import { useState, useEffect } from "react";
import { CalendarDays, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CalendarPanel from "./CalendarPanel";

/* ------------------------------------------------------------------
   Drop this section into the existing "Upcoming Events" page
   (the page behind the menu bar / the dashboard's "More" link).

   It shows a card that says "Pictorial Calendar Format". Clicking the
   card opens the pictorial calendar in a pop-up, with the Contribute
   and View buttons at the bottom.

   Usage (inside the Upcoming Events page component):

     import PictorialCalendarSection from "../components/PictorialCalendarSection";
     ...
     <PictorialCalendarSection events={events} image={Slider1} />

   `events` = [{ date: "YYYY-MM-DD", title, description?, route? }]
------------------------------------------------------------------ */

// Sample events — pass your real ones via the `events` prop.
const SAMPLE_EVENTS = [
  { date: "2026-10-11", title: "Navratri begins", description: "Garba and devi festivals in village temples.", route: "/cultural-events" },
  { date: "2026-10-15", title: "New Guided Trail: Fort to Bhagwati Bandar", description: "A 3 km coastal walk with a local guide.", route: "/guided-walks" },
  { date: "2026-10-20", title: "Dussehra", description: "Processions and fairs across the district.", route: "/cultural-events" },
  { date: "2026-11-08", title: "Diwali", description: "Fort illuminations and local markets.", route: "/cultural-events" },
];

export default function PictorialCalendarSection({
  events = SAMPLE_EVENTS,
  image,
  onView,
  onContribute,
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Close on Esc, and lock page scroll while the pop-up is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <section className="px-5 sm:px-10 lg:px-16 py-6">
      {/* The label card — click to open the calendar */}
      <button
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="group relative w-full max-w-xl text-left overflow-hidden rounded-xl bg-white ring-1 ring-black/5 shadow-[0_10px_28px_-14px_rgba(15,23,42,0.22)] hover:-translate-y-1 hover:shadow-[0_26px_50px_-18px_rgba(180,83,42,0.4)] transition-all duration-300"
      >
        {image && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:opacity-35 transition-opacity"
            style={{ backgroundImage: `url(${image})` }}
          />
        )}
        <div className="relative flex items-center gap-4 p-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#B4532A] text-white">
            <CalendarDays size={22} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-xl font-bold text-slate-900">
              Pictorial Calendar Format
            </span>
            <span className="block text-sm text-slate-600">
              Tap to open the events calendar
            </span>
          </span>
          <ChevronRight
            size={20}
            className="shrink-0 text-[#B4532A] transition-transform group-hover:translate-x-1"
          />
        </div>
      </button>

      {/* Pop-up with the calendar */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Events calendar"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close calendar"
              className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg hover:bg-slate-100"
            >
              <X size={16} />
            </button>
            <CalendarPanel
              events={events}
              image={image}
              onEventClick={(route) => {
                setOpen(false);
                navigate(route);
              }}
              onView={onView}
              onContribute={onContribute || (() => navigate("/events/contribute"))} // TODO: create this route/form
            />
          </div>
        </div>
      )}
    </section>
  );
}