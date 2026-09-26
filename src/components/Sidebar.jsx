import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  Home,
  Compass,
  Drama,
  Users,
  LifeBuoy,
  Landmark,
  ChevronDown,
} from "lucide-react";
import { MENUS } from "../config/navMenus";

// Icon per top-level menu, purely for visual scanning on mobile.
const MENU_ICONS = {
  "Plan Your Trip": Compass,
  Experiences: Drama,
  Stories: Users,
  Resources: LifeBuoy,
  About: Landmark,
};

// One accordion row. Renders its own children indented underneath when
// expanded, and recurses for any child that itself has "children" (the
// About → Geography / About nested group).
function AccordionSection({ item, depth = 0, navigate, onNavigate, location }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const Icon = depth === 0 ? MENU_ICONS[item.label] : null;

  const isCurrentRoute =
    item.route && location.pathname + location.hash === item.route;

  if (!hasChildren) {
    return (
      <button
        onClick={() => onNavigate(item.route)}
        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
          isCurrentRoute
            ? "bg-white/10 text-white font-semibold"
            : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`}
        style={{ paddingLeft: `${0.75 + depth * 0.9}rem` }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#B4532A] shrink-0" />
        {item.label}
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-white hover:bg-white/5 transition-colors"
        style={{ paddingLeft: `${0.75 + depth * 0.9}rem` }}
      >
        <span className="flex items-center gap-2.5">
          {Icon && <Icon size={16} className="text-[#5EEAD4] shrink-0" />}
          {item.label}
        </span>
        <ChevronDown
          size={15}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="mt-0.5 space-y-0.5">
          {item.children.map((child) => (
            <AccordionSection
              key={child.label}
              item={child}
              depth={depth + 1}
              navigate={navigate}
              onNavigate={onNavigate}
              location={location}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (route) => {
    if (!route) return;
    navigate(route);
    setOpen(false);
  };

  return (
    <>
      {/* Backdrop — dims the page and lets a tap outside close the menu */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-72 max-w-[85vw] bg-[#0b3149] text-white flex flex-col transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <span className="font-display text-lg font-bold tracking-tight">
            Ratnagiri Tourism
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <button
            onClick={() => handleNavigate("/dashboard")}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
              location.pathname === "/dashboard"
                ? "bg-white/10 text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Home size={16} className="text-[#5EEAD4] shrink-0" />
            Home
          </button>

          <div className="my-2 border-t border-white/10" />

          {MENUS.map((menu) => (
            <AccordionSection
              key={menu.label}
              item={menu}
              navigate={navigate}
              onNavigate={handleNavigate}
              location={location}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}