import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";

export default function ContestPage() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);

  const [contest, setContest] = useState(null);
  const [timeStatus, setTimeStatus] = useState("loading");
  const [countdown, setCountdown] = useState("");
  const [verdicts, setVerdicts] = useState({});

  const fetchContest = async () => {
    try {
      const res = await axios.get(`/api/contest/${id}`, {
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
      const res = await axios.get(`/api/submissions/contest/status/${id}`, {
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
          fetchContest(); // refresh status
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
    <div className="min-h-screen text-white bg-black p-6">
      <h1 className="text-2xl font-bold mb-2">{contest.name}</h1>
      <p className="mb-1"><strong>Duration:</strong> {contest.duration} mins</p>
      <p className="mb-1"><strong>Start:</strong> {new Date(contest.startTime).toLocaleString()}</p>
      <p className="mb-2"><strong>End:</strong> {new Date(contest.endTime).toLocaleString()}</p>

      {timeStatus === "before" && (
        <p className="text-yellow-400 font-semibold mb-4">⏳ Starts in: {countdown}</p>
      )}
      {timeStatus === "during" && (
        <p className="text-green-400 font-semibold mb-4">⏰ Ends in: {countdown}</p>
      )}
      {timeStatus === "after" && (
        <p className="text-red-400 font-semibold mb-4">📛 Contest Over</p>
      )}

      <h2 className="text-xl font-semibold mt-4 mb-2">Problems</h2>
      <div className="grid gap-4 md:grid-cols-2">
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
                className="text-blue-400 hover:underline text-lg font-medium"
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
