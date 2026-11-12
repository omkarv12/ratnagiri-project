import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import EventsCalendar from "../components/EventsCalendar";
import API_BASE_URL from "../config";

const GAP = 24; // must match gap-6 on the track

/* ───────────── helpers ───────────── */

const parse = (iso) => new Date(`${String(iso).slice(0, 10)}T00:00:00`);
const dayOf = (iso) => parse(iso).getDate();
const monthOf = (iso) => parse(iso).toLocaleDateString("en-IN", { month: "short" });
const weekdayOf = (iso) => parse(iso).toLocaleDateString("en-IN", { weekday: "long" });
const fullDate = (iso) =>
  parse(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function daysUntil(iso) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((parse(iso) - today) / 86400000);
}

function whenLabel(iso) {
  const d = daysUntil(iso);
  if (d <= 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d < 31) return `In ${d} days`;
  const m = Math.round(d / 30);
  return `In ${m} month${m > 1 ? "s" : ""}`;
}

// The image column name can differ in your backend. Add yours here if needed.
function imageOf(e) {
  const raw =
    e.image_url || e.image || e.photo_url || e.photo || e.banner_url || e.cover_image || e.image_path;
  if (!raw) return null;
  if (/^(https?:)?\/\//.test(raw) || raw.startsWith("data:")) return raw;
  return `${API_BASE_URL}${raw.startsWith("/") ? "" : "/"}${raw}`;
}

/* ───────────── one event card ───────────── */

function EventCard({ e, index }) {
  const [failed, setFailed] = useState(false);
  const src = imageOf(e);
  const showImg = src && !failed;
  const place = e.location || e.venue || e.place;

  return (
    <article
      className="group flex w-[86%] shrink-0 snap-start flex-col overflow-hidden rounded-3xl bg-white shadow-[0_18px_40px_-24px_rgba(11,49,73,0.45)] ring-1 ring-slate-200/80 transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-26px_rgba(11,49,73,0.55)] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
    >
      {/* image */}
      <div className="relative h-60 overflow-hidden bg-[#0b3149] sm:h-64 xl:h-72">
        {showImg ? (
          <img
            src={src}
            alt={e.title}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.07]"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0b3149] via-[#0d4150] to-[#0f766e]">
            <span aria-hidden="true" className="absolute -right-10 -top-10 h-48 w-48 rounded-full border border-white/10" />
            <span aria-hidden="true" className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-[#FBBF24]/10 blur-2xl" />
            <CalendarDays size={54} className="relative text-white/25" strokeWidth={1.2} />
          </div>
        )}

        {/* readable bottom fade */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b3149]/70 via-transparent to-[#0b3149]/20" />

        {/* date badge */}
        <div className="absolute left-4 top-4 flex h-[68px] w-[58px] flex-col items-center justify-center rounded-2xl bg-white/95 shadow-lg backdrop-blur">
          <span className="text-2xl font-extrabold leading-none text-[#0b3149]">{dayOf(e.event_date)}</span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#B4532A]">
            {monthOf(e.event_date)}
          </span>
        </div>

        {/* countdown pill */}
        <span className="absolute right-4 top-4 rounded-full bg-[#FBBF24] px-3 py-1 text-xs font-bold text-[#0b3149] shadow-md">
          {whenLabel(e.event_date)}
        </span>

        {index === 0 && (
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white ring-1 ring-white/30 backdrop-blur">
            <Sparkles size={12} className="text-[#FBBF24]" /> Next up
          </span>
        )}
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-6">
        {e.organizer_name && (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">
            by {e.organizer_name}
          </p>
        )}
        <h3 className="mt-2 text-xl font-bold leading-snug text-[#0b3149] sm:text-[22px]">{e.title}</h3>
        {e.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{e.description}</p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} className="text-[#B4532A]" />
            {weekdayOf(e.event_date)}, {fullDate(e.event_date)}
          </span>
          {place && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} className="text-[#B4532A]" />
              {place}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/* ───────────── horizontal carousel ───────────── */

function EventsCarousel({ events }) {
  const track = useRef(null);
  const [paused, setPaused] = useState(false);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [progress, setProgress] = useState(0);

  const step = () => {
    const card = track.current?.children[0];
    return card ? card.offsetWidth + GAP : 0;
  };

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft >= max - 4 });
    setProgress(max <= 0 ? 1 : 0.12 + 0.88 * (el.scrollLeft / max));
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update, events.length]);

  const go = (dir) => track.current?.scrollBy({ left: dir * step(), behavior: "smooth" });

  // Gentle auto-advance. Hover, touch or focus pauses it; loops back to the start.
  useEffect(() => {
    const el = track.current;
    if (!el || paused || events.length < 2) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const id = setInterval(() => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 4) return;
      if (el.scrollLeft >= max - 4) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: step(), behavior: "smooth" });
    }, 4800);
    return () => clearInterval(id);
  }, [paused, events.length]);

  const canScroll = !(edge.start && edge.end);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-10 w-1.5 rounded-full bg-gradient-to-b from-[#FBBF24] via-[#B4532A] to-teal-600" />
          <div>
            <h2 className="text-2xl font-bold text-[#0b3149] sm:text-3xl">Coming up</h2>
            <p className="text-sm text-slate-500">The next happenings across the district</p>
          </div>
        </div>

        {canScroll && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => go(-1)}
              disabled={edge.start}
              aria-label="Previous events"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0b3149] ring-1 ring-slate-200 transition hover:bg-[#0b3149] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-[#0b3149]"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => go(1)}
              disabled={edge.end}
              aria-label="Next events"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#B4532A] text-white shadow-md shadow-[#B4532A]/30 transition hover:bg-[#9c4522] disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div
          ref={track}
          onScroll={update}
          tabIndex={0}
          aria-label="Upcoming events, scroll sideways"
          className="rt-hide-scroll -mx-1 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 pb-6 pt-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          {events.map((e, i) => (
            <EventCard key={e.id} e={e} index={i} />
          ))}
        </div>

        {canScroll && (
          <div className="mt-1 flex items-center gap-4">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FBBF24] via-[#B4532A] to-teal-600 transition-[width] duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="text-xs font-medium text-slate-400">Swipe or use arrows</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────── page ───────────── */

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

  const goTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const next = events[0];

  return (
    <div className="animate-in fade-in duration-500">
      <style>{`
        .rt-hide-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .rt-hide-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ============ Hero ============ */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#0b3149] via-[#0d4150] to-[#0f766e] px-5 pb-28 pt-12 sm:px-10 sm:pb-32 sm:pt-16 lg:px-16">
        <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-6 -top-6 h-52 w-52 rounded-full border border-white/10" />
        <span aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#FBBF24]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1680px] items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-[#FBBF24] ring-1 ring-white/15">
              <CalendarDays size={14} />
              Experiences
            </div>
            <h1 className="text-4xl font-bold leading-[1.05] text-white sm:text-6xl">
              Upcoming <span className="text-[#FBBF24]">Events</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-lg">
              Festivals, trails and happenings across Ratnagiri district. See what is coming up,
              browse the month, or add an event of your own.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => goTo("calendar")}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b3149] shadow-lg shadow-black/20 transition hover:-translate-y-0.5"
              >
                <CalendarDays size={16} className="text-[#B4532A]" />
                Browse calendar
              </button>
              <button
                onClick={() => goTo("contribute")}
                className="inline-flex items-center gap-2 rounded-full bg-[#B4532A] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:bg-[#9c4522]"
              >
                <PlusCircle size={16} />
                Contribute an event
              </button>
            </div>
          </div>

          {/* stat strip */}
          {events.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur">
                <p className="text-4xl font-bold text-white">{events.length}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                  Upcoming events
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur">
                <p className="text-4xl font-bold text-[#FBBF24]">{whenLabel(next.event_date)}</p>
                <p className="mt-1 line-clamp-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                  {next.title}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ============ Carousel (floats over the hero) ============ */}
      <section id="events-list" className="relative -mt-16 scroll-mt-24 px-5 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[1680px] rounded-[28px] bg-white p-5 shadow-[0_40px_80px_-40px_rgba(11,49,73,0.45)] ring-1 ring-slate-200/70 sm:p-8">
          {loading && (
            <div className="grid gap-6 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="overflow-hidden rounded-3xl ring-1 ring-slate-100">
                  <div className="h-64 animate-pulse bg-slate-100" />
                  <div className="space-y-3 p-6">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && events.length === 0 && (
            <div className="flex flex-col items-center rounded-2xl bg-[#F4F8F9] px-4 py-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#B4532A] shadow-sm ring-1 ring-slate-200">
                <CalendarDays size={26} />
              </span>
              <p className="mt-4 text-lg font-bold text-[#0b3149]">No upcoming events yet</p>
              <p className="mt-1 text-sm text-slate-500">Be the first to add one for your area.</p>
              <button
                onClick={() => goTo("contribute")}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#B4532A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#9c4522]"
              >
                Contribute an event <ArrowRight size={16} />
              </button>
            </div>
          )}

          {!loading && events.length > 0 && <EventsCarousel events={events} />}
        </div>
      </section>

      {/* ============ Calendar and contribute form ============ */}
      <section id="calendar" className="scroll-mt-24 px-3 pb-6 pt-16 sm:px-10 lg:px-16">
        <div className="mx-auto mb-6 max-w-[1680px] px-2 sm:px-0">
          <div className="flex items-center gap-3">
            <span className="h-10 w-1.5 rounded-full bg-gradient-to-b from-[#FBBF24] via-[#B4532A] to-teal-600" />
            <div>
              <h2 className="text-2xl font-bold text-[#0b3149] sm:text-3xl">Event calendar</h2>
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