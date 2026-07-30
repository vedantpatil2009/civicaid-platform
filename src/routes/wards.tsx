import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, Mail, MapPin, Phone, Users } from "lucide-react";
import { PageShell, PublicLayout } from "@/components/layout/PublicLayout";
import { SectionHeading } from "@/components/common/SectionHeading";
import { EmptyState, ListSkeleton } from "@/components/common/StateBlocks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CityMap, type MapMarker } from "@/components/map/CityMap";
import { useMapPoints, usePollution, useWards } from "@/hooks/useCityData";
import { aqiBand } from "@/lib/algorithms/pollutionRisk";

export const Route = createFileRoute("/wards")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
    mode: typeof search.mode === "string" ? search.mode : "ward",
  }),
  head: () => ({
    meta: [
      { title: "Ward Information — Smart City Data Platform" },
      {
        name: "description",
        content:
          "Councillor details, ward office contacts, population data and live civic metrics for every city ward.",
      },
      { property: "og:title", content: "Ward Information" },
      {
        property: "og:description",
        content: "Find your ward office, councillor and live ward-level civic performance.",
      },
    ],
  }),
  component: WardsPage,
});

function WardsPage() {
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q);
  const wards = useWards();
  const pollution = usePollution();
  const complaints = useMapPoints();

  const filtered = useMemo(() => {
    const list = wards.data ?? [];
    const needle = query.trim().toLowerCase();
    if (!needle) return list;
    return list.filter(
      (w) =>
        String(w.ward_number) === needle ||
        w.ward_name.toLowerCase().includes(needle) ||
        (w.councillor_name ?? "").toLowerCase().includes(needle) ||
        (w.zone ?? "").toLowerCase().includes(needle),
    );
  }, [wards.data, query]);

  const markers: MapMarker[] = filtered.map((w) => ({
    id: w.id,
    lat: Number(w.latitude),
    lng: Number(w.longitude),
    title: `Ward ${w.ward_number} · ${w.ward_name}`,
    subtitle: w.councillor_name ?? undefined,
    tone: "info",
    radius: 11,
  }));

  const complaintsByWard = (ward: number) =>
    (complaints.data ?? []).filter((c) => c.ward_number === ward);

  return (
    <PublicLayout>
      <PageShell className="space-y-10">
        <SectionHeading
          eyebrow="Ward directory"
          title="Ward information"
          description="Search by ward number, name, zone or councillor to reach the right office."
        />

        <div className="surface-card grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="ward-filter">Search wards</Label>
            <Input
              id="ward-filter"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ward number, name, zone or councillor"
              className="h-11 rounded-xl"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {wards.data?.length ?? 0} wards
          </p>
        </div>

        <div className="surface-card p-3">
          <CityMap markers={markers} className="h-[360px] w-full" />
        </div>

        {wards.isLoading ? (
          <ListSkeleton rows={4} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No matching wards"
            description="Try a different ward number, zone or councillor name."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((ward) => {
              const wardComplaints = complaintsByWard(ward.ward_number);
              const openCount = wardComplaints.filter(
                (c) => c.status !== "resolved" && c.status !== "rejected",
              ).length;
              const air = pollution.data?.find((p) => p.ward_number === ward.ward_number);
              return (
                <article key={ward.id} className="surface-card hover-lift space-y-4 p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Ward {ward.ward_number} · {ward.zone}
                      </p>
                      <h3 className="truncate text-lg font-semibold text-foreground">
                        {ward.ward_name}
                      </h3>
                    </div>
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                      <Building2 className="size-5" aria-hidden />
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-muted p-2.5">
                      <dt className="text-muted-foreground">Population</dt>
                      <dd className="font-semibold text-foreground">
                        {ward.population?.toLocaleString()}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-muted p-2.5">
                      <dt className="text-muted-foreground">Area</dt>
                      <dd className="font-semibold text-foreground">{ward.area_sq_km} km²</dd>
                    </div>
                    <div className="rounded-xl bg-muted p-2.5">
                      <dt className="text-muted-foreground">Open complaints</dt>
                      <dd className="font-semibold text-foreground">{openCount}</dd>
                    </div>
                    <div className="rounded-xl bg-muted p-2.5">
                      <dt className="text-muted-foreground">Air quality</dt>
                      <dd className="font-semibold capitalize text-foreground">
                        {air ? `${air.aqi} · ${aqiBand(air.aqi).replace("-", " ")}` : "—"}
                      </dd>
                    </div>
                  </dl>

                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Users className="size-4 shrink-0" aria-hidden />
                      <span className="truncate">{ward.councillor_name}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone className="size-4 shrink-0" aria-hidden />
                      <span className="truncate">{ward.office_phone}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="size-4 shrink-0" aria-hidden />
                      <span className="truncate">{ward.office_email}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="size-4 shrink-0" aria-hidden />
                      <span className="truncate">
                        {Number(ward.latitude).toFixed(4)}, {Number(ward.longitude).toFixed(4)}
                      </span>
                    </li>
                  </ul>
                </article>
              );
            })}
          </div>
        )}
      </PageShell>
    </PublicLayout>
  );
}