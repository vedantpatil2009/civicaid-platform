import { createFileRoute } from "@tanstack/react-router";
import { Building2, Compass, Eye, Target } from "lucide-react";
import { PageShell, PublicLayout } from "@/components/layout/PublicLayout";
import { SectionHeading } from "@/components/common/SectionHeading";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Corporation — Smart City Data Platform" },
      {
        name: "description",
        content:
          "How the municipal corporation runs the Smart City Data Platform: mission, governance, departments and service commitments.",
      },
      { property: "og:title", content: "About the Municipal Corporation" },
      {
        property: "og:description",
        content: "Mission, governance and service commitments behind the Smart City Data Platform.",
      },
    ],
  }),
  component: AboutPage,
});

const PILLARS = [
  {
    icon: Target,
    title: "Mission",
    body: "Deliver measurable civic services with a transparent record of every request, escalation and resolution.",
  },
  {
    icon: Eye,
    title: "Vision",
    body: "A city where any resident can see the same operational data the administration sees.",
  },
  {
    icon: Compass,
    title: "Approach",
    body: "Automated prioritisation, duplicate detection and SLA clocks instead of manual registers.",
  },
  {
    icon: Building2,
    title: "Governance",
    body: "Eight wards, seven departments and a single accountable escalation matrix.",
  },
];

function AboutPage() {
  return (
    <PublicLayout>
      <PageShell className="space-y-14">
        <SectionHeading
          eyebrow="About"
          title="A municipal platform built for accountability"
          description="The Smart City Data Platform unifies citizen reporting, departmental workflow and live environmental telemetry in one public system."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <article key={pillar.title} className="surface-card hover-lift space-y-3 p-6">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                <pillar.icon className="size-5" aria-hidden />
              </span>
              <h2 className="text-base font-semibold text-foreground">{pillar.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
            </article>
          ))}
        </div>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">How a complaint travels</h2>
            <ol className="space-y-4">
              {[
                [
                  "Submitted",
                  "A citizen files a report with category, description, GPS location and optional photo evidence.",
                ],
                [
                  "Scored",
                  "The priority engine weighs category severity, urgent keywords, upvotes and ageing to assign a priority.",
                ],
                [
                  "Deduplicated",
                  "Text similarity and geo-proximity checks flag reports describing the same on-ground issue.",
                ],
                [
                  "Routed",
                  "The complaint is assigned to the owning department with its published SLA target.",
                ],
                [
                  "Resolved",
                  "Status changes notify the citizen automatically and close the SLA clock.",
                ],
              ].map(([title, body], index) => (
                <li key={title} className="flex gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="surface-card space-y-4 p-6">
            <h2 className="text-xl font-semibold text-foreground">Service commitments</h2>
            <dl className="divide-y divide-border text-sm">
              {[
                ["Emergency response", "Within 4 hours"],
                ["Water supply disruption", "Within 24 hours"],
                ["Road & pothole repair", "Within 72 hours"],
                ["Garbage collection", "Within 24 hours"],
                ["Street light restoration", "Within 48 hours"],
                ["Complaint acknowledgement", "Immediate, with reference code"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="shrink-0 font-semibold text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </PageShell>
    </PublicLayout>
  );
}
