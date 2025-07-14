import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AllRatings from "./pages/allRating";
import AllSubmissions from "./pages/allSumissions";
import ContestPage from "./pages/ContestPage";
import ProblemsPage from "./pages/ProblemsPage";
import CreateContestPage from "./pages/CreateContestPage";
import { AuthContext } from "./context/AuthContext";
import axios from "axios";
import { BASE_URL } from './utils/axiosConfig';


function App() {
  const { token } = useContext(AuthContext);
  const [runningContest, setRunningContest] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Delay rendering until AuthContext is initialized
  useEffect(() => {
    setTimeout(() => setIsReady(true), 0);
  }, []);

  useEffect(() => {
    if (!token) {
      console.warn("⏳ Token not available yet or user not logged in.");
      return;
    }

    const checkRunningContest = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/contest/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const now = new Date();

        const ongoing = res.data.find((c) => {
          const start = new Date(c.startTime);
          const end = new Date(c.endTime);
          return now >= start && now <= end;
        });

        const justEnded = res.data.find((c) => {
          const end = new Date(c.endTime);
          return now > end && now - end < 30000; // ended within last 30 seconds
        });

        if (ongoing) {
          setRunningContest({ type: "ongoing", data: ongoing });
        } else if (justEnded) {
          setRunningContest({ type: "ended", data: justEnded });
          setTimeout(() => {
            setRunningContest(null);
            window.location.href = "/profile";
          }, 3000);
        } else {
          setRunningContest(null);
        }
      } catch (err) {
        console.error("❌ Error checking contest:", err.message);
      }
    };

    checkRunningContest();
    const interval = setInterval(checkRunningContest, 30000);
    return () => clearInterval(interval);
  }, [token]);

  if (!isReady) return null;

  return (
    <Router>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Ongoing Contest Banner */}
      {runningContest?.type === "ongoing" && (
        <div className="fixed bottom-0 left-0 w-full bg-green-700 text-white text-center py-2 z-50 shadow-md">
          Contest <strong>{runningContest.data.name}</strong> is live!{" "}
          <Link
            to={`/contest/${runningContest.data._id}`}
            className="underline font-semibold"
          >
            Join Now →
          </Link>
        </div>
      )}

      {/* Ended Contest Banner */}
      {runningContest?.type === "ended" && (
        <div className="fixed bottom-0 left-0 w-full bg-red-700 text-white text-center py-2 z-50 shadow-md">
          Contest <strong>{runningContest.data.name}</strong> has ended. Redirecting...
        </div>
      )}

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
