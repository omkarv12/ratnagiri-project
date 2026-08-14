import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { LogIn, LogOut, Menu, X } from "lucide-react";

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
        <header className="sticky top-0 z-40 flex items-center justify-between px-10 py-4 bg-white shadow-sm">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0b3149] hover:bg-[#0a2b3f] text-white transition"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div
              className="text-xl font-serif font-semibold cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              Ratnagiri
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-gray-700">
            <a href="#" className="hover:text-gray-900">
              Discover
            </a>
            <a href="#" className="hover:text-gray-900">
              Tourism Development Fund 
            </a>
            <a href="#" className="hover:text-gray-900">
              Interactive Map
            </a>
            <a href="#" className="hover:text-gray-900">
              Select Language 
            </a>
            <a href="#" className="hover:text-gray-900">
              Enquire
            </a>
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
        </header>

        {/* Main content */}
        <div className="p-8 pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}