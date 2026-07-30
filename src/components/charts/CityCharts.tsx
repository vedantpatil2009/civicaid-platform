import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
);

const PRIMARY = "#2347C6";
const SECONDARY = "#1B2D73";
const GRID = "rgba(30,41,59,0.08)";

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { padding: 10, cornerRadius: 12 },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: "#64748B", font: { size: 11 } } },
    y: { grid: { color: GRID }, ticks: { color: "#64748B", font: { size: 11 } }, beginAtZero: true },
  },
} as const;

function ChartFrame({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="surface-card p-5 sm:p-6">
      <header className="mb-4 min-w-0">
        <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
        {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
      </header>
      <div className="h-64">{children}</div>
    </section>
  );
}

export function TrafficChart({ labels, values }: { labels: string[]; values: number[] }) {
  return (
    <ChartFrame title="Traffic density by corridor" subtitle="Live congestion score (0–100)">
      <Bar
        options={baseOptions as never}
        data={{
          labels,
          datasets: [
            {
              label: "Density",
              data: values,
              backgroundColor: PRIMARY,
              borderRadius: 8,
              maxBarThickness: 34,
            },
          ],
        }}
      />
    </ChartFrame>
  );
}

export function PollutionChart({ labels, values }: { labels: string[]; values: number[] }) {
  return (
    <ChartFrame title="Air quality across wards" subtitle="AQI readings from city monitors">
      <Line
        options={baseOptions as never}
        data={{
          labels,
          datasets: [
            {
              label: "AQI",
              data: values,
              borderColor: SECONDARY,
              backgroundColor: "rgba(35,71,198,0.14)",
              fill: true,
              tension: 0.38,
              pointRadius: 4,
              pointBackgroundColor: SECONDARY,
            },
          ],
        }}
      />
    </ChartFrame>
  );
}

export function DepartmentPerformanceChart({
  labels,
  resolved,
  open,
}: {
  labels: string[];
  resolved: number[];
  open: number[];
}) {
  return (
    <ChartFrame title="Department performance" subtitle="Resolved vs open complaints">
      <Bar
        options={
          {
            ...baseOptions,
            plugins: { ...baseOptions.plugins, legend: { display: true, position: "bottom" } },
            scales: {
              x: { ...baseOptions.scales.x, stacked: true },
              y: { ...baseOptions.scales.y, stacked: true },
            },
          } as never
        }
        data={{
          labels,
          datasets: [
            { label: "Resolved", data: resolved, backgroundColor: "#22C55E", borderRadius: 6, maxBarThickness: 30 },
            { label: "Open", data: open, backgroundColor: "#F59E0B", borderRadius: 6, maxBarThickness: 30 },
          ],
        }}
      />
    </ChartFrame>
  );
}

export function CategoryBreakdownChart({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  return (
    <ChartFrame title="Complaints by category" subtitle="Share of total reports">
      <Doughnut
        options={
          {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "62%",
            plugins: { legend: { position: "right", labels: { boxWidth: 12, font: { size: 11 } } } },
          } as never
        }
        data={{
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: [
                "#2347C6",
                "#1B2D73",
                "#22C55E",
                "#F59E0B",
                "#EF4444",
                "#0EA5E9",
                "#8B5CF6",
                "#14B8A6",
                "#94A3B8",
              ],
              borderWidth: 0,
            },
          ],
        }}
      />
    </ChartFrame>
  );
}