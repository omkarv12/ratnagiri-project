import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  MapPin,
  Clock,
  Navigation,
  LocateFixed,
  Loader2,
  SearchX,
  Search,
  Heart,
  X,
  Compass,
  CalendarDays,
  Signpost,
  Map as MapIcon,
  ExternalLink,
} from "lucide-react";

import { useLocations } from "../context/LocationsContext";

/* ---- Scroll reveal (same pattern as other pages) --------------------- */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function Reveal({ children, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {children}
    </div>
  );
}

/* ---- Config ---------------------------------------------------------- */
const CATEGORY_STYLE = {
  "Beach Tourism": { emoji: "🏖️", chip: "bg-sky-50 text-sky-700" },
  "Heritage Tourism": { emoji: "🏛️", chip: "bg-purple-50 text-purple-700" },
  "Religious Tourism": { emoji: "🛕", chip: "bg-orange-50 text-orange-700" },
  "Nature & Eco Tourism": { emoji: "🌿", chip: "bg-green-50 text-green-700" },
  "Adventure & Marine Tourism": { emoji: "🚤", chip: "bg-cyan-50 text-cyan-700" },
};
const DEFAULT_STYLE = { emoji: "📍", chip: "bg-slate-100 text-slate-600" };

const FAVORITES_KEY = "rt_favorites"; // shared with the interactive map ("village:<id>")

/* ---- Helpers --------------------------------------------------------- */

