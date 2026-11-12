import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  PlusCircle,
  X,
} from "lucide-react";
import API_BASE_URL from "../config";

/* ------------------------------------------------------------------
   Ratnagiri Tourism Calendar: month grid, a scrollable "selected day"
   side panel, category filters and the contribute form.

   GET  {api}?year=YYYY&month=M   -> [{ id, title, event_date, category,
                                        organizer_name, description, photo_url }]
   POST {api}/contribute          -> creates a pending event (admin approves)
   POST /api/upload-photo         -> Cloudinary upload, returns { url }
------------------------------------------------------------------ */

const API = `${API_BASE_URL}/api/events`;
const MAX_PHOTO_MB = 5;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CATEGORIES = {
  beaches:    { label: "Beaches",    bg: "#f7a072", fg: "#222" },
  forts:      { label: "Forts",      bg: "#64b5f6", fg: "#fff" },
  temples:    { label: "Temples",    bg: "#ba68c8", fg: "#fff" },
  waterfalls: { label: "Waterfalls", bg: "#4dd0e1", fg: "#222" },
  mangoes:    { label: "Mangoes",    bg: "#ffd54f", fg: "#222" },
};

const toKey = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const keyToDate = (key) => new Date(`${key}T00:00:00`);

const emptyForm = {
  title: "",
  event_date: "",
  category: "beaches",
  organizer_name: "",
  organizer_contact: "",
  organizer_email: "",
  description: "",
};

const STEPS = [
  { t: "Submit", d: "Fill in the details and add a photo." },
  { t: "Review", d: "Our team checks it, usually within a day." },
  { t: "Live", d: "It appears on the calendar for everyone." },
];

