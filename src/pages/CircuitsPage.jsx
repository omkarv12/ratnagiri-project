// src/pages/CircuitsPage.jsx
// Serves both /experiences/circuits (list) and /experiences/circuits/:slug (detail).
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  ExternalLink,
  MapPin,
  Route as RouteIcon,
} from "lucide-react";
import API_BASE_URL from "../config";

async function getJson(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("The server sent an unexpected reply. Please try again later.");
  }
  if (!res.ok || data?.success === false) throw new Error(data?.error || "Could not load circuits.");
  return data;
}

const kmText = (km) => (km ? `${Number(km)} km` : null);
const daysText = (n) => `${n} ${n === 1 ? "day" : "days"}`;

function Message({ children, tone = "gray" }) {
  return (
    <p className={`py-16 text-center ${tone === "red" ? "text-red-600" : "text-gray-500"}`}>{children}</p>
  );
}

/* ------------------------------- list ------------------------------- */

function CircuitCard({ c }) {
  return (
    <Link
      to={`/experiences/circuits/${c.slug}`}
      className="group block overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
    >
      <div className="aspect-[16/9] bg-teal-900 overflow-hidden">
        {c.hero_image ? (
          <img
            src={c.hero_image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-teal-300">
            <RouteIcon size={40} />
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="text-sm font-medium text-orange-700">{c.theme}</p>
        <h2 className="mt-1 text-xl font-semibold text-gray-900">{c.title}</h2>
        {c.tagline && <p className="mt-1 text-sm text-gray-600">{c.tagline}</p>}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-700">
          <span className="inline-flex items-center gap-1.5"><MapPin size={15} />{c.stop_count} {c.stop_count === 1 ? "stop" : "stops"}</span>
          {kmText(c.total_distance_km) && <span className="inline-flex items-center gap-1.5"><RouteIcon size={15} />{kmText(c.total_distance_km)}</span>}
          <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} />{daysText(c.duration_days)}</span>
        </div>
      </div>
    </Link>
  );
}

function CircuitList() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("All");

  useEffect(() => {
    getJson("/api/circuits").then(setItems).catch((e) => setError(e.message));
  }, []);

  const themes = useMemo(() => ["All", ...new Set((items || []).map((c) => c.theme))], [items]);
  const shown = (items || []).filter((c) => theme === "All" || c.theme === theme);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Tourism circuits</h1>
      <p className="mt-2 max-w-2xl text-gray-600">
        A circuit links several places into one route, with the distance between each stop. Pick one
        and follow it in order.
      </p>

      {themes.length > 2 && (
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by theme">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              aria-pressed={theme === t}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                theme === t ? "bg-teal-900 text-white" : "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {error ? (
        <Message tone="red">{error}</Message>
      ) : !items ? (
        <Message>Loading circuits...</Message>
      ) : shown.length === 0 ? (
        <Message>No circuits to show yet. Check back soon.</Message>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c) => <CircuitCard key={c.slug} c={c} />)}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ detail ------------------------------ */

function Fact({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon size={20} className="mt-0.5 shrink-0 text-teal-700" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function Stop({ s, index }) {
  const image = s.image_url || s.linked?.image;
  const hasPin = s.linked?.lat != null && s.linked?.lng != null;

  return (
    <li className="relative pl-10 pb-10 last:pb-0">
      <span className="absolute -left-[17px] top-0 grid h-8 w-8 place-items-center rounded-full bg-teal-900 text-sm font-semibold text-white ring-4 ring-white">
        {index + 1}
      </span>

      {index > 0 && s.distance_km > 0 && (
        <p className="mb-1 text-sm font-medium text-orange-700">{Number(s.distance_km)} km from the previous stop</p>
      )}
      <h3 className="text-lg font-semibold text-gray-900">{s.name}</h3>
      {s.linked?.area && <p className="text-sm text-gray-500">{s.linked.area}</p>}

      <div className="mt-3 flex flex-col gap-4 sm:flex-row">
        {image && (
          <img src={image} alt="" loading="lazy" className="h-40 w-full rounded-lg object-cover sm:w-56 shrink-0" />
        )}
        <div className="min-w-0">
          {s.description && <p className="max-w-prose text-gray-700">{s.description}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-600">
            {s.time_needed && (
              <span className="inline-flex items-center gap-1.5"><Clock size={15} />{s.time_needed}</span>
            )}
            {hasPin && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${s.linked.lat},${s.linked.lng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-teal-700 hover:underline"
              >
                <MapPin size={15} />Open in Maps
              </a>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function CircuitDetail({ slug }) {
  const [circuit, setCircuit] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setCircuit(null);
    setError("");
    getJson(`/api/circuits/${encodeURIComponent(slug)}`)
      .then((d) => setCircuit(d.circuit))
      .catch((e) => setError(e.message));
  }, [slug]);

  const back = (
    <Link to="/experiences/circuits" className="inline-flex items-center gap-1.5 text-sm text-teal-700 hover:underline">
      <ArrowLeft size={16} />All circuits
    </Link>
  );

  if (error) return <div className="mx-auto max-w-4xl px-4 py-10">{back}<Message tone="red">{error}</Message></div>;
  if (!circuit) return <div className="mx-auto max-w-4xl px-4 py-10"><Message>Loading circuit...</Message></div>;

  const c = circuit;
  const route = [c.start_point, c.end_point].filter(Boolean).join(" to ");

  return (
    <article>
      <header className="relative bg-teal-900 text-white">
        {c.hero_image && (
          <img src={c.hero_image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        )}
        <div className="relative mx-auto flex min-h-[300px] max-w-4xl flex-col justify-end px-4 pb-8 pt-10">
          <Link to="/experiences/circuits" className="mb-auto inline-flex items-center gap-1.5 text-sm text-teal-100 hover:underline">
            <ArrowLeft size={16} />All circuits
          </Link>
          <p className="text-sm font-medium text-orange-300">{c.theme}</p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{c.title}</h1>
          {c.tagline && <p className="mt-2 max-w-2xl text-teal-50">{c.tagline}</p>}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="grid grid-cols-2 gap-6 rounded-xl bg-gray-50 p-5 ring-1 ring-gray-200 sm:grid-cols-4">
          <Fact icon={RouteIcon} label="Total distance" value={kmText(c.total_distance_km)} />
          <Fact icon={CalendarDays} label="Duration" value={daysText(c.duration_days)} />
          <Fact icon={Clock} label="Best season" value={c.best_season} />
          <Fact icon={MapPin} label="Route" value={route} />
        </div>

        {c.summary && <p className="mt-8 max-w-prose text-lg leading-relaxed text-gray-700">{c.summary}</p>}

        {c.highlights?.length > 0 && (
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {c.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <Check size={18} className="mt-0.5 shrink-0 text-teal-700" />{h}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-gray-900">The route</h2>
          {c.map_url && (
            <a
              href={c.map_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              <ExternalLink size={16} />Open full route in Google Maps
            </a>
          )}
        </div>

        <ol className="mt-8 ml-4 border-l-2 border-orange-500">
          {c.stops.map((s, i) => <Stop key={i} s={s} index={i} />)}
        </ol>

        {c.tips?.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900">Travel tips</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
              {c.tips.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </section>
        )}

        {c.how_to_reach && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900">How to reach</h2>
            <p className="mt-4 max-w-prose whitespace-pre-line text-gray-700">{c.how_to_reach}</p>
          </section>
        )}

        <div className="mt-12">{back}</div>
      </div>
    </article>
  );
}

export default function CircuitsPage() {
  const { slug } = useParams();
  return slug ? <CircuitDetail slug={slug} /> : <CircuitList />;
}
