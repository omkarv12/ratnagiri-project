import { useEffect, useState } from "react";
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

  // Approved upcoming events from the Flask / Postgres backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/events/upcoming?limit=12`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
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

      {/* Calendar shown directly on the page */}
      <section className="px-3 sm:px-10 lg:px-16 py-6">
        <div className="max-w-[1680px] mx-auto">
          <EventsCalendar />
        </div>
      </section>

      {/* Full list of upcoming approved events */}
      <section
        id="events-list"
        className="px-5 sm:px-10 lg:px-16 pb-10 scroll-mt-24"
      >
        <div className="max-w-[1680px] mx-auto">
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">
            Coming up
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {loading && (
              <p className="text-sm text-slate-400">Loading events...</p>
            )}
            {!loading && events.length === 0 && (
              <p className="text-sm text-slate-400">
                No upcoming events yet. Use the form above to contribute one.
              </p>
            )}
            {events.map((e) => (
              <div
                key={e.id}
                className="overflow-hidden rounded-xl bg-white shadow-[0_10px_28px_-14px_rgba(15,23,42,0.22)]"
              >
                {e.photo_url && (
                  <img
                    src={e.photo_url}
                    alt={e.title}
                    loading="lazy"
                    className="h-36 w-full object-cover"
                  />
                )}
                <div className="p-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-[#B4532A] mb-1">
                    <MapPin size={12} /> {formatDate(e.event_date)}
                  </p>
                  <p className="text-base font-semibold text-slate-800">
                    {e.title}
                  </p>
                  {e.organizer_name && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      by {e.organizer_name}
                    </p>
                  )}
                  {e.description && (
                    <p className="text-sm text-slate-500 mt-1 leading-snug line-clamp-3">
                      {e.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}