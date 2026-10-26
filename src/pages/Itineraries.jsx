import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Wallet, Sun } from "lucide-react";
import API_BASE_URL from "../config";

const DURATIONS = [
  { key: "all", label: "Any length", test: () => true },
  { key: "1", label: "1 day", test: (d) => d === 1 },
  { key: "2", label: "2 days", test: (d) => d === 2 },
  { key: "3", label: "3+ days", test: (d) => d >= 3 },
];

export default function Itineraries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("All");
  const [duration, setDuration] = useState("all");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/itineraries`)
      .then((r) => r.json())
      .then((d) => {
        if (!Array.isArray(d)) throw new Error(d.error || "Could not load itineraries.");
        setItems(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const themes = useMemo(
    () => ["All", ...Array.from(new Set(items.map((i) => i.theme))).sort()],
    [items]
  );

  const durationTest = DURATIONS.find((d) => d.key === duration).test;
  const shown = items.filter(
    (i) => (theme === "All" || i.theme === theme) && durationTest(i.duration_days)
  );

  const chip = (active) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold transition ${
      active ? "bg-teal-700 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-teal-50"
    }`;

  return (
    <div>
      <section className="bg-gradient-to-br from-[#B4532A] to-[#7b1e2b] px-4 py-12 text-center text-white sm:px-6">
        <h1 className="rt-display text-3xl font-bold sm:text-4xl">Itineraries</h1>
        <p className="mx-auto mt-3 max-w-2xl text-orange-50">
          Ready-made plans for exploring Ratnagiri, day by day.
        </p>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {themes.map((t) => (
            <button key={t} onClick={() => setTheme(t)} className={chip(theme === t)}>
              {t}
            </button>
          ))}
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          {DURATIONS.map((d) => (
            <button key={d.key} onClick={() => setDuration(d.key)} className={chip(duration === d.key)}>
              {d.label}
            </button>
          ))}
        </div>

        {loading && <p className="text-slate-500">Loading itineraries...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && shown.length === 0 && (
          <p className="text-slate-500">
            {items.length === 0 ? "No itineraries have been published yet." : "No itineraries match these filters."}
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((it) => (
            <Link
              key={it.slug}
              to={`/experiences/itineraries/${it.slug}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-44 bg-gradient-to-br from-[#B4532A] to-[#0b3149]">
                {it.hero_image && (
                  <img
                    src={it.hero_image}
                    alt={it.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {it.theme}
                </span>
                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#0b3149]/90 px-2.5 py-1 text-xs font-semibold text-white">
                  <CalendarDays size={12} /> {it.duration_days} {it.duration_days === 1 ? "day" : "days"}
                </span>
              </div>
              <div className="p-4">
                <h2 className="rt-display text-xl font-bold text-slate-900">{it.title}</h2>
                {it.tagline && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{it.tagline}</p>}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-[#B4532A]" /> {it.stop_count} stops
                  </span>
                  {it.best_season && (
                    <span className="flex items-center gap-1">
                      <Sun size={13} className="text-amber-600" /> {it.best_season}
                    </span>
                  )}
                  {it.budget_note && (
                    <span className="flex items-center gap-1">
                      <Wallet size={13} className="text-teal-700" /> {it.budget_note}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
