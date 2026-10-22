import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BedDouble,
  MapPin,
  ShieldCheck,
  Navigation,
  Search,
  SlidersHorizontal,
  X,
  Wifi,
  Car,
  Utensils,
  Zap,
  Droplets,
  Coffee,
  LocateFixed,
  Loader2,
  ArrowUpRight,
  Home,
} from "lucide-react";
import { useLocations } from "../context/LocationsContext";

/* ---------- helpers ---------- */

function driveThumb(link, width = 700) {
  if (!link) return null;
  if (/^https?:\/\//.test(link) && !link.includes("drive.google.com")) return link;
  const match = link.match(/[-\w]{25,}/);
  return match ? `https://drive.google.com/thumbnail?id=${match[0]}&sz=w${width}` : null;
}

// Accepts an array or a comma-separated string.
const toList = (v) =>
  Array.isArray(v)
    ? v.filter(Boolean)
    : typeof v === "string"
    ? v.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

// "Traditional(Local/Traditional architecture...)" -> "Traditional"
const shortType = (t) => (t ? String(t).split("(")[0].trim() : "");

// Lowest number found in "Deluxe: ₹3500/night, AC: ₹2500/night" -> 2500
function minPrice(text) {
  if (!text) return null;
  const nums = String(text).replace(/,/g, "").match(/\d{3,6}/g);
  return nums ? Math.min(...nums.map(Number)) : null;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const FACILITY_ICONS = {
  Breakfast: Coffee,
  Lunch: Utensils,
  Dinner: Utensils,
  WiFi: Wifi,
  "Power Backup": Zap,
  Parking: Car,
  "Hot Water": Droplets,
};

const ALL_FACILITIES = Object.keys(FACILITY_ICONS);
const DISTANCES = [5, 10, 25, 50];

/* ---------- small UI pieces ---------- */

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-amber-600 bg-amber-600 text-white shadow-sm"
          : "border-stone-300 bg-white text-stone-700 hover:border-amber-500 hover:text-amber-700"
      }`}
    >
      {children}
    </button>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-stone-500">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="h-52 bg-stone-200" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-3/4 rounded bg-stone-200" />
        <div className="h-3 w-1/2 rounded bg-stone-200" />
        <div className="h-3 w-2/3 rounded bg-stone-200" />
        <div className="h-10 rounded-lg bg-stone-200" />
      </div>
    </div>
  );
}

function StayCard({ home, onOpen }) {
  const img = driveThumb(home.header_photo || home.photo_homestay);
  const type = shortType(home.type || home.homestay_type);
  const unit = home.unit_type || home.homestay_unit_type;
  const facilities = toList(home.facilities ?? home.facilities_services);
  const price = home._price;
  const hasCoords = home._lat != null && home._lng != null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-52 overflow-hidden bg-amber-50">
        {img ? (
          <img
            src={img}
            alt={home.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BedDouble className="text-amber-400" size={42} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {type && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800 shadow">
            {type}
          </span>
        )}
        {home._distance != null && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow">
            <Navigation size={11} />
            {home._distance < 10 ? home._distance.toFixed(1) : Math.round(home._distance)} km away
          </span>
        )}
        {price && (
          <div className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-3 py-1.5 text-right shadow">
            <p className="text-[10px] font-semibold uppercase leading-none text-stone-500">From</p>
            <p className="text-sm font-extrabold leading-tight text-stone-900">
              ₹{price.toLocaleString("en-IN")}
              <span className="text-[11px] font-medium text-stone-500">/night</span>
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="flex items-start gap-2 font-serif text-xl font-bold leading-snug text-stone-900">
          <span className="flex-1">{home.name}</span>
          <ShieldCheck size={17} className="mt-1 shrink-0 text-emerald-500" title="Verified by the department" />
        </h2>

        <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-600">
          <MapPin size={14} className="shrink-0 text-amber-600" />
          {[home.village, home.taluka].filter(Boolean).join(", ") || "Ratnagiri"}
        </p>

        {unit && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
            <Home size={14} className="shrink-0 text-stone-400" />
            {unit}
          </p>
        )}

        {facilities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {facilities.slice(0, 4).map((f) => {
              const Icon = FACILITY_ICONS[f] || ShieldCheck;
              return (
                <span
                  key={f}
                  className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-700"
                >
                  <Icon size={11} className="text-amber-600" />
                  {f}
                </span>
              );
            })}
            {facilities.length > 4 && (
              <span className="rounded-md bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-500">
                +{facilities.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex gap-2 pt-5">
          <button
            onClick={onOpen}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-600 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700"
          >
            View details <ArrowUpRight size={15} />
          </button>
          {hasCoords && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${home._lat},${home._lng}`}
              target="_blank"
              rel="noreferrer"
              title="Get directions"
              aria-label={`Get directions to ${home.name}`}
              className="flex items-center justify-center rounded-lg border border-stone-300 px-3 text-stone-700 transition hover:border-amber-500 hover:text-amber-700"
            >
              <Navigation size={16} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/* ---------- page ---------- */

