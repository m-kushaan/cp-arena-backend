import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function HomePage() {
  const { token } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white flex flex-col justify-center items-center px-4 py-10">
      <motion.h1
        className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-red-600 mb-6 text-center"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Welcome to Bit Rush
      </motion.h1>

      <motion.p
        className="text-base sm:text-lg md:text-xl text-gray-300 mb-10 max-w-2xl text-center px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Practice, compete, and analyze your performance on private and public contests powered by Codeforces.
      </motion.p>

      {token ? (
        <motion.div
          className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            to="/profile"
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold text-sm sm:text-base transition"
          >
            Profile
          </Link>
          <Link
            to="/create-contest"
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold text-sm sm:text-base transition"
          >
            Create Contest
          </Link>
          <Link
            to="/problems"
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold text-sm sm:text-base transition"
          >
            Problems
          </Link>
        </motion.div>
      ) : (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4"
        >
          <Link
            to="/login"
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold text-sm sm:text-base transition"
          >
            Get Started
          </Link>
        </motion.div>
      )}
    </div>
  );
}
