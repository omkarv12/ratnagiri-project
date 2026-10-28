import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { MENUS } from "../config/navMenus";
import {
  Menu,
  X,
  ShieldCheck,
  MapPlus,
  Compass,
} from "lucide-react";
import BackToTop from "../components/BackToTop";
import Breadcrumb from "../components/Breadcrumb";

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
.group:hover > .rt-nav-link,
.group:focus-within > .rt-nav-link {
  background-color: rgba(255, 255, 255, .12);
  transform: scale(1.04);
}
.rt-nav-link:hover::after,
.group:hover > .rt-nav-link::after,
.group:focus-within > .rt-nav-link::after,
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

// Shared classes for every top-level nav item: white, base size, semibold, single line.
// Slightly roomier padding so the menu bar reads broader.
const NAV_ITEM_CLASS =
  "rt-nav-link flex min-h-[2.75rem] items-center whitespace-nowrap px-3 xl:px-4 py-2 rounded-lg text-[0.9375rem] xl:text-base font-semibold text-white";

// Every top-level nav entry, in order. Home is first, then the configured menus.
const NAV_ITEMS = [{ label: "Home", route: "/dashboard", exact: true }, ...MENUS];

const NAV_GAP = 4; // px — must match the gap-1 used by the nav row

/* ------------------------------------------------------------------ */
/*  Small components                                                   */
/* ------------------------------------------------------------------ */

function Caret() {
  return (
    <span
      aria-hidden="true"
      className="ml-0.5 h-0 w-0 border-x-[4px] border-t-[5px] border-x-transparent border-t-white/80 group-hover:border-t-white group-focus-within:border-t-white group-hover:rotate-180 group-focus-within:rotate-180 transition-transform duration-200"
    />
  );
}

// One dropdown panel. Renders flat items, and recurses for any item that
// itself has "children" (used for About → Geography), opening as a flyout
// beside the parent item. `flyLeft` makes flyouts open to the left so panels
// near the right edge of the screen never run off-screen.
function DropdownPanel({ items, navigate, flyLeft = false }) {
  return (
    <div className="w-72 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-xl shadow-slate-900/15 border border-slate-100 border-t-2 border-t-teal-600 py-2">
      {items.map((child) =>
        child.children ? (
          <div key={child.label} className="relative group/sub">
            <button
              type="button"
              className="rt-dd-item flex w-[calc(100%-8px)] items-center justify-between gap-2.5 text-left px-3.5 py-2.5 text-base font-medium text-slate-800 rounded-lg mx-1"
            >
              <span className="flex items-center gap-2.5">
                <span className="rt-dot shrink-0" />
                {child.label}
              </span>
              <span aria-hidden="true" className="text-xs text-slate-400">
                {flyLeft ? "◂" : "▸"}
              </span>
            </button>
            <div
              className={`absolute top-0 z-50 opacity-0 invisible transition-all duration-200 group-hover/sub:opacity-100 group-hover/sub:visible group-focus-within/sub:opacity-100 group-focus-within/sub:visible group-hover/sub:translate-x-0 group-focus-within/sub:translate-x-0 ${
                flyLeft ? "right-full pr-2 -translate-x-1" : "left-full pl-2 translate-x-1"
              }`}
            >
              <DropdownPanel items={child.children} navigate={navigate} flyLeft={flyLeft} />
            </div>
          </div>
        ) : (
          <button
            key={child.label}
            onClick={() => navigate(child.route)}
            className="rt-dd-item flex items-center gap-2.5 text-left px-3.5 py-2.5 text-base font-medium text-slate-800 rounded-lg mx-1 w-[calc(100%-8px)]"
          >
            <span className="rt-dot shrink-0" />
            {child.label}
          </button>
        )
      )}
    </div>
  );
}

