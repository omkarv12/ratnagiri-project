import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { LogIn, LogOut } from "lucide-react";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const showLoginButton = location.pathname === "/dashboard" && !user;
  const showLogoutButton =
    user &&
    (location.pathname === "/dashboard" || location.pathname === "/admin");

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Updated Header */}
        <header className="flex items-center justify-between px-10 py-4 bg-white shadow-sm">
          {/* Left: Logo */}
          <div className="text-xl font-serif font-semibold cursor-pointer" onClick={() => navigate("/dashboard")}>
            Ratnagiri
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-gray-700">
            <a href="#" className="hover:text-gray-900">Destinations</a>
            <a href="#" className="hover:text-gray-900">Bespoke Tours</a>
            <a href="#" className="hover:text-gray-900">Atelier Journal</a>
            <a href="#" className="hover:text-gray-900">Our Philosophy</a>
            <a href="#" className="hover:text-gray-900">Enquire</a>
          </nav>

          {/* Right: Admin Login / Logout Button */}
          <div>
            {showLoginButton && (
              <button
                onClick={() => navigate("/login")}
                className="bg-[#0b3149] hover:bg-[#0a2b3f] text-white px-4 py-2 rounded-md font-semibold text-sm transition"
              >
                ADMIN LOGIN
              </button>
            )}
            {showLogoutButton && (
              <button
                onClick={() => {
                  logout();
                  navigate("/dashboard");
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold text-sm transition"
              >
                LOGOUT
              </button>
            )}
          </div>
       header>

        Main content */}
        <div class="p-8 pt6">
         Outlet />
        </div      </main>
    </div>
  );
}