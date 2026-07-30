import { clamp } from "./geo";

export type FloodLevel = "low" | "watch" | "warning" | "severe";

export interface FloodInput {
  rainfallMm: number;
  humidity?: number | null;
  waterLoggingReports?: number;
  drainageEfficiency?: number; // 0-1, 1 = perfect drainage
  isLowLying?: boolean;
}

export interface FloodRiskResult {
  score: number;
  level: FloodLevel;
  label: string;
  advice: string;
}

/** Flood risk indicator from rainfall intensity, drainage and live reports. */
export function calculateFloodRisk(input: FloodInput): FloodRiskResult {
  const rainScore = clamp((input.rainfallMm / 100) * 100);
  const humidityScore = clamp(((input.humidity ?? 60) - 50) * 2);
  const reportScore = clamp((input.waterLoggingReports ?? 0) * 18);
  const drainagePenalty = clamp((1 - (input.drainageEfficiency ?? 0.7)) * 100);
  const terrain = input.isLowLying ? 12 : 0;

  const score = clamp(
    Math.round(
      rainScore * 0.4 + reportScore * 0.25 + drainagePenalty * 0.2 + humidityScore * 0.15 + terrain,
    ),
  );

  const level: FloodLevel =
    score >= 75 ? "severe" : score >= 55 ? "warning" : score >= 32 ? "watch" : "low";

  const meta: Record<FloodLevel, { label: string; advice: string }> = {
    low: { label: "Low risk", advice: "Drainage operating normally." },
    watch: { label: "Watch", advice: "Localised puddling possible in low-lying lanes." },
    warning: { label: "Warning", advice: "Avoid underpasses; keep emergency numbers handy." },
    severe: { label: "Severe", advice: "Water logging expected — move to higher ground." },
  };

  return { score, level, ...meta[level] };
}