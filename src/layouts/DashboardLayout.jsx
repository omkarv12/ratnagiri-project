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
  Sparkles,
  Compass,
  Star,
  MessageSquare,
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
  "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[15px] hover:text-base font-semibold text-slate-900 hover:bg-slate-100 transition-all duration-150";

// Dropdown parents, matching the Discover / Review branches from the site map.
const NAV_MENUS = [
  {
    label: "Discover",
    route: "/discover",
    icon: Compass,
    children: [
      { label: "Travelers' Choice", route: "/discover/travelers-choice" },
      { label: "Travel Stories", route: "/stories" },
      { label: "Travel Games", route: "/discover/travel-games" },
    ],
  },
  {
    label: "Review",
    route: "/review",
    icon: Star,
    children: [
      { label: "Write a review", route: "/review/write" },
      { label: "Post photos", route: "/review/photos" },
      { label: "Add a place", route: "/review/add-place" },
    ],
  },
];

function NavDropdown({ menu, active, navigate }) {
  const Icon = menu.icon;
  return (
    <div className="relative group">
      <button
        onClick={() => navigate(menu.route)}
        className={`${NAV_ITEM_CLASS} ${active ? "bg-slate-100" : ""}`}
      >
        <Icon size={16} className={active ? "text-teal-600" : "text-slate-500"} />
        {menu.label}
        <ChevronDown size={13} className="text-slate-400 group-hover:rotate-180 transition-transform" />
      </button>

      {/* Dropdown panel */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-150 z-50">
        <div className="w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-2">
          {menu.children.map((child) => (
            <button
              key={child.label}
              onClick={() => navigate(child.route)}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100 hover:text-[#0b3149] rounded-lg mx-1 w-[calc(100%-8px)] transition-colors"
            >
              {child.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

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
              {/* Plan with Interactive Map — border-only animated glow CTA */}
              <button
                onClick={() => navigate("/map")}
                className="glow-cta flex items-center gap-2 bg-white text-slate-900 font-semibold text-[15px] hover:text-base pl-4 pr-5 py-2 rounded-full transition-all duration-150 mr-2"
              >
                <Sparkles size={16} className="text-emerald-500" />
                Plan with Interactive Map
              </button>

              {NAV_MENUS.map((menu) => (
                <NavDropdown
                  key={menu.label}
                  menu={menu}
                  active={location.pathname.startsWith(menu.route)}
                  navigate={navigate}
                />
              ))}

              <button
                onClick={() => navigate("/forum")}
                className={`${NAV_ITEM_CLASS} ${
                  location.pathname.startsWith("/forum") ? "bg-slate-100" : ""
                }`}
              >
                <MessageSquare
                  size={16}
                  className={location.pathname.startsWith("/forum") ? "text-teal-600" : "text-slate-500"}
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

        {/* Border-only animated glow for the "Plan with Interactive Map" CTA.
            Two synced conic-gradient rings spin behind the button, masked so
            only the border-width ring is visible (no fill behind the
            button). The gradient has uneven stops around the full circle, so
            as it rotates, brightness shifts from side to side instead of a
            single dot chasing around — ::after is a softly blurred, slightly
            larger copy for ambient glow. Scoped here since this is the only
            place it's used; move to your global stylesheet (e.g. index.css)
            if reused elsewhere. */}
        <style>{`
          .glow-cta {
            position: relative;
            z-index: 0;
            border: 1px solid rgba(15, 23, 42, 0.08);
          }
          .glow-cta::before,
          .glow-cta::after {
            content: "";
            position: absolute;
            border-radius: 9999px;
            background: conic-gradient(
              from 0deg,
              #22c55e 0deg,
              #bbf7d0 55deg,
              transparent 100deg,
              transparent 140deg,
              #86efac 195deg,
              #22c55e 235deg,
              transparent 280deg,
              transparent 320deg,
              #4ade80 350deg,
              #22c55e 360deg
            );
            animation: spinBorder 5s linear infinite;
            pointer-events: none;
          }
          .glow-cta::before {
            inset: -2px;
            padding: 2px;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
                    mask-composite: exclude;
            z-index: -1;
          }
          .glow-cta::after {
            inset: -4px;
            padding: 4px;
            filter: blur(4px);
            opacity: 0.6;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
                    mask-composite: exclude;
            z-index: -2;
          }
          @keyframes spinBorder {
            to { transform: rotate(360deg); }
          }
          @media (prefers-reduced-motion: reduce) {
            .glow-cta::before,
            .glow-cta::after { animation: none; }
          }
        `}</style>
      </main>
    </div>
  );
}