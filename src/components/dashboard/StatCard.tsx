import type { ElementType } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: ElementType;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
  trend?: { value: string; direction: "up" | "down" };
  className?: string;
}

const TONES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-info/15 text-info",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  trend,
  className,
}: StatCardProps) {
  return (
    <article className={cn("surface-card hover-lift p-5 sm:p-6", className)}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", TONES[tone])}>
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
              trend.direction === "up"
                ? "bg-success/15 text-success"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="size-3" aria-hidden />
            ) : (
              <ArrowDownRight className="size-3" aria-hidden />
            )}
            {trend.value}
          </span>
        ) : null}
        {hint ? <span className="text-muted-foreground">{hint}</span> : null}
      </div>
    </article>
  );
}
