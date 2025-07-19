import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { BASE_URL } from '../utils/axiosConfig.js';
axios.defaults.withCredentials = true;


export default function AllRatings() {
  const { token } = useContext(AuthContext);
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/dashboard`, {
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
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-12 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-red-500 mb-6 text-center sm:text-left">
        Rating Changes
      </h1>

      <ul className="space-y-4">
        {ratings.map((r, i) => (
          <li
            key={i}
            className="bg-zinc-800 p-4 rounded-lg shadow-md flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-6"
          >
            <div>
              <a
                href={`https://codeforces.com/contest/${r.contestId}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline font-semibold block text-sm sm:text-base"
              >
                {r.contestName}
              </a>
              <p className="text-gray-300 mt-1 text-sm sm:text-base">
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
              className="text-red-400 hover:underline text-sm self-start sm:self-center"
            >
              View Standings →
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
