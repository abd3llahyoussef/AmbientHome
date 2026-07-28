import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    type ChartOptions,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface RealtimeLineChartProps {
    title: string;
    value: number;
    color?: string;
    maxPoints?: number;
}

interface Point {
    time: string;
    value: number;
}

export default function RealtimeLineChart({
    title,
    value,
    color = "rgb(75,192,192)",
    maxPoints = 20,
}: RealtimeLineChartProps) {
    const [history, setHistory] = useState<Point[]>([]);

    useEffect(() => {
        const time = new Date().toLocaleTimeString();

        setHistory((prev) => {
            const updated = [...prev, { time, value }];

            if (updated.length > maxPoints) {
                updated.shift();
            }

            return updated;
        });
    }, [value, maxPoints]);

    const data = {
        labels: history.map((p) => p.time),
        datasets: [
            {
                label: title,
                data: history.map((p) => p.value),
                borderColor: color,
                backgroundColor: color,
                tension: 0.3,
                pointRadius: 3,
                fill: false,
            },
        ],
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: false,
            },
        },
    };

    return (
        <div
            style={{
                width: "100%",
                height: 300,
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 15,
            }}
        >
            <Line data={data} options={options} />
        </div>
    );
}