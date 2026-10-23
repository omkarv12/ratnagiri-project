import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, Wallet, CalendarDays, Phone, X, Check, ChevronRight } from "lucide-react";
import { EXPERIENCES, EXPERIENCE_LIST } from "../config/experienceConfig";
import { experiencesApi, toHighlightList } from "../api/experiencesApi";

// Which meta fields to show, in order, with their icon.
const META = [
  { key: "location", icon: MapPin },
  { key: "duration", icon: Clock },
  { key: "price", icon: Wallet },
  { key: "season", icon: CalendarDays },
];

/**
 * One page component for all three experiences.
 * Usage:  <ExperiencePage category="guided-walks" />
 */
export default function ExperiencePage({ category }) {
  const config = EXPERIENCES[category];
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    experiencesApi
      .list(category)
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => {
    setSelected(null);
    window.scrollTo({ top: 0 });
    load();
  }, [load]);

  // Modal: close on Escape, lock page scroll while open
  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [selected]);

  if (!config) {
    return <p className="p-10 text-slate-500">This experience page doesn't exist.</p>;
  }

  return (
    <div className="font-body bg-[#fbf8f3] min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', Georgia, serif; }
        .font-body { font-family: 'Plus Jakarta Sans', 'Noto Sans Devanagari', system-ui, sans-serif; }
        @keyframes xpModalIn { from { opacity: 0; transform: translateY(14px) scale(.98); } to { opacity: 1; transform: none; } }
        .xp-modal { animation: xpModalIn .25s ease-out both; }
        .xp-card { box-shadow: 0 10px 28px -14px rgba(15,23,42,.22); transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease; }
        .xp-card:hover { transform: translateY(-4px); box-shadow: 0 26px 50px -18px rgba(180,83,42,.4); }
        @media (prefers-reduced-motion: reduce) {
          .xp-modal { animation: none; }
          .xp-card, .xp-card:hover { transition: none; transform: none; }
        }
      `}</style>

      {/* ---------- Hero ---------- */}
      <section className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">
        <div className="relative max-w-[1680px] mx-auto rounded-2xl overflow-hidden h-[340px] sm:h-[400px] lg:h-[440px] shadow-[0_35px_70px_-20px_rgba(11,49,73,0.5)] ring-1 ring-black/5">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${config.cover}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/40" />
          <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-[inset_0_0_0_1px_rgba(0,0,0,0.45),inset_0_0_90px_30px_rgba(0,0,0,0.45)]" />

          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-14 lg:px-20">
            <div
              className="relative max-w-xl rounded-2xl ring-1 ring-white/15 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.65)] p-5 pl-6 sm:p-7 sm:pl-9 backdrop-blur-md"
              style={{ background: "linear-gradient(135deg, rgba(11,49,73,.88), rgba(11,49,73,.72))" }}
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-5 bottom-5 w-1 rounded-r-full bg-gradient-to-b from-[#FBBF24] via-[#B4532A] to-teal-500"
              />
              <button
                onClick={() => navigate("/#experiences")}
                className="text-xs font-semibold text-[#FBBF24] hover:text-amber-200 mb-3 inline-flex items-center gap-1 transition-colors"
              >
                Local Experiences <ChevronRight size={12} />
              </button>
              <h1 className="font-display text-white text-3xl sm:text-4xl leading-[1.08] mb-3">
                {config.title}
              </h1>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-md">
                {config.tagline}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Switcher between the three experiences ---------- */}
      <nav
        aria-label="Local experiences"
        className="max-w-[1680px] mx-auto px-5 sm:px-10 lg:px-16 pt-6 flex flex-wrap gap-2"
      >
        {EXPERIENCE_LIST.map((exp) => {
          const active = exp.slug === category;
          return (
            <button
              key={exp.slug}
              onClick={() => navigate(exp.route)}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B4532A] ${
                active
                  ? "bg-[#B4532A] text-white shadow-sm"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#B4532A] hover:text-[#B4532A]"
              }`}
            >
              {exp.title}
            </button>
          );
        })}
      </nav>

      {/* ---------- Intro ---------- */}
      <section className="max-w-[1680px] mx-auto px-5 sm:px-10 lg:px-16 pt-8 pb-2">
        <p className="max-w-2xl text-base text-slate-600 leading-relaxed">{config.intro}</p>
      </section>

      {/* ---------- Items ---------- */}
      <section className="max-w-[1680px] mx-auto px-5 sm:px-10 lg:px-16 py-10 sm:py-12">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl bg-white overflow-hidden animate-pulse shadow-sm">
                <div className="h-52 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-2/3 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-100 rounded" />
                  <div className="h-3 w-4/5 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-red-600 mb-4">Couldn't load {config.nounPlural}: {error}</p>
            <button
              onClick={load}
              className="rounded-full bg-[#B4532A] hover:bg-[#9c4522] text-white text-sm font-semibold px-5 py-2 transition"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <p className="font-display text-xl text-slate-800 mb-2">
              No {config.nounPlural} listed yet
            </p>
            <p className="text-sm text-slate-500">
              We're adding new ones soon. Meanwhile, have a look at the other experiences above.
            </p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                config={config}
                onOpen={() => setSelected(item)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ---------- Plan-your-visit band ---------- */}
      <section className="px-5 sm:px-10 lg:px-16 pb-14">
        <div className="max-w-[1680px] mx-auto rounded-2xl bg-[#0b3149] px-6 sm:px-10 py-8 flex flex-wrap items-center justify-between gap-5">
          <div>
            <h2 className="font-display text-2xl text-white mb-1">Building a trip around this?</h2>
            <p className="text-sm text-slate-300 max-w-md">
              Pair it with a homestay or pick a ready-made itinerary.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => navigate("/homestays")}
              className="rounded-full bg-[#B4532A] hover:bg-[#9c4522] text-white text-sm font-semibold px-5 py-2.5 transition"
            >
              Find a homestay
            </button>
            <button
              onClick={() => navigate("/itineraries")}
              className="rounded-full ring-1 ring-white/40 hover:bg-white/10 text-white text-sm font-semibold px-5 py-2.5 transition"
            >
              See itineraries
            </button>
          </div>
        </div>
      </section>

      {selected && (
        <DetailModal item={selected} config={config} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function MetaRow({ item, config, size = "sm" }) {
  const rows = META.filter((m) => item[m.key]);
  if (!rows.length) return null;
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-1.5 ${size === "sm" ? "text-xs" : "text-sm"} text-slate-500`}>
      {rows.slice(0, size === "sm" ? 2 : 4).map(({ key, icon: Icon }) => (
        <li key={key} className="flex items-center gap-1.5">
          <Icon size={size === "sm" ? 13 : 15} className="text-[#B4532A] shrink-0" />
          <span className="sr-only">{config.labels[key]}: </span>
          {item[key]}
        </li>
      ))}
    </ul>
  );
}

function ItemCard({ item, config, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="xp-card group text-left rounded-xl bg-white overflow-hidden flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B4532A]"
    >
      <div className="relative h-52 bg-slate-100 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${item.image_url || config.cover})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display text-lg text-slate-900 leading-snug mb-1.5">{item.title}</h3>
        {item.summary && (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-3">{item.summary}</p>
        )}
        <div className="mt-auto pt-2 flex items-end justify-between gap-3">
          <MetaRow item={item} config={config} />
          <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-[#B4532A]">
            Details
            <ChevronRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </button>
  );
}

function DetailModal({ item, config, onClose }) {
  const highlights = toHighlightList(item.highlights);
  const metaRows = META.filter((m) => item[m.key]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        className="xp-modal relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 text-white flex items-center justify-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X size={18} />
        </button>

        <div className="relative h-56 sm:h-72 bg-slate-100">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${item.image_url || config.cover})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <h2 className="absolute bottom-4 left-5 right-14 font-display text-2xl sm:text-3xl text-white leading-tight">
            {item.title}
          </h2>
        </div>

        <div className="p-5 sm:p-8">
          {metaRows.length > 0 && (
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 mb-6 border-b border-slate-100">
              {metaRows.map(({ key, icon: Icon }) => (
                <div key={key}>
                  <dt className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Icon size={13} className="text-[#B4532A]" />
                    {config.labels[key]}
                  </dt>
                  <dd className="text-sm font-semibold text-slate-800">{item[key]}</dd>
                </div>
              ))}
            </dl>
          )}

          {(item.description || item.summary) && (
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line max-w-prose">
              {item.description || item.summary}
            </p>
          )}

          {highlights.length > 0 && (
            <div className="mt-6">
              <h3 className="font-display text-lg text-slate-900 mb-3">What to expect</h3>
              <ul className="space-y-2">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                      <Check size={12} />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.contact && (
            <div className="mt-7 flex flex-wrap items-center gap-3 rounded-xl bg-amber-50 p-4">
              <Phone size={16} className="text-[#B4532A] shrink-0" />
              <p className="text-sm text-slate-700">
                To book or ask questions, contact{" "}
                <span className="font-semibold text-slate-900">{item.contact}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
