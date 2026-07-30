import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bus,
  CheckCircle2,
  CloudSun,
  Droplets,
  FileText,
  Flame,
  Gauge,
  Landmark,
  Megaphone,
  Recycle,
  ShieldCheck,
  Trash2,
  Waves,
} from "lucide-react";
import heroImage from "@/assets/city-hero.jpg";
import { PublicLayout, PageShell } from "@/components/layout/PublicLayout";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ServiceCard } from "@/components/city/ServiceCard";
import { WardSearchCard } from "@/components/city/WardSearchCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertList } from "@/components/city/AlertList";
import { AqiCard, FloodCard, TrafficCard, WeatherCard } from "@/components/city/EnvironmentCards";
import { CardSkeletonGrid, EmptyState } from "@/components/common/StateBlocks";
import { Button } from "@/components/ui/button";
import { CityMap, type MapMarker } from "@/components/map/CityMap";
import {
  useAlerts,
  useMapPoints,
  usePollution,
  useTraffic,
  useWeather,
} from "@/hooks/useCityData";
import { calculateTrafficDensity } from "@/lib/algorithms/trafficDensity";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart City Data Platform — Civic Reporting & Live City Data" },
      {
        name: "description",
        content:
          "Report civic issues, track complaint resolution and monitor live traffic, air quality, weather and flood data across every ward.",
      },
      { property: "og:title", content: "Smart City Data Platform" },
      {
        property: "og:description",
        content:
          "One municipal platform for citizen complaints, ward services and real-time city intelligence.",
      },
    ],
  }),
  component: HomePage,
});

const QUICK_SERVICES = [
  { title: "Report a complaint", description: "Photo, location and category in under a minute.", icon: Megaphone, to: "/report", tag: "Most used" },
  { title: "Water supply", description: "Outages, low pressure and pipeline leakages.", icon: Droplets, to: "/services" },
  { title: "Garbage collection", description: "Missed pickups, overflowing bins and dumping.", icon: Trash2, to: "/services" },
  { title: "Property tax", description: "Assessment, dues and online payment receipts.", icon: FileText, to: "/services" },
  { title: "Emergency contacts", description: "Hospitals, police, fire and disaster helplines.", icon: ShieldCheck, to: "/contact" },
  { title: "Flood alerts", description: "Live water logging advisories for your ward.", icon: Waves, to: "/map" },
  { title: "Traffic updates", description: "Corridor-level congestion and incident feed.", icon: Bus, to: "/map" },
  { title: "Weather", description: "Rainfall, humidity and heat advisories.", icon: CloudSun, to: "/map" },
];

