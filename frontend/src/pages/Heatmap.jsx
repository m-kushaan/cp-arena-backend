import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import ReactTooltip from "react-tooltip";
import "../index.css"; // Required for color classes

export default function Heatmap({ data }) {
  const today = new Date();
  const startDate = new Date();
  startDate.setFullYear(today.getFullYear() - 1);

  return (
    <div className="mt-10 px-4 sm:px-6 lg:px-12 overflow-x-auto">
      <h2 className="text-xl font-bold text-red-400 mb-2">🔥 Streak Heatmap</h2>
      <CalendarHeatmap
        startDate={startDate}
        endDate={today}
        values={data.map(d => ({
          date: d.date,
          count: d.solved ? 1 : 0,
        }))}
        classForValue={(value) => {
          if (!value || value.count === 0) return "color-empty";
          return `color-scale-${Math.min(value.count, 4)}`;
        }}
        tooltipDataAttrs={(value) => ({
          "data-tip": `${value.date}: ${value.count ? "Solved" : "No problem solved"}`,
        })}
        showWeekdayLabels
      />
      <ReactTooltip />
    </div>
  );
}
