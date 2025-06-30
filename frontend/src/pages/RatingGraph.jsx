import { Line } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  Tooltip,
  Filler
} from "chart.js";
import "chartjs-adapter-date-fns";

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, TimeScale, Tooltip, Filler);

export default function RatingGraph({ ratingHistory }) {
  const data = {
    labels: ratingHistory.map(entry => new Date(entry.ratingUpdateTimeSeconds * 1000)),
    datasets: [
      {
        label: "Rating",
        data: ratingHistory.map(entry => ({
          x: new Date(entry.ratingUpdateTimeSeconds * 1000),
          y: entry.newRating,
          contestName: entry.contestName,
          contestId: entry.contestId,
        })),
        borderColor: "red",
        backgroundColor: "rgba(255, 0, 0, 0.3)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const point = context.raw;
            return ` ${point.contestName} — ${point.y}`;
          },
          afterLabel: () => `Click to open contest`
        }
      }
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "month",
          tooltipFormat: "MMM yyyy"
        },
        ticks: {
          color: "white",
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
        },
        grid: { color: "#444" }
      },
      y: {
        ticks: { color: "white" },
        grid: { color: "#444" }
      }
    },
    onClick: (evt, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const contest = ratingHistory[index];
        const contestURL = `https://codeforces.com/contest/${contest.contestId}`;
        window.open(contestURL, "_blank");
      }
    }
  };

  return (
    <div className="mt-10 bg-zinc-900 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-red-400 mb-4">Rating Graph</h2>
      <div style={{ height: "400px" }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
