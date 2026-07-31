import { cn } from "@/lib/utils";
import type { ComplaintPriority, ComplaintStatus } from "@/services/complaints";

const STATUS_STYLES: Record<ComplaintStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-warning/15 text-warning-foreground border-warning/30",
  },
  assigned: { label: "Assigned", className: "bg-info/15 text-info border-info/30" },
  in_progress: { label: "In Progress", className: "bg-primary/10 text-primary border-primary/25" },
  resolved: { label: "Resolved", className: "bg-success/15 text-success border-success/30" },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive border-destructive/25",
  },
};

const PRIORITY_STYLES: Record<ComplaintPriority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-muted text-muted-foreground border-border" },
  medium: { label: "Medium", className: "bg-warning/15 text-warning-foreground border-warning/30" },
  high: { label: "High", className: "bg-destructive/10 text-destructive border-destructive/25" },
  critical: {
    label: "Critical",
    className: "bg-destructive text-destructive-foreground border-destructive",
  },
};

const base =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap";

export function StatusBadge({
  status,
  className,
}: {
  status: ComplaintStatus;
  className?: string;
}) {
  const meta = STATUS_STYLES[status];
  return <span className={cn(base, meta.className, className)}>{meta.label}</span>;
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: ComplaintPriority;
  className?: string;
}) {
  const meta = PRIORITY_STYLES[priority];
  return <span className={cn(base, meta.className, className)}>{meta.label}</span>;
}

export const STATUS_LABELS = STATUS_STYLES;
