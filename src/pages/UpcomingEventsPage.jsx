import { useEffect, useRef, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import EventsCalendar from "../components/EventsCalendar";
import API_BASE_URL from "../config";

const formatDate = (iso) =>
  new Date(`${String(iso).slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function UpcomingEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const listRef = useRef(null);

  // Approved upcoming events from the Flask / Postgres backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/events/upcoming?limit=12`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  // Rolling display: the list drifts upward slowly and loops back to the top.
  // It pauses while the visitor hovers, touches or focuses it, and is skipped
  // entirely for people who prefer reduced motion. The scroll bar stays
  // usable the whole time.
  useEffect(() => {
    const el = listRef.current;
    if (!el || paused || events.length < 2) return undefined;
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
  }, [paused, events.length]);

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

      {/* 1. Coming up — rolling list with a scroll bar on the right */}
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

          {events.length > 0 && (
            <div
              ref={listRef}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onTouchStart={() => setPaused(true)}
              onTouchEnd={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
              tabIndex={0}
              aria-label="Upcoming events, scrollable list"
              className="rt-roll max-h-[19rem] overflow-y-scroll pr-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 content-start rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              {events.map((e) => (
                <div
                  key={e.id}
                  className="flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_10px_28px_-14px_rgba(15,23,42,0.22)]"
                >
                  {e.photo_url && (
                    <img
                      src={e.photo_url}
                      alt={e.title}
                      loading="lazy"
                      className="h-24 w-full shrink-0 object-cover"
                    />
                  )}
                  <div className="p-3 min-w-0">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-[#B4532A] mb-1">
                      <MapPin size={12} /> {formatDate(e.event_date)}
                    </p>
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                      {e.title}
                    </p>
                    {e.organizer_name && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        by {e.organizer_name}
                      </p>
                    )}
                    {e.description && (
                      <p className="text-xs text-slate-500 mt-1 leading-snug line-clamp-2">
                        {e.description}
                      </p>
                    )}
                  </div>
                </div>
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