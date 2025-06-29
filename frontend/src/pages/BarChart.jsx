import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function BarChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="italic text-gray-500">No rating data to display.</p>;
  }

  const labels = Object.keys(data).sort((a, b) => Number(a) - Number(b));
  const values = labels.map(label => data[label]);

  const colors = labels.map((rating) => {
    const r = Number(rating);
    if (r >= 2900) return '#FFD700'; // yellow
    if (r >= 2600) return '#FF0000';
    if (r >= 2400) return '#FF3333';
    if (r >= 2300) return '#FF9900';
    if (r >= 2100) return '#FFA500';
    if (r >= 1900) return '#9933FF';
    if (r >= 1600) return '#0000FF';
    if (r >= 1400) return '#00CED1';
    if (r >= 1200) return '#32CD32';
    return '#A9A9A9';
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Solved',
        data: values,
        backgroundColor: colors,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `Solved: ${ctx.raw}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Rating',
          color: '#ffffff',
        },
        ticks: { color: '#ffffff' },
      },
      y: {
        title: {
          display: true,
          text: 'Problems Solved',
          color: '#ffffff',
        },
        ticks: { color: '#ffffff' },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
