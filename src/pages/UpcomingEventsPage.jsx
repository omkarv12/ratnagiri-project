import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import EventsCalendar from "../components/EventsCalendar";
import API_BASE_URL from "../config";

const COLUMNS = 3;

const dayOf = (iso) =>
  new Date(`${String(iso).slice(0, 10)}T00:00:00`).getDate();

const monthOf = (iso) =>
  new Date(`${String(iso).slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", {
    month: "short",
  });

const fullDate = (iso) =>
  new Date(`${String(iso).slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// One column of the notice board. It scrolls upward by itself, loops back to
// the top, pauses while the visitor hovers / touches / focuses it, and stays
// still for people who prefer reduced motion. The scroll bar on the right
// stays usable the whole time.
function RollingColumn({ items }) {
  const ref = useRef(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || paused || items.length < 2) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;

    const id = setInterval(() => {
      if (el.scrollHeight <= el.clientHeight + 2) return; // nothing to scroll
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
        el.scrollTop = 0;
      } else {
        el.scrollTop += 1;
      }
    }, 40);
    return () => clearInterval(id);
  }, [paused, items.length]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      tabIndex={0}
      aria-label="Upcoming events, scrollable list"
      className="rt-roll h-72 overflow-y-scroll rounded-xl bg-white shadow-[0_10px_28px_-14px_rgba(15,23,42,0.22)] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
    >
      <ul className="divide-y divide-slate-100">
        {items.map((e) => (
          <li key={e.id} className="flex gap-3 p-3">
            <div className="w-12 shrink-0 rounded-lg bg-[#B4532A] py-1.5 text-center text-white">
              <p className="text-lg font-bold leading-none">{dayOf(e.event_date)}</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
                {monthOf(e.event_date)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug text-slate-800">{e.title}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {fullDate(e.event_date)}
                {e.organizer_name ? ` · by ${e.organizer_name}` : ""}
              </p>
              {e.description && (
                <p className="mt-1 line-clamp-2 text-xs leading-snug text-slate-500">
                  {e.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function UpcomingEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Approved upcoming events from the Flask / Postgres backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/events/upcoming?limit=12`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  // Deal events out across the columns (1st, 2nd, 3rd, 1st, ...) so the
  // soonest events sit at the top of each column.
  const columns = Array.from({ length: COLUMNS }, (_, c) =>
    events.filter((_, i) => i % COLUMNS === c)
  ).filter((col) => col.length > 0);

  return (
    <div className="animate-in fade-in duration-500">
      <style>{`
        .rt-roll { scrollbar-width: thin; scrollbar-color: #B4532A #f1f5f9; }
        .rt-roll::-webkit-scrollbar { width: 8px; }
        .rt-roll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 99px; }
        .rt-roll::-webkit-scrollbar-thumb { background: #B4532A; border-radius: 99px; }
        .rt-roll::-webkit-scrollbar-thumb:hover { background: #9c4522; }
      `}</style>

      <header className="px-5 sm:px-10 lg:px-16 pt-8 pb-2">
        <div className="max-w-[1680px] mx-auto">
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
            <CalendarDays size={16} />
            Experiences
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Upcoming Events
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-lg">
            Festivals, trails and happenings across Ratnagiri district.
          </p>
        </div>
      </header>

      {/* 1. Coming up — three scrolling columns above the calendar */}
      <section
        id="events-list"
        className="px-5 sm:px-10 lg:px-16 pt-6 pb-4 scroll-mt-24"
      >
        <div className="max-w-[1680px] mx-auto">
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">
            Coming up
          </h2>

          {loading && <p className="text-sm text-slate-400">Loading events...</p>}
          {!loading && events.length === 0 && (
            <p className="text-sm text-slate-400">
              No upcoming events yet. Use the form below to contribute one.
            </p>
          )}

          {columns.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {columns.map((items, i) => (
                <RollingColumn key={i} items={items} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. Calendar and contribute form */}
      <section className="px-3 sm:px-10 lg:px-16 py-6">
        <div className="max-w-[1680px] mx-auto">
          <EventsCalendar />
        </div>
      </section>
    </div>
  );
}