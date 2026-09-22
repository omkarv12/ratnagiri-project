import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import {
  Menu,
  X,
  ShieldCheck,
  MapPlus,
  Compass,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Theme: fonts, colour tokens, animations (unchanged palette)        */
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
  line-height: 1.65;
  color: #0f172a;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.rt-root :where(h1, h2, h3, .rt-display) {
  font-family: 'Fraunces', 'Noto Sans Devanagari', Georgia, serif;
  text-wrap: balance;
}
.rt-root :focus-visible {
  outline: 2px solid #5EEAD4;
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

/* Nav links: soft pill, gentle grow, mango underline that draws in */
.rt-nav-link {
  position: relative;
  transition: background-color .15s, transform .2s;
}
.rt-nav-link::after {
  content: "";
  position: absolute;
  left: .6rem; right: .6rem; bottom: .22rem;
  height: 2px;
  border-radius: 2px;
  background: var(--rt-mango);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform .25s ease;
}
.rt-nav-link:hover,
.group:hover > .rt-nav-link {
  background-color: rgba(255, 255, 255, .12);
  transform: scale(1.04);
}
.rt-nav-link:hover::after,
.group:hover > .rt-nav-link::after,
.rt-nav-link[data-active="true"]::after { transform: scaleX(1); }

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
.rt-compass, .rt-mapplus, .rt-shield { transition: transform .4s ease; }
.rt-cta:hover .rt-compass { transform: rotate(45deg); }
.rt-cta:hover .rt-mapplus { transform: scale(1.15) rotate(-6deg); }
.rt-cta:hover .rt-shield { transform: scale(1.12); }

@media (prefers-reduced-motion: reduce) {
  .rt-root *, .rt-root *::before, .rt-root *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

// Put this file in  public/logos/  (PNG or SVG, transparent background).
// Until it exists, a dashed placeholder with the alt text is shown.
const LOGO = { src: "/logos/ratnagiri-tourism.png", alt: "Ratnagiri Tourism" };

// Shared classes for every top-level nav item: white, small semibold, single line.
const NAV_ITEM_CLASS =
  "rt-nav-link flex min-h-[2.25rem] items-center whitespace-nowrap px-2.5 py-1.5 rounded-lg text-[0.8125rem] font-semibold text-white";

/* Page structure — matches the requested menu tree. "Geography" is a
   nested flyout inside "About". Routes marked with a comment are new
   pages that weren't in the previous menu and may need adjusting. */
const PLAN_MENU = {
  label: "Plan Your Trip",
  route: "/plan-your-trip",
  children: [
    { label: "Plan Your Trip", route: "/plan-your-trip" }, // new route
    { label: "Plan Your Trip – Interactive Map", route: "/interactive-map" },
  ],
};

const EXPERIENCES_MENU = {
  label: "Experiences",
  route: "/experiences",
  children: [
    { label: "Upcoming Events", route: "/experiences/upcoming-events" }, // new route
    { label: "Discover Your Stay", route: "/experiences/discover-your-stay" }, // new route
  ],
};

const STORIES_MENU = {
  label: "Stories",
  route: "/stories",
  children: [
    { label: "Videos", route: "/stories/videos" },
    { label: "Reels", route: "/stories/reels" },
  ],
};

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

const ABOUT_MENU = {
  label: "About",
  route: "/about",
  children: [
    {
      label: "About",
      children: [
        { label: "Society & Economy", route: "/about/society-and-economy" },
        { label: "Culture", route: "/about/culture" },
        { label: "Governance", route: "/about/good-governance" },
      ],
    },
    {
      label: "Geography",
      children: [
        { label: "Places", route: "/about/geography/places" }, // new route
        { label: "Hidden Paths", route: "/experiences/hidden-paths" },
        { label: "Explore Villages", route: "/experiences/explore-villages" },
        { label: "Itineraries", route: "/experiences/itineraries" },
        { label: "Circuits", route: "/experiences/circuits" },
      ],
    },
  ],
};

const MENUS = [PLAN_MENU, EXPERIENCES_MENU, STORIES_MENU, RESOURCES_MENU, ABOUT_MENU];

/* ------------------------------------------------------------------ */
/*  Small components                                                   */
/* ------------------------------------------------------------------ */

// Logo image with a graceful placeholder when the file hasn't been added yet.
function LogoSlot({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={`flex items-center justify-center text-center rounded-lg border border-dashed border-white/30 bg-white/10 text-white/70 text-[0.625rem] leading-tight px-1.5 aspect-square ${className}`}
      >
        {alt}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`object-contain ${className}`}
    />
  );
}

// One dropdown panel. Renders flat items, and recurses for any item that
// itself has "children" (used for About → Geography), opening as a flyout
// to the right of the parent item.
function DropdownPanel({ items, navigate }) {
  return (
    <div className="w-64 bg-white rounded-xl shadow-xl shadow-slate-900/15 border border-slate-100 border-t-2 border-t-teal-600 py-2">
      {items.map((child) =>
        child.children ? (
          <div key={child.label} className="relative group/sub">
            <button
              type="button"
              className="rt-dd-item flex w-[calc(100%-8px)] items-center justify-between gap-2.5 text-left px-3.5 py-2.5 text-[0.9375rem] font-medium text-slate-800 rounded-lg mx-1"
            >
              <span className="flex items-center gap-2.5">
                <span className="rt-dot shrink-0" />
                {child.label}
              </span>
              <span aria-hidden="true" className="text-xs text-slate-400">▸</span>
            </button>
            <div className="absolute left-full top-0 pl-2 opacity-0 invisible translate-x-1 group-hover/sub:opacity-100 group-hover/sub:visible group-hover/sub:translate-x-0 transition-all duration-200 z-50">
              <DropdownPanel items={child.children} navigate={navigate} />
            </div>
          </div>
        ) : (
          <button
            key={child.label}
            onClick={() => navigate(child.route)}
            className="rt-dd-item flex items-center gap-2.5 text-left px-3.5 py-2.5 text-[0.9375rem] font-medium text-slate-800 rounded-lg mx-1 w-[calc(100%-8px)]"
          >
            <span className="rt-dot shrink-0" />
            {child.label}
          </button>
        )
      )}
    </div>
  );
}

function NavDropdown({ menu, active, navigate }) {
  return (
    <div className="relative group">
      <button
        onClick={() => navigate(menu.route)}
        data-active={active}
        className={`${NAV_ITEM_CLASS} gap-1`}
      >
        {menu.label}
        <span
          aria-hidden="true"
          className="ml-0.5 h-0 w-0 border-x-[4px] border-t-[5px] border-x-transparent border-t-white/80 group-hover:border-t-white group-hover:rotate-180 transition-transform duration-200"
        />
      </button>

      <div className="absolute left-0 top-full pt-2 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
        <DropdownPanel items={menu.children} navigate={navigate} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
        {/* ============ Single sticky bar: logo · pages · CTAs · Admin ============ */}
        <header className="rt-header-in sticky top-0 z-40 bg-[#0b3149] shadow-md">
          <div className="mx-auto grid h-16 max-w-[1680px] grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:px-8 lg:px-12">
            {/* Left: mobile toggle + logo + title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
                className="lg:hidden flex h-9 items-center gap-1.5 rounded-lg px-2 text-[0.8125rem] font-semibold text-white hover:bg-white/10 transition"
              >
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                aria-label="Ratnagiri Tourism — home"
                className="flex items-center gap-2"
              >
                <LogoSlot {...LOGO} className="h-8 sm:h-9" />
                <span className="rt-display text-base sm:text-lg lg:text-xl font-bold tracking-tight text-white leading-tight whitespace-nowrap">
                  Ratnagiri Tourism
                </span>
              </button>
            </div>

            {/* Center: page structure */}
            <div className="hidden lg:flex items-center justify-center gap-1">
              <button
                onClick={() => navigate("/dashboard")}
                data-active={location.pathname === "/dashboard"}
                className={NAV_ITEM_CLASS}
              >
                Home
              </button>
              {MENUS.map((menu) => (
                <NavDropdown
                  key={menu.label}
                  menu={menu}
                  active={isActive(menu.route)}
                  navigate={navigate}
                />
              ))}
            </div>

            {/* Right: CTAs + Admin */}
            <div className="flex items-center justify-end gap-2.5 sm:gap-3">
              <button
                onClick={() => navigate("/interactive-map")}
                aria-label="Interactive Map"
                title="Interactive Map"
                className="rt-cta relative flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-[#C2410C] via-[#B4532A] to-[#9A3412] px-3 lg:px-3.5 text-[0.8125rem] font-semibold text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 active:translate-y-0 transition-all duration-200"
              >
                <span className="rt-shine pointer-events-none absolute inset-0 overflow-hidden rounded-full" />
                <Compass size={15} className="rt-compass relative" />
                <span className="relative hidden xl:inline">Interactive Map</span>
                <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                  <span className="rt-ping absolute inline-flex h-full w-full rounded-full bg-amber-300" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-[#0b3149]" />
                </span>
              </button>

              <button
                onClick={() => navigate("/registration")}
                aria-label="Add location and services"
                title="Add location and services"
                className="rt-cta relative flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-teal-700 to-teal-800 px-3 lg:px-3.5 text-[0.8125rem] font-semibold text-white ring-1 ring-teal-400/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 active:translate-y-0 transition-all duration-200"
              >
                <span className="rt-shine pointer-events-none absolute inset-0 overflow-hidden rounded-full" />
                <MapPlus size={15} className="rt-mapplus relative" />
                <span className="relative hidden xl:inline">Add location and services</span>
              </button>

              <button
                onClick={() => navigate(user ? "/admin" : "/login")}
                aria-label="Admin"
                title="Admin"
                className="rt-cta relative flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#0b3149] px-3 lg:px-3.5 text-[0.8125rem] font-semibold text-white ring-1 ring-white/40 hover:-translate-y-0.5 hover:bg-[#134b78] hover:shadow-lg hover:shadow-black/30 active:translate-y-0 transition-all duration-200"
              >
                <span className="rt-shine pointer-events-none absolute inset-0 overflow-hidden rounded-full" />
                <ShieldCheck size={15} className="rt-shield relative" />
                <span className="relative hidden sm:inline">Admin login</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div id="main-content" tabIndex={-1} className="pb-8 outline-none">
          <Outlet />
        </div>
      </main>
    </div>
  );
}