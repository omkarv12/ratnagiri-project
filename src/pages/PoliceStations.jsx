import { useState, useEffect, useMemo, useRef } from "react";
import {
  ShieldCheck,
  Building2,
  Landmark,
  Wifi,
  MapPin,
  Clock,
  Accessibility,
  ExternalLink,
  Navigation,
  Phone,
  Siren,
  LocateFixed,
  Loader2,
  SearchX,
  Search,
  DoorOpen,
  Globe,
  MessageCircle,
  Languages,
  ChevronDown,
  FileText,
  FileSearch,
  Users,
  ParkingCircle,
  X,
  LayoutGrid,
} from "lucide-react";

import API_BASE_URL from "../config";

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
const CATEGORIES = [
  { key: "all", label: "All", icon: LayoutGrid },
  { key: "station", label: "Police stations", icon: ShieldCheck },
  { key: "district_office", label: "District offices", icon: Landmark },
  { key: "cyber", label: "Cyber crime", icon: Wifi },
  { key: "headquarters", label: "Headquarters", icon: Building2 },
  { key: "women_cell", label: "Women's cell", icon: Users },
  { key: "traffic", label: "Traffic", icon: Navigation },
  { key: "outpost", label: "Outposts", icon: MapPin },
];

const CATEGORY_LABEL = {
  station: "Police station",
  district_office: "District office",
  cyber: "Cyber crime",
  headquarters: "Headquarters",
  women_cell: "Women's cell",
  traffic: "Traffic",
  outpost: "Outpost",
};

const CATEGORY_STYLE = {
  station: "bg-sky-50 text-sky-800",
  district_office: "bg-indigo-50 text-indigo-700",
  cyber: "bg-teal-50 text-teal-700",
  headquarters: "bg-amber-50 text-amber-800",
  women_cell: "bg-rose-50 text-rose-700",
  traffic: "bg-orange-50 text-orange-700",
  outpost: "bg-slate-100 text-slate-700",
};

// Each toggle filters on a boolean field of the station (openNow is computed here).
const TOGGLES = [
  { key: "openNow", label: "Open now", icon: DoorOpen },
  { key: "is_24x7", label: "Open 24 hours", icon: Clock },
  { key: "files_fir", label: "Accepts FIRs", icon: FileText },
  { key: "online_complaints", label: "Online complaints", icon: Globe },
  { key: "women_help_desk", label: "Women's help desk", icon: Users },
  { key: "wheelchair_accessible", label: "Wheelchair accessible", icon: Accessibility },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_FROM_NAME = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

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

// Current day and minutes-since-midnight in Ratnagiri (IST), whatever the visitor's device clock says.
function nowInIST() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value;
  let hour = parseInt(get("hour"), 10);
  if (hour === 24) hour = 0;
  return {
    day: DAY_FROM_NAME[get("weekday")] ?? 0,
    minutes: hour * 60 + parseInt(get("minute"), 10),
  };
}

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

function formatTime(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

// true = open, false = closed, null = we don't have hours for this place.
function isOpenNow(p, now) {
  const hours = p.hours || [];
  if (hours.length === 0) return p.is_24x7 ? true : null;
  const today = hours.filter((h) => h.day === now.day);
  if (today.some((h) => h.is_24h)) return true;
  return today.some(
    (h) =>
      !h.is_closed &&
      h.opens &&
      h.closes &&
      now.minutes >= toMinutes(h.opens) &&
      now.minutes < toMinutes(h.closes)
  );
}

function hoursForDay(hours, day) {
  const rows = (hours || []).filter((h) => h.day === day);
  if (rows.length === 0) return "Not listed";
  if (rows.some((h) => h.is_24h)) return "Open 24 hours";
  if (rows.every((h) => h.is_closed)) return "Closed";
  return rows
    .filter((h) => !h.is_closed)
    .map((h) => `${formatTime(h.opens)} – ${formatTime(h.closes)}`)
    .join(", ");
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/* ---- Small pieces ---------------------------------------------------- */
function Pill_({ children, tone = "slate", icon: Icon }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    navy: "bg-sky-50 text-[#0b3149]",
    amber: "bg-amber-50 text-amber-800",
    teal: "bg-teal-50 text-teal-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full font-body ${tones[tone]}`}
    >
      {Icon && <Icon size={11} />}
      {children}
    </span>
  );
}

function DetailSection({ title, icon: Icon, children }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 font-body mb-2">
        <Icon size={12} />
        {title}
      </p>
      {children}
    </div>
  );
}

