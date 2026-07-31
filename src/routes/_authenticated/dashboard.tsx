import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Clock, FileText } from "lucide-react";
import { PageShell, PublicLayout } from "@/components/layout/PublicLayout";
import { SectionHeading } from "@/components/common/SectionHeading";
import { StatCard } from "@/components/dashboard/StatCard";
import { ComplaintCard } from "@/components/city/ComplaintCard";
import { CardSkeletonGrid, EmptyState } from "@/components/common/StateBlocks";
import { Button } from "@/components/ui/button";
import { useMyComplaints } from "@/hooks/useComplaints";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Complaints — Smart City Data Platform" },
      {
        name: "description",
        content:
          "Track the status, priority and department assignment of every complaint you filed.",
      },
      { property: "og:title", content: "My Complaints" },
      { property: "og:description", content: "Your civic complaint tracker." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { profile } = useAuth();
  const complaints = useMyComplaints();
  const list = complaints.data ?? [];
  const open = list.filter((c) => c.status !== "resolved" && c.status !== "rejected");
  const resolved = list.filter((c) => c.status === "resolved");
  const inProgress = list.filter((c) => c.status === "in_progress");

  return (
    <PublicLayout>
      <PageShell className="space-y-8">
        <SectionHeading
          eyebrow="Citizen portal"
          title={profile?.full_name ? `Welcome back, ${profile.full_name}` : "My complaints"}
          description="Every report you filed, with live status and department assignment."
          action={
            <Button asChild className="rounded-full">
              <Link to="/report">Report new issue</Link>
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total filed" value={list.length} icon={FileText} />
          <StatCard label="Open" value={open.length} icon={AlertTriangle} tone="warning" />
          <StatCard label="In progress" value={inProgress.length} icon={Clock} tone="info" />
          <StatCard label="Resolved" value={resolved.length} icon={CheckCircle2} tone="success" />
        </div>

        {complaints.isLoading ? (
          <CardSkeletonGrid count={4} />
        ) : list.length === 0 ? (
          <EmptyState
            title="No complaints yet"
            description="When you report an issue it will appear here with a live status."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        )}
      </PageShell>
    </PublicLayout>
  );
}
