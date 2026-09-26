// src/components/Breadcrumb.jsx
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

// Turns a path segment like "good-governance" into "Good Governance".
function humanize(segment) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const SITE_NAME = "Ratnagiri Tourism";

export default function Breadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on the home/dashboard page — there's nothing to show a
  // breadcrumb or "back" for there.
  if (location.pathname === "/dashboard" || location.pathname === "/") {
    return null;
  }

  const segments = location.pathname.split("/").filter(Boolean);
  const currentLabel = segments.length
    ? humanize(segments[segments.length - 1])
    : "Home";

  return (
    <div className="bg-white border-b border-slate-100">
      <div className="mx-auto max-w-[1680px] px-4 sm:px-8 lg:px-12 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-[#0b3149] transition shrink-0"
        >
          <ArrowLeft size={16} />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-slate-500 hover:text-[#0f766e] transition truncate"
          >
            {SITE_NAME}
          </button>
          <ChevronRight size={14} className="text-slate-300 shrink-0" />
          <span className="font-semibold text-slate-800 truncate">
            {currentLabel}
          </span>
        </nav>
      </div>
    </div>
  );
}