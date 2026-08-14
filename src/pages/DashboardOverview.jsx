import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { LogIn, LogOut, Menu } from "lucide-react";

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
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main content area */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow-sm px-4 sm:px-6 py-4 sticky top-0 z-30">
          {/* Left: Hamburger (mobile) and Logo */}
          <div className="flex items-center gap-4">
            {/* Hamburger for mobile */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 md:hidden focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-600"
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <div
              onClick={() => {
                navigate("/dashboard");
                setSidebarOpen(false);
              }}
              className="text-xl font-serif font-semibold cursor-pointer select-none"
            >
              Ratnagiri
            </div>
          </div>

          {/* Center: Navigation links (hidden on mobile) */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-gray-700">
            <a href="#" className="hover:text-gray-900">
              Destinations
            </a>
            <a href="#" className="hover:text-gray-900">
              Bespoke Tours
            </a>
            <a href="#" className="hover:text-gray-900">
              Atelier Journal
            </a>
            <a href="#" className="hover:text-gray-900">
              Our Philosophy
            </a>
            <a href="#" className="hover:text-gray-900">
              Enquire
            </a>
          </nav>

          {/* Right: Login / Logout Buttons */}
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
        <div className="p-4 sm:p-8 pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}