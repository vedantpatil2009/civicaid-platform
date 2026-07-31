import { createFileRoute } from "@tanstack/react-router";
import { Ambulance, Clock, Flame, Mail, MapPin, Phone, ShieldAlert } from "lucide-react";
import { PageShell, PublicLayout } from "@/components/layout/PublicLayout";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ListSkeleton } from "@/components/common/StateBlocks";
import { CityMap, type MapMarker } from "@/components/map/CityMap";
import { useDepartments, useFacilities } from "@/hooks/useCityData";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Emergency Helplines — Smart City Data Platform" },
      {
        name: "description",
        content:
          "Department helplines, ward office contacts and 24×7 emergency numbers for police, fire, ambulance and disaster response.",
      },
      { property: "og:title", content: "Contact & Emergency Helplines" },
      {
        property: "og:description",
        content: "Reach the right municipal department or emergency service instantly.",
      },
    ],
  }),
  component: ContactPage,
});

const EMERGENCY = [
  { icon: ShieldAlert, label: "Police control room", number: "100" },
  { icon: Flame, label: "Fire & rescue", number: "101" },
  { icon: Ambulance, label: "Ambulance", number: "108" },
  { icon: ShieldAlert, label: "Disaster management cell", number: "1077" },
];

function ContactPage() {
  const departments = useDepartments();
  const facilities = useFacilities();

  const markers: MapMarker[] = (facilities.data ?? []).map((f) => ({
    id: f.id,
    lat: Number(f.latitude),
    lng: Number(f.longitude),
    title: `${f.name} (${f.type})`,
    subtitle: f.phone ?? undefined,
    tone: "info",
  }));

  return (
    <PublicLayout>
      <PageShell className="space-y-12">
        <SectionHeading
          eyebrow="Contact"
          title="Reach the corporation"
          description="Emergency helplines are staffed round the clock. Department desks operate 9:00–18:00 on working days."
        />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EMERGENCY.map((item) => (
            <a
              key={item.label}
              href={`tel:${item.number}`}
              className="surface-card hover-lift flex items-center gap-4 p-5"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-destructive/10 text-destructive">
                <item.icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-2xl font-bold text-destructive">{item.number}</p>
              </div>
            </a>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Department desks</h2>
            {departments.isLoading ? (
              <ListSkeleton rows={4} />
            ) : (
              <ul className="space-y-3">
                {departments.data?.map((dept) => (
                  <li
                    key={dept.id}
                    className="surface-card grid gap-2 p-5 sm:grid-cols-[minmax(0,1fr)_auto]"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">{dept.description}</p>
                    </div>
                    <div className="space-y-1 text-sm sm:text-right">
                      <p className="flex items-center gap-2 sm:justify-end">
                        <Phone className="size-4 shrink-0 text-primary" aria-hidden />
                        {dept.contact_phone}
                      </p>
                      <p className="flex items-center gap-2 truncate sm:justify-end">
                        <Mail className="size-4 shrink-0 text-primary" aria-hidden />
                        {dept.contact_email}
                      </p>
                      <p className="flex items-center gap-2 text-muted-foreground sm:justify-end">
                        <Clock className="size-4 shrink-0" aria-hidden />
                        SLA {dept.target_hours}h
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Municipal head office</h2>
            <div className="surface-card space-y-3 p-6 text-sm">
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                Civic Centre, Municipal Corporation Road, Central Zone
              </p>
              <p className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-primary" aria-hidden />
                1800-000-1947 (toll free)
              </p>
              <p className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-primary" aria-hidden />
                helpdesk@smartcity.gov.in
              </p>
              <p className="flex items-center gap-3">
                <Clock className="size-4 shrink-0 text-primary" aria-hidden />
                Monday to Saturday · 09:00 – 18:00
              </p>
            </div>
            <h2 className="text-xl font-semibold text-foreground">Emergency facilities</h2>
            <div className="surface-card p-3">
              <CityMap markers={markers} className="h-[320px] w-full" />
            </div>
          </div>
        </section>
      </PageShell>
    </PublicLayout>
  );
}
