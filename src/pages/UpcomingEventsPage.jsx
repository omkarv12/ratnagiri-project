import { useEffect, useRef, useState } from "react";
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

/* ───────────── one event card (compact) ───────────── */

function EventCard({ e, first }) {
  const [failed, setFailed] = useState(false);
  const src = imageOf(e);
  const showImg = src && !failed;
  const place = e.location || e.venue || e.place;

  return (
    <article className="group flex w-[240px] shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_14px_30px_-20px_rgba(11,49,73,0.5)] ring-1 ring-slate-200/80 transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_46px_-22px_rgba(11,49,73,0.55)] sm:w-[260px] xl:w-[280px]">
      {/* image */}
      <div className="relative h-36 overflow-hidden bg-[#0b3149] xl:h-40">
        {showImg ? (
          <img
            src={src}
            alt={e.title}
            loading="lazy"
            draggable={false}
            onError={() => setFailed(true)}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.07]"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0b3149] via-[#0d4150] to-[#0f766e]">
            <span aria-hidden="true" className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-white/10" />
            <span aria-hidden="true" className="absolute -bottom-10 -left-8 h-36 w-36 rounded-full bg-[#FBBF24]/10 blur-2xl" />
            <CalendarDays size={38} className="relative text-white/25" strokeWidth={1.2} />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b3149]/65 via-transparent to-[#0b3149]/15" />

        {/* date badge */}
        <div className="absolute left-3 top-3 flex h-[54px] w-[46px] flex-col items-center justify-center rounded-xl bg-white/95 shadow-lg backdrop-blur">
          <span className="text-xl font-extrabold leading-none text-[#0b3149]">{dayOf(e.event_date)}</span>
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#B4532A]">
            {monthOf(e.event_date)}
          </span>
        </div>

        {/* countdown pill */}
        <span className="absolute right-3 top-3 rounded-full bg-[#FBBF24] px-2.5 py-0.5 text-[11px] font-bold text-[#0b3149] shadow-md">
          {whenLabel(e.event_date)}
        </span>

        {first && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white ring-1 ring-white/30 backdrop-blur">
            <Sparkles size={11} className="text-[#FBBF24]" /> Next up
          </span>
        )}
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-4">
        {e.organizer_name && (
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-teal-700">
            by {e.organizer_name}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-[#0b3149]">{e.title}</h3>
        {e.description && (
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-slate-600">{e.description}</p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-500">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={12} className="text-[#B4532A]" />
            {fullDate(e.event_date)}
          </span>
          {place && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} className="text-[#B4532A]" />
              {place}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/* ───────────── endless, self-scrolling carousel ───────────── */

const SPEED = 0.6; // pixels per frame (about 36px per second). Raise for faster.

function EventsCarousel({ events }) {
  const track = useRef(null);
  const paused = useRef(false);
  const resumeTimer = useRef(null);
  const [still, setStill] = useState(false);

  // Make sure one copy is wide enough, then render two copies for a seamless loop.
  let base = events;
  while (base.length < 6) base = base.concat(events);

  const hold = (ms) => {
    paused.current = true;
    clearTimeout(resumeTimer.current);
    if (ms) resumeTimer.current = setTimeout(() => (paused.current = false), ms);
  };
  const release = () => {
    clearTimeout(resumeTimer.current);
    paused.current = false;
  };

  useEffect(() => {
    const el = track.current;
    if (!el) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      return undefined;
    }

    const half = () => (el.scrollWidth + GAP) / 2;
    let pos = half(); // start in the middle so scrolling left also loops
    el.scrollLeft = pos;
    let raf = 0;

    const loop = () => {
      const h = half();
      if (paused.current) {
        pos = el.scrollLeft; // follow manual scrolling, arrows and drags
      } else {
        pos += SPEED;
        el.scrollLeft = pos;
      }
      if (pos >= h * 2 - 1) { pos -= h; el.scrollLeft = pos; }
      else if (pos <= 1) { pos += h; el.scrollLeft = pos; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resumeTimer.current);
    };
  }, [events.length]);

  const nudge = (dir) => {
    const el = track.current;
    if (!el) return;
    hold(1600);
    el.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-9 w-1.5 rounded-full bg-gradient-to-b from-[#FBBF24] via-[#B4532A] to-teal-600" />
          <div>
            <h2 className="text-2xl font-bold text-[#0b3149] sm:text-3xl">Coming up</h2>
            <p className="text-sm text-slate-500">The next happenings across the district</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="mr-1 hidden text-xs font-medium text-slate-400 sm:inline">Hover to pause</span>
          <button
            onClick={() => nudge(-1)}
            aria-label="Scroll back"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0b3149] ring-1 ring-slate-200 transition hover:bg-[#0b3149] hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => nudge(1)}
            aria-label="Scroll forward"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B4532A] text-white shadow-md shadow-[#B4532A]/30 transition hover:bg-[#9c4522]"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={track}
          onMouseEnter={() => hold()}
          onMouseLeave={release}
          onTouchStart={() => hold()}
          onTouchEnd={() => hold(2500)}
          onFocus={() => hold()}
          onBlur={release}
          tabIndex={0}
          aria-label="Upcoming events, scrolls automatically. Hover to pause."
          className={`rt-hide-scroll flex gap-6 overflow-x-auto py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${still ? "snap-x" : ""}`}
        >
          {base.map((e, i) => (
            <EventCard key={`a-${e.id}-${i}`} e={e} first={i === 0} />
          ))}
          {!still &&
            base.map((e, i) => (
              <div key={`b-${e.id}-${i}`} aria-hidden="true" className="contents">
                <EventCard e={e} first={false} />
              </div>
            ))}
        </div>

        {/* soft edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent sm:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent sm:w-16" />
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