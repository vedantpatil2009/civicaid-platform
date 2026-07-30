import { createFileRoute } from "@tanstack/react-router";
import {
  Bus,
  Building2,
  CloudSun,
  Droplets,
  FileText,
  HeartPulse,
  Lightbulb,
  Megaphone,
  Recycle,
  ShieldCheck,
  TreePine,
  Waves,
} from "lucide-react";
import { PageShell, PublicLayout } from "@/components/layout/PublicLayout";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ServiceCard } from "@/components/city/ServiceCard";
import { ListSkeleton } from "@/components/common/StateBlocks";
import { useDepartments } from "@/hooks/useCityData";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Municipal Services — Smart City Data Platform" },
      {
        name: "description",
        content:
          "Browse every municipal service: complaints, water supply, waste, property tax, health, lighting and emergency response.",
      },
      { property: "og:title", content: "Municipal Services" },
      {
        property: "og:description",
        content: "Every citizen service offered by the municipal corporation in one directory.",
      },
    ],
  }),
  component: ServicesPage,
});

const GROUPS = [
  {
    title: "Report & track",
    services: [
      { title: "Report a complaint", description: "Raise a civic issue with photo and GPS location.", icon: Megaphone, to: "/report" },
      { title: "Track complaints", description: "Follow status, assignment and SLA countdown.", icon: FileText, to: "/dashboard" },
      { title: "Emergency response", description: "Disaster helplines and rapid response units.", icon: ShieldCheck, to: "/contact" },
    ],
  },
  {
    title: "Utilities",
    services: [
      { title: "Water supply", description: "Outages, contamination and pipeline leakage.", icon: Droplets, to: "/report" },
      { title: "Sewerage", description: "Blockages, manholes and drainage maintenance.", icon: Waves, to: "/report" },
      { title: "Street lighting", description: "Faulty poles, dark lanes and signal lights.", icon: Lightbulb, to: "/report" },
      { title: "Waste management", description: "Missed collection, bins and bulk waste pickup.", icon: Recycle, to: "/report" },
    ],
  },
  {
    title: "Civic & administration",
    services: [
      { title: "Property tax", description: "Assessment, dues, receipts and rebates.", icon: Building2, to: "/contact" },
      { title: "Health & sanitation", description: "Fogging, vector control and public health drives.", icon: HeartPulse, to: "/report" },
      { title: "Parks & greenery", description: "Tree trimming, fallen trees and park upkeep.", icon: TreePine, to: "/report" },
    ],
  },
  {
    title: "City intelligence",
    services: [
      { title: "Live city map", description: "Complaints, flood, AQI and emergency facilities.", icon: Bus, to: "/map" },
      { title: "Weather & flood watch", description: "Rainfall, humidity and water logging risk.", icon: CloudSun, to: "/map" },
    ],
  },
];

function ServicesPage() {
  const departments = useDepartments();

  return (
    <PublicLayout>
      <PageShell className="space-y-14">
        <SectionHeading
          eyebrow="Service directory"
          title="Municipal services"
          description="Everything the corporation delivers, organised the way citizens actually search for it."
        />

        {GROUPS.map((group) => (
          <section key={group.title} className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">{group.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {group.services.map((service) => (
                <ServiceCard key={service.title} {...service} />
              ))}
            </div>
          </section>
        ))}

        <section className="space-y-5">
          <SectionHeading
            eyebrow="Departments"
            title="Who handles what"
            description="Each department publishes a resolution target measured against every complaint."
          />
          {departments.isLoading ? (
            <ListSkeleton rows={3} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {departments.data?.map((dept) => (
                <article key={dept.id} className="surface-card hover-lift space-y-3 p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <h3 className="truncate text-base font-semibold text-foreground">{dept.name}</h3>
                    <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
                      {dept.code}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{dept.description}</p>
                  <dl className="grid gap-1 text-xs text-muted-foreground">
                    <div className="flex justify-between gap-3">
                      <dt>SLA target</dt>
                      <dd className="font-semibold text-foreground">{dept.target_hours} hours</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Helpline</dt>
                      <dd className="font-semibold text-foreground">{dept.contact_phone}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Email</dt>
                      <dd className="truncate font-semibold text-foreground">{dept.contact_email}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </section>
      </PageShell>
    </PublicLayout>
  );
}