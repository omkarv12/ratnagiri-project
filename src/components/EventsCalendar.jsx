import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, PlusCircle, ArrowUp } from "lucide-react";
import API_BASE_URL from "../config";

/* ------------------------------------------------------------------
   Ratnagiri Tourism Calendar — full month grid + contribute form.

   GET  {api}?year=YYYY&month=M      -> [{ id, title, event_date, category, organizer_name, description }]
   POST {api}/contribute             -> creates a pending event (admin approves)
------------------------------------------------------------------ */

const API = `${API_BASE_URL}/api/events`;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const CATEGORIES = {
  beaches:    { label: "Beaches",    bg: "#f7a072", fg: "#222" },
  forts:      { label: "Forts",      bg: "#64b5f6", fg: "#fff" },
  temples:    { label: "Temples",    bg: "#ba68c8", fg: "#fff" },
  waterfalls: { label: "Waterfalls", bg: "#4dd0e1", fg: "#222" },
  mangoes:    { label: "Mangoes",    bg: "#ffd54f", fg: "#222" },
};

const toKey = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const emptyForm = {
  title: "",
  event_date: "",
  category: "beaches",
  organizer_name: "",
  organizer_contact: "",
  organizer_email: "",
  description: "",
};

export default function EventsCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "ok" | "err", text }
  const calendarRef = useRef(null);
  const formRef = useRef(null);

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

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      const key = String(e.event_date).slice(0, 10);
      (map[key] = map[key] || []).push(e);
    });
    return map;
  }, [events]);

  // Build grid cells (leading/trailing days from neighbouring months)
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

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch(`${API}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Could not submit event");
      }
      setForm(emptyForm);
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

  const scrollTo = (ref) =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const todayKey = toKey(now.getFullYear(), now.getMonth(), now.getDate());

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-white">
      {/* ---------- Header ---------- */}
      <header
        ref={calendarRef}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-5"
        style={{
          background:
            "linear-gradient(135deg, #a3c9c7 0%, #76abae 60%, #173b45 100%)",
        }}
      >
        <h1 className="text-xl md:text-2xl font-extrabold uppercase tracking-widest text-[#173b45]">
          Ratnagiri Tourism Calendar 🌴⭐
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center"
          >
            <ChevronLeft size={18} />
          </button>

          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg bg-white px-3 py-2 text-sm font-semibold"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg bg-white px-3 py-2 text-sm font-semibold"
          >
            {[0, 1, 2].map((o) => {
              const y = now.getFullYear() + o;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>

          <button
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center"
          >
            <ChevronRight size={18} />
          </button>

          <span className="rounded-md bg-[#fed166] px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-[#2b2d42] shadow">
            {MONTHS[month]} {year}
          </span>

          <button
            onClick={() => scrollTo(formRef)}
            className="flex items-center gap-1.5 rounded-lg bg-[#173b45] hover:bg-[#0f272e] text-white px-4 py-2 text-sm font-semibold transition"
          >
            <PlusCircle size={16} /> Contribute Event
          </button>
        </div>
      </header>

      {/* ---------- Weekday labels ---------- */}
      <div className="grid grid-cols-7 bg-[#c5dedc] border-b-2 border-[#b2d2d0] py-2 text-center text-[11px] md:text-[13px] font-bold tracking-wider text-[#1b4965]">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* ---------- Grid ---------- */}
      <div className="grid grid-cols-7 bg-[#fdfaf4] border-2 border-slate-200">
        {cells.map((c, i) => {
          const key = c.muted ? null : toKey(year, month, c.day);
          const dayEvents = key ? eventsByDate[key] || [] : [];
          const isToday = key === todayKey;
          return (
            <div
              key={i}
              className={`min-h-[75px] md:min-h-[110px] p-1.5 border-r border-b border-slate-100 flex flex-col ${
                c.muted ? "bg-[#f8f6f0] text-slate-300" : "bg-white"
              }`}
            >
              <span
                className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? "bg-[#173b45] text-white" : "text-slate-500"
                }`}
              >
                {String(c.day).padStart(2, "0")}
              </span>

              {dayEvents.map((ev) => {
                const cat = CATEGORIES[ev.category] || CATEGORIES.beaches;
                return (
                  <div
                    key={ev.id}
                    title={`${ev.title}${
                      ev.organizer_name ? ` — ${ev.organizer_name}` : ""
                    }${ev.description ? `\n${ev.description}` : ""}`}
                    className="mb-1 rounded-full px-2 py-0.5 text-[10px] md:text-[11px] font-semibold leading-tight shadow-sm truncate cursor-default"
                    style={{ background: cat.bg, color: cat.fg }}
                  >
                    {ev.title}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ---------- Legend ---------- */}
      <footer className="flex flex-wrap justify-center gap-3 bg-[#f6eedb] border-t-2 border-[#ebd9b8] px-5 py-3.5">
        {Object.entries(CATEGORIES).map(([k, c]) => (
          <span
            key={k}
            className="rounded-full px-3.5 py-1 text-xs font-bold"
            style={{ background: c.bg, color: c.fg }}
          >
            {c.label}
          </span>
        ))}
      </footer>

      {/* ---------- Contribute form ---------- */}
      <section ref={formRef} className="p-6 md:p-8 border-t border-slate-200">
        <h2 className="text-xl font-bold text-[#173b45] mb-1">
          Contribute Tourism Event
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Submit your festival, tour, or cultural gathering to feature on the
          Ratnagiri Tourism schedule.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-4">
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
              <select
                required
                value={form.category}
                onChange={update("category")}
                className="input"
              >
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

          {notice && (
            <p
              className={`mt-4 text-sm font-medium ${
                notice.type === "ok" ? "text-teal-700" : "text-red-600"
              }`}
            >
              {notice.text}
            </p>
          )}

          <div className="flex items-center gap-3 mt-5">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-[#173b45] hover:bg-[#0d252c] disabled:opacity-60 text-white px-7 py-3 text-sm font-bold transition"
            >
              {submitting ? "Submitting..." : "Submit & Add to Calendar"}
            </button>
            <button
              type="button"
              onClick={() => scrollTo(calendarRef)}
              className="flex items-center gap-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[#173b45] px-5 py-3 text-sm font-semibold transition"
            >
              <ArrowUp size={15} /> View Calendar
            </button>
          </div>
        </form>
      </section>

      {/* Shared input style (Tailwind @apply-free) */}
      <style>{`
        .input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 14px;
          background: #fff;
        }
        .input:focus { outline: 2px solid #76abae; border-color: #76abae; }
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