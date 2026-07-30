import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:flex sm:items-end sm:justify-between",
        align === "center" && "text-center sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn("min-w-0 space-y-2", align === "center" && "mx-auto max-w-2xl")}>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        ) : null}
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}