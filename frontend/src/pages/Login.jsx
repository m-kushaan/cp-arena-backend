import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      toast.success("Logged in successfully!");
      login(res.data.token);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  // Google auth callback handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      login(token);
      toast.success("Logged in with Google!");
      window.history.replaceState({}, document.title, "/");
      navigate("/");
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white flex items-center justify-center">
      {/* Background glow effects */}
      <div className="absolute bg-red-600 opacity-30 w-96 h-96 rounded-full top-10 left-10 blur-3xl animate-pulse"></div>
      <div className="absolute bg-red-500 opacity-25 w-80 h-80 rounded-full bottom-10 right-10 blur-2xl animate-ping"></div>

      <form
        onSubmit={handleLogin}
        className="relative bg-zinc-900 border border-red-600 text-white p-8 rounded-lg shadow-lg w-full max-w-md z-10"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-red-500">
          Welcome Back
        </h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 bg-zinc-800 text-white border border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 bg-zinc-800 text-white border border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 transition py-2 rounded font-semibold"
        >
          Login
        </button>
        <div className="my-4 text-center text-gray-400">or</div>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-white text-black hover:bg-gray-300 transition py-2 rounded font-semibold"
        >
          Continue with Google
        </button>
      </form>
    </div>
  );
}