/* ---- Station card ---------------------------------------------------- */
function StationCard({ p, now, highlight = false }) {
  const services = p.services || [];
  const hours = p.hours || [];
  const hasDetails = services.length > 0 || hours.length > 0 || p.jurisdiction;

  const badges = [
    p.is_24x7 && ["24 hours", Clock],
    p.files_fir && ["Accepts FIRs", FileText],
    p.online_complaints && ["Online complaints", Globe],
    p.women_help_desk && ["Women's help desk", Users],
    p.tourist_help && ["Tourist help", ShieldCheck],
    p.lost_property_reports && ["Lost property", FileSearch],
    p.wheelchair_accessible && ["Wheelchair accessible", Accessibility],
    p.accessible_restrooms && ["Accessible restrooms", Accessibility],
    p.parking_available && ["Parking", ParkingCircle],
    p.files_fir === false && ["Not a complaint desk", Building2],
  ].filter(Boolean);

  const waDigits = p.whatsapp ? p.whatsapp.replace(/\D/g, "") : null;

  return (
    <div
      className={`rt-card bg-white rounded-xl p-6 flex flex-col h-full ${
        highlight ? "ring-2 ring-[#0b3149]" : ""
      }`}
    >
      {/* Top row: type + distance */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span
          className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full font-body ${
            CATEGORY_STYLE[p.category] || "bg-slate-100 text-slate-600"
          }`}
        >
          {CATEGORY_LABEL[p.category] || p.category}
        </span>
        {p.distanceKm != null && (
          <span className="text-xs font-semibold text-[#0b3149] font-body whitespace-nowrap">
            {formatKm(p.distanceKm)}
          </span>
        )}
      </div>

      <h3 className="font-semibold text-slate-800 mb-1 font-body leading-snug">
        {p.name}
      </h3>

      {/* Open status */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
        {p.openNow === true && (
          <span className="text-[11px] font-bold text-emerald-700 font-body">
            ● Open now
          </span>
        )}
        {p.openNow === false && (
          <span className="text-[11px] font-bold text-rose-700 font-body">
            ● Closed now
          </span>
        )}
        {p.opening_hours_note && (
          <span className="text-[11px] text-slate-500 font-body">
            {p.opening_hours_note}
          </span>
        )}
      </div>

      {(p.address || p.landmark) && (
        <p className="text-xs text-slate-500 font-body mb-2 flex items-start gap-1.5">
          <MapPin size={12} className="mt-0.5 shrink-0" />
          <span>
            {p.address}
            {p.landmark ? ` (${p.landmark})` : ""}
          </span>
        </p>
      )}

      {p.description && (
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-body mb-3">
          {p.description}
        </p>
      )}

      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {badges.map(([label, Icon]) => (
            <Pill_ key={label} icon={Icon}>
              {label}
            </Pill_>
          ))}
        </div>
      )}

      {(p.features || []).length > 0 && (
        <ul className="space-y-2 mb-4">
          {p.features.map((point, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 font-body leading-relaxed"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#0b3149] mt-1.5 shrink-0" />
              {point}
            </li>
          ))}
        </ul>
      )}

      {(p.languages || []).length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-slate-600 font-body mb-4">
          <Languages size={12} className="text-slate-400" />
          {p.languages.join(", ")}
        </p>
      )}

      {/* Expandable details */}
      {hasDetails && (
        <details className="group border-t border-slate-100 pt-3 mb-4">
          <summary className="flex items-center justify-between cursor-pointer text-xs font-semibold text-[#0b3149] font-body list-none">
            Hours &amp; services
            <ChevronDown
              size={14}
              className="transition-transform group-open:rotate-180"
            />
          </summary>

          <div className="mt-3">
            {p.jurisdiction && (
              <DetailSection title="Area covered" icon={MapPin}>
                <p className="text-xs font-body text-slate-600">{p.jurisdiction}</p>
              </DetailSection>
            )}

            {hours.length > 0 && (
              <DetailSection title="Opening hours" icon={Clock}>
                <ul className="text-xs font-body text-slate-600 space-y-1">
                  {DAYS.map((d, i) => (
                    <li
                      key={d}
                      className={`flex justify-between gap-3 ${
                        i === now.day ? "font-bold text-slate-900" : ""
                      }`}
                    >
                      <span>{d}</span>
                      <span className="text-right">{hoursForDay(hours, i)}</span>
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}

            {services.length > 0 && (
              <DetailSection title="Handles" icon={ShieldCheck}>
                <div className="flex flex-wrap gap-1.5">
                  {services.map((s) => (
                    <Pill_ key={s.name}>{s.name}</Pill_>
                  ))}
                </div>
              </DetailSection>
            )}
          </div>
        </details>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-auto">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0b3149] hover:bg-slate-800 px-3 py-1.5 rounded-full transition-colors"
        >
          <Navigation size={13} />
          Get Directions
        </a>
        {p.phone && (
          <a
            href={`tel:${p.phone}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            <Phone size={12} />
            {p.phone}
          </a>
        )}
        {waDigits && (
          <a
            href={`https://wa.me/${waDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            <MessageCircle size={12} />
            WhatsApp
          </a>
        )}
        {p.online_complaint_url && (
          <a
            href={p.online_complaint_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            <Globe size={12} />
            Report online
          </a>
        )}
        {p.website && (
          <a
            href={p.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            <Globe size={12} />
            Website
          </a>
        )}
        {p.map_url && (
          <a
            href={p.map_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0b3149] hover:text-slate-700"
          >
            View on Map
            <ExternalLink size={11} />
          </a>
        )}
      </div>

      <p className="text-[11px] text-slate-400 font-body mt-3">
        {p.is_verified && p.last_verified
          ? `Verified ${formatDate(p.last_verified)}`
          : "Details not yet verified. Please call ahead."}
      </p>
    </div>
  );
}

/* ---- Page ------------------------------------------------------------ */
export default function PoliceStations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 'idle' | 'loading' | 'granted' | 'denied' | 'unsupported'
  const [geoStatus, setGeoStatus] = useState("idle");
  const [position, setPosition] = useState(null);

  const [category, setCategory] = useState("all");
  const [area, setArea] = useState("all");
  const [language, setLanguage] = useState("all");
  const [search, setSearch] = useState("");
  const [toggles, setToggles] = useState({});

  // Re-check "open now" once a minute
  const [now, setNow] = useState(nowInIST);
  useEffect(() => {
    const id = setInterval(() => setNow(nowInIST()), 60000);
    return () => clearInterval(id);
  }, []);

  // Load stations from the API
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/police-stations`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setStations(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  // Add distance and open-now to every station
  const enriched = useMemo(
    () =>
      stations.map((p) => ({
        ...p,
        distanceKm: position
          ? haversineKm(position.lat, position.lng, p.lat, p.lng)
          : null,
        openNow: isOpenNow(p, now),
      })),
    [stations, position, now]
  );

  const availableCategories = useMemo(() => {
    const present = new Set(stations.map((p) => p.category));
    return CATEGORIES.filter((c) => c.key === "all" || present.has(c.key));
  }, [stations]);

  const areas = useMemo(() => {
    const set = new Set(
      enriched
        .filter((p) => category === "all" || p.category === category)
        .map((p) => p.area)
        .filter(Boolean)
    );
    return Array.from(set).sort();
  }, [enriched, category]);

  const languages = useMemo(() => {
    const set = new Set(enriched.flatMap((p) => p.languages || []));
    return Array.from(set).sort();
  }, [enriched]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = enriched.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (area !== "all" && p.area !== area) return false;
      if (language !== "all" && !(p.languages || []).includes(language)) return false;
      if (!Object.entries(toggles).every(([key, on]) => !on || p[key] === true))
        return false;
      if (q) {
        const haystack = [
          p.name,
          p.unit_type,
          p.area,
          p.address,
          p.landmark,
          p.jurisdiction,
          ...(p.services || []).map((s) => s.name),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    list.sort((a, b) =>
      position ? a.distanceKm - b.distanceKm : a.name.localeCompare(b.name)
    );
    return list;
  }, [enriched, category, area, language, toggles, search, position]);

  // "Nearest" only makes sense for places where you can actually file a complaint.
  const nearest = useMemo(() => {
    if (!position) return null;
    return visible.find((p) => p.files_fir === true) || null;
  }, [visible, position]);

  const filtersActive =
    category !== "all" ||
    area !== "all" ||
    language !== "all" ||
    search.trim() !== "" ||
    Object.values(toggles).some(Boolean);

  const clearFilters = () => {
    setCategory("all");
    setArea("all");
    setLanguage("all");
    setSearch("");
    setToggles({});
  };

  const pickCategory = (key) => {
    setCategory(key);
    setArea("all");
  };

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
        .rt-card:hover { transform: translateY(-4px); box-shadow: 0 26px 50px -18px rgba(11,49,73,0.35); }
        details > summary::-webkit-details-marker { display: none; }
        @media (prefers-reduced-motion: reduce) { .rt-card, .rt-card:hover { transition: none; transform: none; } }
      `}</style>

      {/* ================= Hero ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0b3149] to-slate-900 px-5 sm:px-10 lg:px-16 py-16 sm:py-20">
        <div className="relative max-w-[1680px] mx-auto">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] text-white/80 mb-3 font-body">
            Resources &middot; Police Stations
          </p>
          <h1 className="font-display text-white text-4xl sm:text-5xl lg:text-6xl mb-3">
            Police Stations in Ratnagiri
          </h1>
          <p className="text-white/85 text-sm sm:text-base max-w-2xl font-body leading-relaxed">
            Law enforcement contacts, administrative offices and specialized
            units, sorted by how close they are to you.
          </p>
        </div>
      </section>

      {/* ================= Emergency strip ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-4 bg-rose-600">
        <div className="max-w-[1680px] mx-auto flex flex-wrap items-center gap-x-6 gap-y-2 text-white font-body">
          <span className="flex items-center gap-2 text-sm font-bold">
            <Siren size={18} />
            In an emergency, call now
          </span>
          <a
            href="tel:112"
            className="text-sm font-semibold bg-white text-rose-700 px-4 py-1.5 rounded-full hover:bg-rose-50 transition-colors"
          >
            112 &middot; All emergencies
          </a>
          <a
            href="tel:100"
            className="text-sm font-semibold bg-white text-rose-700 px-4 py-1.5 rounded-full hover:bg-rose-50 transition-colors"
          >
            100 &middot; Police
          </a>
          <a
            href="tel:1930"
            className="text-sm font-semibold bg-white text-rose-700 px-4 py-1.5 rounded-full hover:bg-rose-50 transition-colors"
          >
            1930 &middot; Cyber fraud
          </a>
          <a
            href="tel:1091"
            className="text-sm font-semibold bg-white text-rose-700 px-4 py-1.5 rounded-full hover:bg-rose-50 transition-colors"
          >
            1091 &middot; Women helpline
          </a>
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
            <p className="flex items-center gap-2 text-sm text-[#0b3149] font-semibold font-body">
              <LocateFixed size={16} />
              Showing the closest places to your current location first.
            </p>
          )}
          {(geoStatus === "denied" || geoStatus === "unsupported") && (
            <div className="flex flex-wrap items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-sm text-amber-900 font-body">
                {geoStatus === "unsupported"
                  ? "Your browser doesn't support location."
                  : "Location is off, so results are listed alphabetically."}{" "}
                Allow location to sort by distance.
              </p>
              {geoStatus === "denied" && (
                <button
                  onClick={requestLocation}
                  className="text-xs font-semibold text-white bg-[#0b3149] hover:bg-slate-800 px-3 py-1.5 rounded-full"
                >
                  Try again
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ================= Nearest to you ================= */}
      {nearest && (
        <section className="px-5 sm:px-10 lg:px-16 pt-8">
          <div className="max-w-[1680px] mx-auto">
            <Reveal>
              <div className="flex items-center gap-2 text-[#0b3149] text-xs font-bold uppercase tracking-[0.15em] mb-3">
                <LocateFixed size={16} />
                Nearest station where you can file a complaint
              </div>
              <div className="max-w-xl">
                <StationCard p={nearest} now={now} highlight />
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
              placeholder="Search by name, area or service"
              aria-label="Search police stations"
              className="w-full text-sm font-body border border-slate-300 rounded-full pl-10 pr-4 py-2.5 bg-white text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {availableCategories.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => pickCategory(key)}
                aria-pressed={category === key}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold font-body transition-colors ${
                  category === key
                    ? "bg-[#0b3149] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* Dropdowns + toggles */}
          <div className="flex flex-wrap items-center gap-3">
            {areas.length > 1 && (
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                aria-label="Filter by area"
                className="text-sm font-body border border-slate-300 rounded-full px-4 py-2 bg-white text-slate-700"
              >
                <option value="all">All areas</option>
                {areas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            )}

            {languages.length > 0 && (
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Filter by language spoken"
                className="text-sm font-body border border-slate-300 rounded-full px-4 py-2 bg-white text-slate-700"
              >
                <option value="all">Any language</option>
                {languages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            )}

            {TOGGLES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setToggles((t) => ({ ...t, [key]: !t[key] }))}
                aria-pressed={!!toggles[key]}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold font-body border transition-colors ${
                  toggles[key]
                    ? "bg-amber-100 border-amber-400 text-amber-900"
                    : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}

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
              Loading police stations...
            </p>
          )}

          {error && (
            <p className="text-rose-700 font-body">
              Couldn't load police stations ({error}). Please try again later.
            </p>
          )}

          {!loading && !error && (
            <>
              <p className="text-sm text-slate-500 font-body mb-5">
                {visible.length} {visible.length === 1 ? "place" : "places"}{" "}
                found
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
                      className="text-sm font-semibold text-[#0b3149] hover:text-slate-700 font-body"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                  {visible.map((p) => (
                    <StationCard key={p.id} p={p} now={now} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ================= Quick reference strip ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-12 sm:py-14 bg-slate-900">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="rt-card bg-slate-800 rounded-xl p-5 flex items-start gap-3">
                <span className="w-9 h-9 rounded-full bg-slate-500/20 text-slate-300 flex items-center justify-center shrink-0">
                  <Phone size={16} />
                </span>
                <div>
                  <p className="text-white font-semibold text-sm font-body">
                    Emergencies &amp; FIRs
                  </p>
                  <p className="text-slate-400 text-xs font-body mt-1 leading-relaxed">
                    Ratnagiri City Police Station is the main point of contact
                    for emergency calls and filing FIRs. Use the "Accepts FIRs"
                    filter to find others.
                  </p>
                </div>
              </div>
              <div className="rt-card bg-slate-800 rounded-xl p-5 flex items-start gap-3">
                <span className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                  <Wifi size={16} />
                </span>
                <div>
                  <p className="text-white font-semibold text-sm font-body">
                    Cyber Crime
                  </p>
                  <p className="text-slate-400 text-xs font-body mt-1 leading-relaxed">
                    Report online fraud, phishing or digital harassment at the
                    dedicated Cyber Police Station, or call 1930 for financial
                    cyber fraud.
                  </p>
                </div>
              </div>
              <div className="rt-card bg-slate-800 rounded-xl p-5 flex items-start gap-3">
                <span className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                  <Accessibility size={16} />
                </span>
                <div>
                  <p className="text-white font-semibold text-sm font-body">
                    Accessible Facilities
                  </p>
                  <p className="text-slate-400 text-xs font-body mt-1 leading-relaxed">
                    Use the "Wheelchair accessible" filter to find entrances,
                    parking and restrooms that are listed as accessible.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= Closing note ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-16 sm:py-20 bg-slate-50">
        <div className="max-w-[1680px] mx-auto text-center">
          <Reveal>
            <FileText className="mx-auto text-[#0b3149] mb-4" size={28} />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Know Where to Go
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-2xl mx-auto">
              Distances are straight-line estimates. Tap "Get Directions" for
              the actual route and travel time. Hours and services can change,
              so please call ahead to confirm. Some offices, such as the
              administration building, do not take everyday complaints.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}