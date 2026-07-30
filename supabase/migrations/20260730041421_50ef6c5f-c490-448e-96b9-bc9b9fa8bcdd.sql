-- ENUMS
CREATE TYPE public.app_role AS ENUM ('citizen','staff','admin');
CREATE TYPE public.complaint_status AS ENUM ('pending','assigned','in_progress','resolved','rejected');
CREATE TYPE public.complaint_priority AS ENUM ('low','medium','high','critical');

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  ward_number integer,
  address text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'citizen',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','staff'));
$$;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

-- DEPARTMENTS
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  description text,
  contact_email text,
  contact_phone text,
  target_hours integer NOT NULL DEFAULT 72,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.departments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "departments_public_read" ON public.departments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "departments_admin_write" ON public.departments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- WARD INFORMATION
CREATE TABLE public.ward_information (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_number integer NOT NULL UNIQUE,
  ward_name text NOT NULL,
  zone text,
  councillor_name text,
  office_phone text,
  office_email text,
  population integer,
  area_sq_km numeric,
  households integer,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ward_information TO anon;
GRANT SELECT ON public.ward_information TO authenticated;
GRANT ALL ON public.ward_information TO service_role;
ALTER TABLE public.ward_information ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wards_public_read" ON public.ward_information FOR SELECT TO anon, authenticated USING (true);

-- COMPLAINTS
CREATE TABLE public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code text NOT NULL UNIQUE DEFAULT ('SCP-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  citizen_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  status public.complaint_status NOT NULL DEFAULT 'pending',
  priority public.complaint_priority NOT NULL DEFAULT 'medium',
  ward_number integer,
  address text,
  latitude numeric,
  longitude numeric,
  photo_url text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  resolution_notes text,
  upvotes integer NOT NULL DEFAULT 0,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "complaints_select_own_or_staff" ON public.complaints FOR SELECT TO authenticated
  USING (citizen_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "complaints_insert_own" ON public.complaints FOR INSERT TO authenticated
  WITH CHECK (citizen_id = auth.uid());
CREATE POLICY "complaints_update_staff" ON public.complaints FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "complaints_delete_admin" ON public.complaints FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE INDEX complaints_status_idx ON public.complaints(status);
CREATE INDEX complaints_ward_idx ON public.complaints(ward_number);
CREATE INDEX complaints_created_idx ON public.complaints(created_at DESC);

-- Anonymised public map feed (no citizen identity / description)
CREATE VIEW public.complaint_map_points
WITH (security_invoker = false) AS
  SELECT id, reference_code, category, status, priority, ward_number, latitude, longitude, created_at
  FROM public.complaints
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
GRANT SELECT ON public.complaint_map_points TO anon, authenticated;

-- COMPLAINT UPDATES
CREATE TABLE public.complaint_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  status public.complaint_status NOT NULL,
  note text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.complaint_updates TO authenticated;
GRANT ALL ON public.complaint_updates TO service_role;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "complaint_updates_select" ON public.complaint_updates FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.complaints c WHERE c.id = complaint_id AND c.citizen_id = auth.uid()));
CREATE POLICY "complaint_updates_insert_staff" ON public.complaint_updates FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND created_by = auth.uid());

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  complaint_id uuid REFERENCES public.complaints(id) ON DELETE CASCADE,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_own" ON public.notifications FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- CITY ALERTS
CREATE TABLE public.city_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  ward_number integer,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.city_alerts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.city_alerts TO authenticated;
GRANT ALL ON public.city_alerts TO service_role;
ALTER TABLE public.city_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts_public_read" ON public.city_alerts FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "alerts_admin_write" ON public.city_alerts FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- WEATHER
CREATE TABLE public.weather (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_number integer,
  temperature_c numeric NOT NULL,
  feels_like_c numeric,
  humidity integer,
  wind_kph numeric,
  rainfall_mm numeric NOT NULL DEFAULT 0,
  condition text NOT NULL DEFAULT 'Clear',
  recorded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.weather TO anon, authenticated;
GRANT ALL ON public.weather TO service_role;
ALTER TABLE public.weather ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weather_public_read" ON public.weather FOR SELECT TO anon, authenticated USING (true);

-- TRAFFIC
CREATE TABLE public.traffic (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_number integer,
  corridor text NOT NULL,
  vehicle_count integer NOT NULL DEFAULT 0,
  avg_speed_kph numeric NOT NULL DEFAULT 0,
  capacity integer NOT NULL DEFAULT 1000,
  incident_count integer NOT NULL DEFAULT 0,
  latitude numeric,
  longitude numeric,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.traffic TO anon, authenticated;
GRANT ALL ON public.traffic TO service_role;
ALTER TABLE public.traffic ENABLE ROW LEVEL SECURITY;
CREATE POLICY "traffic_public_read" ON public.traffic FOR SELECT TO anon, authenticated USING (true);

-- POLLUTION
CREATE TABLE public.pollution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_number integer,
  station text NOT NULL,
  aqi integer NOT NULL,
  pm25 numeric,
  pm10 numeric,
  no2 numeric,
  so2 numeric,
  co numeric,
  latitude numeric,
  longitude numeric,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pollution TO anon, authenticated;
GRANT ALL ON public.pollution TO service_role;
ALTER TABLE public.pollution ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pollution_public_read" ON public.pollution FOR SELECT TO anon, authenticated USING (true);

-- CITY FACILITIES (hospitals, police, fire)
CREATE TABLE public.facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  phone text,
  ward_number integer,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL
);
GRANT SELECT ON public.facilities TO anon, authenticated;
GRANT ALL ON public.facilities TO service_role;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "facilities_public_read" ON public.facilities FOR SELECT TO anon, authenticated USING (true);

-- TRIGGERS
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER complaints_updated_at BEFORE UPDATE ON public.complaints
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'citizen')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Notify citizen on complaint status change
CREATE OR REPLACE FUNCTION public.notify_complaint_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.citizen_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, complaint_id)
    VALUES (NEW.citizen_id, 'Complaint ' || NEW.reference_code || ' updated',
      'Status changed to ' || NEW.status::text, 'complaint', NEW.id);
    INSERT INTO public.complaint_updates (complaint_id, status, note, created_by)
    VALUES (NEW.id, NEW.status, NEW.resolution_notes, auth.uid());
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER complaints_status_notify AFTER UPDATE ON public.complaints
FOR EACH ROW EXECUTE FUNCTION public.notify_complaint_status();

-- REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.city_alerts;

-- SEED DATA
INSERT INTO public.departments (name, code, description, contact_email, contact_phone, target_hours) VALUES
('Public Works','PWD','Roads, footpaths, potholes and street infrastructure','pwd@smartcity.gov','1800-100-101',72),
('Water Supply & Sewerage','WSS','Drinking water, pipelines, leakages and sewer lines','water@smartcity.gov','1800-100-102',24),
('Solid Waste Management','SWM','Garbage collection, street sweeping and landfill operations','waste@smartcity.gov','1800-100-103',48),
('Electrical & Street Lighting','ESL','Street lights, signals and municipal electrical assets','power@smartcity.gov','1800-100-104',36),
('Health & Sanitation','HSD','Public health, sanitation drives and vector control','health@smartcity.gov','1800-100-105',48),
('Traffic & Transport','TTD','Traffic signals, congestion management and parking','traffic@smartcity.gov','1800-100-106',12),
('Disaster Management','DMD','Flooding, water logging and emergency response','disaster@smartcity.gov','1800-100-107',6);

INSERT INTO public.ward_information (ward_number, ward_name, zone, councillor_name, office_phone, office_email, population, area_sq_km, households, latitude, longitude) VALUES
(1,'Civic Centre','Central','Aarav Mehta','022-4001-0001','ward1@smartcity.gov',48200,6.4,11800,19.0760,72.8777),
(2,'Riverside','North','Priya Nair','022-4001-0002','ward2@smartcity.gov',52400,7.9,13100,19.0896,72.8656),
(3,'Industrial Estate','East','Rohan Verma','022-4001-0003','ward3@smartcity.gov',38900,11.2,9400,19.0650,72.8990),
(4,'Green Park','West','Sana Qureshi','022-4001-0004','ward4@smartcity.gov',61300,8.1,15600,19.0620,72.8420),
(5,'Old Town','South','Vikram Iyer','022-4001-0005','ward5@smartcity.gov',44700,5.3,12200,19.0480,72.8700),
(6,'Tech Corridor','East','Neha Kulkarni','022-4001-0006','ward6@smartcity.gov',57800,9.6,14900,19.1010,72.8830),
(7,'Lakeview','North','Imran Shaikh','022-4001-0007','ward7@smartcity.gov',35100,4.8,8700,19.1150,72.8550),
(8,'Harbour Front','South','Meera Das','022-4001-0008','ward8@smartcity.gov',41500,6.9,10300,19.0350,72.8500);

