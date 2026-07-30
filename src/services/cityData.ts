import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Ward = Tables<"ward_information">;
export type Department = Tables<"departments">;
export type WeatherReading = Tables<"weather">;
export type TrafficReadingRow = Tables<"traffic">;
export type PollutionReadingRow = Tables<"pollution">;
export type CityAlert = Tables<"city_alerts">;
export type Facility = Tables<"facilities">;
export type MapPoint = Tables<"complaint_map_points">;

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export async function fetchWards(): Promise<Ward[]> {
  return unwrap(
    await supabase.from("ward_information").select("*").order("ward_number", { ascending: true }),
  );
}

export async function fetchDepartments(): Promise<Department[]> {
  return unwrap(await supabase.from("departments").select("*").order("name"));
}

export async function fetchWeather(): Promise<WeatherReading[]> {
  return unwrap(
    await supabase.from("weather").select("*").order("recorded_at", { ascending: false }),
  );
}

export async function fetchTraffic(): Promise<TrafficReadingRow[]> {
  return unwrap(await supabase.from("traffic").select("*").order("corridor"));
}

export async function fetchPollution(): Promise<PollutionReadingRow[]> {
  return unwrap(await supabase.from("pollution").select("*").order("ward_number"));
}

export async function fetchAlerts(): Promise<CityAlert[]> {
  return unwrap(
    await supabase
      .from("city_alerts")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
  );
}

export async function fetchFacilities(): Promise<Facility[]> {
  return unwrap(await supabase.from("facilities").select("*").order("name"));
}

export async function fetchMapPoints(): Promise<MapPoint[]> {
  return unwrap(
    await supabase
      .from("complaint_map_points")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500),
  );
}