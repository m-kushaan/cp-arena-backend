import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function ProblemsPage() {
  const { token } = useContext(AuthContext);
  const [problems, setProblems] = useState([]);
  const [difficulty, setDifficulty] = useState("");
  const [tag, setTag] = useState("");
  const [excludeSolved, setExcludeSolved] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params = {};
      if (difficulty) params.difficulty = difficulty;
      if (tag) params.tag = tag;
      if (excludeSolved) params.excludeSolved = true;

      const res = await axios.get("/api/problems", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      // Sort by createdAt (most recent first)
      const sorted = [...res.data.problems].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setProblems(sorted);
    } catch (err) {
      toast.error("Failed to fetch problems.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const getBoxColor = (verdict) => {
    if (!verdict) return "border-zinc-700"; // unsolved
    if (verdict === "OK") return "border-green-500"; // accepted
    return "border-red-500"; // attempted but failed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto bg-zinc-900 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-red-400 mb-4">Find Codeforces Problems</h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="bg-black text-white border border-zinc-600 rounded px-3 py-2"
          >
            <option value="">All Difficulties</option>
            {[800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="bg-black text-white border border-zinc-600 rounded px-3 py-2"
          >
            <option value="">All Tags</option>
            {["greedy", "dp", "math", "implementation", "dfs and similar", "binary search"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={excludeSolved}
              onChange={(e) => setExcludeSolved(e.target.checked)}
            />
            Exclude Solved
          </label>

          <button
            onClick={fetchProblems}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Filter
          </button>
        </div>

        {/* Problem List */}
        {loading ? (
          <p className="text-gray-400">Loading problems...</p>
        ) : problems.length === 0 ? (
          <p className="text-gray-400 italic">No problems found with selected filters.</p>
        ) : (
          <div className="grid gap-4">
            {problems.map((p, i) => (
              <div
                key={`${p.contestId}-${p.index}`}
                className={`bg-zinc-800 rounded-lg p-4 shadow-md border ${getBoxColor(p.verdict)}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <a
                    href={`https://codeforces.com/contest/${p.contestId}/problem/${p.index}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline font-medium"
                  >
                    {p.name}
                  </a>
                  {p.rating && (
                    <span className="text-sm text-gray-400">Rating: {p.rating}</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Tags: {p.tags.join(", ")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