INSERT INTO public.facilities (name, type, phone, ward_number, latitude, longitude) VALUES
('City General Hospital','hospital','108',1,19.0770,72.8790),
('Riverside Multispeciality','hospital','108',2,19.0910,72.8640),
('Green Park Clinic','hospital','108',4,19.0630,72.8410),
('Central Police Station','police','100',1,19.0745,72.8760),
('East Zone Police Station','police','100',3,19.0665,72.8975),
('Harbour Police Outpost','police','100',8,19.0360,72.8515),
('Fire & Rescue HQ','fire','101',1,19.0755,72.8735),
('North Fire Station','fire','101',7,19.1135,72.8570),
('Tech Corridor Fire Unit','fire','101',6,19.1000,72.8845);

INSERT INTO public.weather (ward_number, temperature_c, feels_like_c, humidity, wind_kph, rainfall_mm, condition) VALUES
(NULL,31.4,35.2,74,14.6,12.4,'Heavy Rain'),
(1,31.0,34.8,73,13.2,10.8,'Rain'),
(2,30.6,34.1,78,15.9,18.2,'Heavy Rain'),
(4,31.8,35.6,70,12.1,6.4,'Cloudy'),
(8,30.2,33.7,81,17.4,22.6,'Heavy Rain');

INSERT INTO public.traffic (ward_number, corridor, vehicle_count, avg_speed_kph, capacity, incident_count, latitude, longitude) VALUES
(1,'Civic Centre Junction',1840,18.4,2000,2,19.0762,72.8780),
(2,'Riverside Bridge',1520,26.1,2200,0,19.0900,72.8660),
(3,'Industrial Estate Road',980,34.5,1800,1,19.0655,72.8985),
(4,'Green Park Avenue',1710,15.2,1900,3,19.0625,72.8425),
(5,'Old Town Market Road',1290,12.8,1400,1,19.0485,72.8705),
(6,'Tech Corridor Expressway',2260,41.3,3000,0,19.1015,72.8835),
(7,'Lakeview Ring Road',760,44.8,1600,0,19.1155,72.8555),
(8,'Harbour Access Road',1440,21.6,1700,2,19.0355,72.8505);

INSERT INTO public.pollution (ward_number, station, aqi, pm25, pm10, no2, so2, co, latitude, longitude) VALUES
(1,'Civic Centre Monitor',156,68.2,132.5,41.2,12.4,1.1,19.0765,72.8775),
(2,'Riverside Monitor',92,34.1,78.6,26.8,8.1,0.7,19.0895,72.8650),
(3,'Industrial Estate Monitor',214,98.7,186.3,58.4,22.9,1.8,19.0648,72.8992),
(4,'Green Park Monitor',68,22.4,54.9,18.3,6.2,0.5,19.0618,72.8418),
(5,'Old Town Monitor',138,59.6,118.2,37.5,11.7,1.0,19.0482,72.8702),
(6,'Tech Corridor Monitor',104,41.3,88.4,29.1,9.4,0.8,19.1012,72.8828),
(7,'Lakeview Monitor',54,17.8,44.2,14.6,4.8,0.4,19.1148,72.8552),
(8,'Harbour Front Monitor',172,74.9,146.1,45.7,16.3,1.3,19.0352,72.8498);

