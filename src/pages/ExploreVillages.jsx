import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Home, Landmark } from "lucide-react";
import API_BASE_URL from "../config";

export default function ExploreVillages() {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [taluka, setTaluka] = useState("All");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/explore-villages`)
      .then((r) => r.json())
      .then((d) => {
        if (!Array.isArray(d)) throw new Error(d.error || "Could not load villages.");
        setVillages(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const talukas = useMemo(
    () => ["All", ...Array.from(new Set(villages.map((v) => v.taluka_name))).sort()],
    [villages]
  );

  const shown = villages.filter(
    (v) =>
      (taluka === "All" || v.taluka_name === taluka) &&
      (!query.trim() ||
        `${v.village_name} ${v.tagline || ""}`.toLowerCase().includes(query.trim().toLowerCase()))
  );

  return (
    <div>
      <section className="bg-gradient-to-br from-[#0b3149] to-teal-800 px-4 py-12 text-center text-white sm:px-6">
        <h1 className="rt-display text-3xl font-bold sm:text-4xl">Explore Villages</h1>
        <p className="mx-auto mt-3 max-w-2xl text-teal-50">
          History, food, flowers, birds, places to visit and homestays, village by village.
        </p>

        <div className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-lg">
          <Search size={18} className="text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a village"
            aria-label="Search a village"
            className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {talukas.map((t) => (
            <button
              key={t}
              onClick={() => setTaluka(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                taluka === t
                  ? "bg-teal-700 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-teal-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading && <p className="text-slate-500">Loading villages...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && shown.length === 0 && (
          <p className="text-slate-500">
            {villages.length === 0
              ? "No village pages have been published yet."
              : "No villages match your search."}
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((v) => (
            <Link
              key={`${v.taluka_name}-${v.village_name}`}
              to={`/experiences/explore-villages/${encodeURIComponent(v.taluka_name)}/${encodeURIComponent(v.village_name)}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-44 bg-gradient-to-br from-teal-600 to-[#0b3149]">
                {v.hero_image && (
                  <img
                    src={v.hero_image}
                    alt={v.village_name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
                <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  <MapPin size={12} /> {v.taluka_name}
                </span>
              </div>
              <div className="p-4">
                <h2 className="rt-display text-xl font-bold text-slate-900">{v.village_name}</h2>
                {v.tagline && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{v.tagline}</p>}
                <div className="mt-3 flex gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <Landmark size={14} className="text-[#B4532A]" /> {v.place_count} places
                  </span>
                  <span className="flex items-center gap-1">
                    <Home size={14} className="text-teal-700" /> {v.stay_count} stays
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
