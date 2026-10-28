import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, PlusCircle, Sparkles } from "lucide-react";
import EventsCalendar from "../components/EventsCalendar";
import API_BASE_URL from "../config";

const COLUMNS = 3;

const parse = (iso) => new Date(`${String(iso).slice(0, 10)}T00:00:00`);
const dayOf = (iso) => parse(iso).getDate();
const monthOf = (iso) => parse(iso).toLocaleDateString("en-IN", { month: "short" });
const fullDate = (iso) =>
  parse(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function EventRow({ e }) {
  return (
    <li className="group flex gap-3 rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-gradient-to-b from-[#B4532A] to-[#8f3f1f] text-white shadow-sm">
        <span className="text-xl font-bold leading-none">{dayOf(e.event_date)}</span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
          {monthOf(e.event_date)}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold leading-snug text-[#0b3149]">{e.title}</p>
        <p className="mt-0.5 text-xs font-medium text-teal-700">
          {fullDate(e.event_date)}
          {e.organizer_name && (
            <span className="font-normal text-slate-500"> · by {e.organizer_name}</span>
          )}
        </p>
        {e.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
            {e.description}
          </p>
        )}
      </div>
    </li>
  );
}

// One column of the notice board: an endless loop. When the list is taller
// than the box, it is rendered twice back to back; the column scrolls up
// slowly and, the moment the first copy has gone past, jumps back by exactly
// one copy — so the join is invisible and it never snaps to the top. Hover,
// touch or keyboard focus pauses it; the scroll bar still works (scrolling
// by hand also wraps around). Reduced-motion users get a normal, still list.
function RollingColumn({ items }) {
  const ref = useRef(null);
  const listRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [loop, setLoop] = useState(false);

  // Loop only when the list actually overflows the box.
  useLayoutEffect(() => {
    const el = ref.current;
    const list = listRef.current;
    if (!el || !list) return;
    setLoop(list.offsetHeight > el.clientHeight + 2);
  }, [items]);

  // Start in the middle (second copy looks identical) so scrolling up wraps too.
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && loop) el.scrollTop = el.scrollHeight / 2;
  }, [loop]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !loop || paused) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const id = setInterval(() => {
      el.scrollTop += 1;
    }, 30);
    return () => clearInterval(id);
  }, [loop, paused]);

  // Wrap in both directions, for the auto-scroll and for manual scrolling.
  const handleScroll = () => {
    const el = ref.current;
    if (!el || !loop) return;
    const half = el.scrollHeight / 2;
    if (el.scrollTop >= half) el.scrollTop -= half;
    else if (el.scrollTop <= 0) el.scrollTop += half;
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-[#F4F8F9] ring-1 ring-slate-200/80">
      <div
        ref={ref}
        onScroll={handleScroll}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        tabIndex={0}
        aria-label="Upcoming events, scrollable list"
        className="rt-roll h-80 overflow-y-scroll focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      >
        <ul ref={listRef} className="space-y-2.5 p-2.5 pr-1.5">
          {items.map((e) => (
            <EventRow key={e.id} e={e} />
          ))}
        </ul>
        {loop && (
          <ul aria-hidden="true" className="space-y-2.5 p-2.5 pr-1.5">
            {items.map((e) => (
              <EventRow key={`copy-${e.id}`} e={e} />
            ))}
          </ul>
        )}
      </div>
      {/* soft fade so rows glide in and out instead of being cut off */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[#F4F8F9] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#F4F8F9] to-transparent" />
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

  const goTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="animate-in fade-in duration-500">
      <style>{`
        .rt-roll { scrollbar-width: thin; scrollbar-color: #B4532A transparent; }
        .rt-roll::-webkit-scrollbar { width: 7px; }
        .rt-roll::-webkit-scrollbar-track { background: transparent; }
        .rt-roll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        .rt-roll::-webkit-scrollbar-thumb:hover { background: #B4532A; }
      `}</style>

      {/* ============ Hero band ============ */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#0b3149] via-[#0d4150] to-[#0f766e] px-5 pb-20 pt-10 sm:px-10 sm:pb-24 sm:pt-14 lg:px-16">
        {/* decorative rings */}
        <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full border border-white/10" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#FBBF24]/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1680px]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-[#FBBF24] ring-1 ring-white/15">
            <CalendarDays size={14} />
            Experiences
          </div>
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-5xl">
            Upcoming <span className="text-[#FBBF24]">Events</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            Festivals, trails and happenings across Ratnagiri district — see what is coming up,
            browse the month, or add an event of your own.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => goTo("calendar")}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0b3149] shadow-lg shadow-black/20 transition hover:-translate-y-0.5"
            >
              <CalendarDays size={16} className="text-[#B4532A]" />
              Browse calendar
            </button>
            <button
              onClick={() => goTo("contribute")}
              className="inline-flex items-center gap-2 rounded-full bg-[#B4532A] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:bg-[#9c4522]"
            >
              <PlusCircle size={16} />
              Contribute an event
            </button>
            {events.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-sm font-semibold text-white ring-1 ring-white/15">
                <Sparkles size={14} className="text-[#FBBF24]" />
                {events.length} upcoming
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ============ 1. Coming up — floats over the hero ============ */}
      <section
        id="events-list"
        className="relative -mt-12 px-5 sm:px-10 lg:px-16 scroll-mt-24"
      >
        <div className="mx-auto max-w-[1680px] rounded-2xl bg-white p-5 shadow-[0_30px_60px_-30px_rgba(11,49,73,0.35)] ring-1 ring-slate-200/70 sm:p-7">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="h-8 w-1.5 rounded-full bg-gradient-to-b from-[#FBBF24] via-[#B4532A] to-teal-600" />
              <div>
                <h2 className="text-2xl font-bold text-[#0b3149]">Coming up</h2>
                <p className="text-sm text-slate-500">The next happenings across the district</p>
              </div>
            </div>
            {columns.length > 0 && (
              <p className="flex items-center gap-1 text-xs font-medium text-slate-400">
                <ChevronDown size={14} /> Hover to pause · scroll to browse
              </p>
            )}
          </div>

          {loading && <p className="text-sm text-slate-500">Loading events...</p>}
          {!loading && events.length === 0 && (
            <p className="rounded-xl bg-[#F4F8F9] px-4 py-6 text-center text-sm text-slate-500">
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

      {/* ============ 2. Calendar and contribute form ============ */}
      <section id="calendar" className="scroll-mt-24 px-3 pb-4 pt-12 sm:px-10 lg:px-16">
        <div className="mx-auto mb-5 max-w-[1680px] px-2 sm:px-0">
          <div className="flex items-center gap-3">
            <span className="h-8 w-1.5 rounded-full bg-gradient-to-b from-[#FBBF24] via-[#B4532A] to-teal-600" />
            <div>
              <h2 className="text-2xl font-bold text-[#0b3149]">Event calendar</h2>
              <p className="text-sm text-slate-500">
                Browse month by month, or add your own event at the bottom.
              </p>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[1680px]">
          <EventsCalendar />
        </div>
      </section>
    </div>
  );
}