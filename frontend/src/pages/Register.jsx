import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    codeforcesHandle: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/register', formData);
      toast.success(res.data.message || 'Registered successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach(msg => toast.error(msg));
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Something went wrong.');
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white flex items-center justify-center">
      {/* Glowing red background accents */}
      <div className="absolute bg-red-600 opacity-30 w-80 h-80 rounded-full top-20 left-10 blur-3xl animate-pulse"></div>
      <div className="absolute bg-red-500 opacity-25 w-80 h-80 rounded-full bottom-10 right-10 blur-2xl animate-ping"></div>

      <form
        onSubmit={handleRegister}
        className="relative bg-zinc-900 border border-red-600 text-white p-8 rounded-lg shadow-lg w-full max-w-md z-10"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-red-500">
          Join the Web
        </h2>
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="w-full p-3 mb-4 bg-zinc-800 text-white border border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
          value={formData.username}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-3 mb-4 bg-zinc-800 text-white border border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="text"
          name="codeforcesHandle"
          placeholder="Codeforces Handle"
          className="w-full p-3 mb-4 bg-zinc-800 text-white border border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
          value={formData.codeforcesHandle}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-3 mb-4 bg-zinc-800 text-white border border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
          value={formData.password}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 transition py-2 rounded font-semibold"
        >
          Register
        </button>

        <p className="text-sm text-center mt-4 text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-red-500 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
