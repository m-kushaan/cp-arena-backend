import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function AllSubmissions() {
  const { token } = useContext(AuthContext);
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const res = await axios.get("/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sorted = [...res.data.submissions].sort(
          (a, b) => b.creationTimeSeconds - a.creationTimeSeconds
        );
        setSubs(sorted.slice(0, 50)); // limit to 50 recent
      } catch (err) {
        toast.error("Failed to load submissions.");
      }
    };

    fetchSubs();
  }, [token]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold text-red-500 mb-6">Recent Submissions</h1>
      <ul className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
        {subs.map((s, i) => {
          const prob = s.problem;
          const id = `${prob.contestId}${prob.index}`;
          const problemURL = `https://codeforces.com/problemset/problem/${prob.contestId}/${prob.index}`;
          const submissionURL = `https://codeforces.com/contest/${prob.contestId}/submission/${s.id}`;

          return (
            <li
              key={i}
              className="bg-zinc-800 rounded p-4 text-sm flex flex-col md:flex-row justify-between"
            >
              <div>
                <a
                  href={problemURL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline font-medium"
                >
                  {prob.name}
                </a>
                <p className="text-gray-400">
                  Verdict:{" "}
                  <span className={s.verdict === "OK" ? "text-green-400" : "text-red-400"}>
                    {s.verdict}
                  </span>
                  , Lang: {s.programmingLanguage}
                </p>
              </div>

              <a
                href={submissionURL}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-red-400 hover:underline mt-2 md:mt-0"
              >
                View Submission →
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