// Straight-line distance in km between two lat/lng points.
function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function formatKm(km) {
  return km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`;
}

// Google Drive link -> thumbnail URL.
function driveThumb(link, width = 800) {
  if (!link) return null;
  const match = link.match(/[-\w]{25,}/);
  if (!match) return null;
  return `https://drive.google.com/thumbnail?id=${match[0]}&sz=w${width}`;
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/* ---- Place card ------------------------------------------------------ */
function PlaceCard({ p, favorite, onToggleFavorite, highlight = false }) {
  const style = CATEGORY_STYLE[p.category] || DEFAULT_STYLE;
  const img = driveThumb(p.photo_location);
  const hasCoords = p.latitude && p.longitude;

  return (
    <div
      id={`place-${p.id}`}
      className={`rt-card bg-white rounded-xl overflow-hidden flex flex-col h-full scroll-mt-28 ${
        highlight ? "ring-2 ring-orange-500" : ""
      }`}
    >
      {/* Photo */}
      <div className="relative h-44 bg-slate-100">
        {img ? (
          <img
            src={img}
            alt={p.location_name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-orange-50 to-amber-100">
            {style.emoji}
          </div>
        )}
        <button
          onClick={() => onToggleFavorite(p.id)}
          aria-label={favorite ? "Remove from favorites" : "Save to favorites"}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-sm hover:scale-110 transition-transform"
        >
          <Heart
            size={16}
            className={favorite ? "fill-rose-500 text-rose-500" : "text-slate-400"}
          />
        </button>
      </div>

      <div className="p-6 flex flex-col flex-1">
        {/* Top row: category + distance */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full font-body ${style.chip}`}
          >
            {style.emoji} {p.category || "Place"}
          </span>
          {p.distanceKm != null && (
            <span className="text-xs font-semibold text-orange-700 font-body whitespace-nowrap">
              {formatKm(p.distanceKm)}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-slate-800 mb-1 font-body leading-snug">
          {p.location_name}
        </h3>

        <p className="text-xs text-slate-500 font-body mb-3 flex items-start gap-1.5">
          <MapPin size={12} className="mt-0.5 shrink-0" />
          <span>
            {[p.village_name, p.taluka_name && `Taluka ${p.taluka_name}`]
              .filter(Boolean)
              .join(", ")}
            {p.nearest_landmark ? ` (near ${p.nearest_landmark})` : ""}
          </span>
        </p>

        {/* Quick facts */}
        <div className="space-y-1.5 mb-4">
          {p.avg_time_spent && (
            <p className="flex items-center gap-1.5 text-xs text-slate-600 font-body">
              <Clock size={12} className="text-slate-400" />
              Time needed: <span className="font-semibold">{p.avg_time_spent}</span>
            </p>
          )}
          {p.seasonal_availability && (
            <p className="flex items-center gap-1.5 text-xs text-slate-600 font-body">
              <CalendarDays size={12} className="text-slate-400" />
              Season: <span className="font-semibold">{p.seasonal_availability}</span>
            </p>
          )}
          {p.road_condition && (
            <p className="flex items-center gap-1.5 text-xs text-slate-600 font-body">
              <Signpost size={12} className="text-slate-400" />
              Road: <span className="font-semibold">{p.road_condition}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-auto">
          {hasCoords && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-full transition-colors"
            >
              <Navigation size={13} />
              Get Directions
            </a>
          )}
          <Link
            to="/map"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-700 hover:text-orange-800"
          >
            <MapIcon size={12} />
            Interactive map
            <ExternalLink size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---- Page ------------------------------------------------------------ */
export default function Places() {
  const { locations, loading } = useLocations();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get("place"); // set by the nav menu links

  // 'idle' | 'loading' | 'granted' | 'denied' | 'unsupported'
  const [geoStatus, setGeoStatus] = useState("idle");
  const [position, setPosition] = useState(null);

  const [category, setCategory] = useState("all");
  const [taluka, setTaluka] = useState("all");
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState(loadFavorites);

  const isFavorite = (id) => favorites.includes(`village:${id}`);
  const toggleFavorite = (id) => {
    const key = `village:${id}`;
    const next = favorites.includes(key)
      ? favorites.filter((k) => k !== key)
      : [...favorites, key];
    setFavorites(next);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable — the toggle still works for this visit
    }
  };

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("granted");
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Ask once on load; the visitor can retry from the banner.
  useEffect(() => {
    requestLocation();
  }, []);

  // Add distance to every place
  const enriched = useMemo(
    () =>
      (locations || []).map((l) => ({
        ...l,
        distanceKm:
          position && l.latitude && l.longitude
            ? haversineKm(position.lat, position.lng, l.latitude, l.longitude)
            : null,
      })),
    [locations, position]
  );

  const categories = useMemo(
    () => Array.from(new Set(enriched.map((l) => l.category).filter(Boolean))).sort(),
    [enriched]
  );
  const talukas = useMemo(
    () => Array.from(new Set(enriched.map((l) => l.taluka_name).filter(Boolean))).sort(),
    [enriched]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = enriched.filter((l) => {
      if (category !== "all" && l.category !== category) return false;
      if (taluka !== "all" && l.taluka_name !== taluka) return false;
      if (favoritesOnly && !favorites.includes(`village:${l.id}`)) return false;
      if (q) {
        const haystack = [l.location_name, l.village_name, l.taluka_name, l.nearest_landmark, l.category]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    list.sort((a, b) =>
      position
        ? (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
        : (a.location_name || "").localeCompare(b.location_name || "")
    );
    return list;
  }, [enriched, category, taluka, search, favoritesOnly, favorites, position]);

  const nearest = position && visible.length > 0 && visible[0].distanceKm != null ? visible[0] : null;
  const filtersActive =
    category !== "all" || taluka !== "all" || search.trim() !== "" || favoritesOnly;

  const clearFilters = () => {
    setCategory("all");
    setTaluka("all");
    setSearch("");
    setFavoritesOnly(false);
  };

  // Coming from the nav menu (?place=<id>): clear filters are already off, so just scroll to it.
  useEffect(() => {
    if (!selectedId || loading) return;
    const timer = setTimeout(() => {
      document
        .getElementById(`place-${selectedId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedId, loading, visible.length]);

  return (
    <div className="animate-in fade-in duration-500 bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Fraunces', Georgia, serif; }
        .font-body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .rt-card {
          box-shadow: 0 10px 28px -14px rgba(15, 23, 42, 0.18);
          transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease;
        }
        .rt-card:hover { transform: translateY(-4px); box-shadow: 0 26px 50px -18px rgba(234,88,12,0.3); }
        @media (prefers-reduced-motion: reduce) { .rt-card, .rt-card:hover { transition: none; transform: none; } }
      `}</style>

      {/* ================= Hero ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 to-amber-700 px-5 sm:px-10 lg:px-16 py-16 sm:py-20">
        <div className="relative max-w-[1680px] mx-auto">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] text-white/80 mb-3 font-body">
            About &middot; Geography &middot; Places
          </p>
          <h1 className="font-display text-white text-4xl sm:text-5xl lg:text-6xl mb-3">
            Places to Visit in Ratnagiri
          </h1>
          <p className="text-white/85 text-sm sm:text-base max-w-2xl font-body leading-relaxed">
            Beaches, forts, temples and hidden corners across the district,
            sorted by how close they are to you.
          </p>
        </div>
      </section>

      {/* ================= Location banner ================= */}
      <section className="px-5 sm:px-10 lg:px-16 pt-8">
        <div className="max-w-[1680px] mx-auto">
          {geoStatus === "loading" && (
            <p className="flex items-center gap-2 text-sm text-slate-600 font-body">
              <Loader2 size={16} className="animate-spin" />
              Finding your location...
            </p>
          )}
          {geoStatus === "granted" && (
            <p className="flex items-center gap-2 text-sm text-orange-700 font-semibold font-body">
              <LocateFixed size={16} />
              Showing the closest places to your current location first.
            </p>
          )}
          {(geoStatus === "denied" || geoStatus === "unsupported") && (
            <div className="flex flex-wrap items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-sm text-amber-900 font-body">
                {geoStatus === "unsupported"
                  ? "Your browser doesn't support location."
                  : "Location is off, so places are listed alphabetically."}{" "}
                Allow location to sort by distance.
              </p>
              {geoStatus === "denied" && (
                <button
                  onClick={requestLocation}
                  className="text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-full"
                >
                  Try again
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ================= Nearest to you ================= */}
      {nearest && !filtersActive && (
        <section className="px-5 sm:px-10 lg:px-16 pt-8">
          <div className="max-w-[1680px] mx-auto">
            <Reveal>
              <div className="flex items-center gap-2 text-orange-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
                <LocateFixed size={16} />
                Nearest to you
              </div>
              <div className="max-w-xl">
                <PlaceCard
                  p={nearest}
                  favorite={isFavorite(nearest.id)}
                  onToggleFavorite={toggleFavorite}
                  highlight
                />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ================= Filters ================= */}
      <section className="px-5 sm:px-10 lg:px-16 pt-10">
        <div className="max-w-[1680px] mx-auto">
          {/* Search */}
          <div className="relative max-w-md mb-4">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by place, village or taluka"
              aria-label="Search places"
              className="w-full text-sm font-body border border-slate-300 rounded-full pl-10 pr-4 py-2.5 bg-white text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {["all", ...categories].map((key) => {
              const style = CATEGORY_STYLE[key];
              return (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  aria-pressed={category === key}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold font-body transition-colors ${
                    category === key
                      ? "bg-orange-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {key === "all" ? <Compass size={15} /> : <span>{style?.emoji || "📍"}</span>}
                  {key === "all" ? "All" : key}
                </button>
              );
            })}
          </div>

          {/* Dropdown + toggles */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={taluka}
              onChange={(e) => setTaluka(e.target.value)}
              aria-label="Filter by taluka"
              className="text-sm font-body border border-slate-300 rounded-full px-4 py-2 bg-white text-slate-700"
            >
              <option value="all">All talukas</option>
              {talukas.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <button
              onClick={() => setFavoritesOnly((v) => !v)}
              aria-pressed={favoritesOnly}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold font-body border transition-colors ${
                favoritesOnly
                  ? "bg-rose-50 border-rose-300 text-rose-700"
                  : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Heart size={13} className={favoritesOnly ? "fill-rose-500 text-rose-500" : ""} />
              Favorites only
            </button>

            {filtersActive && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 font-body"
              >
                <X size={13} />
                Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ================= Results ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-10 sm:py-12">
        <div className="max-w-[1680px] mx-auto">
          {loading && (
            <p className="flex items-center gap-2 text-slate-600 font-body">
              <Loader2 size={18} className="animate-spin" />
              Loading places...
            </p>
          )}

          {!loading && (
            <>
              <p className="text-sm text-slate-500 font-body mb-5">
                {visible.length} {visible.length === 1 ? "place" : "places"} found
              </p>

              {visible.length === 0 ? (
                <div className="text-center py-12">
                  <SearchX className="mx-auto text-slate-400 mb-3" size={32} />
                  <p className="text-slate-600 font-body mb-3">
                    Nothing matches these filters.
                  </p>
                  {filtersActive && (
                    <button
                      onClick={clearFilters}
                      className="text-sm font-semibold text-orange-700 hover:text-orange-800 font-body"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                  {visible.map((p) => (
                    <PlaceCard
                      key={p.id}
                      p={p}
                      favorite={isFavorite(p.id)}
                      onToggleFavorite={toggleFavorite}
                      highlight={String(p.id) === selectedId}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ================= Closing note ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-16 sm:py-20 bg-orange-50/50">
        <div className="max-w-[1680px] mx-auto text-center">
          <Reveal>
            <Compass className="mx-auto text-orange-600 mb-4" size={28} />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Plan Your Visit
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-2xl mx-auto">
              Distances are straight-line estimates. Tap "Get Directions" for the
              actual route and travel time. Road conditions and seasons can
              change, so check before you set out.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