function HomePage() {
  const alerts = useAlerts();
  const weather = useWeather();
  const pollution = usePollution();
  const traffic = useTraffic();
  const mapPoints = useMapPoints();

  const cityWeather = weather.data?.find((w) => w.ward_number === null) ?? weather.data?.[0];
  const worstAir = [...(pollution.data ?? [])].sort((a, b) => b.aqi - a.aqi)[0];
  const busiestCorridor = [...(traffic.data ?? [])].sort(
    (a, b) =>
      calculateTrafficDensity({
        vehicle_count: b.vehicle_count,
        capacity: b.capacity,
        avg_speed_kph: Number(b.avg_speed_kph),
        incident_count: b.incident_count,
      }).score -
      calculateTrafficDensity({
        vehicle_count: a.vehicle_count,
        capacity: a.capacity,
        avg_speed_kph: Number(a.avg_speed_kph),
        incident_count: a.incident_count,
      }).score,
  )[0];

  const points = mapPoints.data ?? [];
  const activeComplaints = points.filter((p) => p.status !== "resolved" && p.status !== "rejected").length;
  const resolved = points.filter((p) => p.status === "resolved").length;
  const waterLogging = points.filter((p) => p.category === "Water Logging").length;

  const markers: MapMarker[] = points.slice(0, 120).map((p) => ({
    id: p.id!,
    lat: Number(p.latitude),
    lng: Number(p.longitude),
    title: `${p.category} · Ward ${p.ward_number ?? "—"}`,
    subtitle: p.reference_code ?? undefined,
    tone:
      p.status === "resolved"
        ? "resolved"
        : p.priority === "critical"
          ? "critical"
          : p.priority === "high"
            ? "high"
            : "pending",
  }));

  return (
    <PublicLayout>
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="Aerial view of the city at dusk with connected infrastructure"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-gradient opacity-90" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:px-8">
          <div className="animate-fade-up space-y-6 text-primary-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]">
              <span className="size-1.5 rounded-full bg-success" aria-hidden />
              Live civic operations
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
              Your city, measured and answerable.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
              Report civic issues with photo evidence, track every escalation to resolution and
              monitor real-time traffic, air quality and flood telemetry across all wards.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-white text-primary hover:bg-white/90">
                <Link to="/report">Report an issue</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              >
                <Link to="/map">Open live city map</Link>
              </Button>
            </div>
            <dl className="grid max-w-lg grid-cols-3 gap-4 pt-4">
              {[
                ["8", "Wards covered"],
                ["7", "Departments"],
                ["24×7", "Monitoring"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-2xl font-bold">{value}</dt>
                  <dd className="text-xs text-primary-foreground/75">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <WardSearchCard />
        </div>
      </section>

      <PageShell className="space-y-16">
        <section className="space-y-6">
          <SectionHeading
            eyebrow="City pulse"
            title="Today across the city"
            description="Aggregated from citizen reports, monitoring stations and department feeds."
          />
          {mapPoints.isLoading ? (
            <CardSkeletonGrid />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Active complaints" value={activeComplaints} icon={AlertTriangle} tone="warning" hint="Open across all wards" />
              <StatCard label="Resolved issues" value={resolved} icon={CheckCircle2} tone="success" hint="Closed by departments" />
              <StatCard label="Peak air quality index" value={worstAir?.aqi ?? "—"} icon={Flame} tone="danger" hint={worstAir?.station ?? ""} />
              <StatCard label="Water logging reports" value={waterLogging} icon={Waves} tone="info" hint="Live flood watch" />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {worstAir ? <AqiCard reading={worstAir} /> : null}
            {cityWeather ? <WeatherCard reading={cityWeather} /> : null}
            {busiestCorridor ? <TrafficCard reading={busiestCorridor} /> : null}
            {cityWeather ? (
              <FloodCard weather={cityWeather} waterLoggingReports={waterLogging} />
            ) : null}
          </div>
        </section>

        <section className="space-y-6">
          <SectionHeading
            eyebrow="Quick services"
            title="What do you need today?"
            description="The eight most requested municipal services, one tap away."
            action={
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/services">All services</Link>
              </Button>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_SERVICES.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-5">
            <SectionHeading
              eyebrow="Live map"
              title="Complaints on the ground"
              description="Colour-coded by priority — green resolved, amber pending, orange high, red critical."
            />
            <div className="surface-card p-3">
              <CityMap markers={markers} className="h-[420px] w-full" />
            </div>
          </div>
          <div className="space-y-5">
            <SectionHeading eyebrow="Advisories" title="Latest alerts" />
            {alerts.isLoading ? (
              <CardSkeletonGrid count={3} className="grid-cols-1 sm:grid-cols-1 lg:grid-cols-1" />
            ) : alerts.data?.length ? (
              <AlertList alerts={alerts.data} />
            ) : (
              <EmptyState title="No active alerts" description="The city is operating normally." />
            )}
          </div>
        </section>

        <section className="surface-card grid gap-6 overflow-hidden bg-primary-gradient p-8 text-primary-foreground sm:p-12 lg:grid-cols-[1.4fr_auto] lg:items-center">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold sm:text-3xl">Something broken in your neighbourhood?</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
              Complaints are auto-prioritised, checked for duplicates and routed to the right
              department with an SLA clock attached.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-white text-primary hover:bg-white/90">
              <Link to="/report">Report now</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            >
              <Link to="/dashboard">Track my complaints</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Landmark, title: "Ward governance", body: "Councillor, office contacts and civic budgets for all 8 wards." },
            { icon: Gauge, title: "Live telemetry", body: "Traffic density, AQI and rainfall refreshed continuously." },
            { icon: Recycle, title: "Accountable SLAs", body: "Every department has a published resolution target." },
            { icon: ShieldCheck, title: "Secure by design", body: "Row-level security keeps citizen data private." },
          ].map((item) => (
            <article key={item.title} className="surface-card hover-lift space-y-2 p-5">
              <span className="grid size-10 place-items-center rounded-2xl bg-primary-soft text-primary">
                <item.icon className="size-5" aria-hidden />
              </span>
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </section>
      </PageShell>
    </PublicLayout>
  );
}