INSERT INTO public.city_alerts (title, message, severity, ward_number, is_active) VALUES
('Water logging on Harbour Access Road','Knee-deep water reported near the harbour junction. Avoid the stretch until 8 PM.','critical',8,true),
('Air quality advisory — Industrial Estate','AQI has crossed 200. Sensitive groups should limit outdoor activity.','warning',3,true),
('Scheduled water supply cut — Old Town','Supply will be interrupted from 10 AM to 4 PM for pipeline repair.','info',5,true),
('Heavy rainfall warning for the city','IMD forecasts 90mm rainfall over the next 24 hours. Emergency helpline 1916 is active.','warning',NULL,true);

INSERT INTO public.complaints (title, description, category, status, priority, ward_number, address, latitude, longitude, upvotes, created_at, resolved_at, department_id) VALUES
('Large pothole near Civic Centre','A deep pothole has formed at the main junction causing two-wheeler skids during rain.','Roads & Potholes','in_progress','high',1,'Civic Centre Junction, Ward 1',19.0764,72.8782,42,now()-interval '3 days',NULL,(SELECT id FROM public.departments WHERE code='PWD')),
('Garbage not collected for 5 days','Overflowing bins outside the market entrance attracting stray animals.','Garbage & Sanitation','pending','high',5,'Old Town Market Road, Ward 5',19.0487,72.8708,67,now()-interval '2 days',NULL,(SELECT id FROM public.departments WHERE code='SWM')),
('Street light not working','Entire lane is dark after 7 PM, unsafe for pedestrians.','Street Lighting','assigned','medium',4,'Green Park Avenue Lane 3, Ward 4',19.0622,72.8428,18,now()-interval '5 days',NULL,(SELECT id FROM public.departments WHERE code='ESL')),
('Sewage overflow in residential lane','Sewer line blockage flooding the lane with waste water.','Water & Sewerage','in_progress','critical',8,'Harbour Front Colony, Ward 8',19.0358,72.8508,89,now()-interval '1 day',NULL,(SELECT id FROM public.departments WHERE code='WSS')),
('Traffic signal malfunctioning','Signal stuck on red causing long queues during peak hours.','Traffic','resolved','high',6,'Tech Corridor Expressway, Ward 6',19.1018,72.8838,31,now()-interval '9 days',now()-interval '7 days',(SELECT id FROM public.departments WHERE code='TTD')),
('Water logging after rainfall','Water accumulates up to two feet at the underpass after every shower.','Water Logging','pending','critical',2,'Riverside Bridge Underpass, Ward 2',19.0902,72.8664,120,now()-interval '6 hours',NULL,(SELECT id FROM public.departments WHERE code='DMD')),
('Broken footpath tiles','Loose tiles have injured two senior citizens this month.','Roads & Potholes','assigned','medium',7,'Lakeview Ring Road, Ward 7',19.1152,72.8558,12,now()-interval '4 days',NULL,(SELECT id FROM public.departments WHERE code='PWD')),
('Mosquito breeding near vacant plot','Stagnant water in a vacant plot causing severe mosquito menace.','Health & Sanitation','resolved','medium',3,'Industrial Estate Sector 4, Ward 3',19.0658,72.8988,25,now()-interval '14 days',now()-interval '10 days',(SELECT id FROM public.departments WHERE code='HSD')),
('Illegal dumping near school','Construction debris dumped along the school boundary wall.','Garbage & Sanitation','rejected','low',4,'Green Park School Road, Ward 4',19.0615,72.8415,8,now()-interval '20 days',NULL,(SELECT id FROM public.departments WHERE code='SWM')),
('Low water pressure for two weeks','Households on the upper floors receive almost no water in the morning.','Water & Sewerage','pending','medium',1,'Civic Centre Residency, Ward 1',19.0758,72.8768,54,now()-interval '8 days',NULL,(SELECT id FROM public.departments WHERE code='WSS')),
('Fallen tree blocking road','A large tree fell during last night storm and is blocking one carriageway.','Roads & Potholes','in_progress','critical',2,'Riverside Avenue, Ward 2',19.0891,72.8648,73,now()-interval '12 hours',NULL,(SELECT id FROM public.departments WHERE code='DMD')),
('Damaged manhole cover','Open manhole on a busy pedestrian stretch.','Water & Sewerage','resolved','high',6,'Tech Corridor Service Lane, Ward 6',19.1006,72.8822,44,now()-interval '11 days',now()-interval '9 days',(SELECT id FROM public.departments WHERE code='WSS'));