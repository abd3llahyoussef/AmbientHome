import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { TimeSeriesPoint } from "../types/sensor";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export interface LiveLineChartProps {
  title: string;
  points: TimeSeriesPoint[];
  unit: string;
  color: string;
  /** Fixed y-axis bounds; omit to let Chart.js auto-scale. */
  yMin?: number;
  yMax?: number;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/**
 * A single, self-contained line chart. Render one of these per metric
 * (temperature °C, temperature °F, humidity, ...) and feed it its own
 * slice of time-series data.
 */
export default function LiveLineChart({ title, points, unit, color, yMin, yMax }: LiveLineChartProps) {
  const chartData = useMemo(
    () => ({
      labels: points.map((p) => formatTime(p.timestamp)),
      datasets: [
        {
          label: `${title} (${unit})`,
          data: points.map((p) => p.value),
          borderColor: color,
          backgroundColor: `${color}33`,
          pointBackgroundColor: color,
          pointRadius: 3,
          tension: 0.35,
          fill: true,
        },
      ],
    }),
    [points, title, unit, color]
  );

  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 250 },
      scales: {
        x: {
          ticks: { color: "#9ca3af", maxRotation: 0, autoSkip: true, maxTicksLimit: 6 },
          grid: { color: "rgba(255,255,255,0.06)" },
        },
        y: {
          min: yMin,
          max: yMax,
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(255,255,255,0.06)" },
        },
      },
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.parsed.y} ${unit}`,
          },
        },
      },
    }),
    [unit, yMin, yMax]
  );

  const latest = points.length > 0 ? points[points.length - 1].value : null;

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <h3>{title}</h3>
        <span className="chart-card__latest" style={{ color }}>
          {latest !== null ? `${latest} ${unit}` : "—"}
        </span>
      </div>
      <div className="chart-card__canvas">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
