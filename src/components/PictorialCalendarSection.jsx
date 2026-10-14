import { useState, useEffect } from "react";
import { CalendarDays, ChevronRight, X } from "lucide-react";
import EventsCalendar from "./EventsCalendar";

/* ------------------------------------------------------------------
   Card that says "Pictorial Calendar Format". Clicking it opens the
   full Ratnagiri Tourism Calendar (month grid + Contribute form) in
   a large pop-up. Events are loaded by EventsCalendar from the API,
   so no `events` prop is needed any more.
------------------------------------------------------------------ */

export default function PictorialCalendarSection({ image }) {
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

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Events calendar"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-3 sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative mx-auto max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close calendar"
              className="absolute top-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg hover:bg-slate-100"
            >
              <X size={18} />
            </button>
            <EventsCalendar />
          </div>
        </div>
      )}
    </section>
  );
}