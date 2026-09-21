import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import {
  Menu,
  X,
  Search,
  Globe,
  ChevronDown,
  UserRound,
  MessageSquare,
  MapPlus,
} from "lucide-react";

function LogoMark() {
  return (
    <svg width="46" height="46" viewBox="0 0 38 38" fill="none">
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

// Shared classes for every plain-text nav item: dark text, grey rounded-pill
// hover state, text grows slightly on hover — matches the Tripadvisor ref.
const NAV_ITEM_CLASS =
  "flex items-center px-3.5 py-2 rounded-lg text-[15px] hover:text-base font-semibold text-slate-900 hover:bg-slate-100 transition-all duration-150";

// Plain nav links, left to right. "Forum" is intentionally last.
// Update the routes below once the real pages exist.
const NAV_LINKS = [
  { label: "Plan Your Trip", route: "/plan-your-trip" },
  { label: "Experiences", route: "/experiences" },
  { label: "Stories", route: "/stories" },
  { label: "Resources", route: "/resources" },
  { label: "About", route: "/about" },
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
                className="flex items-center gap-3 shrink-0"
              >
                <LogoMark />
                <span className="text-left leading-tight">
                  <span className="block font-serif text-2xl font-bold text-[#0b3149]">
                    Ratnagiri
                  </span>
                  <span className="block text-xs font-medium text-teal-600 -mt-0.5">
                    Tourism Dashboard
                  </span>
                </span>
              </button>
            </div>

            {/* Center: nav */}
            <nav className="hidden md:flex items-center gap-2 text-sm">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.route)}
                  className={`${NAV_ITEM_CLASS} ${
                    location.pathname.startsWith(link.route) ? "bg-slate-100" : ""
                  }`}
                >
                  {link.label}
                </button>
              ))}

              <button
                onClick={() => navigate("/review/add-place")}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[15px] px-4 py-2 rounded-full transition-colors duration-150 ml-1"
              >
                <MapPlus size={16} />
                Add location and services
              </button>

              <button
                onClick={() => navigate("/forum")}
                className={`${NAV_ITEM_CLASS} ${
                  location.pathname.startsWith("/forum") ? "bg-slate-100" : ""
                }`}
              >
                <MessageSquare
                  size={16}
                  className={`mr-1.5 ${
                    location.pathname.startsWith("/forum") ? "text-teal-600" : "text-slate-500"
                  }`}
                />
                Forum
              </button>
            </nav>

            {/* Right: language, search, login/logout */}
            <div className="flex items-center gap-4 shrink-0">
              <button className="hidden sm:flex items-center gap-1 text-sm font-semibold text-slate-900 hover:bg-slate-100 rounded-lg px-2.5 py-2 transition">
                <Globe size={16} />
                EN
                <ChevronDown size={14} />
              </button>

              <button
                aria-label="Search"
                className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full text-slate-700 hover:bg-slate-100 transition"
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