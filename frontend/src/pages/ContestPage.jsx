import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import { BASE_URL } from '../utils/axiosConfig.js';
axios.defaults.withCredentials = true;

export default function ContestPage() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);

  const [contest, setContest] = useState(null);
  const [timeStatus, setTimeStatus] = useState("loading");
  const [countdown, setCountdown] = useState("");
  const [verdicts, setVerdicts] = useState({});

  const fetchContest = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/contest/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const c = res.data;
      const now = new Date();
      const start = new Date(c.startTime);
      const end = new Date(c.endTime);

      if (now < start) setTimeStatus("before");
      else if (now >= start && now <= end) setTimeStatus("during");
      else setTimeStatus("after");

      setContest(c);
    } catch (err) {
      toast.error("Failed to load contest.");
      setTimeStatus("error");
    }
  };

  const fetchVerdicts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/submissions/contest/status/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const verdictMap = {};
      res.data.problemsStatus.forEach((p) => {
        const key = `${p.contestId}-${p.index}`;
        if (p.solved) verdictMap[key] = "OK";
      });
      setVerdicts(verdictMap);
    } catch (err) {
      console.error("Failed to fetch verdicts", err);
    }
  };

  useEffect(() => {
    if (token) fetchContest();
  }, [id, token]);

  useEffect(() => {
    if (!contest) return;

    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (timeStatus === "before") {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = start - now;
        if (diff <= 0) {
          clearInterval(interval);
          fetchContest();
        } else {
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setCountdown(`${mins}m ${secs}s`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }

    if (timeStatus === "during") {
      const interval = setInterval(() => {
        const now = new Date();
        const remaining = end - now;
        if (remaining <= 0) {
          clearInterval(interval);
          setTimeStatus("after");
        } else {
          const mins = Math.floor(remaining / 60000);
          const secs = Math.floor((remaining % 60000) / 1000);
          setCountdown(`${mins}m ${secs}s`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [contest, timeStatus]);

  useEffect(() => {
    if (timeStatus === "during") {
      fetchVerdicts();
      const interval = setInterval(fetchVerdicts, 10000);
      return () => clearInterval(interval);
    }
  }, [timeStatus]);

  const getVerdictColor = (verdict) => {
    if (!verdict) return "border-gray-500";
    if (verdict === "OK") return "border-green-500";
    return "border-red-500";
  };

  if (timeStatus === "loading" || !contest) {
    return (
      <div className="min-h-screen text-white bg-black flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-12 py-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">{contest.name}</h1>

      <div className="space-y-2 text-sm sm:text-base text-gray-300">
        <p><strong>Duration:</strong> {contest.duration} mins</p>
        <p><strong>Start:</strong> {new Date(contest.startTime).toLocaleString()}</p>
        <p><strong>End:</strong> {new Date(contest.endTime).toLocaleString()}</p>
      </div>

      {timeStatus === "before" && (
        <p className="text-yellow-400 font-semibold mt-4">⏳ Starts in: {countdown}</p>
      )}
      {timeStatus === "during" && (
        <p className="text-green-400 font-semibold mt-4">⏰ Ends in: {countdown}</p>
      )}
      {timeStatus === "after" && (
        <p className="text-red-400 font-semibold mt-4">📛 Contest Over</p>
      )}

      <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">Problems</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contest.problems.map((p, idx) => {
          const verdict = verdicts[`${p.contestId}-${p.index}`] || null;
          return (
            <div
              key={idx}
              className={`border-2 rounded-lg p-4 ${getVerdictColor(verdict)} hover:shadow-lg transition`}
            >
              <a
                href={p.link}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline text-lg font-medium break-words"
              >
                {p.name}
              </a>
              <p className="text-sm text-gray-400 mt-1">
                Verdict:{" "}
                <span className={
                  verdict === "OK"
                    ? "text-green-400"
                    : verdict
                      ? "text-red-400"
                      : "text-gray-400"
                }>
                  {verdict || "Unsolved"}
                </span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
