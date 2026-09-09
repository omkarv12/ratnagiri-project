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

  const navLinks = [
    { label: "Discover", href: "#" },
    { label: "Tourism Fund", href: "#" },
    { label: "Interactive Map", href: "#" },
    { label: "Language", href: "#" },
    { label: "Enquire", href: "#" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* ================= Header ================= */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 sm:px-10 h-[72px] bg-white/90 backdrop-blur-md border-b border-slate-200/80">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0b2f45] text-white hover:bg-[#123d5c] active:scale-95 transition-all duration-200"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex flex-col items-start leading-none group"
            >
              <span className="font-serif italic text-[19px] sm:text-[21px] text-[#0b2f45] tracking-tight group-hover:text-[#123d5c] transition-colors">
                Ratnagiri
                <span className="text-orange-500 not-italic font-sans font-semibold text-[10px] sm:text-[11px] uppercase tracking-[0.18em] block mt-0.5">
                  Sustainable Tourism
                </span>
              </span>
            </button>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-[13px] font-medium text-slate-600">
            {navLinks.map((link) => (
              
                key={link.label}
                href={link.href}
                className="relative px-4 py-2 rounded-full uppercase tracking-wide text-[11.5px] font-semibold transition-colors duration-200 hover:text-[#0b2f45] hover:bg-slate-100"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: Admin Login / Logout Button */}
          <div className="flex items-center">
            {showLoginButton && (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 bg-gradient-to-r from-[#0b2f45] to-[#12405e] hover:from-orange-500 hover:to-orange-600 text-white pl-4 pr-5 py-2.5 rounded-full font-semibold text-[12px] uppercase tracking-wide shadow-sm hover:shadow-md transition-all duration-200"
              >
                <LogIn size={15} />
                Admin Login
              </button>
            )}
            {showLogoutButton && (
              <button
                onClick={() => {
                  logout();
                  navigate("/dashboard");
                }}
                className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 pl-4 pr-5 py-2.5 rounded-full font-semibold text-[12px] uppercase tracking-wide transition-all duration-200"
              >
                <LogOut size={15} />
                Logout
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