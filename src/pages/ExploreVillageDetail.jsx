import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Home, MapPin, Clock, CalendarDays, Bus, Car, Banknote, Phone } from "lucide-react";
import API_BASE_URL from "../config";

// Photo columns can hold one URL or a comma-separated list; use the first https one.
const firstUrl = (value) =>
  String(value || "")
    .split(",")
    .map((s) => s.trim())
    .find((s) => s.startsWith("http")) || "";

const has = (v) => (Array.isArray(v) ? v.length > 0 : Boolean(v && String(v).trim()));

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-40 py-8">
      <h2 className="rt-display mb-5 text-2xl font-bold text-[#0b3149]">{title}</h2>
      {children}
    </section>
  );
}

function ItemGrid({ items }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <article key={it.name} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          {it.image_url && (
            <img src={it.image_url} alt={it.name} loading="lazy" className="h-44 w-full object-cover" />
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-slate-900">{it.name}</h3>
              {it.season && (
                <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  {it.season}
                </span>
              )}
            </div>
            {it.description && <p className="mt-1.5 text-sm text-slate-600">{it.description}</p>}
          </div>
        </article>
      ))}
    </div>
  );
}

export default function ExploreVillageDetail() {
  const { taluka, village } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${API_BASE_URL}/api/explore-villages/${encodeURIComponent(taluka)}/${encodeURIComponent(village)}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok || !d.success) throw new Error(d.error || "Village not found.");
        setData(d.village);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [taluka, village]);

  if (loading) return <p className="p-8 text-slate-500">Loading village...</p>;
  if (error || !data) {
    return (
      <div className="p-8">
        <p className="mb-4 text-red-600">{error || "Village not found."}</p>
        <Link to="/experiences/explore-villages" className="font-semibold text-teal-700 underline">
          Back to all villages
        </Link>
      </div>
    );
  }

  const v = data;
  const sections = [
    has(v.intro) && { id: "about", label: "About" },
    (has(v.history) || has(v.history_timeline)) && { id: "history", label: "History" },
    has(v.places) && { id: "places", label: "Places to visit" },
    has(v.homestays) && { id: "stay", label: "Where to stay" },
    (has(v.drivers) || has(v.bus_stops)) && { id: "transport", label: "Getting around" },
    has(v.atms) && { id: "atms", label: "ATMs" },
    has(v.food) && { id: "food", label: "Local food" },
    has(v.flowers) && { id: "flowers", label: "Flowers" },
    has(v.birds) && { id: "birds", label: "Birds" },
    has(v.festivals) && { id: "festivals", label: "Festivals" },
    has(v.gallery) && { id: "gallery", label: "Gallery" },
    (has(v.how_to_reach) || has(v.best_time)) && { id: "reach", label: "How to reach" },
  ].filter(Boolean);

  const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div>
      {/* Hero */}
      <header className="relative h-64 bg-gradient-to-br from-teal-700 to-[#0b3149] sm:h-80">
        {v.hero_image && <img src={v.hero_image} alt={v.village_name} className="h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-6 text-white sm:px-6">
          <Link
            to="/experiences/explore-villages"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white"
          >
            <ArrowLeft size={16} /> All villages
          </Link>
          <h1 className="rt-display text-3xl font-bold sm:text-5xl">{v.village_name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
            <MapPin size={14} /> {v.taluka_name} taluka
          </p>
          {v.tagline && <p className="mt-2 max-w-2xl text-lg text-white/95">{v.tagline}</p>}
        </div>
      </header>

      {/* Section pills (sticky under the site header) */}
      {sections.length > 1 && (
        <nav aria-label="Village sections" className="sticky top-20 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2.5 sm:px-6">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => jump(s.id)}
                className="shrink-0 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700 hover:bg-teal-100 hover:text-teal-900"
              >
                {s.label}
              </button>
            ))}
          </div>
        </nav>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {has(v.intro) && (
          <Section id="about" title={`About ${v.village_name}`}>
            <p className="max-w-3xl whitespace-pre-line text-slate-700">{v.intro}</p>
          </Section>
        )}

        {(has(v.history) || has(v.history_timeline)) && (
          <Section id="history" title="History">
            {has(v.history) && <p className="max-w-3xl whitespace-pre-line text-slate-700">{v.history}</p>}
            {has(v.history_timeline) && (
              <ol className="mt-6 max-w-3xl space-y-4 border-l-2 border-[#B4532A]/40 pl-6">
                {v.history_timeline.map((t, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-[#B4532A] ring-4 ring-[#F4F8F9]" />
                    {t.year && <p className="text-sm font-bold text-[#B4532A]">{t.year}</p>}
                    <p className="text-slate-700">{t.text}</p>
                  </li>
                ))}
              </ol>
            )}
          </Section>
        )}

        {has(v.places) && (
          <Section id="places" title="Places to visit">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {v.places.map((p) => {
                const img = firstUrl(p.photo_location);
                return (
                  <Link
                    key={p.id}
                    to={`/profile/location/${p.id}`}
                    className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="h-40 bg-gradient-to-br from-teal-100 to-teal-200">
                      {img && <img src={img} alt={p.location_name} loading="lazy" className="h-full w-full object-cover" />}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-900">{p.location_name}</h3>
                      {p.attraction_type && <p className="text-sm text-teal-700">{p.attraction_type}</p>}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        {p.avg_time_spent && (
                          <span className="flex items-center gap-1"><Clock size={12} /> {p.avg_time_spent}</span>
                        )}
                        {p.seasonal_availability && (
                          <span className="flex items-center gap-1"><CalendarDays size={12} /> {p.seasonal_availability}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Section>
        )}

        {has(v.homestays) && (
          <Section id="stay" title="Where to stay">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {v.homestays.map((h) => {
                const img = firstUrl(h.photo_homestay);
                return (
                  <Link
                    key={h.id}
                    to={`/profile/homestay/${h.id}`}
                    className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="h-40 bg-gradient-to-br from-amber-100 to-amber-200">
                      {img && <img src={img} alt={h.homestay_name} loading="lazy" className="h-full w-full object-cover" />}
                    </div>
                    <div className="p-4">
                      <h3 className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Home size={16} className="text-teal-700" /> {h.homestay_name}
                      </h3>
                      {h.homestay_type && <p className="text-sm text-slate-600">{h.homestay_type}</p>}
                      {h.price_range && <p className="mt-1 text-sm font-semibold text-[#B4532A]">{h.price_range}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </Section>
        )}

        {(has(v.drivers) || has(v.bus_stops)) && (
          <Section id="transport" title="Getting around">
            {has(v.drivers) && (
              <>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
                  <Car size={18} className="text-teal-700" /> Local drivers
                </h3>
                <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {v.drivers.map((d) => {
                    const img = firstUrl(d.driver_photo) || firstUrl(d.vehicle_photo);
                    return (
                      <article key={d.id} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-teal-100">
                          {img && <img src={img} alt={d.driver_name} loading="lazy" className="h-full w-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900">{d.driver_name}</h4>
                          {d.vehicle_type && <p className="text-sm text-slate-600">{d.vehicle_type}</p>}
                          {d.per_day_rate && (
                            <p className="text-sm font-semibold text-[#B4532A]">₹{d.per_day_rate} / day</p>
                          )}
                          {d.phone_number && (
                            <a
                              href={`tel:${d.phone_number}`}
                              className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:underline"
                            >
                              <Phone size={13} /> {d.phone_number}
                            </a>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}

            {has(v.bus_stops) && (
              <>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
                  <Bus size={18} className="text-teal-700" /> Bus stops
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {v.bus_stops.map((b) => (
                    <article key={b.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                      <h4 className="font-bold text-slate-900">{b.stop_name}</h4>
                      {b.distance_km != null && (
                        <p className="text-sm text-slate-500">About {b.distance_km} km from the village</p>
                      )}
                      <div className="mt-2 flex gap-4 text-sm font-semibold">
                        {b.timetable_link && (
                          <a href={b.timetable_link} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">
                            Timetable
                          </a>
                        )}
                        {b.google_maps_link && (
                          <a href={b.google_maps_link} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">
                            Map
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </Section>
        )}

        {has(v.atms) && (
          <Section id="atms" title="ATMs">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {v.atms.map((a) => (
                <article key={a.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <h3 className="flex items-center gap-2 font-bold text-slate-900">
                    <Banknote size={18} className="text-[#B4532A]" /> {a.bank_name}
                  </h3>
                  <p className="text-sm text-slate-600">{a.atm_name}</p>
                  {a.address && <p className="mt-1 text-sm text-slate-500">{a.address}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                    {a.is_24x7 && <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800">24x7</span>}
                    {a.has_cash_deposit && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">Cash deposit</span>
                    )}
                    {a.google_maps_link && (
                      <a href={a.google_maps_link} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">
                        Map
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </Section>
        )}

        {has(v.food) && <Section id="food" title="Local food"><ItemGrid items={v.food} /></Section>}
        {has(v.flowers) && <Section id="flowers" title="Flowers of the village"><ItemGrid items={v.flowers} /></Section>}
        {has(v.birds) && <Section id="birds" title="Birds you may spot"><ItemGrid items={v.birds} /></Section>}
        {has(v.festivals) && <Section id="festivals" title="Festivals"><ItemGrid items={v.festivals} /></Section>}

        {has(v.gallery) && (
          <Section id="gallery" title="Gallery">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {v.gallery.map((url) => (
                <img key={url} src={url} alt="" loading="lazy" className="h-40 w-full rounded-xl object-cover" />
              ))}
            </div>
          </Section>
        )}

        {(has(v.how_to_reach) || has(v.best_time)) && (
          <Section id="reach" title="How to reach">
            {has(v.how_to_reach) && <p className="max-w-3xl whitespace-pre-line text-slate-700">{v.how_to_reach}</p>}
            {has(v.best_time) && (
              <p className="mt-3 text-slate-700">
                <span className="font-semibold text-[#0b3149]">Best time to visit:</span> {v.best_time}
              </p>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}
