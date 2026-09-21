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
  Compass,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Theme: fonts, colour tokens, animations                            */
/*  (If you prefer, move the @import into index.html and this CSS     */
/*  into index.css — nothing else in this file depends on it.)        */
/* ------------------------------------------------------------------ */
const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');

.rt-root {
  --rt-navy: #0b3149;
  --rt-teal: #0f766e;
  --rt-laterite: #B4532A;
  --rt-mango: #FBBF24;
  --rt-mist: #F4F8F9;

  font-family: 'Plus Jakarta Sans', 'Noto Sans Devanagari', system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.65;
  color: #0f172a;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
/* Headings on every page inherit the display serif (sizes stay per-page) */
.rt-root :where(h1, h2, h3, .rt-display) {
  font-family: 'Fraunces', 'Noto Sans Devanagari', Georgia, serif;
  text-wrap: balance;
}
.rt-root :focus-visible {
  outline: 2px solid var(--rt-teal);
  outline-offset: 2px;
}

/* One orchestrated moment: header drops in once on load */
@keyframes rt-drop {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.rt-header-in { animation: rt-drop .5s ease-out both; }

/* "Live" pulse on the map button — plays 3 times, then rests */
@keyframes rt-ping {
  0%   { transform: scale(1); opacity: .8; }
  80%, 100% { transform: scale(2.6); opacity: 0; }
}
.rt-ping { animation: rt-ping 1.6s cubic-bezier(0, 0, .2, 1) 3; }

/* Logo micro-motion on hover */
.rt-logo .rt-sun,
.rt-logo .rt-wave1,
.rt-logo .rt-wave2 { transition: transform .5s ease; }
.rt-brand:hover .rt-sun   { transform: translateY(-2px); }
.rt-brand:hover .rt-wave1 { transform: translateX(-2px); }
.rt-brand:hover .rt-wave2 { transform: translateX(2px); }

/* Nav links: pill hover, gentle grow, teal underline that draws in */
.rt-nav-link {
  position: relative;
  transition: background-color .15s, color .15s, transform .2s;
}
.rt-nav-link::after {
  content: "";
  position: absolute;
  left: .75rem; right: .75rem; bottom: .3rem;
  height: 2px;
  border-radius: 2px;
  background: var(--rt-teal);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform .25s ease;
}
.rt-nav-link:hover,
.group:hover > .rt-nav-link {
  background-color: #f1f5f9;
  color: var(--rt-navy);
  transform: scale(1.04);
}
.rt-nav-link:hover::after,
.group:hover > .rt-nav-link::after,
.rt-nav-link[data-active="true"]::after { transform: scaleX(1); }
.rt-nav-link[data-active="true"] { color: var(--rt-navy); }

/* Dropdown items: teal wash, laterite dot, small slide */
.rt-dd-item { transition: background-color .15s, color .15s, transform .2s; }
.rt-dd-item .rt-dot {
  width: 6px; height: 6px; border-radius: 9999px;
  background: #cbd5e1;
  transition: background-color .2s, transform .2s;
}
.rt-dd-item:hover {
  background-color: #f0fdfa;
  color: #115e59;
  transform: translateX(2px);
}
.rt-dd-item:hover .rt-dot { background: var(--rt-laterite); transform: scale(1.5); }

/* CTA buttons: light sweep + icon motion */
.rt-shine::before {
  content: "";
  position: absolute; top: 0; bottom: 0; left: -60%;
  width: 40%;
  background: linear-gradient(105deg, transparent, rgba(255,255,255,.38), transparent);
  transform: skewX(-20deg);
  transition: left .6s ease;
}
.rt-cta:hover .rt-shine::before { left: 130%; }
.rt-compass, .rt-mapplus { transition: transform .4s ease; }
.rt-cta:hover .rt-compass { transform: rotate(45deg); }
.rt-cta:hover .rt-mapplus { transform: scale(1.15) rotate(-6deg); }

@media (prefers-reduced-motion: reduce) {
  .rt-root *, .rt-root *::before, .rt-root *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

// Compact coastal mark: navy tile, sun over two waves.
function LogoMark() {
  return (
    <svg className="rt-logo" width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <rect width="34" height="34" rx="10" fill="#0b3149" />
      <circle className="rt-sun" cx="21.5" cy="12" r="4" fill="#FBBF24" />
      <path
        className="rt-wave1"
        d="M5 21c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 9 0"
        stroke="#5EEAD4"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        className="rt-wave2"
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

// Shared classes for every nav item: 15px semibold, single line.
const NAV_ITEM_CLASS =
  "rt-nav-link flex items-center whitespace-nowrap px-3 py-2 rounded-lg text-[15px] font-semibold text-slate-900";

// Explore dropdown — /explore/*
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

// Experiences dropdown — /experiences/*
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

// Stories dropdown — /stories/*
const STORIES_MENU = {
  label: "Stories",
  route: "/stories",
  children: [
    { label: "Videos", route: "/stories/videos" },
    { label: "Reels", route: "/stories/reels" },
    { label: "Written Stories", route: "/stories/written" },
  ],
};

// Resources dropdown — /resources/*
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

// About dropdown — /about/*
const ABOUT_MENU = {
  label: "About",
  route: "/about",
  children: [
    { label: "Society and Economy", route: "/about/society-and-economy" },
    { label: "Culture", route: "/about/culture" },
    { label: "Good Governance", route: "/about/good-governance" },
  ],
};

function NavDropdown({ menu, active, navigate }) {
  return (
    <div className="relative group">
      <button
        onClick={() => navigate(menu.route)}
        data-active={active}
        className={`${NAV_ITEM_CLASS} gap-1.5`}
      >
        {menu.label}
        <ChevronDown
          size={13}
          className="text-slate-400 group-hover:text-teal-700 group-hover:rotate-180 transition-transform duration-200"
        />
      </button>

      {/* Dropdown panel */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
        <div className="w-64 bg-white rounded-xl shadow-xl shadow-slate-900/10 border border-slate-100 border-t-2 border-t-teal-600 py-2">
          {menu.children.map((child) => (
            <button
              key={child.label}
              onClick={() => navigate(child.route)}
              className="rt-dd-item flex items-center gap-2.5 text-left px-3.5 py-2.5 text-[15px] font-medium text-slate-800 rounded-lg mx-1 w-[calc(100%-8px)]"
            >
              <span className="rt-dot shrink-0" />
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
    <div className="rt-root flex min-h-screen bg-[#F4F8F9]">
      <style>{THEME_CSS}</style>

      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main
        className={`flex-1 min-w-0 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* ================= Header ================= */}
        <header className="rt-header-in sticky top-0 z-40 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 h-16 max-w-[1680px] mx-auto">
            {/* Left: hamburger + logo */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#0b3149] hover:bg-[#0f4664] text-white transition shrink-0"
              >
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="rt-brand flex items-center gap-2.5 shrink-0"
              >
                <LogoMark />
                <span className="rt-display text-lg font-bold tracking-tight text-[#0b3149] whitespace-nowrap">
                  Ratnagiri Tourism
                </span>
              </button>
            </div>

            {/* Center: nav — single line, needs xl (1280px+) */}
            <nav className="hidden xl:flex flex-1 min-w-0 items-center justify-center gap-0.5">
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
                data-active={isActive("/forum")}
                className={NAV_ITEM_CLASS}
              >
                Forum
              </button>

              {/* CTAs: icon-only < 1536px, short label 1536–1699px, full label 1700px+ */}
              <div className="flex items-center gap-2 ml-2">
                {/* Interactive Map */}
                <button
                  onClick={() => navigate("/interactive-map")}
                  aria-label="Interactive Map"
                  title="Interactive Map"
                  className="rt-cta relative flex items-center gap-2 whitespace-nowrap h-10 px-3 min-[1536px]:px-4 rounded-full text-white font-semibold text-[15px] bg-gradient-to-r from-[#C2410C] via-[#B4532A] to-[#9A3412] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-900/30 active:translate-y-0 transition-all duration-200"
                >
                  <span className="rt-shine absolute inset-0 overflow-hidden rounded-full pointer-events-none" />
                  <Compass size={17} className="rt-compass relative" />
                  <span className="relative hidden min-[1536px]:inline min-[1700px]:hidden">Interactive Map</span>
                  <span className="relative hidden min-[1700px]:inline">Interactive Map</span>
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="rt-ping absolute inline-flex h-full w-full rounded-full bg-amber-300" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
                  </span>
                </button>

                {/* Add location and services */}
                <button
                  onClick={() => navigate("/review/add-place")}
                  aria-label="Add location and services"
                  title="Add location and services"
                  className="rt-cta relative flex items-center gap-2 whitespace-nowrap h-10 px-3 min-[1536px]:px-4 rounded-full text-white font-semibold text-[15px] bg-gradient-to-r from-teal-700 to-teal-800 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-900/30 active:translate-y-0 transition-all duration-200"
                >
                  <span className="rt-shine absolute inset-0 overflow-hidden rounded-full pointer-events-none" />
                  <MapPlus size={17} className="rt-mapplus relative" />
                  <span className="relative hidden min-[1536px]:inline min-[1700px]:hidden">Add Add location & services</span>
                  <span className="relative hidden min-[1700px]:inline">Add location and services</span>
                </button>
              </div>
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
                className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full text-slate-700 hover:bg-slate-100 hover:text-teal-700 transition"
              >
                <Search size={18} />
              </button>

              {showLoginButton && (
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 whitespace-nowrap bg-[#0b3149] hover:bg-[#0f4664] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/20 text-white pl-3 pr-4 py-2 rounded-full font-semibold text-[15px] transition-all duration-200"
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
                  className="whitespace-nowrap bg-red-600 hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-900/20 text-white px-4 py-2 rounded-full font-semibold text-[15px] transition-all duration-200"
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