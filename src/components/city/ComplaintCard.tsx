import { CalendarClock, MapPin } from "lucide-react";
import { PriorityBadge, StatusBadge } from "@/components/common/StatusBadge";
import type { ComplaintWithDepartment } from "@/services/complaints";
import { formatRelative } from "@/lib/format";

export function ComplaintCard({
  complaint,
  onSelect,
}: {
  complaint: ComplaintWithDepartment;
  onSelect?: (complaint: ComplaintWithDepartment) => void;
}) {
  const Wrapper = onSelect ? "button" : "div";
  return (
    <Wrapper
      {...(onSelect ? { type: "button" as const, onClick: () => onSelect(complaint) } : {})}
      className="surface-card hover-lift w-full space-y-3 p-5 text-left"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            {complaint.reference_code}
          </p>
          <h3 className="truncate text-base font-semibold text-foreground">{complaint.title}</h3>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
      </div>
      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {complaint.description}
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {complaint.address ?? `Ward ${complaint.ward_number ?? "—"}`}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="size-3.5 shrink-0" aria-hidden />
          {formatRelative(complaint.created_at)}
        </span>
        {complaint.departments ? (
          <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
            {complaint.departments.name}
          </span>
        ) : null}
      </div>
    </Wrapper>
  );
}