export default function EventsCalendar() {
  const now = new Date();
  const todayKey = toKey(now.getFullYear(), now.getMonth(), now.getDate());

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(todayKey);
  const [activeCat, setActiveCat] = useState(null);
  const [openId, setOpenId] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "ok" | "err", text }

  const calendarRef = useRef(null);
  const panelRef = useRef(null);
  const formRef = useRef(null);
  const fileRef = useRef(null);
  const userPicked = useRef(false);

  // Load events for the visible month
  useEffect(() => {
    let cancelled = false;
    fetch(`${API}?year=${year}&month=${month + 1}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => !cancelled && setEvents(Array.isArray(data) ? data : []))
      .catch(() => !cancelled && setEvents([]));
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  // New month: select today (if this month) or the 1st
  useEffect(() => {
    userPicked.current = false;
    const isCurrent = year === now.getFullYear() && month === now.getMonth();
    setSelected(isCurrent ? todayKey : toKey(year, month, 1));
    setOpenId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  // Free the preview object URL when it changes
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const shown = useMemo(
    () => (activeCat ? events.filter((e) => e.category === activeCat) : events),
    [events, activeCat]
  );

  const eventsByDate = useMemo(() => {
    const map = {};
    shown.forEach((e) => {
      const key = String(e.event_date).slice(0, 10);
      (map[key] = map[key] || []).push(e);
    });
    return map;
  }, [shown]);

  // If the auto-selected day is empty, jump to the next day that has events
  useEffect(() => {
    if (userPicked.current) return;
    const keys = Object.keys(eventsByDate).sort();
    if (!keys.length || eventsByDate[selected]) return;
    const isCurrent = year === now.getFullYear() && month === now.getMonth();
    setSelected((isCurrent && keys.find((k) => k >= todayKey)) || keys[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventsByDate]);

  const counts = useMemo(() => {
    const c = {};
    events.forEach((e) => (c[e.category] = (c[e.category] || 0) + 1));
    return c;
  }, [events]);

  // Grid cells (leading/trailing days from neighbouring months)
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const total = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      const day = i - firstDay + 1;
      if (day < 1) return { day: prevDays + day, muted: true };
      if (day > daysInMonth) return { day: day - daysInMonth, muted: true };
      return { day, muted: false };
    });
  }, [year, month]);

  const shiftMonth = (delta) => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const goToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    userPicked.current = true;
    setSelected(todayKey);
  };

  const pickDay = (key) => {
    userPicked.current = true;
    setSelected(key);
    setOpenId(null);
    // On small screens the panel sits below the grid, so bring it into view
    if (window.innerWidth < 1024) {
      setTimeout(
        () => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        60
      );
    }
  };

  const scrollTo = (ref) =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const addOnSelectedDay = () => {
    setForm((f) => ({ ...f, event_date: selected }));
    scrollTo(formRef);
  };

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNotice({ type: "err", text: "Please choose an image file." });
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setNotice({ type: "err", text: `Photo must be smaller than ${MAX_PHOTO_MB} MB.` });
      e.target.value = "";
      return;
    }
    setNotice(null);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const uploadPhoto = async (file) => {
    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch(`${API_BASE_URL}/api/upload-photo`, {
      method: "POST",
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) throw new Error(data.error || "Photo upload failed");
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);
    try {
      const photo_url = photoFile ? await uploadPhoto(photoFile) : null;

      const res = await fetch(`${API}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photo_url }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Could not submit event");
      }
      setForm(emptyForm);
      clearPhoto();
      setNotice({
        type: "ok",
        text: "Thank you! Your event was submitted and will appear after review.",
      });
    } catch (err) {
      setNotice({ type: "err", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEvents = eventsByDate[selected] || [];
  const selDate = keyToDate(selected);

  return (
    <div className="w-full overflow-hidden rounded-[28px] bg-white shadow-[0_40px_80px_-40px_rgba(11,49,73,0.4)] ring-1 ring-slate-200">
      {/* ================= Header ================= */}
      <header
        ref={calendarRef}
        className="relative overflow-hidden px-5 py-6 sm:px-8"
        style={{ background: "linear-gradient(135deg, #0b3149 0%, #0d4150 55%, #0f766e 100%)" }}
      >
        <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/10" />
        <span aria-hidden="true" className="pointer-events-none absolute right-24 -bottom-24 h-52 w-52 rounded-full bg-[#FBBF24]/10 blur-2xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FBBF24]">
              Ratnagiri Tourism Calendar
            </p>
            <h2 className="mt-1 text-3xl font-bold leading-none text-white sm:text-4xl">
              {MONTHS[month]} <span className="font-light text-white/60">{year}</span>
            </h2>
            <p className="mt-2 text-sm text-white/70">
              {events.length === 0
                ? "No events listed this month yet"
                : `${events.length} event${events.length > 1 ? "s" : ""} this month`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
            >
              <ChevronLeft size={18} />
            </button>

            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              aria-label="Month"
              className="rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-[#0b3149] focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              aria-label="Year"
              className="rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-[#0b3149] focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
            >
              {[0, 1, 2].map((o) => {
                const y = now.getFullYear() + o;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>

            <button
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
            >
              <ChevronRight size={18} />
            </button>

            <button
              onClick={goToday}
              className="rounded-full bg-[#FBBF24] px-4 py-2.5 text-sm font-bold text-[#0b3149] shadow transition hover:-translate-y-0.5"
            >
              Today
            </button>

            <button
              onClick={() => scrollTo(formRef)}
              className="flex items-center gap-1.5 rounded-full bg-[#B4532A] px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-[#9c4522]"
            >
              <PlusCircle size={16} /> Contribute
            </button>
          </div>
        </div>
      </header>

      {/* ================= Filters ================= */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-white px-5 py-3.5 sm:px-8">
        <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-400">Filter</span>
        <button
          onClick={() => setActiveCat(null)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
            activeCat === null
              ? "bg-[#0b3149] text-white shadow"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All · {events.length}
        </button>
        {Object.entries(CATEGORIES).map(([k, c]) => {
          const on = activeCat === k;
          return (
            <button
              key={k}
              onClick={() => setActiveCat(on ? null : k)}
              aria-pressed={on}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                on ? "text-[#0b3149] shadow ring-2" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              style={on ? { background: `${c.bg}55`, "--tw-ring-color": c.bg } : undefined}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.bg }} />
              {c.label}
              <span className="font-semibold opacity-60">{counts[k] || 0}</span>
            </button>
          );
        })}
      </div>

      {/* ================= Grid + day panel ================= */}
      <div className="grid gap-6 bg-[#F7FAFB] p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* ---- month grid ---- */}
        <div>
          <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 md:text-xs">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 md:gap-2">
            {cells.map((c, i) => {
              if (c.muted) {
                return (
                  <div key={i} className="min-h-[58px] rounded-xl p-2 text-xs font-semibold text-slate-300 md:min-h-[108px]">
                    {c.day}
                  </div>
                );
              }

              const key = toKey(year, month, c.day);
              const dayEvents = eventsByDate[key] || [];
              const isToday = key === todayKey;
              const isSel = key === selected;
              const has = dayEvents.length > 0;

              return (
                <button
                  key={i}
                  onClick={() => pickDay(key)}
                  aria-pressed={isSel}
                  aria-label={`${c.day} ${MONTHS[month]}, ${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"}`}
                  className={`group relative flex min-h-[58px] flex-col items-stretch rounded-xl p-1.5 text-left transition duration-200 md:min-h-[108px] md:p-2 ${
                    isSel
                      ? "bg-gradient-to-br from-[#0b3149] to-[#0f766e] text-white shadow-lg shadow-[#0b3149]/25"
                      : has
                      ? "bg-white shadow-sm ring-1 ring-teal-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-teal-400"
                      : "bg-white/70 ring-1 ring-slate-200/70 hover:bg-white hover:ring-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold md:h-7 md:w-7 md:text-sm ${
                        isToday
                          ? "bg-[#B4532A] text-white"
                          : isSel
                          ? "text-white"
                          : "text-slate-700"
                      }`}
                    >
                      {c.day}
                    </span>
                    {has && (
                      <span
                        className={`rounded-full px-1.5 text-[10px] font-bold leading-4 md:px-2 md:text-[11px] ${
                          isSel ? "bg-[#FBBF24] text-[#0b3149]" : "bg-teal-50 text-teal-700"
                        }`}
                      >
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* mobile: coloured dots */}
                  {has && (
                    <div className="mt-auto flex flex-wrap gap-1 pt-1 md:hidden">
                      {dayEvents.slice(0, 4).map((ev) => (
                        <span
                          key={ev.id}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: (CATEGORIES[ev.category] || CATEGORIES.beaches).bg }}
                        />
                      ))}
                    </div>
                  )}

                  {/* desktop: compact title chips */}
                  {has && (
                    <div className="mt-1.5 hidden flex-1 flex-col gap-1 md:flex">
                      {dayEvents.slice(0, 2).map((ev) => {
                        const cat = CATEGORIES[ev.category] || CATEGORIES.beaches;
                        return (
                          <span
                            key={ev.id}
                            className={`flex items-center gap-1.5 truncate rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold leading-tight ${
                              isSel ? "bg-white/15 text-white" : "text-[#0b3149]"
                            }`}
                            style={isSel ? undefined : { background: `${cat.bg}33` }}
                          >
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: cat.bg }} />
                            <span className="truncate">{ev.title}</span>
                          </span>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <span className={`px-1 text-[10.5px] font-bold ${isSel ? "text-[#FBBF24]" : "text-[#B4532A]"}`}>
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---- selected day panel (scrolls on its own) ---- */}
        <aside
          ref={panelRef}
          className="flex max-h-[640px] scroll-mt-24 flex-col overflow-hidden rounded-3xl bg-white shadow-[0_24px_50px_-30px_rgba(11,49,73,0.5)] ring-1 ring-slate-200 lg:sticky lg:top-24 lg:max-h-[760px]"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0b3149] to-[#0d4150] px-6 py-5 text-white">
            <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border border-white/10" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-white text-[#0b3149] shadow-lg">
                <span className="text-2xl font-extrabold leading-none">{selDate.getDate()}</span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#B4532A]">
                  {selDate.toLocaleDateString("en-IN", { month: "short" })}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold leading-tight">
                  {selDate.toLocaleDateString("en-IN", { weekday: "long" })}
                  {selected === todayKey && (
                    <span className="ml-2 rounded-full bg-[#FBBF24] px-2 py-0.5 align-middle text-[10px] font-bold uppercase text-[#0b3149]">
                      Today
                    </span>
                  )}
                </p>
                <p className="text-sm text-white/70">
                  {selDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                  {" · "}
                  {selectedEvents.length === 0
                    ? "no events"
                    : `${selectedEvents.length} event${selectedEvents.length > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
          </div>

          <div key={selected} className="cal-scroll flex-1 space-y-3 overflow-y-auto p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {selectedEvents.length === 0 && (
              <div className="flex flex-col items-center px-4 py-10 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F8F9] text-[#B4532A] ring-1 ring-slate-200">
                  <CalendarDays size={24} />
                </span>
                <p className="mt-4 font-bold text-[#0b3149]">Nothing planned for this day</p>
                <p className="mt-1 text-sm text-slate-500">
                  Know of a festival, trek or fair? Add it for everyone to see.
                </p>
                <button
                  onClick={addOnSelectedDay}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#B4532A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#9c4522]"
                >
                  <PlusCircle size={16} /> Add an event on this day
                </button>
              </div>
            )}

            {selectedEvents.map((ev) => {
              const cat = CATEGORIES[ev.category] || CATEGORIES.beaches;
              const long = (ev.description || "").length > 110;
              const open = openId === ev.id;
              return (
                <article
                  key={ev.id}
                  className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition hover:shadow-md"
                >
                  {ev.photo_url ? (
                    <img
                      src={ev.photo_url}
                      alt={ev.title}
                      loading="lazy"
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="h-1.5 w-full" style={{ background: cat.bg }} />
                  )}
                  <div className="p-4">
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                      style={{ background: cat.bg, color: cat.fg }}
                    >
                      {cat.label}
                    </span>
                    <h3 className="mt-2 text-base font-bold leading-snug text-[#0b3149]">{ev.title}</h3>
                    {ev.organizer_name && (
                      <p className="mt-0.5 text-xs font-medium text-teal-700">by {ev.organizer_name}</p>
                    )}
                    {ev.description && (
                      <p
                        className={`mt-2 whitespace-pre-line text-[13px] leading-relaxed text-slate-600 ${
                          open ? "" : "line-clamp-3"
                        }`}
                      >
                        {ev.description}
                      </p>
                    )}
                    {long && (
                      <button
                        onClick={() => setOpenId(open ? null : ev.id)}
                        className="mt-1.5 text-xs font-bold text-[#B4532A] hover:underline"
                      >
                        {open ? "Show less" : "Read more"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {selectedEvents.length > 1 && (
            <p className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-center text-[11px] font-medium text-slate-400">
              Scroll to see all {selectedEvents.length} events
            </p>
          )}
        </aside>
      </div>

      {/* ================= Contribute ================= */}
      <section
        ref={formRef}
        id="contribute"
        className="scroll-mt-24 border-t border-slate-200 bg-[#F4F8F9] p-4 sm:p-8"
      >
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* info panel */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b3149] via-[#0d4150] to-[#0f766e] p-7 text-white">
            <span aria-hidden="true" className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full border border-white/10" />
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-[#FBBF24]/10 blur-2xl" />
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FBBF24]">Community</p>
              <h2 className="mt-2 text-2xl font-bold leading-tight">Contribute a tourism event</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                Submit your festival, tour or cultural gathering to feature on the Ratnagiri
                Tourism schedule.
              </p>

              <ol className="mt-7 space-y-5">
                {STEPS.map((s, i) => (
                  <li key={s.t} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FBBF24] text-sm font-extrabold text-[#0b3149]">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold">{s.t}</p>
                      <p className="text-xs leading-relaxed text-white/70">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Event / Spot Name *">
                <input
                  required
                  maxLength={200}
                  value={form.title}
                  onChange={update("title")}
                  placeholder="e.g., Alphonso Harvest Walk"
                  className="input"
                />
              </Field>
              <Field label="Event Date *">
                <input
                  required
                  type="date"
                  value={form.event_date}
                  onChange={update("event_date")}
                  className="input"
                />
              </Field>
              <Field label="Category *">
                <select required value={form.category} onChange={update("category")} className="input">
                  {Object.entries(CATEGORIES).map(([k, c]) => (
                    <option key={k} value={k}>{c.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Organizer / Department Name *">
                <input
                  required
                  maxLength={150}
                  value={form.organizer_name}
                  onChange={update("organizer_name")}
                  placeholder="e.g., Konkan Eco Tours"
                  className="input"
                />
              </Field>
              <Field label="Organizer Contact / Phone *">
                <input
                  required
                  type="tel"
                  maxLength={20}
                  value={form.organizer_contact}
                  onChange={update("organizer_contact")}
                  placeholder="+91 98765 43210"
                  className="input"
                />
              </Field>
              <Field label="Organizer Email">
                <input
                  type="email"
                  maxLength={150}
                  value={form.organizer_email}
                  onChange={update("organizer_email")}
                  placeholder="info@konkantours.com"
                  className="input"
                />
              </Field>
            </div>

            <Field label="Event Details & Location">
              <textarea
                rows={3}
                value={form.description}
                onChange={update("description")}
                placeholder="Timings, assembly spot, tickets / free entry details..."
                className="input resize-y"
              />
            </Field>

            {/* Photo upload */}
            <div className="mt-4">
              <p className="mb-1.5 text-[13px] font-semibold text-slate-700">
                Event Photo (shown on the calendar)
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
              />
              {photoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={photoPreview}
                    alt="Selected event"
                    className="h-32 w-48 rounded-xl border border-slate-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    aria-label="Remove photo"
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-[#F7FAFB] px-5 py-4 text-sm font-semibold text-slate-600 transition hover:border-teal-600 hover:bg-white"
                >
                  <ImagePlus size={18} /> Choose a photo (max {MAX_PHOTO_MB} MB)
                </button>
              )}
            </div>

            {notice && (
              <p
                className={`mt-4 text-sm font-medium ${
                  notice.type === "ok" ? "text-teal-700" : "text-red-600"
                }`}
              >
                {notice.text}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-[#B4532A] px-7 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#9c4522] disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit & Add to Calendar"}
              </button>
              <button
                type="button"
                onClick={() => scrollTo(calendarRef)}
                className="flex items-center gap-1.5 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0b3149] ring-1 ring-slate-200 transition hover:bg-slate-100"
              >
                <ArrowUp size={15} /> View Calendar
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Shared styles */}
      <style>{`
        .input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          font-size: 14px;
          background: #fff;
          transition: border-color .2s, box-shadow .2s;
        }
        .input:focus { outline: none; border-color: #0f766e; box-shadow: 0 0 0 3px rgba(15,118,110,.15); }
        .cal-scroll { scrollbar-width: thin; scrollbar-color: #B4532A transparent; }
        .cal-scroll::-webkit-scrollbar { width: 7px; }
        .cal-scroll::-webkit-scrollbar-track { background: transparent; }
        .cal-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        .cal-scroll::-webkit-scrollbar-thumb:hover { background: #B4532A; }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-slate-700">
      {label}
      {children}
    </label>
  );
}