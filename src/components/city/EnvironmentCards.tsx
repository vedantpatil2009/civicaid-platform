import { CloudRain, Droplets, Gauge, Waves, Wind } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { calculatePollutionRisk } from "@/lib/algorithms/pollutionRisk";
import { calculateTrafficDensity } from "@/lib/algorithms/trafficDensity";
import { calculateFloodRisk } from "@/lib/algorithms/floodRisk";
import type { PollutionReadingRow, TrafficReadingRow, WeatherReading } from "@/services/cityData";
import { cn } from "@/lib/utils";

function Shell({
  title,
  icon: Icon,
  children,
  accent,
}: {
  title: string;
  icon: typeof Wind;
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <article className="surface-card hover-lift flex h-full flex-col gap-4 p-5 sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", accent)}>
          <Icon className="size-4.5" aria-hidden />
        </span>
        <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </article>
  );
}

export function AqiCard({ reading }: { reading: PollutionReadingRow }) {
  const risk = calculatePollutionRisk({
    aqi: reading.aqi,
    pm25: Number(reading.pm25),
    pm10: Number(reading.pm10),
    no2: Number(reading.no2),
  });
  return (
    <Shell title="Air quality index" icon={Wind} accent="bg-primary-soft text-primary">
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold leading-none text-foreground">{reading.aqi}</span>
        <span className="pb-1 text-sm font-semibold text-muted-foreground">{risk.label}</span>
      </div>
      <Progress value={risk.index} aria-label="Pollution risk index" />
      <dl className="grid grid-cols-3 gap-2 text-xs">
        {[
          ["PM2.5", reading.pm25],
          ["PM10", reading.pm10],
          ["NO₂", reading.no2],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl bg-muted px-2.5 py-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-semibold text-foreground">{Number(value ?? 0).toFixed(0)}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs leading-relaxed text-muted-foreground">{risk.advice}</p>
    </Shell>
  );
}

export function WeatherCard({ reading }: { reading: WeatherReading }) {
  return (
    <Shell title="City weather" icon={CloudRain} accent="bg-info/15 text-info">
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold leading-none text-foreground">
          {Number(reading.temperature_c).toFixed(0)}°
        </span>
        <span className="pb-1 text-sm font-semibold text-muted-foreground">
          {reading.condition}
        </span>
      </div>
      <dl className="grid grid-cols-3 gap-2 text-xs">
        {[
          ["Feels", `${Number(reading.feels_like_c ?? reading.temperature_c).toFixed(0)}°`],
          ["Humidity", `${reading.humidity ?? 0}%`],
          ["Wind", `${Number(reading.wind_kph ?? 0).toFixed(0)} kph`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-muted px-2.5 py-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-semibold text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Droplets className="size-3.5 shrink-0" aria-hidden />
        {Number(reading.rainfall_mm).toFixed(1)} mm rainfall in the last 24 hours
      </p>
    </Shell>
  );
}

export function TrafficCard({ reading }: { reading: TrafficReadingRow }) {
  const density = calculateTrafficDensity({
    vehicle_count: reading.vehicle_count,
    capacity: reading.capacity,
    avg_speed_kph: Number(reading.avg_speed_kph),
    incident_count: reading.incident_count,
  });
  return (
    <Shell title="Traffic density" icon={Gauge} accent="bg-warning/20 text-warning-foreground">
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold leading-none text-foreground">{density.score}</span>
        <span className="pb-1 text-sm font-semibold text-muted-foreground">{density.label}</span>
      </div>
      <Progress value={density.score} aria-label="Traffic density score" />
      <p className="truncate text-xs text-muted-foreground">
        {reading.corridor} · {Number(reading.avg_speed_kph).toFixed(0)} kph avg ·{" "}
        {reading.vehicle_count.toLocaleString()} vehicles
      </p>
    </Shell>
  );
}

export function FloodCard({
  weather,
  waterLoggingReports,
}: {
  weather: WeatherReading;
  waterLoggingReports: number;
}) {
  const risk = calculateFloodRisk({
    rainfallMm: Number(weather.rainfall_mm),
    humidity: weather.humidity,
    waterLoggingReports,
    drainageEfficiency: 0.68,
    isLowLying: true,
  });
  return (
    <Shell title="Water logging risk" icon={Waves} accent="bg-destructive/10 text-destructive">
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold leading-none text-foreground">{risk.score}</span>
        <span className="pb-1 text-sm font-semibold text-muted-foreground">{risk.label}</span>
      </div>
      <Progress value={risk.score} aria-label="Flood risk score" />
      <p className="text-xs leading-relaxed text-muted-foreground">{risk.advice}</p>
    </Shell>
  );
}
