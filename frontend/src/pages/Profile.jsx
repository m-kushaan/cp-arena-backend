import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import Heatmap from "./Heatmap";
import RatingGraph from "./RatingGraph";
import BarChart from "./BarChart";
import PieChart from "./pieChart";

const getColorClass = (rating) => {
  if (rating >= 2900) return "text-black bg-yellow-400 font-bold px-2 py-0.5 rounded";
  if (rating >= 2600) return "text-red-600 font-bold";
  if (rating >= 2400) return "text-red-500 font-semibold";
  if (rating >= 2300) return "text-orange-500 font-semibold";
  if (rating >= 2100) return "text-orange-400";
  if (rating >= 1900) return "text-violet-500";
  if (rating >= 1600) return "text-blue-500";
  if (rating >= 1400) return "text-cyan-400";
  if (rating >= 1200) return "text-green-500";
  return "text-gray-400";
};

const formatTimeLeft = (endTime) => {
  const now = new Date();
  const diff = new Date(endTime) - now;
  if (diff <= 0) return "Ended";
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${hours}h ${minutes}m left`;
};

export default function Profile() {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get("/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        toast.error("Failed to load profile.");
      }
    };
    fetchDashboard();
  }, [token]);

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  const {
    userInfo,
    submissions = [],
    tagsSolved = {},
    unsolvedProblems = [],
    ratingHistory = [],
    streakData = [],
    ratingGraph = {},
    privateContests = {},
    cfContests = {}
  } = data;

  const {
    upcoming: upcomingPrivateContests = [],
    ongoing: ongoingPrivateContests = [],
    past: pastPrivateContests = []
  } = privateContests;

  const {
    upcoming: upcomingCFContests = [],
    ongoing: ongoingCFContests = []
  } = cfContests;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white p-8">
      {/* Profile Box */}
      <div className="max-w-4xl mx-auto bg-zinc-900 rounded-xl shadow-lg flex flex-col md:flex-row p-6">
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <img
            src={userInfo.titlePhoto}
            alt="User Avatar"
            className="rounded-md border-4 border-red-600 shadow-md w-48 h-48 object-cover"
          />
          <a
            href={`https://codeforces.com/profile/${userInfo.handle}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 text-xl font-bold text-red-500 hover:underline"
          >
            {userInfo.handle}
          </a>
        </div>
        <div className="w-full md:w-2/3 px-6 mt-6 md:mt-0 flex flex-col justify-center space-y-3">
          <p><span className="text-red-400 font-medium">Name:</span> {userInfo.firstName} {userInfo.lastName}</p>
          <p><span className="text-red-400">Rank:</span> <span className={getColorClass(userInfo.rating)}>{userInfo.rank}</span></p>
          <p><span className="text-red-400">Rating:</span> <span className={getColorClass(userInfo.rating)}>{userInfo.rating}</span> (max: <span className={getColorClass(userInfo.maxRating)}>{userInfo.maxRating}, {userInfo.maxRank}</span>)</p>
          <p><span className="text-red-400">Contribution:</span> {userInfo.contribution}</p>
          <p><span className="text-red-400">Friends:</span> {userInfo.friendOfCount}</p>
          <p><span className="text-red-400">Location:</span> {userInfo.city}, {userInfo.country}</p>
          <p><span className="text-red-400">Organization:</span> {userInfo.organization}</p>
        </div>
      </div>

      {/* Private Contests */}
<div className="max-w-4xl mx-auto mt-10 bg-zinc-900 p-6 rounded-xl shadow-lg">
  <h3 className="text-lg font-semibold text-red-400 mb-4">Private Contests</h3>
  {[{ type: "Upcoming", list: upcomingPrivateContests }, { type: "Ongoing", list: ongoingPrivateContests }, { type: "Previous", list: pastPrivateContests }].map(({ type, list }) => (
    <div key={type} className="mb-4">
      <h4 className="text-md text-blue-400 mb-2">{type} Contests</h4>
      {list.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No {type.toLowerCase()} contests</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {list.map((contest, i) => (
            <li key={i} className="flex justify-between items-center">
              <a
                href={`/contest/${contest._id}`}
                className="text-blue-300 hover:underline"
              >
                {contest.name}
              </a>
              {type === "Ongoing" ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-green-400">{formatTimeLeft(contest.endTime)}</span>
                  <a
                    href={`/contest/${contest._id}`}
                    className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-white text-xs"
                  >
                    Join
                  </a>
                </div>
              ) : type === "Upcoming" ? (
                <span className="text-xs text-yellow-400">Starts in {formatTimeLeft(contest.startTime)}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  ))}
</div>


      {/* Codeforces Contests */}
<div className="max-w-4xl mx-auto mt-10 bg-zinc-900 p-6 rounded-xl shadow-lg">
  <h3 className="text-lg font-semibold text-red-400 mb-4">Codeforces Contests</h3>
  {[{ type: "Upcoming", list: upcomingCFContests }, { type: "Ongoing", list: ongoingCFContests }].map(({ type, list }) => (
    <div key={type} className="mb-4">
      <h4 className="text-md text-blue-400 mb-2">{type} Contests</h4>
      {list.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No {type.toLowerCase()} contests</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {list.map((contest, i) => {
            const start = contest.startTimeSeconds * 1000;
            const end = start + contest.durationSeconds * 1000;

            const label = type === "Ongoing"
              ? formatTimeLeft(end)
              : `Starts in ${formatTimeLeft(start)}`;

            return (
              <li key={i} className="flex justify-between items-center">
                <a
                  href={`https://codeforces.com/contest/${contest.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-300 hover:underline"
                >
                  {contest.name}
                </a>
                <span className="text-xs text-green-400">{label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  ))}
</div>


      {/* Rating Graph */}
      <div className="max-w-4xl mx-auto mt-10 bg-zinc-900 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-red-400 mb-4">Rating Graph</h3>
        <RatingGraph ratingHistory={ratingHistory} />
      </div>

      {/* Streak Heatmap */}
      <div className="max-w-4xl mx-auto mt-10 bg-zinc-900 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-red-400 mb-4">Streak Heatmap</h3>
        <Heatmap data={streakData} />
      </div>

      {/* Pie Chart + Topic Breakdown */}
      <div className="max-w-4xl mx-auto mt-10 grid md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 p-4 rounded-lg shadow-md min-h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold text-red-400 mb-3">Problems Solved by Topic</h3>
          <div className="flex-grow"><PieChart tagsSolved={tagsSolved} /></div>
        </div>
        <div className="bg-zinc-900 p-4 rounded-lg shadow-md min-h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold text-red-400 mb-3">Topic Breakdown</h3>
          <ul className="text-sm text-gray-300 space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {Object.entries(tagsSolved).map(([tag, count], i) => (
              <li key={i} className="flex justify-between">
                <span className="capitalize text-white">{tag}</span>
                <span className="text-red-400">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bar Chart (by Rating) */}
      <div className="max-w-4xl mx-auto mt-10 bg-zinc-900 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-red-400 mb-3">Problems Solved by Rating</h3>
        {Object.keys(ratingGraph).length ? (
          <BarChart data={ratingGraph} />
        ) : (
          <p className="italic text-gray-500">No rating data to display.</p>
        )}
      </div>

      {/* Unsolved Problems - Horizontal Scroll */}
      {unsolvedProblems.length > 0 && (
        <div className="max-w-4xl mx-auto mt-10 bg-zinc-900 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-red-400 mb-3">Unsolved Problems</h3>
          <div className="flex overflow-x-auto space-x-4">
            {unsolvedProblems.map((id, i) => {
              const parts = id.split("-");
              if (parts.length !== 2) return null;
              const [cid, idx] = parts;
              return (
                <a
                  key={i}
                  href={`https://codeforces.com/contest/${cid}/problem/${idx}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-300 hover:underline whitespace-nowrap"
                >
                  {cid}-{idx}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
