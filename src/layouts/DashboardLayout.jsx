import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import {
  Menu,
  X,
  MapPin,
  Map as MapIcon,
  CalendarDays,
  Info,
  Search,
  Globe,
  ChevronDown,
  UserRound,
} from "lucide-react";

function LogoMark() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
      <circle cx="19" cy="19" r="19" fill="#0b3149" />
      <path
        d="M6 22c3-4 6-4 9 0s6 4 9 0 6-4 8 0"
        stroke="#5EEAD4"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="14" cy="13" r="3.2" fill="#FBBF24" />
    </svg>
  );
}

const NAV_LINKS = [
  { label: "Discover", icon: MapPin, route: "/dashboard" },
  { label: "Interactive Map", icon: MapIcon, route: "/map" },
  { label: "Plan Your Trip", icon: CalendarDays, route: "/plan-your-trip" },
  { label: "About", icon: Info, route: "/about" },
];

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
        {/* ================= Header ================= */}
        <header className="sticky top-0 z-40 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 px-5 sm:px-8 lg:px-10 py-3 max-w-[1680px] mx-auto">
            {/* Left: hamburger + logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0b3149] hover:bg-[#0a2b3f] text-white transition shrink-0"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2.5 shrink-0"
              >
                <LogoMark />
                <span className="text-left leading-tight">
                  <span className="block font-serif text-lg font-bold text-[#0b3149]">
                    Ratnagiri
                  </span>
                  <span className="block text-[11px] font-medium text-teal-600 -mt-0.5">
                    Tourism Dashboard
                  </span>
                </span>
              </button>
            </div>

            {/* Center: nav links */}
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
              {NAV_LINKS.map(({ label, icon: Icon, route }) => {
                const active = location.pathname === route;
                return (
                  <button
                    key={label}
                    onClick={() => navigate(route)}
                    className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                      active
                        ? "border-teal-500 text-[#0b3149]"
                        : "border-transparent hover:text-[#0b3149]"
                    }`}
                  >
                    <Icon size={15} className={active ? "text-teal-600" : "text-slate-400"} />
                    {label}
                  </button>
                );
              })}
            </nav>

            {/* Right: language, search, login/logout */}
            <div className="flex items-center gap-4 shrink-0">
              <button className="hidden sm:flex items-center gap-1 text-sm text-slate-600 hover:text-[#0b3149] transition">
                <Globe size={16} />
                EN
                <ChevronDown size={14} />
              </button>

              <button
                aria-label="Search"
                className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:bg-slate-100 transition"
              >
                <Search size={18} />
              </button>

              {showLoginButton && (
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 bg-[#0b3149] hover:bg-[#0a2b3f] text-white pl-3 pr-4 py-2 rounded-full font-semibold text-sm transition"
                >
                  <UserRound size={16} />
                  Login
                </button>
              )}
              {showLogoutButton && (
                <button
                  onClick={() => {
                    logout();
                    navigate("/dashboard");
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-semibold text-sm transition"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}