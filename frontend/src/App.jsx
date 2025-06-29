import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import AllRatings from './pages/allRating';
import AllSubmissions from './pages/allSumissions';
import ContestPage from './pages/ContestPage';
import ProblemsPage from "./pages/ProblemsPage";
import CreateContestPage from "./pages/CreateContestPage";
import { AuthContext } from "./context/AuthContext";
import axios from "axios";

function App() {
  const { token } = useContext(AuthContext);
  const [runningContest, setRunningContest] = useState(null);

  useEffect(() => {
    const checkRunningContest = async () => {
      if (!token) return;

      try {
        const res = await axios.get("/api/contest/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const now = new Date();
        const ongoing = res.data.find(c => {
          const start = new Date(c.startTime);
          const end = new Date(c.endTime);
          return now >= start && now <= end;
        });

        const justEnded = res.data.find(c => {
          const end = new Date(c.endTime);
          return now > end && now - end < 30000; // ended within last 30s
        });

        if (ongoing) {
          setRunningContest({ type: "ongoing", data: ongoing });
        } else if (justEnded) {
          setRunningContest({ type: "ended", data: justEnded });

          setTimeout(() => {
            setRunningContest(null);
            window.location.href = "/profile"; // or use navigate
          }, 3000);
        } else {
          setRunningContest(null);
        }
      } catch (err) {
        console.error("❌ Error checking contest:", err.message);
      }
    };

    checkRunningContest();
    const interval = setInterval(checkRunningContest, 30000); // every 30s
    return () => clearInterval(interval);
  }, [token]);

  return (
    <Router>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />

      {/* 🟢 Banner for Running Contest */}
      {runningContest?.type === "ongoing" && (
        <div className="fixed bottom-0 left-0 w-full bg-green-700 text-white text-center py-2 z-50 shadow-md">
          Contest <strong>{runningContest.data.name}</strong> is live!{" "}
          <Link to={`/contest/${runningContest.data._id}`} className="underline font-semibold">
            Join Now →
          </Link>
        </div>
      )}

      {/* 🔴 Banner for Recently Ended Contest */}
      {runningContest?.type === "ended" && (
        <div className="fixed bottom-0 left-0 w-full bg-red-700 text-white text-center py-2 z-50 shadow-md">
          Contest <strong>{runningContest.data.name}</strong> has ended. Redirecting...
        </div>
      )}

      {/* 🧭 Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ratings" element={<AllRatings />} />
        <Route path="/submissions" element={<AllSubmissions />} />
        <Route path="/contest/:id" element={<ContestPage />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/create-contest" element={<CreateContestPage />} />
      </Routes>
    </Router>
  );
}

export default App;