// A top-level nav item. With children it opens a dropdown on hover or keyboard
// focus; without children it is a plain link. `align="right"` anchors the panel
// to the item's right edge (used for items near the right side of the bar).
function NavDropdown({ menu, active, navigate, align = "left", noNavigate = false }) {
  const right = align === "right";
  const hasChildren = Array.isArray(menu.children) && menu.children.length > 0;

  if (!hasChildren) {
    return (
      <button
        onClick={() => menu.route && navigate(menu.route)}
        data-active={active}
        className={NAV_ITEM_CLASS}
      >
        {menu.label}
      </button>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={() => {
          if (!noNavigate && menu.route) navigate(menu.route);
        }}
        data-active={active}
        aria-haspopup="true"
        className={`${NAV_ITEM_CLASS} gap-1 ${noNavigate ? "cursor-default" : ""}`}
      >
        {menu.label}
        <Caret />
      </button>

      <div
        className={`absolute top-full z-50 pt-2 opacity-0 invisible translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 ${
          right ? "right-0" : "left-0"
        }`}
      >
        <DropdownPanel items={menu.children} navigate={navigate} flyLeft={right} />
      </div>
    </div>
  );
}

// The page links in the header. It measures how many fit in the space it has
// and moves the rest into a "More" dropdown, so links never wrap, get cut off
// or push the buttons on the right out of place — at any screen width.
function PrimaryNav({ items, navigate, isItemActive }) {
  const wrapRef = useRef(null);
  const measureRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(items.length);

  const recalc = useCallback(() => {
    const wrap = wrapRef.current;
    const measure = measureRef.current;
    if (!wrap || !measure) return;

    const available = wrap.clientWidth;
    const widths = Array.from(measure.querySelectorAll("[data-measure='item']")).map(
      (el) => el.offsetWidth
    );
    const moreWidth = measure.querySelector("[data-measure='more']")?.offsetWidth || 0;

    const total = widths.reduce((sum, w) => sum + w + NAV_GAP, 0) - NAV_GAP;
    if (total <= available) {
      setVisibleCount(items.length);
      return;
    }

    // Not everything fits: keep as many as fit next to the "More" button.
    let used = moreWidth;
    let count = 0;
    for (const w of widths) {
      if (used + NAV_GAP + w > available) break;
      used += NAV_GAP + w;
      count += 1;
    }
    setVisibleCount(Math.max(1, count));
  }, [items.length]);

  useLayoutEffect(() => {
    recalc();
  }, [recalc]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(recalc);
    observer.observe(wrap);
    // Web fonts change text widths once they load.
    if (document.fonts?.ready) document.fonts.ready.then(recalc);
    return () => observer.disconnect();
  }, [recalc]);

  const shown = items.slice(0, visibleCount);
  const hidden = items.slice(visibleCount);
  const moreMenu = {
    label: "More",
    children: hidden.map((item) => ({
      label: item.label,
      route: item.route,
      children: item.children?.length ? item.children : undefined,
    })),
  };
  const moreActive = hidden.some(isItemActive);

  return (
    <div
      ref={wrapRef}
      className="relative flex min-w-0 items-center justify-start gap-1 pl-2 xl:pl-4"
    >
      {shown.map((item, i) => (
        <NavDropdown
          key={item.label}
          menu={item}
          active={isItemActive(item)}
          navigate={navigate}
          // Items in the right half open their panels toward the left.
          align={i >= Math.ceil(items.length / 2) ? "right" : "left"}
        />
      ))}

      {hidden.length > 0 && (
        <NavDropdown menu={moreMenu} active={moreActive} navigate={navigate} align="right" noNavigate />
      )}

      {/* Invisible copy of every item, used only to measure natural widths. */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-0 top-0 flex h-0 gap-1 overflow-hidden"
      >
        {items.map((item) => (
          <span
            key={item.label}
            data-measure="item"
            className={`${NAV_ITEM_CLASS} shrink-0 gap-1`}
          >
            {item.label}
            {item.children?.length ? <Caret /> : null}
          </span>
        ))}
        <span data-measure="more" className={`${NAV_ITEM_CLASS} shrink-0 gap-1`}>
          More
          <Caret />
        </span>
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

  const isItemActive = (item) =>
    !!item.route &&
    (item.exact ? location.pathname === item.route : location.pathname.startsWith(item.route));

  return (
    <div className="rt-root flex min-h-screen bg-[#F4F8F9]">
      <style>{THEME_CSS}</style>

      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main
        className={`flex-1 min-w-0 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* ============ Single sticky bar: title · pages · CTAs · Admin ============ */}
        <header className="rt-header-in sticky top-0 z-40 bg-[#7b1e2b] shadow-md">
          {/* The middle column takes all leftover space; PrimaryNav fits as many
              links as it can there and tucks the rest under "More". CTAs stay
              icon-only until very wide screens so the menu bar gets the room. */}
          <div className="grid h-20 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 sm:px-4 lg:px-5">
            {/* Left: mobile toggle + title */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
                className="lg:hidden flex h-11 shrink-0 items-center gap-1.5 rounded-lg px-2 text-base font-semibold text-white hover:bg-white/10 transition"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                aria-label="Ratnagiri Tourism — home"
                className="flex min-w-0 items-center"
              >
                <span className="rt-display truncate text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-white leading-tight">
                  Ratnagiri Tourism
                </span>
              </button>
            </div>

            {/* Center: page links (desktop only; phones and tablets use the sidebar) */}
            <div className="hidden lg:block min-w-0">
              <PrimaryNav items={NAV_ITEMS} navigate={navigate} isItemActive={isItemActive} />
            </div>
            <div className="lg:hidden" aria-hidden="true" />

            {/* Right: CTAs + Admin */}
            <div className="flex shrink-0 items-center justify-end gap-2">
              <button
                onClick={() => navigate("/map")}
                aria-label="Interactive Map"
                title="Interactive Map"
                className="rt-cta relative flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-white px-3 text-[0.9375rem] font-semibold text-[#0b3149] ring-1 ring-black/5 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 active:translate-y-0 transition-all duration-200"
              >
                <span className="rt-shine pointer-events-none absolute inset-0 overflow-hidden rounded-full" />
                <Compass size={18} className="rt-compass relative text-[#B4532A]" />
                <span className="relative hidden 2xl:inline">Interactive Map</span>
                <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                  <span className="rt-ping absolute inline-flex h-full w-full rounded-full bg-amber-400" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                </span>
              </button>
              <button
                onClick={() => navigate("/registration")}
                aria-label="Add location and services"
                title="Add location and services"
                className="rt-cta relative flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-teal-700 to-teal-800 px-3 text-[0.9375rem] font-semibold text-white ring-1 ring-teal-400/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 active:translate-y-0 transition-all duration-200"
              >
                <span className="rt-shine pointer-events-none absolute inset-0 overflow-hidden rounded-full" />
                <MapPlus size={18} className="rt-mapplus relative" />
                <span className="relative hidden min-[1700px]:inline">Add location and services</span>
              </button>

              <button
                onClick={() => navigate(user ? "/admin" : "/login")}
                aria-label="Admin"
                title="Admin"
                className="rt-cta relative flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-[#0b3149] px-3 text-[0.9375rem] font-semibold text-white ring-1 ring-white/40 hover:-translate-y-0.5 hover:bg-[#134b78] hover:shadow-lg hover:shadow-black/30 active:translate-y-0 transition-all duration-200"
              >
                <span className="rt-shine pointer-events-none absolute inset-0 overflow-hidden rounded-full" />
                <ShieldCheck size={18} className="rt-shield relative" />
                <span className="relative hidden 2xl:inline">Admin login</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div id="main-content" tabIndex={-1} className="pb-8 outline-none">
          <Breadcrumb />
          <Outlet />
        </div>
      </main>
      <BackToTop />
    </div>
  );.
}