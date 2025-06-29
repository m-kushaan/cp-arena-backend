import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function AllRatings() {
  const { token } = useContext(AuthContext);
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const res = await axios.get("/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sorted = [...res.data.ratingHistory].sort(
          (a, b) => b.ratingUpdateTimeSeconds - a.ratingUpdateTimeSeconds
        );
        setRatings(sorted);
      } catch (err) {
        toast.error("Failed to load ratings.");
      }
    };

    fetchRatings();
  }, [token]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold text-red-500 mb-6">Rating Changes</h1>
      <ul className="space-y-4">
        {ratings.map((r, i) => (
          <li
            key={i}
            className="bg-zinc-800 p-4 rounded-lg shadow-md text-sm flex flex-col md:flex-row justify-between"
          >
            <div>
              <a
                href={`https://codeforces.com/contest/${r.contestId}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline font-semibold"
              >
                {r.contestName}
              </a>
              <p className="text-gray-300 mt-1">
                Old: {r.oldRating}, New:{" "}
                <span className="text-green-400 font-semibold">{r.newRating}</span>{" "}
                (<span className={r.newRating - r.oldRating >= 0 ? "text-green-500" : "text-red-500"}>
                  {r.newRating - r.oldRating >= 0 ? "+" : ""}
                  {r.newRating - r.oldRating}
                </span>)
              </p>
            </div>

            <a
              href={`https://codeforces.com/contest/${r.contestId}/standings`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-red-400 hover:underline mt-2 md:mt-0"
            >
              View Standings →
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
