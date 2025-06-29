import { useState, useContext } from "react";
import axios from "../utils/axiosInstance";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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
        "/api/contest/auto-create",
        {
          name,
          numQuestions,
          ratings,
          startTime,
          endTime,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Contest created!");
      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.message || "Creation failed");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto bg-zinc-900 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-red-400 mb-4">Create Private Contest</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Contest Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 rounded bg-black text-white border border-zinc-600"
          />

          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full p-2 rounded bg-black text-white border border-zinc-600"
          />

          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="w-full p-2 rounded bg-black text-white border border-zinc-600"
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
            className="w-full p-2 rounded bg-black text-white border border-zinc-600"
          />

          {ratings.map((r, idx) => (
            <select
              key={idx}
              value={r}
              onChange={(e) => handleRatingChange(idx, e.target.value)}
              className="w-full p-2 rounded bg-black text-white border border-zinc-600"
              required
            >
              {Array.from({ length: 23 }, (_, i) => 800 + i * 100).map((val) => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          ))}

          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded w-full"
          >
            Create Contest
          </button>
        </form>
      </div>
    </div>
  );
}
