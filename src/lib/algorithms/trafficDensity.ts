import { clamp } from "./geo";

export type CongestionLevel = "free" | "moderate" | "heavy" | "gridlock";

export interface TrafficReading {
  vehicle_count: number;
  capacity: number;
  avg_speed_kph: number;
  incident_count?: number;
}

export interface TrafficDensityResult {
  score: number;
  level: CongestionLevel;
  label: string;
  volumeRatio: number;
}

/**
 * Density = 60% volume-to-capacity ratio + 30% speed deficit + 10% incidents.
 */
export function calculateTrafficDensity(reading: TrafficReading): TrafficDensityResult {
  const capacity = Math.max(1, reading.capacity);
  const volumeRatio = reading.vehicle_count / capacity;
  const speedDeficit = clamp((1 - reading.avg_speed_kph / 50) * 100);
  const incidents = clamp((reading.incident_count ?? 0) * 25);
  const score = clamp(
    Math.round(clamp(volumeRatio * 100) * 0.6 + speedDeficit * 0.3 + incidents * 0.1),
  );

  const level: CongestionLevel =
    score >= 80 ? "gridlock" : score >= 60 ? "heavy" : score >= 35 ? "moderate" : "free";

  const label = {
    free: "Free flowing",
    moderate: "Moderate",
    heavy: "Heavy congestion",
    gridlock: "Gridlock",
  }[level];

  return { score, level, label, volumeRatio };
}