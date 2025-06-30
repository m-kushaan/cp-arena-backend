import { useState, useContext } from "react";
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

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white flex items-center justify-center px-4 py-10">
      {/* Glowing background effects */}
      <div className="absolute bg-red-600 opacity-30 w-64 h-64 sm:w-96 sm:h-96 rounded-full top-10 left-10 blur-3xl animate-pulse"></div>
      <div className="absolute bg-red-500 opacity-25 w-52 h-52 sm:w-80 sm:h-80 rounded-full bottom-10 right-10 blur-2xl animate-ping"></div>

      <form
        onSubmit={handleLogin}
        className="relative w-full max-w-sm sm:max-w-md bg-zinc-900 border border-red-600 p-6 sm:p-8 rounded-xl shadow-xl z-10"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-red-500">
          Welcome Back
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 sm:p-4 mb-4 bg-zinc-800 text-white border border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-red-600 text-sm sm:text-base"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 sm:p-4 mb-6 bg-zinc-800 text-white border border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-red-600 text-sm sm:text-base"
        />

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 transition py-2 rounded font-semibold text-sm sm:text-base"
        >
          Login
        </button>
      </form>
    </div>
  );
}
