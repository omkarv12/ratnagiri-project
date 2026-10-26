import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Sun,
  Wallet,
  Users,
  MapPin,
  Home,
  Landmark,
  Utensils,
  Car,
  Sparkles,
  Clock,
  Lightbulb,
  Navigation,
} from "lucide-react";
import API_BASE_URL from "../config";

const STOP_TYPES = {
  visit: { label: "Visit", icon: Landmark, cls: "bg-teal-100 text-teal-800" },
  stay: { label: "Stay", icon: Home, cls: "bg-amber-100 text-amber-800" },
  food: { label: "Food", icon: Utensils, cls: "bg-orange-100 text-orange-800" },
  travel: { label: "Travel", icon: Car, cls: "bg-slate-200 text-slate-700" },
  activity: { label: "Activity", icon: Sparkles, cls: "bg-purple-100 text-purple-800" },
};

function Meta({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
      <Icon size={18} className="shrink-0 text-[#B4532A]" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function Stop({ stop }) {
  const meta = STOP_TYPES[stop.type] || STOP_TYPES.activity;
  const Icon = meta.icon;
  const linked = stop.linked;
  const image = stop.image_url || linked?.image;

  return (
    <li className="relative pb-8 pl-8 last:pb-0">
      <span className="absolute left-0 top-1 grid h-6 w-6 place-items-center rounded-full bg-[#B4532A] text-white ring-4 ring-[#F4F8F9]">
        <Icon size={13} />
      </span>
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.cls}`}>{meta.label}</span>
          {stop.time && (
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
              <Clock size={12} /> {stop.time}
            </span>
          )}
        </div>
        <h4 className="mt-2 text-lg font-bold text-slate-900">{stop.title}</h4>
        {stop.description && <p className="mt-1 text-sm text-slate-600">{stop.description}</p>}

        {image && (
          <img src={image} alt={stop.title} loading="lazy" className="mt-3 h-44 w-full rounded-xl object-cover" />
        )}

        {linked && (
          <Link
            to={`/profile/${linked.kind}/${linked.id}`}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:underline"
          >
            <MapPin size={14} /> {linked.name}
            {linked.area ? ` · ${linked.area}` : ""}
          </Link>
        )}
      </div>
    </li>
  );
}

export default function ItineraryDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${API_BASE_URL}/api/itineraries/${encodeURIComponent(slug)}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok || !d.success) throw new Error(d.error || "Itinerary not found.");
        setData(d.itinerary);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="p-8 text-slate-500">Loading itinerary...</p>;
  if (error || !data) {
    return (
      <div className="p-8">
        <p className="mb-4 text-red-600">{error || "Itinerary not found."}</p>
        <Link to="/experiences/itineraries" className="font-semibold text-teal-700 underline">
          Back to all itineraries
        </Link>
      </div>
    );
  }

  const it = data;
  const days = it.days || [];
  const tips = it.tips || [];
  const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const pills = [
    ...days.map((d, i) => ({ id: `day-${i + 1}`, label: `Day ${i + 1}` })),
    tips.length > 0 && { id: "tips", label: "Tips" },
    it.how_to_reach && { id: "reach", label: "How to reach" },
  ].filter(Boolean);

  return (
    <div>
      <header className="relative h-64 bg-gradient-to-br from-[#B4532A] to-[#0b3149] sm:h-80">
        {it.hero_image && <img src={it.hero_image} alt={it.title} className="h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-6 text-white sm:px-6">
          <Link
            to="/experiences/itineraries"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white"
          >
            <ArrowLeft size={16} /> All itineraries
          </Link>
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-200">{it.theme}</p>
          <h1 className="rt-display text-3xl font-bold sm:text-5xl">{it.title}</h1>
          {it.tagline && <p className="mt-2 max-w-2xl text-lg text-white/95">{it.tagline}</p>}
        </div>
      </header>

      {pills.length > 1 && (
        <nav aria-label="Itinerary sections" className="sticky top-20 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2.5 sm:px-6">
            {pills.map((p) => (
              <button
                key={p.id}
                onClick={() => jump(p.id)}
                className="shrink-0 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700 hover:bg-orange-100 hover:text-[#B4532A]"
              >
                {p.label}
              </button>
            ))}
          </div>
        </nav>
      )}

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Meta icon={CalendarDays} label="Duration" value={`${it.duration_days} ${it.duration_days === 1 ? "day" : "days"}`} />
          <Meta icon={Sun} label="Best season" value={it.best_season} />
          <Meta icon={Wallet} label="Budget" value={it.budget_note} />
          <Meta icon={Users} label="Suited for" value={it.suited_for} />
        </div>

        {(it.start_point || it.end_point) && (
          <p className="mt-4 text-sm text-slate-600">
            <span className="font-semibold text-[#0b3149]">Route:</span> {it.start_point || "Start"}
            {" → "}
            {it.end_point || "End"}
          </p>
        )}

        {it.summary && <p className="mt-6 whitespace-pre-line text-slate-700">{it.summary}</p>}

        {days.map((day, i) => (
          <section key={i} id={`day-${i + 1}`} className="scroll-mt-40 pt-10">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-[#B4532A]">Day {i + 1}</p>
                <h2 className="rt-display text-2xl font-bold text-[#0b3149]">{day.title || `Day ${i + 1}`}</h2>
              </div>
              {day.map_url && (
                <a
                  href={day.map_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  <Navigation size={14} /> Open route in Google Maps
                </a>
              )}
            </div>
            {day.summary && <p className="mb-5 text-slate-700">{day.summary}</p>}

            <ol className="relative border-l-2 border-[#B4532A]/30 ml-3">
              {day.stops.map((stop, j) => (
                <Stop key={j} stop={stop} />
              ))}
            </ol>
          </section>
        ))}

        {tips.length > 0 && (
          <section id="tips" className="scroll-mt-40 pt-10">
            <h2 className="rt-display mb-4 text-2xl font-bold text-[#0b3149]">Travel tips</h2>
            <ul className="space-y-2">
              {tips.map((t, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-amber-50 p-3 text-slate-700 ring-1 ring-amber-100">
                  <Lightbulb size={18} className="mt-0.5 shrink-0 text-amber-600" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {it.how_to_reach && (
          <section id="reach" className="scroll-mt-40 pt-10">
            <h2 className="rt-display mb-4 text-2xl font-bold text-[#0b3149]">How to reach</h2>
            <p className="whitespace-pre-line text-slate-700">{it.how_to_reach}</p>
          </section>
        )}
      </div>
    </div>
  );
}
