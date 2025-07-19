import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from '../utils/axiosConfig.js';
axios.defaults.withCredentials = true;

export default function CreateContestPage() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [numQuestions, setNumQuestions] = useState(1);
  const [ratings, setRatings] = useState(["800"]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleRatingChange = (index, value) => {
    const updated = [...ratings];
    updated[index] = value;
    setRatings(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (ratings.length !== numQuestions) {
      toast.error("Ratings must match number of questions.");
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/api/contest/auto-create`,
        {
          name,
          numQuestions,
          ratings,
          startTime,
          endTime,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Contest created!");
      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create contest");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="w-full max-w-screen-md mx-auto bg-zinc-900 p-4 sm:p-6 rounded-xl shadow-lg">
        <h2 className="text-lg sm:text-xl font-bold text-red-400 mb-4 text-center">
          Create Private Contest
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Contest Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 sm:p-3 rounded bg-black text-white border border-zinc-600 text-sm sm:text-base"
          />

          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full p-2 sm:p-3 rounded bg-black text-white border border-zinc-600 text-sm sm:text-base"
          />

          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="w-full p-2 sm:p-3 rounded bg-black text-white border border-zinc-600 text-sm sm:text-base"
          />

          <input
            type="number"
            min="1"
            max="10"
            value={numQuestions}
            onChange={(e) => {
              const count = parseInt(e.target.value);
              setNumQuestions(count);
              setRatings(Array(count).fill("800"));
            }}
            className="w-full p-2 sm:p-3 rounded bg-black text-white border border-zinc-600 text-sm sm:text-base"
          />

          <div className="flex flex-col gap-3">
            {ratings.map((r, idx) => (
              <select
                key={idx}
                value={r}
                onChange={(e) => handleRatingChange(idx, e.target.value)}
                className="w-full p-2 sm:p-3 rounded bg-black text-white border border-zinc-600 text-sm sm:text-base"
                required
              >
                {Array.from({ length: 23 }, (_, i) => 800 + i * 100).map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            ))}
          </div>

          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded w-full text-sm sm:text-base font-semibold transition"
          >
            Create Contest
          </button>
        </form>
      </div>
    </div>
  );
}
