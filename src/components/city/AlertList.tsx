import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import type { CityAlert } from "@/services/cityData";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

const TONES = {
  critical: { icon: ShieldAlert, className: "bg-destructive/10 text-destructive" },
  warning: { icon: AlertTriangle, className: "bg-warning/20 text-warning-foreground" },
  info: { icon: Info, className: "bg-info/15 text-info" },
} as const;

export function AlertList({ alerts }: { alerts: CityAlert[] }) {
  return (
    <ul className="space-y-3">
      {alerts.map((alert) => {
        const tone = TONES[(alert.severity as keyof typeof TONES) in TONES ? (alert.severity as keyof typeof TONES) : "info"];
        const Icon = tone.icon;
        return (
          <li key={alert.id} className="surface-card flex gap-3 p-4">
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", tone.className)}>
              <Icon className="size-4.5" aria-hidden />
            </span>
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold text-foreground">{alert.title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{alert.message}</p>
              <p className="text-xs text-muted-foreground">
                {alert.ward_number ? `Ward ${alert.ward_number} · ` : "City-wide · "}
                {formatRelative(alert.created_at)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}