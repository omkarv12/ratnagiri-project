import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, PlusCircle, Eye } from "lucide-react";

/* ------------------------------------------------------------------
   Pictorial calendar panel — drop-in replacement for the "Upcoming
   Events" list in the Experiences section.

   Props
     events   [{ date: "YYYY-MM-DD", title, description?, route? }]
     image    banner photo behind the month name (e.g. Slider1)
     onView        () => void   — "View" button
     onContribute  () => void   — "Contribute" button
     onEventClick  (route) => void  — optional, click an event line
------------------------------------------------------------------ */

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const toKey = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export default function CalendarPanel({
  events = [],
  image,
  onView,
  onContribute,
  onEventClick,
}) {
  const today = new Date();
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  const [cursor, setCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [selected, setSelected] = useState(todayKey);

  const { year, month } = cursor;
  const monthName = new Date(year, month, 1).toLocaleDateString("en-IN", {
    month: "long",
  });
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Always render 6 weeks so the panel height never jumps between months.
  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstWeekday + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  const eventsByDate = events.reduce((acc, e) => {
    (acc[e.date] = acc[e.date] || []).push(e);
    return acc;
  }, {});

  const shiftMonth = (delta) =>
    setCursor(({ year: y, month: m }) => {
      const d = new Date(y, m + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const selectedEvents = eventsByDate[selected] || [];

  return (
    <div className="rt-card tint-amber rounded-xl overflow-hidden h-96 flex flex-col bg-white">
      {/* Pictorial month banner */}
      <div className="relative h-[72px] shrink-0 text-white">
        {image && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#B4532A]/90 via-[#B4532A]/70 to-[#0b3149]/70" />
        <div className="relative h-full flex items-center justify-between px-3">
          <button
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-center leading-tight">
            <p className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FBBF24]">
              <CalendarDays size={12} /> Events Calendar
            </p>
            <p className="font-display text-xl font-bold">
              {monthName} <span className="text-white/80 font-semibold">{year}</span>
            </p>
          </div>
          <button
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Month grid */}
      <div className="px-3 pt-2 shrink-0">
        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-1">
          {WEEKDAYS.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5 text-center">
          {cells.map((day, i) => {
            if (!day) return <span key={i} className="h-7" />;
            const key = toKey(year, month, day);
            const hasEvent = !!eventsByDate[key];
            const isToday = key === todayKey;
            const isSelected = key === selected;
            return (
              <button
                key={i}
                onClick={() => setSelected(key)}
                aria-label={`${day} ${monthName}${hasEvent ? ", has events" : ""}`}
                className={`relative h-7 mx-auto w-7 rounded-full text-xs font-medium transition ${
                  isSelected
                    ? "bg-[#B4532A] text-white"
                    : isToday
                    ? "ring-2 ring-teal-600 text-teal-700 font-bold"
                    : "text-slate-700 hover:bg-amber-50"
                }`}
              >
                {day}
                {hasEvent && (
                  <span
                    className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${
                      isSelected ? "bg-[#FBBF24]" : "bg-[#B4532A]"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day's events */}
      <div className="rt-feed flex-1 min-h-0 overflow-y-auto px-3 py-2">
        {selectedEvents.length === 0 ? (
          <p className="text-[11px] text-slate-400 text-center pt-1">
            No events on this day.
          </p>
        ) : (
          selectedEvents.map((e) => (
            <button
              key={e.title}
              onClick={() => e.route && onEventClick?.(e.route)}
              className="w-full text-left rounded-lg bg-amber-50 px-2.5 py-1.5 mb-1 hover:bg-amber-100 transition"
            >
              <p className="text-xs font-semibold text-slate-800 truncate">{e.title}</p>
              {e.description && (
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-1">
                  {e.description}
                </p>
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer buttons */}
      <div className="shrink-0 grid grid-cols-2 gap-2 p-3 border-t border-slate-100">
        <button
          onClick={onContribute}
          className="flex items-center justify-center gap-1.5 rounded-full bg-[#B4532A] hover:bg-[#9c4522] text-white text-xs font-semibold py-2 transition"
        >
          <PlusCircle size={14} /> Contribute
        </button>
        <button
          onClick={onView}
          className="flex items-center justify-center gap-1.5 rounded-full bg-[#0b3149] hover:bg-[#134b78] text-white text-xs font-semibold py-2 transition"
        >
          <Eye size={14} /> View
        </button>
      </div>
    </div>
  );
}