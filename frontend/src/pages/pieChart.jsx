import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// Codeforces-themed colors
const colors = [
  "#32CD32", // green
  "#00CED1", // cyan
  "#0000FF", // blue
  "#AA00FF", // violet
  "#FFBB33", // orange-gold
  "#FF9900", // orange
  "#FF6666", // reddish-orange
  "#FF0000", // red
  "#FFD700", // yellow
  "#B0B0B0", // gray
];

const PieChart = ({ tagsSolved }) => {
  if (!tagsSolved || Object.keys(tagsSolved).length === 0) {
    return <p className="text-gray-400 text-sm">No topic data available.</p>;
  }

  const labels = Object.keys(tagsSolved);
  const dataValues = labels.map((tag) => tagsSolved[tag]);

  const chartData = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#ffffff"
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const tag = chartData.labels[context.dataIndex];
            const value = chartData.datasets[0].data[context.dataIndex];
            return `${tag}: ${value}`;
          }
        }
      }
    }
  };

  return <Pie data={chartData} options={options} />;
};

export default PieChart;
