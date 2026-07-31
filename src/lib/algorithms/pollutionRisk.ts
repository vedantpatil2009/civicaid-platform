import { clamp } from "./geo";

export interface PollutionReading {
  aqi: number;
  pm25?: number | null;
  pm10?: number | null;
  no2?: number | null;
}

export type AqiBand = "good" | "satisfactory" | "moderate" | "poor" | "very-poor" | "severe";

export interface PollutionRiskResult {
  index: number;
  band: AqiBand;
  label: string;
  advice: string;
}

export function aqiBand(aqi: number): AqiBand {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "satisfactory";
  if (aqi <= 200) return "moderate";
  if (aqi <= 300) return "poor";
  if (aqi <= 400) return "very-poor";
  return "severe";
}

const BAND_META: Record<AqiBand, { label: string; advice: string }> = {
  good: { label: "Good", advice: "Air quality is healthy for everyone." },
  satisfactory: { label: "Satisfactory", advice: "Minor discomfort for very sensitive people." },
  moderate: { label: "Moderate", advice: "Sensitive groups should limit prolonged exertion." },
  poor: { label: "Poor", advice: "Avoid outdoor exercise; wear a mask outdoors." },
  "very-poor": { label: "Very Poor", advice: "Respiratory illness likely on prolonged exposure." },
  severe: { label: "Severe", advice: "Health emergency — stay indoors." },
};

/** Composite risk index blending AQI with particulate load. */
export function calculatePollutionRisk(reading: PollutionReading): PollutionRiskResult {
  const aqiScore = clamp((reading.aqi / 500) * 100);
  const pm25Score = clamp(((reading.pm25 ?? 0) / 250) * 100);
  const pm10Score = clamp(((reading.pm10 ?? 0) / 430) * 100);
  const no2Score = clamp(((reading.no2 ?? 0) / 400) * 100);
  const index = Math.round(aqiScore * 0.55 + pm25Score * 0.25 + pm10Score * 0.12 + no2Score * 0.08);
  const band = aqiBand(reading.aqi);
  return { index, band, ...BAND_META[band] };
}
