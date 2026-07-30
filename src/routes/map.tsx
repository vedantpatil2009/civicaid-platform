import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Ambulance, Flame, Layers, ShieldAlert, Wind } from "lucide-react";
import { PageShell, PublicLayout } from "@/components/layout/PublicLayout";
import { SectionHeading } from "@/components/common/SectionHeading";
import { CityMap, type MapMarker } from "@/components/map/CityMap";
import { AlertList } from "@/components/city/AlertList";
import { EmptyState } from "@/components/common/StateBlocks";
import { cn } from "@/lib/utils";
import {
  useAlerts,
  useFacilities,
  useMapPoints,
  usePollution,
  useTraffic,
} from "@/hooks/useCityData";
import { calculateTrafficDensity } from "@/lib/algorithms/trafficDensity";
import { detectHotspots } from "@/lib/algorithms/hotspots";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live City Map — Traffic, AQI, Flood & Complaints" },
      {
        name: "description",
        content:
          "An interactive OpenStreetMap view of civic complaints, traffic congestion, air quality, flood risk and emergency facilities.",
      },
      { property: "og:title", content: "Live City Map" },
      {
        property: "og:description",
        content: "Interactive city intelligence map with complaint, traffic, AQI and flood layers.",
      },
    ],
  }),
  component: MapPage,
});

const LAYERS = [
  { id: "complaints", label: "Complaints", icon: ShieldAlert },
  { id: "traffic", label: "Traffic", icon: Layers },
  { id: "aqi", label: "Air quality", icon: Wind },
  { id: "flood", label: "Flood", icon: Flame },
  { id: "facilities", label: "Emergency services", icon: Ambulance },
] as const;

type LayerId = (typeof LAYERS)[number]["id"];

function MapPage() {
  const [active, setActive] = useState<LayerId[]>(["complaints", "facilities"]);
  const complaints = useMapPoints();
  const traffic = useTraffic();
  const pollution = usePollution();
  const facilities = useFacilities();
  const alerts = useAlerts();

  const toggle = (id: LayerId) =>
    setActive((prev) => (prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]));

  const markers = useMemo<MapMarker[]>(() => {
    const list: MapMarker[] = [];

    if (active.includes("complaints")) {
      (complaints.data ?? []).forEach((c) => {
        list.push({
          id: `c-${c.id}`,
          lat: Number(c.latitude),
          lng: Number(c.longitude),
          title: `${c.category} · ${c.reference_code}`,
          subtitle: `Ward ${c.ward_number ?? "—"} · ${c.status}`,
          tone:
            c.status === "resolved"
              ? "resolved"
              : c.priority === "critical"
                ? "critical"
                : c.priority === "high"
                  ? "high"
                  : "pending",
        });
      });
    }

    if (active.includes("flood")) {
      (complaints.data ?? [])
        .filter((c) => c.category === "Water Logging")
        .forEach((c) =>
          list.push({
            id: `f-${c.id}`,
            lat: Number(c.latitude),
            lng: Number(c.longitude),
            title: `Water logging · Ward ${c.ward_number ?? "—"}`,
            tone: "critical",
            radius: 16,
          }),
        );
    }

    if (active.includes("traffic")) {
      (traffic.data ?? []).forEach((t) => {
        if (t.latitude == null || t.longitude == null) return;
        const density = calculateTrafficDensity({
          vehicle_count: t.vehicle_count,
          capacity: t.capacity,
          avg_speed_kph: Number(t.avg_speed_kph),
          incident_count: t.incident_count,
        });
        list.push({
          id: `t-${t.id}`,
          lat: Number(t.latitude),
          lng: Number(t.longitude),
          title: `${t.corridor} · ${density.label}`,
          subtitle: `Density ${density.score}/100`,
          tone: density.score >= 75 ? "critical" : density.score >= 55 ? "high" : "pending",
          radius: 12,
        });
      });
    }

    if (active.includes("aqi")) {
      (pollution.data ?? []).forEach((p) => {
        if (p.latitude == null || p.longitude == null) return;
        list.push({
          id: `p-${p.id}`,
          lat: Number(p.latitude),
          lng: Number(p.longitude),
          title: `${p.station} · AQI ${p.aqi}`,
          tone: p.aqi > 200 ? "critical" : p.aqi > 100 ? "high" : "resolved",
          radius: 14,
        });
      });
    }

    if (active.includes("facilities")) {
      (facilities.data ?? []).forEach((f) =>
        list.push({
          id: `x-${f.id}`,
          lat: Number(f.latitude),
          lng: Number(f.longitude),
          title: `${f.name} (${f.type})`,
          subtitle: f.phone ?? undefined,
          tone: "info",
          radius: 8,
        }),
      );
    }

    return list;
  }, [active, complaints.data, traffic.data, pollution.data, facilities.data]);

  const hotspots = useMemo(
    () =>
      detectHotspots(
        (complaints.data ?? []).map((c) => ({
          id: c.id!,
          latitude: Number(c.latitude),
          longitude: Number(c.longitude),
          category: c.category,
          ward_number: c.ward_number,
        })),
      ),
    [complaints.data],
  );

  return (
    <PublicLayout>
      <PageShell className="space-y-8">
        <SectionHeading
          eyebrow="City intelligence"
          title="Live city map"
          description="Toggle layers to overlay complaints, congestion, pollution, flooding and emergency services."
        />

        <div className="flex flex-wrap gap-2">
          {LAYERS.map((layer) => {
            const isOn = active.includes(layer.id);
            return (
              <button
                key={layer.id}
                type="button"
                aria-pressed={isOn}
                onClick={() => toggle(layer.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  isOn
                    ? "border-primary bg-primary text-primary-foreground shadow-glow"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                <layer.icon className="size-4" aria-hidden />
                {layer.label}
              </button>
            );
          })}
        </div>

        <div className="surface-card p-3">
          <CityMap markers={markers} className="h-[560px] w-full" zoom={12} />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {[
            ["#22C55E", "Resolved"],
            ["#F59E0B", "Pending"],
            ["#F97316", "High"],
            ["#EF4444", "Critical"],
            ["#2347C6", "Facility / info"],
          ].map(([color, label]) => (
            <span key={label} className="inline-flex items-center gap-2">
              <span className="size-3 rounded-full" style={{ backgroundColor: color }} aria-hidden />
              {label}
            </span>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Complaint hotspots</h2>
            {hotspots.length ? (
              <ul className="space-y-3">
                {hotspots.slice(0, 5).map((spot) => (
                  <li key={`${spot.centre.lat}-${spot.centre.lng}`} className="surface-card p-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {spot.dominantCategory} cluster
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ward {spot.wardNumber ?? "—"} · {spot.count} reports within 700 m
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive">
                        {spot.intensity}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="No hotspots detected"
                description="Complaints are dispersed — no clustering above threshold."
              />
            )}
          </section>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Emergency alerts</h2>
            {alerts.data?.length ? (
              <AlertList alerts={alerts.data} />
            ) : (
              <EmptyState title="No active alerts" />
            )}
          </section>
        </div>
      </PageShell>
    </PublicLayout>
  );
}