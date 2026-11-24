import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  PlusCircle,
  X,
} from "lucide-react";
import API_BASE_URL from "../config";

/*
  Festivals & Events showcase (same idea as the reference screenshot):
    - left: dark panel with the selected event (title, start date, text, KNOW MORE)
    - right: poster slider with arrows and a progress line
    - KNOW MORE opens a details popup: poster, address, phone, email, link

  USE
    Home page (after the Experiences section):   <FestivalsEvents />
    Events page (top, above the calendar):        <FestivalsEvents variant="page" />

  Data: GET /api/events/upcoming?limit=12  (approved events only)
  Fields used: title, event_date, description, photo_url, category, organizer_name,
               organizer_contact, organizer_email, address, event_link
*/

const EVENTS_ROUTE = "/experiences/upcoming-events"; // route of UpcomingEventsPage in App.jsx
const AUTOPLAY_MS = 6000;

/* ---------- helpers ---------- */
const parse = (iso) => new Date(`${String(iso).slice(0, 10)}T00:00:00`);
const dateLine = (iso) =>
  parse(iso)
    .toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    .toUpperCase();

function photoOf(e) {
  const raw = e.photo_url || e.image_url || e.image || e.photo || e.banner_url;
  if (!raw) return null;
  if (/^(https?:)?\/\//.test(raw) || raw.startsWith("data:")) return raw;
  return `${API_BASE_URL}${raw.startsWith("/") ? "" : "/"}${raw}`;
}
const addressOf = (e) => e.address || e.location || e.venue || e.place || "";

// Only allow real web links (stops "javascript:" links from the database)
function safeUrl(u) {
  const v = String(u || "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(v)) return `https://${v}`;
  return null;
}
const telHref = (p) => `tel:${String(p).replace(/[^\d+]/g, "")}`;

const goTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ---------- poster (used inside the slider) ---------- */
function Poster({ e, on, onPick }) {
  const src = photoOf(e);
  return (
    <button
      type="button"
      onClick={onPick}
      aria-label={`${e.title}, ${dateLine(e.event_date)}`}
      aria-current={on}
      className={`fe-item group relative h-full shrink-0 overflow-hidden bg-[#2a0608] ${on ? "on" : ""}`}
    >
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          draggable={false}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full flex-col justify-end bg-gradient-to-br from-[#5a0c18] via-[#3b0710] to-[#1d0306] p-5 text-left">
          <CalendarDays size={34} className="mb-3 text-[#e8a13a]" aria-hidden="true" />
          <p className="font-display text-xl font-semibold leading-tight text-white">{e.title}</p>
          <p className="mt-1 text-xs tracking-widest text-white/70">{dateLine(e.event_date)}</p>
        </div>
      )}
      <span
        aria-hidden="true"
        className={`absolute inset-0 transition duration-500 ${on ? "bg-transparent" : "bg-black/50 group-hover:bg-black/25"}`}
      />
    </button>
  );
}

/* ---------- details popup ---------- */
function EventDetails({ e, onClose }) {
  const src = photoOf(e);
  const address = addressOf(e);
  const link = safeUrl(e.event_link);
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (ev) => ev.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const Row = ({ icon: Icon, children }) => (
    <li className="flex items-start gap-3 text-[15px] text-slate-700">
      <Icon size={18} className="mt-0.5 shrink-0 text-[#8b0a3a]" aria-hidden="true" />
      <span className="min-w-0 break-words">{children}</span>
    </li>
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={e.title}
        onClick={(ev) => ev.stopPropagation()}
        className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto bg-white shadow-2xl md:grid-cols-[320px_minmax(0,1fr)]"
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center bg-white/90 text-slate-800 shadow hover:bg-white"
        >
          <X size={18} />
        </button>

        <div className="relative min-h-[260px] bg-[#2a0608] md:min-h-full">
          {src ? (
            <img src={src} alt={e.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#5a0c18] to-[#1d0306]">
              <CalendarDays size={56} className="text-white/30" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          {e.category && (
            <span className="inline-block bg-[#8b0a3a]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#8b0a3a]">
              {e.category}
            </span>
          )}
          <h3 className="mt-3 font-display text-3xl font-semibold leading-tight text-[#2a0608]">{e.title}</h3>
          <p className="mt-2 text-sm font-semibold tracking-widest text-[#b45309]">
            STARTING FROM {dateLine(e.event_date)}
          </p>
          {e.organizer_name && <p className="mt-1 text-sm text-slate-500">Organised by {e.organizer_name}</p>}

          {e.description && (
            <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-slate-700">{e.description}</p>
          )}

          <ul className="mt-6 space-y-3 border-t border-slate-200 pt-5">
            {address && (
              <Row icon={MapPin}>
                {address}{" "}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#8b0a3a] underline"
                >
                  Open in Maps
                </a>
              </Row>
            )}
            {e.organizer_contact && (
              <Row icon={Phone}>
                <a href={telHref(e.organizer_contact)} className="font-semibold text-[#8b0a3a] hover:underline">
                  {e.organizer_contact}
                </a>
              </Row>
            )}
            {e.organizer_email && (
              <Row icon={Mail}>
                <a href={`mailto:${e.organizer_email}`} className="font-semibold text-[#8b0a3a] hover:underline">
                  {e.organizer_email}
                </a>
              </Row>
            )}
          </ul>

          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-[#8b0a3a] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:brightness-110"
            >
              Event link <ExternalLink size={15} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- section ---------- */
export default function FestivalsEvents({ variant = "home" }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [detail, setDetail] = useState(null);
  const paused = useRef(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/events/upcoming?limit=12`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setEvents(Array.isArray(d) ? d : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const n = events.length;
  const step = (d) => setActive((i) => (n ? (i + d + n) % n : 0));

  // autoplay (stops on hover, while the popup is open, and for "reduce motion")
  useEffect(() => {
    if (n < 2 || detail || reduced()) return undefined;
    const t = setInterval(() => {
      if (!paused.current) setActive((i) => (i + 1) % n);
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [n, detail]);

  const cur = events[active];
  const curPhoto = cur ? photoOf(cur) : null;
  const addNew = () => (variant === "page" ? goTo("contribute") : navigate(`${EVENTS_ROUTE}#contribute`));

  return (
    <section
      id="festivals"
      className="relative overflow-hidden bg-[#e9e6db] py-14 sm:py-20"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <style>{`
        .fe-track { --wi: 150px; --wa: min(74vw, 330px); --gap: 12px; }
        @media (min-width: 1024px) { .fe-track { --wi: 170px; --wa: 390px; } }
        .fe-inner {
          display: flex; height: 100%; gap: var(--gap);
          transform: translateX(calc(var(--k, 0) * (var(--wi) + var(--gap)) * -1));
          transition: transform .7s cubic-bezier(.22,1,.36,1);
        }
        .fe-item { width: var(--wi); transition: width .7s cubic-bezier(.22,1,.36,1); }
        .fe-item.on { width: var(--wa); }
        @keyframes fe-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        .fe-in { animation: fe-in .6s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .fe-inner, .fe-item { transition: none; }
          .fe-in { animation: none; }
        }
      `}</style>

      <div className="px-5 text-center">
        <h2 className="font-display text-2xl font-semibold uppercase tracking-[0.32em] text-[#4a0a12] sm:text-4xl">
          Festivals &amp; Events
        </h2>
        {variant === "page" && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => goTo("calendar")}
              className="inline-flex items-center gap-2 border border-[#4a0a12] px-5 py-2.5 text-sm font-semibold uppercase tracking-widest text-[#4a0a12] transition hover:bg-[#4a0a12] hover:text-white"
            >
              <CalendarDays size={16} aria-hidden="true" /> Browse calendar
            </button>
            <button
              onClick={addNew}
              className="inline-flex items-center gap-2 bg-[#8b0a3a] px-5 py-2.5 text-sm font-semibold uppercase tracking-widest text-white transition hover:brightness-110"
            >
              <PlusCircle size={16} aria-hidden="true" /> Add your event
            </button>
          </div>
        )}
      </div>

      <div className="mt-10 grid gap-6 sm:mt-14 lg:grid-cols-2 lg:gap-8">
        {/* ---------- left: selected event ---------- */}
        <div className="relative flex min-h-[420px] items-center overflow-hidden bg-[#2a0608] lg:h-[520px]">
          {curPhoto && (
            <img
              key={`bg-${cur.id}`}
              src={curPhoto}
              alt=""
              aria-hidden="true"
              className="fe-in absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.14] blur-sm"
            />
          )}
          <div className="relative w-full px-6 py-10 sm:px-10 lg:pl-[max(4rem,calc((100vw-1280px)/2+1rem))] lg:pr-12">
            {loading && (
              <div className="space-y-4" aria-busy="true">
                <div className="h-10 w-3/4 animate-pulse bg-white/10" />
                <div className="h-4 w-1/3 animate-pulse bg-white/10" />
                <div className="h-4 w-full animate-pulse bg-white/10" />
              </div>
            )}

            {!loading && !cur && (
              <div className="text-white">
                <h3 className="font-display text-3xl font-medium">No upcoming events yet</h3>
                <p className="mt-3 max-w-md text-white/70">Know of a festival, trek or fair? Add it for everyone to see.</p>
                <button
                  onClick={addNew}
                  className="mt-8 inline-flex items-center gap-2 border border-white/80 px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#2a0608]"
                >
                  <PlusCircle size={16} aria-hidden="true" /> Add an event
                </button>
              </div>
            )}

            {cur && (
              <div key={cur.id} className="fe-in text-white">
                <h3 className="font-display text-3xl font-medium leading-tight sm:text-[2.6rem]">{cur.title}</h3>
                <p className="mt-3 text-base uppercase tracking-wide text-white/90">
                  Starting from {dateLine(cur.event_date)}
                </p>
                <div className="my-7 h-px w-full bg-[#e8a13a]" />
                {cur.description && (
                  <p className="line-clamp-3 max-w-xl text-[15px] leading-8 text-white/80">{cur.description}</p>
                )}
                {addressOf(cur) && (
                  <p className="mt-4 flex items-center gap-2 text-sm text-white/70">
                    <MapPin size={15} className="shrink-0 text-[#e8a13a]" aria-hidden="true" />
                    <span className="line-clamp-1">{addressOf(cur)}</span>
                  </p>
                )}
                <button
                  onClick={() => setDetail(cur)}
                  className="mt-8 border border-white/90 px-9 py-4 text-sm font-medium uppercase tracking-[0.25em] text-white transition hover:bg-white hover:text-[#2a0608]"
                >
                  Know more
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ---------- right: poster slider ---------- */}
        <div className="relative h-[440px] lg:h-[520px]">
          <div className="fe-track h-full overflow-hidden px-5 lg:px-0" style={{ "--k": active }}>
            {loading && (
              <div className="flex h-full gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-full w-[170px] shrink-0 animate-pulse bg-black/10 first:w-[300px]" />
                ))}
              </div>
            )}
            {!loading && n > 0 && (
              <div className="fe-inner">
                {events.map((e, i) => (
                  <Poster key={e.id ?? i} e={e} on={i === active} onPick={() => setActive(i)} />
                ))}
              </div>
            )}
            {!loading && n === 0 && (
              <div className="flex h-full items-center justify-center border-2 border-dashed border-[#4a0a12]/25 text-center text-[#4a0a12]/60">
                <div>
                  <CalendarDays size={40} className="mx-auto mb-3" aria-hidden="true" />
                  <p className="text-sm font-semibold uppercase tracking-widest">Event posters appear here</p>
                </div>
              </div>
            )}
          </div>

          {n > 1 && (
            <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 translate-y-1/2 shadow-lg">
              <button
                onClick={() => step(-1)}
                aria-label="Previous event"
                className="flex h-14 w-14 items-center justify-center bg-[#e4e4e7] text-slate-600 transition hover:bg-white"
              >
                <ChevronLeft size={26} />
              </button>
              <button
                onClick={() => step(1)}
                aria-label="Next event"
                className="flex h-14 w-14 items-center justify-center bg-[#e03a55] text-white transition hover:brightness-110"
              >
                <ChevronRight size={26} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* progress line */}
      {n > 1 && (
        <div className="mx-auto mt-14 h-[2px] w-[min(86%,1280px)] bg-black/15" aria-hidden="true">
          <div
            className="h-full bg-slate-700 transition-[width] duration-700"
            style={{ width: `${((active + 1) / n) * 100}%` }}
          />
        </div>
      )}

      {variant === "home" && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => navigate(EVENTS_ROUTE)}
            className="border border-[#4a0a12] px-8 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#4a0a12] transition hover:bg-[#4a0a12] hover:text-white"
          >
            View all events &amp; calendar
          </button>
        </div>
      )}

      {detail && <EventDetails e={detail} onClose={() => setDetail(null)} />}
    </section>
  );
}