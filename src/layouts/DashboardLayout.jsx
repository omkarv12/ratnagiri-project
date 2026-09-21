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
  MapPlus,
} from "lucide-react";

// Compact coastal mark: navy tile, sun over a wave. Small enough to sit
// quietly next to the (now smaller) wordmark.
function LogoMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <rect width="34" height="34" rx="10" fill="#0b3149" />
      <circle cx="21.5" cy="12" r="4" fill="#FBBF24" />
      <path
        d="M5 21c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 9 0"
        stroke="#5EEAD4"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M5 27c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 9 0"
        stroke="#5EEAD4"
        strokeOpacity="0.45"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Shared classes for every plain-text nav item. `whitespace-nowrap` keeps each
// label on a single line so the whole bar never wraps.
const NAV_ITEM_CLASS =
  "flex items-center whitespace-nowrap px-3 py-2 rounded-lg text-[15px] hover:text-base font-semibold text-slate-900 hover:bg-slate-100 transition-all duration-150";

// Explore dropdown — its own pages live under /explore/*.
const EXPLORE_MENU = {
  label: "Explore",
  route: "/explore",
  children: [
    { label: "Guided Walks", route: "/explore/guided-walks" },
    { label: "Konkani Food", route: "/explore/konkani-food" },
    { label: "Community Interaction Events", route: "/explore/community-events" },
    { label: "Calendar", route: "/explore/calendar" },
  ],
};

// Experiences dropdown — its own pages live under /experiences/*.
const EXPERIENCES_MENU = {
  label: "Experiences",
  route: "/experiences",
  children: [
    { label: "Hidden Paths", route: "/experiences/hidden-paths" },
    { label: "Explore Villages", route: "/experiences/explore-villages" },
    { label: "Itineraries", route: "/experiences/itineraries" },
    { label: "Circuits", route: "/experiences/circuits" },
  ],
};

// Stories dropdown — its own pages live under /stories/*.
const STORIES_MENU = {
  label: "Stories",
  route: "/stories",
  children: [
    { label: "Videos", route: "/stories/videos" },
    { label: "Reels", route: "/stories/reels" },
    { label: "Written Stories", route: "/stories/written" },
  ],
};

// About dropdown — its own pages live under /about/*.
const ABOUT_MENU = {
  label: "About",
  route: "/about",
  children: [
    { label: "Society and Economy", route: "/about/society-and-economy" },
    { label: "Culture", route: "/about/culture" },
    { label: "Good Governance", route: "/about/good-governance" },
  ],
};

// Resources dropdown — its own pages live under /resources/*.
const RESOURCES_MENU = {
  label: "Resources",
  route: "/resources",
  children: [
    { label: "Medical Facilities", route: "/resources/medical-facilities" },
    { label: "Police Stations", route: "/resources/police-stations" },
    { label: "Transport Facilities", route: "/resources/transport-facilities" },
    { label: "Do's / Don'ts", route: "/resources/dos-and-donts" },
  ],
};

function NavDropdown({ menu, active, navigate }) {
  return (
    <div className="relative group">
      <button
        onClick={() => navigate(menu.route)}
        className={`${NAV_ITEM_CLASS} gap-1.5 ${active ? "bg-slate-100" : ""}`}
      >
        {menu.label}
        <ChevronDown size={13} className="text-slate-400 group-hover:rotate-180 transition-transform" />
      </button>

      {/* Dropdown panel */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-150 z-50">
        <div className="w-64 bg-white rounded-xl shadow-lg border border-slate-100 py-2">
          {menu.children.map((child) => (
            <button
              key={child.label}
              onClick={() => navigate(child.route)}
              className="text-left px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100 hover:text-[#0b3149] rounded-lg mx-1 w-[calc(100%-8px)] transition-colors"
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

  const isActive = (route) => location.pathname.startsWith(route);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main
        className={`flex-1 min-w-0 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* ================= Header ================= */}
        <header className="sticky top-0 z-40 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 h-16 max-w-[1680px] mx-auto">
            {/* Left: hamburger + logo */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#0b3149] hover:bg-[#0a2b3f] text-white transition shrink-0"
              >
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2.5 shrink-0"
              >
                <LogoMark />
                <span className="font-serif text-lg font-bold tracking-tight text-[#0b3149] whitespace-nowrap">
                  Ratnagiri Tourism
                </span>
              </button>
            </div>

            {/* Center: nav — single line, takes the free space and centres itself */}
            <nav className="hidden lg:flex flex-1 min-w-0 items-center justify-center gap-0.5 text-sm">
              <NavDropdown
                menu={EXPLORE_MENU}
                active={isActive(EXPLORE_MENU.route)}
                navigate={navigate}
              />

              <NavDropdown
                menu={EXPERIENCES_MENU}
                active={isActive(EXPERIENCES_MENU.route)}
                navigate={navigate}
              />

              <NavDropdown
                menu={STORIES_MENU}
                active={isActive(STORIES_MENU.route)}
                navigate={navigate}
              />

              <NavDropdown
                menu={RESOURCES_MENU}
                active={isActive(RESOURCES_MENU.route)}
                navigate={navigate}
              />

              <NavDropdown
                menu={ABOUT_MENU}
                active={isActive(ABOUT_MENU.route)}
                navigate={navigate}
              />

              <button
                onClick={() => navigate("/forum")}
                className={`${NAV_ITEM_CLASS} ${isActive("/forum") ? "bg-slate-100" : ""}`}
              >
                Forum
              </button>

              <button
                onClick={() => navigate("/review/add-place")}
                className="flex items-center gap-2 whitespace-nowrap bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2 rounded-full transition-colors duration-150 ml-2"
              >
                <MapPlus size={16} />
                <span className="hidden xl:inline">Add location and services</span>
                <span className="xl:hidden">Add place</span>
              </button>
            </nav>

            {/* Right: language, search, login/logout */}
            <div className="flex items-center gap-2 shrink-0">
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
                  className="flex items-center gap-2 whitespace-nowrap bg-[#0b3149] hover:bg-[#0a2b3f] text-white pl-3 pr-4 py-2 rounded-full font-semibold text-sm transition"
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
                  className="whitespace-nowrap bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-semibold text-sm transition"
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