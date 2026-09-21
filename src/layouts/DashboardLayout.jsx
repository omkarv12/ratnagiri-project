import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import {
  Menu,
  X,
  UserRound,
  MapPlus,
  Compass,
  Mic,
  Languages,
  Accessibility,
  RotateCcw,
} from "lucide-react";
// Social brand icons — install once:  npm i react-icons
import {
  FaSquareFacebook,
  FaXTwitter,
  FaSquareInstagram,
  FaYoutube,
  FaWhatsapp,
  FaPinterest,
  FaLinkedin,
} from "react-icons/fa6";

/* ------------------------------------------------------------------ */
/*  Theme: fonts, colour tokens, animations                            */
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

/* Accessibility-panel effects (classes are set on <html>) */
html.rt-hc   { filter: contrast(1.25); }
html.rt-gray { filter: grayscale(1); }
html.rt-hc.rt-gray { filter: contrast(1.25) grayscale(1); }
html.rt-links a { text-decoration: underline !important; }

/* Light band with a faint city skyline along the bottom (like the reference header) */
.rt-band {
  background-color: #EAF1F7;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='520' height='120' viewBox='0 0 520 120'%3E%3Cg fill='%230b3149' fill-opacity='0.07'%3E%3Crect x='0' y='60' width='34' height='60'/%3E%3Crect x='40' y='30' width='26' height='90'/%3E%3Crect x='72' y='70' width='40' height='50'/%3E%3Cpath d='M120 120V64l22-30 22 30v56z'/%3E%3Crect x='172' y='48' width='30' height='72'/%3E%3Crect x='208' y='78' width='46' height='42'/%3E%3Crect x='262' y='20' width='22' height='100'/%3E%3Crect x='290' y='56' width='36' height='64'/%3E%3Cpath d='M334 120V70q24-40 48 0v50z'/%3E%3Crect x='392' y='40' width='28' height='80'/%3E%3Crect x='426' y='74' width='40' height='46'/%3E%3Crect x='472' y='52' width='34' height='68'/%3E%3C/g%3E%3C/svg%3E"),
    linear-gradient(180deg, #F3F8FB 0%, #E4EEF5 100%);
  background-repeat: repeat-x, no-repeat;
  background-position: left bottom, center;
  background-size: 520px 120px, 100% 100%;
}

/* One orchestrated moment: top of the page drops in once on load */
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

/* Social icons */
.rt-social { transition: color .2s, transform .2s; }
.rt-social:hover { color: #5EEAD4; transform: translateY(-2px) scale(1.12); }

/* Nav links (dark bar): soft pill, gentle grow, mango underline that draws in */
.rt-nav-link {
  position: relative;
  transition: background-color .15s, transform .2s;
}
.rt-nav-link::after {
  content: "";
  position: absolute;
  left: .75rem; right: .75rem; bottom: .3rem;
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

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

// Replace "#" with your real profile links.
const SOCIALS = [
  { label: "Facebook", href: "#", Icon: FaSquareFacebook },
  { label: "X (Twitter)", href: "#", Icon: FaXTwitter },
  { label: "Instagram", href: "#", Icon: FaSquareInstagram },
  { label: "YouTube", href: "#", Icon: FaYoutube },
  { label: "WhatsApp", href: "#", Icon: FaWhatsapp },
  { label: "Pinterest", href: "#", Icon: FaPinterest },
  { label: "LinkedIn", href: "#", Icon: FaLinkedin },
];

// Put these image files in  public/logos/  (PNG or SVG, transparent background).
// Until a file exists, a dashed placeholder with its name is shown.
const LOGOS = {
  left: { src: "/logos/maharashtra-tourism.png", alt: "Maharashtra Tourism logo" },
  emblem: { src: "/logos/satyamev-jayate.png", alt: "Satyamev Jayate emblem" },
  seal: { src: "/logos/maharashtra-seal.png", alt: "Government of Maharashtra seal" },
  incredible: { src: "/logos/incredible-india.png", alt: "Incredible India logo" },
};

// Shared classes for every nav item: white, 15px semibold, single line.
const NAV_ITEM_CLASS =
  "rt-nav-link flex min-h-[2.75rem] items-center whitespace-nowrap px-3 py-2 rounded-lg text-[0.9375rem] font-semibold text-white";

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

const STORIES_MENU = {
  label: "Stories",
  route: "/stories",
  children: [
    { label: "Videos", route: "/stories/videos" },
    { label: "Reels", route: "/stories/reels" },
    { label: "Written Stories", route: "/stories/written" },
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
    { label: "Society and Economy", route: "/about/society-and-economy" },
    { label: "Culture", route: "/about/culture" },
    { label: "Good Governance", route: "/about/good-governance" },
  ],
};

/* ------------------------------------------------------------------ */
/*  Small components                                                   */
/* ------------------------------------------------------------------ */

// Logo image with a graceful placeholder when the file hasn't been added yet.
function LogoSlot({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={`flex items-center justify-center text-center rounded-lg border border-dashed border-slate-300 bg-white/60 text-slate-500 text-[0.6875rem] leading-tight px-1.5 aspect-square ${className}`}
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

function NavDropdown({ menu, active, navigate }) {
  return (
    <div className="relative group">
      <button
        onClick={() => navigate(menu.route)}
        data-active={active}
        className={`${NAV_ITEM_CLASS} gap-1.5`}
      >
        {menu.label}
        <span
          aria-hidden="true"
          className="ml-0.5 h-0 w-0 border-x-[4px] border-t-[5px] border-x-transparent border-t-white/80 group-hover:border-t-white group-hover:rotate-180 transition-transform duration-200"
        />
      </button>

      {/* Dropdown panel */}
      <div className="absolute left-0 top-full pt-2 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
        <div className="w-64 bg-white rounded-xl shadow-xl shadow-slate-900/15 border border-slate-100 border-t-2 border-t-teal-600 py-2">
          {menu.children.map((child) => (
            <button
              key={child.label}
              onClick={() => navigate(child.route)}
              className="rt-dd-item flex items-center gap-2.5 text-left px-3.5 py-2.5 text-[0.9375rem] font-medium text-slate-800 rounded-lg mx-1 w-[calc(100%-8px)]"
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

// Accessibility panel: text size, contrast, grayscale, underline links.
const A11Y_KEY = "rt-a11y";
const DEFAULT_A11Y = { scale: 100, contrast: false, gray: false, links: false };

function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(() => {
    try {
      return { ...DEFAULT_A11Y, ...JSON.parse(localStorage.getItem(A11Y_KEY) || "{}") };
    } catch {
      return DEFAULT_A11Y;
    }
  });
  const wrapRef = useRef(null);

  // Apply preferences to <html> so they affect the whole site.
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${prefs.scale}%`;
    root.classList.toggle("rt-hc", prefs.contrast);
    root.classList.toggle("rt-gray", prefs.gray);
    root.classList.toggle("rt-links", prefs.links);
    try {
      localStorage.setItem(A11Y_KEY, JSON.stringify(prefs));
    } catch {
      /* storage unavailable — fine */
    }
  }, [prefs]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const setScale = (delta) =>
    setPrefs((p) => ({ ...p, scale: Math.min(130, Math.max(90, p.scale + delta)) }));
  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const Toggle = ({ label, k }) => (
    <button
      type="button"
      role="switch"
      aria-checked={prefs[k]}
      onClick={() => toggle(k)}
      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[0.9375rem] font-medium text-slate-800 hover:bg-slate-100 transition"
    >
      {label}
      <span
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          prefs[k] ? "bg-teal-700" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            prefs[k] ? "translate-x-[1.125rem]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Accessibility options"
        aria-expanded={open}
        title="Accessibility"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-700 hover:bg-teal-600 ring-2 ring-white/70 text-white transition hover:scale-105"
      >
        <Accessibility size={22} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 rounded-xl border border-slate-100 border-t-2 border-t-teal-600 bg-white p-2 text-slate-900 shadow-xl shadow-slate-900/15">
          <p className="px-3 pt-2 pb-1 text-[0.9375rem] font-bold text-[#0b3149]">Accessibility</p>

          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-[0.9375rem] font-medium text-slate-800">
              Text size <span className="text-slate-500">({prefs.scale}%)</span>
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setScale(-10)}
                disabled={prefs.scale <= 90}
                aria-label="Decrease text size"
                className="h-8 w-9 rounded-lg border border-slate-200 text-sm font-bold text-[#0b3149] hover:bg-slate-100 disabled:opacity-40 transition"
              >
                A−
              </button>
              <button
                type="button"
                onClick={() => setScale(10)}
                disabled={prefs.scale >= 130}
                aria-label="Increase text size"
                className="h-8 w-9 rounded-lg border border-slate-200 text-base font-bold text-[#0b3149] hover:bg-slate-100 disabled:opacity-40 transition"
              >
                A+
              </button>
            </div>
          </div>

          <Toggle label="High contrast" k="contrast" />
          <Toggle label="Grayscale" k="gray" />
          <Toggle label="Underline links" k="links" />

          <button
            type="button"
            onClick={() => setPrefs(DEFAULT_A11Y)}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[0.9375rem] font-semibold text-teal-800 hover:bg-teal-50 transition"
          >
            <RotateCcw size={15} />
            Reset all
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const showLoginButton = location.pathname === "/dashboard" && !user;
  const showLogoutButton =
    user &&
    (location.pathname === "/dashboard" || location.pathname === "/admin");

  const isActive = (route) => location.pathname.startsWith(route);

  // Voice search (only shown in browsers that support it).
  const SpeechRec =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const startVoice = () => {
    try {
      const rec = new SpeechRec();
      rec.lang = "en-IN";
      rec.onresult = (e) => setQuery(e.results[0][0].transcript);
      rec.start();
    } catch {
      /* mic blocked or unsupported */
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="rt-root flex min-h-screen bg-[#F4F8F9]">
      <style>{THEME_CSS}</style>

      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main
        className={`flex-1 min-w-0 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <header className="rt-header-in">
          {/* ============ Row 1: social · skip · search · map · EN · accessibility ============ */}
          <div className="relative z-50 bg-[#0b3149] text-white">
            <div className="mx-auto flex min-h-[3.5rem] max-w-[1680px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <ul className="hidden md:flex items-center gap-4">
                {SOCIALS.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="rt-social block text-white/90"
                    >
                      <Icon size={20} />
                    </a>
                  </li>
                ))}
              </ul>

              <div className="ml-auto flex items-center gap-2 sm:gap-3">
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only md:not-sr-only inline-flex h-11 items-center rounded-sm border border-sky-300/40 bg-[#134b78] px-4 text-[0.8125rem] font-bold uppercase tracking-wide text-white hover:bg-[#1a5c91] transition"
                >
                  Skip to content
                </a>

                <form
                  onSubmit={handleSearch}
                  role="search"
                  className="flex h-11 w-40 sm:w-60 items-center rounded-sm bg-white focus-within:ring-2 focus-within:ring-teal-300"
                >
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search"
                    placeholder="Search…"
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-[0.9375rem] text-slate-900 placeholder:text-slate-500 outline-none"
                  />
                  {SpeechRec && (
                    <button
                      type="button"
                      onClick={startVoice}
                      aria-label="Voice search"
                      title="Voice search"
                      className="px-2.5 text-[#0b3149] hover:text-teal-700 transition"
                    >
                      <Mic size={18} />
                    </button>
                  )}
                </form>

                <button
                  onClick={() => navigate("/interactive-map")}
                  className="hidden sm:inline-flex h-11 items-center rounded-sm bg-white px-3 text-[0.8125rem] font-bold uppercase tracking-wide text-[#0b3149] hover:bg-teal-50 hover:-translate-y-0.5 transition"
                >
                  Tourist Map
                </button>

                <button
                  aria-label="Language: English"
                  title="Language"
                  className="flex items-center gap-1.5 min-h-[2.75rem] rounded-lg px-2 py-1.5 text-[0.9375rem] font-semibold text-white hover:bg-white/10 transition"
                >
                  <Languages size={20} />
                  EN
                </button>

                {showLoginButton && (
                  <button
                    onClick={() => navigate("/login")}
                    className="flex h-11 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/40 pl-3 pr-4 text-[0.9375rem] font-semibold text-white hover:bg-white/10 transition"
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
                    className="h-11 whitespace-nowrap rounded-full bg-red-600 px-4 text-[0.9375rem] font-semibold text-white hover:bg-red-700 transition"
                  >
                    Logout
                  </button>
                )}

                <AccessibilityMenu />
              </div>
            </div>
          </div>

          {/* ============ Row 2: logos left · title centre · logos right ============ */}
          <div className="rt-band">
            <div className="mx-auto grid max-w-[1680px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <div className="justify-self-start">
                <LogoSlot {...LOGOS.left} className="h-14 sm:h-20 lg:h-24" />
              </div>

              <button
                onClick={() => navigate("/dashboard")}
                aria-label="Ratnagiri Tourism — home"
                className="flex flex-col items-center text-center"
              >
                <LogoSlot {...LOGOS.emblem} className="mb-1 h-12 sm:h-14" />
                <span className="rt-display text-[1.375rem] sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#0b3149] leading-tight">
                  Ratnagiri Tourism
                </span>
                <span className="mt-0.5 text-[0.875rem] sm:text-[1.0625rem] font-medium text-slate-700">
                  Government of Maharashtra
                </span>
              </button>

              <div className="flex items-center justify-self-end gap-3 sm:gap-5">
                <LogoSlot {...LOGOS.seal} className="hidden sm:block h-16 lg:h-24" />
                <LogoSlot {...LOGOS.incredible} className="h-12 sm:h-16 lg:h-20" />
              </div>
            </div>
          </div>
        </header>

        {/* ============ Row 3: pages · map · add place (sticky) ============ */}
        <div className="sticky top-0 z-40 bg-[#0b3149] shadow-md">
          <nav
            aria-label="Main"
            className="mx-auto flex h-[3.25rem] max-w-[1680px] items-center gap-1 px-4 sm:px-6 lg:px-8"
          >
            {/* Small screens: opens the sidebar */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
              className="lg:hidden flex h-11 items-center gap-2 rounded-lg px-2.5 text-[0.9375rem] font-semibold text-white hover:bg-white/10 transition"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              Menu
            </button>

            {/* Pages */}
            <div className="hidden lg:flex items-center gap-0.5">
              <button
                onClick={() => navigate("/dashboard")}
                data-active={location.pathname === "/dashboard"}
                className={NAV_ITEM_CLASS}
              >
                Home
              </button>
              <NavDropdown menu={EXPLORE_MENU} active={isActive(EXPLORE_MENU.route)} navigate={navigate} />
              <NavDropdown menu={EXPERIENCES_MENU} active={isActive(EXPERIENCES_MENU.route)} navigate={navigate} />
              <NavDropdown menu={STORIES_MENU} active={isActive(STORIES_MENU.route)} navigate={navigate} />
              <NavDropdown menu={RESOURCES_MENU} active={isActive(RESOURCES_MENU.route)} navigate={navigate} />
              <NavDropdown menu={ABOUT_MENU} active={isActive(ABOUT_MENU.route)} navigate={navigate} />
              <button
                onClick={() => navigate("/forum")}
                data-active={isActive("/forum")}
                className={NAV_ITEM_CLASS}
              >
                Forum
              </button>
            </div>

            {/* CTAs: icon-only < 1024px, short label 1024–1279px, full label 1280px+ */}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => navigate("/interactive-map")}
                aria-label="Interactive Map"
                title="Interactive Map"
                className="rt-cta relative flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#C2410C] via-[#B4532A] to-[#9A3412] px-3 lg:px-4 text-[0.9375rem] font-semibold text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 active:translate-y-0 transition-all duration-200"
              >
                <span className="rt-shine pointer-events-none absolute inset-0 overflow-hidden rounded-full" />
                <Compass size={17} className="rt-compass relative" />
                <span className="relative hidden lg:inline xl:hidden">Map</span>
                <span className="relative hidden xl:inline">Interactive Map</span>
                <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                  <span className="rt-ping absolute inline-flex h-full w-full rounded-full bg-amber-300" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-[#0b3149]" />
                </span>
              </button>

              <button
                onClick={() => navigate("/review/add-place")}
                aria-label="Add location and services"
                title="Add location and services"
                className="rt-cta relative flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-teal-700 to-teal-800 px-3 lg:px-4 text-[0.9375rem] font-semibold text-white ring-1 ring-teal-400/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 active:translate-y-0 transition-all duration-200"
              >
                <span className="rt-shine pointer-events-none absolute inset-0 overflow-hidden rounded-full" />
                <MapPlus size={17} className="rt-mapplus relative" />
                <span className="relative hidden lg:inline xl:hidden">Add place</span>
                <span className="relative hidden xl:inline">Add location and services</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Main content (target of "Skip to content") */}
        <div id="main-content" tabIndex={-1} className="pb-8 outline-none">
          <Outlet />
        </div>
      </main>
    </div>
  );
}