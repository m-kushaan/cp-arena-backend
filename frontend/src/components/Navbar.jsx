import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Webhook } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentPath = location.pathname;

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/profile", label: "Profile" },
    { path: "/create-contest", label: "Create Contest" },
    { path: "/problems", label: "Problems" },
  ];

  return (
    <nav className="w-full bg-black text-white px-6 py-4 flex justify-between items-center shadow-md z-50">
      {/* Logo Section */}
      <div className="flex items-center space-x-2 text-2xl font-extrabold text-red-600">
        <Webhook className="w-6 h-6" />
        <Link to="/" className="hover:text-red-400 transition">Bit Rush</Link>
      </div>

      {/* Navigation Links */}
      <div className="space-x-6 text-base flex items-center">
        {token ? (
          <>
            {navItems
              .filter(item => item.path !== currentPath)
              .map((item, idx) => (
                <Link key={idx} to={item.path} className="hover:text-red-400 transition">
                  {item.label}
                </Link>
              ))}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-red-400 transition">Login</Link>
            <Link to="/register" className="hover:text-red-400 transition">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
