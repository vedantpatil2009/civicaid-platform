import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Clock, Gauge } from "lucide-react";
import { PageShell, PublicLayout } from "@/components/layout/PublicLayout";
import { SectionHeading } from "@/components/common/SectionHeading";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState, ListSkeleton } from "@/components/common/StateBlocks";
import { PriorityBadge, StatusBadge } from "@/components/common/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryBreakdownChart, DepartmentPerformanceChart } from "@/components/charts/CityCharts";
import { useAllComplaints, useRealtimeComplaints, useUpdateComplaint } from "@/hooks/useComplaints";
import { useDepartments } from "@/hooks/useCityData";
import { useAuth } from "@/contexts/AuthContext";
import { formatRelative } from "@/lib/format";
import type { ComplaintStatus } from "@/services/complaints";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — Smart City Data Platform" },
      {
        name: "description",
        content:
          "Municipal staff console for triaging, assigning and resolving citizen complaints.",
      },
      { property: "og:title", content: "Admin Console" },
      { property: "og:description", content: "Triage and resolve citizen complaints." },
    ],
  }),
  component: AdminPage,
});

const STATUSES: ComplaintStatus[] = ["pending", "assigned", "in_progress", "resolved", "rejected"];

function AdminPage() {
  const { isStaff } = useAuth();
  useRealtimeComplaints();
  const complaints = useAllComplaints();
  const departments = useDepartments();
  const update = useUpdateComplaint();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const list = complaints.data ?? [];
  const filtered = useMemo(
    () => (statusFilter === "all" ? list : list.filter((c) => c.status === statusFilter)),
    [list, statusFilter],
  );

  const byCategory = useMemo(() => {
    const counts = new Map<string, number>();
    list.forEach((c) => counts.set(c.category, (counts.get(c.category) ?? 0) + 1));
    return {
      labels: [...counts.keys()],
      values: [...counts.values()],
    };
  }, [list]);

  const byDepartment = useMemo(() => {
    const total = new Map<string, number>();
    const done = new Map<string, number>();
    list.forEach((c) => {
      const name = c.departments?.name ?? "Unassigned";
      total.set(name, (total.get(name) ?? 0) + 1);
      if (c.status === "resolved") done.set(name, (done.get(name) ?? 0) + 1);
    });
    const labels = [...total.keys()];
    return {
      labels,
      resolved: labels.map((l) => done.get(l) ?? 0),
      open: labels.map((l) => (total.get(l) ?? 0) - (done.get(l) ?? 0)),
    };
  }, [list]);

  if (!isStaff) {
    return (
      <PublicLayout>
        <PageShell>
          <EmptyState
            title="Staff access only"
            description="Your account does not have administrator or staff permissions."
          />
        </PageShell>
      </PublicLayout>
    );
  }

  const openCount = list.filter((c) => c.status !== "resolved" && c.status !== "rejected").length;
  const resolvedCount = list.filter((c) => c.status === "resolved").length;
  const criticalCount = list.filter((c) => c.priority === "critical").length;

  return (
    <PublicLayout>
      <PageShell className="space-y-8">
        <SectionHeading
          eyebrow="Admin portal"
          title="Complaint operations console"
          description="Live queue with status, priority and department assignment controls."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total complaints" value={list.length} icon={Gauge} />
          <StatCard label="Open" value={openCount} icon={Clock} tone="warning" />
          <StatCard label="Critical" value={criticalCount} icon={AlertTriangle} tone="danger" />
          <StatCard label="Resolved" value={resolvedCount} icon={CheckCircle2} tone="success" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="surface-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Complaints by category</h2>
            <CategoryBreakdownChart labels={byCategory.labels} values={byCategory.values} />
          </div>
          <div className="surface-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Department performance</h2>
            <DepartmentPerformanceChart
              labels={byDepartment.labels}
              resolved={byDepartment.resolved}
              open={byDepartment.open}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
          <span className="text-sm font-medium text-foreground">Filter by status</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 max-w-xs rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {complaints.isLoading ? (
          <ListSkeleton rows={5} />
        ) : filtered.length === 0 ? (
          <EmptyState title="Queue is clear" description="No complaints match this filter." />
        ) : (
          <ul className="space-y-3">
            {filtered.map((complaint) => (
              <li key={complaint.id} className="surface-card space-y-4 p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                      {complaint.reference_code} · {formatRelative(complaint.created_at)}
                    </p>
                    <h3 className="truncate text-base font-semibold text-foreground">
                      {complaint.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {complaint.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <StatusBadge status={complaint.status} />
                    <PriorityBadge priority={complaint.priority} />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select
                    value={complaint.status}
                    onValueChange={(value) => {
                      update.mutate(
                        { id: complaint.id, status: value as ComplaintStatus },
                        { onSuccess: () => toast.success("Status updated") },
                      );
                    }}
                  >
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={complaint.department_id ?? undefined}
                    onValueChange={(value) => {
                      update.mutate(
                        { id: complaint.id, department_id: value },
                        { onSuccess: () => toast.success("Department assigned") },
                      );
                    }}
                  >
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue placeholder="Assign department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.data?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PageShell>
    </PublicLayout>
  );
}