export default function DiscoverYourStay() {
  const { homestays, loading } = useLocations();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [taluka, setTaluka] = useState("");
  const [types, setTypes] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [maxDistance, setMaxDistance] = useState(null);
  const [sort, setSort] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);

  // Live location: idle | loading | granted | denied | unsupported
  const [geoStatus, setGeoStatus] = useState("idle");
  const [userPos, setUserPos] = useState(null);

  const locateMe = () => {
    if (!navigator.geolocation) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("granted");
        setSort("nearest");
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const clearLocation = () => {
    setUserPos(null);
    setGeoStatus("idle");
    setMaxDistance(null);
    if (sort === "nearest") setSort("recommended");
  };

  // Normalise each stay once: coordinates, price, distance.
  const enriched = useMemo(
    () =>
      (homestays || []).map((h) => {
        const lat = parseFloat(h.latitude ?? h.lat);
        const lng = parseFloat(h.longitude ?? h.lng ?? h.lon);
        const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
        return {
          ...h,
          _lat: hasCoords ? lat : null,
          _lng: hasCoords ? lng : null,
          _price: minPrice(h.price_range),
          _distance:
            userPos && hasCoords ? haversineKm(userPos.lat, userPos.lng, lat, lng) : null,
        };
      }),
    [homestays, userPos]
  );

  const talukas = useMemo(
    () => [...new Set(enriched.map((h) => h.taluka).filter(Boolean))].sort(),
    [enriched]
  );
  const typeOptions = useMemo(
    () =>
      [...new Set(enriched.map((h) => shortType(h.type || h.homestay_type)).filter(Boolean))].sort(),
    [enriched]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = enriched.filter((h) => {
      if (q) {
        const hay = [h.name, h.village, h.taluka, h.owner_name].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (taluka && h.taluka !== taluka) return false;
      if (types.length && !types.includes(shortType(h.type || h.homestay_type))) return false;
      if (facilities.length) {
        const have = toList(h.facilities ?? h.facilities_services);
        if (!facilities.every((f) => have.includes(f))) return false;
      }
      if (maxDistance && userPos) {
        if (h._distance == null || h._distance > maxDistance) return false;
      }
      return true;
    });

    const byName = (a, b) => (a.name || "").localeCompare(b.name || "");
    if (sort === "nearest" && userPos) {
      list = [...list].sort((a, b) => (a._distance ?? Infinity) - (b._distance ?? Infinity));
    } else if (sort === "price-low") {
      list = [...list].sort((a, b) => (a._price ?? Infinity) - (b._price ?? Infinity));
    } else if (sort === "price-high") {
      list = [...list].sort((a, b) => (b._price ?? -1) - (a._price ?? -1));
    } else if (sort === "name") {
      list = [...list].sort(byName);
    }
    return list;
  }, [enriched, query, taluka, types, facilities, maxDistance, sort, userPos]);

  const toggle = (setter) => (value) =>
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const activeCount =
    (taluka ? 1 : 0) + types.length + facilities.length + (maxDistance ? 1 : 0) + (query ? 1 : 0);

  const clearAll = () => {
    setQuery("");
    setTaluka("");
    setTypes([]);
    setFacilities([]);
    setMaxDistance(null);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
            Ratnagiri · Konkan Coast
          </p>
          <h1 className="font-serif text-4xl font-bold leading-tight text-white sm:text-5xl">
            Discover Your Stay
          </h1>
          <p className="mt-3 max-w-xl text-base text-stone-300">
            Authentic homestays hosted by local families — wake up to the sea, the hills and
            real Konkan hospitality.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by homestay, village or taluka…"
                className="w-full rounded-xl border-0 bg-white py-3.5 pl-11 pr-4 text-sm shadow-lg outline-none ring-2 ring-transparent focus:ring-amber-400"
              />
            </div>
            <button
              type="button"
              onClick={geoStatus === "granted" ? clearLocation : locateMe}
              disabled={geoStatus === "loading"}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold shadow-lg transition ${
                geoStatus === "granted"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-amber-500 text-stone-900 hover:bg-amber-400"
              } disabled:opacity-70`}
            >
              {geoStatus === "loading" ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <LocateFixed size={17} />
              )}
              {geoStatus === "loading"
                ? "Locating…"
                : geoStatus === "granted"
                ? "Using your location"
                : "Stays near me"}
              {geoStatus === "granted" && <X size={15} />}
            </button>
          </div>

          {geoStatus === "denied" && (
            <p className="mt-3 text-xs text-amber-200">
              Location access was blocked. Allow it in your browser settings to see the nearest stays.
            </p>
          )}
          {geoStatus === "unsupported" && (
            <p className="mt-3 text-xs text-amber-200">
              Your browser doesn't support location services.
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-stone-800">
              {loading ? "Loading stays…" : `${results.length} ${results.length === 1 ? "stay" : "stays"} found`}
            </p>
            {geoStatus === "granted" && (
              <p className="text-xs text-emerald-700">Distances measured from your current location</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((s) => !s)}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-semibold text-stone-700 hover:border-amber-500"
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeCount > 0 && (
                <span className="rounded-full bg-amber-600 px-1.5 text-[11px] font-bold text-white">
                  {activeCount}
                </span>
              )}
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort stays"
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 outline-none focus:border-amber-500"
            >
              <option value="recommended">Recommended</option>
              <option value="nearest" disabled={!userPos}>
                Nearest first{!userPos ? " (enable location)" : ""}
              </option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name: A–Z</option>
            </select>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <section className="mb-8 space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-stone-500">
                  Taluka
                </p>
                <select
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
                >
                  <option value="">All talukas</option>
                  {talukas.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              {userPos && (
                <FilterGroup label="Within distance">
                  <Chip active={!maxDistance} onClick={() => setMaxDistance(null)}>
                    Any
                  </Chip>
                  {DISTANCES.map((d) => (
                    <Chip key={d} active={maxDistance === d} onClick={() => setMaxDistance(d)}>
                      {d} km
                    </Chip>
                  ))}
                </FilterGroup>
              )}
            </div>

            {typeOptions.length > 0 && (
              <FilterGroup label="Homestay style">
                {typeOptions.map((t) => (
                  <Chip key={t} active={types.includes(t)} onClick={() => toggle(setTypes)(t)}>
                    {t}
                  </Chip>
                ))}
              </FilterGroup>
            )}

            <FilterGroup label="Facilities">
              {ALL_FACILITIES.map((f) => (
                <Chip key={f} active={facilities.includes(f)} onClick={() => toggle(setFacilities)(f)}>
                  {f}
                </Chip>
              ))}
            </FilterGroup>

            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-sm font-semibold text-amber-700 underline-offset-2 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </section>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <BedDouble className="mx-auto mb-3 text-stone-300" size={44} />
            <p className="font-serif text-xl font-bold text-stone-800">
              {homestays?.length ? "No stays match your filters" : "No homestays added yet"}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {homestays?.length
                ? "Try widening the distance or removing a filter."
                : "Check back soon — new hosts are joining every week."}
            </p>
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="mt-5 rounded-lg bg-amber-600 px-5 py-2 text-sm font-bold text-white hover:bg-amber-700"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((home) => (
              <StayCard
                key={home.id}
                home={home}
                onOpen={() => navigate(`/profile/homestay/${home.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}