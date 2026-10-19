import { useState, useEffect, useMemo, useRef } from "react";
import {
  Stethoscope,
  FlaskConical,
  Pill,
  MapPin,
  Clock,
  Accessibility,
  Calendar,
  ExternalLink,
  HeartPulse,
  Building2,
  Navigation,
  Phone,
  Ambulance,
  Truck,
  LocateFixed,
  Loader2,
  SearchX,
  Search,
  DoorOpen,
  ShieldCheck,
  Heart,
  Droplets,
  Globe,
  MessageCircle,
  User,
  Languages,
  IndianRupee,
  Star,
  ChevronDown,
  X,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

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
  { key: "all", label: "All", icon: HeartPulse },
  { key: "hospital", label: "Hospitals", icon: Building2 },
  { key: "clinic", label: "Clinics", icon: Stethoscope },
  { key: "diagnostic", label: "Diagnostics", icon: FlaskConical },
  { key: "pharmacy", label: "Pharmacies", icon: Pill },
  { key: "blood_bank", label: "Blood banks", icon: Droplets },
  { key: "ambulance", label: "Ambulance", icon: Ambulance },
];

const CATEGORY_LABEL = {
  hospital: "Hospital",
  clinic: "Clinic",
  diagnostic: "Diagnostic",
  pharmacy: "Pharmacy",
  blood_bank: "Blood bank",
  ambulance: "Ambulance",
};

const CATEGORY_STYLE = {
  hospital: "bg-rose-50 text-rose-700",
  clinic: "bg-teal-50 text-teal-700",
  diagnostic: "bg-amber-50 text-amber-700",
  pharmacy: "bg-sky-50 text-sky-700",
  blood_bank: "bg-red-50 text-red-700",
  ambulance: "bg-orange-50 text-orange-700",
};

const OWNERSHIP_LABEL = {
  government: "Government",
  private: "Private",
  charitable: "Charitable",
  trust: "Trust",
};

// Each toggle filters on a boolean field of the facility (openNow is computed here).
const TOGGLES = [
  { key: "openNow", label: "Open now", icon: DoorOpen },
  { key: "is_24x7", label: "Open 24 hours", icon: Clock },
  { key: "emergency_available", label: "Emergency", icon: Ambulance },
  { key: "wheelchair_accessible", label: "Wheelchair accessible", icon: Accessibility },
  { key: "home_service", label: "Home delivery / visit", icon: Truck },
  { key: "cashless_insurance", label: "Cashless insurance", icon: ShieldCheck },
  { key: "is_free", label: "Free care", icon: Heart },
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
function isOpenNow(f, now) {
  const hours = f.hours || [];
  if (hours.length === 0) return f.is_24x7 ? true : null;
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

function formatFee(min, max) {
  if (min == null && max == null) return null;
  if (min != null && max != null && min !== max) return `₹${min} – ₹${max}`;
  return `₹${min ?? max}`;
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
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-800",
    rose: "bg-rose-50 text-rose-700",
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

/* ---- Facility card --------------------------------------------------- */
function FacilityCard({ f, now, highlight = false }) {
  const fee = formatFee(f.consultation_fee_min, f.consultation_fee_max);
  const services = f.services || [];
  const doctors = f.doctors || [];
  const hours = f.hours || [];
  const hasDetails = services.length > 0 || doctors.length > 0 || hours.length > 0;

  const badges = [
    f.is_24x7 && ["24 hours", Clock],
    f.emergency_available && ["Emergency", Ambulance],
    f.ambulance_available && ["Ambulance", Ambulance],
    f.icu_available && ["ICU", HeartPulse],
    f.wheelchair_accessible && ["Wheelchair accessible", Accessibility],
    f.home_service && ["Home service", Truck],
    f.appointment_required && ["Appointment needed", Calendar],
    f.walk_in_allowed && !f.appointment_required && ["Walk-ins welcome", DoorOpen],
    f.is_free && ["Free care", Heart],
  ].filter(Boolean);

  const payments = [
    f.accepts_upi && "UPI",
    f.accepts_cards && "Cards",
    f.cashless_insurance && "Cashless insurance",
    ...(f.govt_schemes || []),
  ].filter(Boolean);

  const waDigits = f.whatsapp ? f.whatsapp.replace(/\D/g, "") : null;

  return (
    <div
      className={`rt-card bg-white rounded-xl p-6 flex flex-col h-full ${
        highlight ? "ring-2 ring-teal-500" : ""
      }`}
    >
      {/* Top row: type + distance */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span
          className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full font-body ${
            CATEGORY_STYLE[f.category] || "bg-slate-100 text-slate-600"
          }`}
        >
          {CATEGORY_LABEL[f.category] || f.category}
          {f.specialty && f.specialty !== "General" && f.specialty !== "Pharmacy"
            ? ` · ${f.specialty}`
            : ""}
        </span>
        {f.distanceKm != null && (
          <span className="text-xs font-semibold text-teal-700 font-body whitespace-nowrap">
            {formatKm(f.distanceKm)}
          </span>
        )}
      </div>

      <h3 className="font-semibold text-slate-800 mb-1 font-body leading-snug">
        {f.name}
      </h3>

      {/* Ownership, open status, rating */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
        {f.ownership && (
          <span className="text-[11px] text-slate-500 font-body">
            {OWNERSHIP_LABEL[f.ownership] || f.ownership}
          </span>
        )}
        {f.openNow === true && (
          <span className="text-[11px] font-bold text-emerald-700 font-body">
            ● Open now
          </span>
        )}
        {f.openNow === false && (
          <span className="text-[11px] font-bold text-rose-700 font-body">
            ● Closed now
          </span>
        )}
        {f.rating_avg != null && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 font-body">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            {f.rating_avg.toFixed(1)}
            {f.rating_count ? ` (${f.rating_count})` : ""}
          </span>
        )}
      </div>

      {(f.address || f.landmark) && (
        <p className="text-xs text-slate-500 font-body mb-2 flex items-start gap-1.5">
          <MapPin size={12} className="mt-0.5 shrink-0" />
          <span>
            {f.address}
            {f.landmark ? ` (${f.landmark})` : ""}
          </span>
        </p>
      )}

      {f.description && (
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-body mb-3">
          {f.description}
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

      {(f.features || []).length > 0 && (
        <ul className="space-y-2 mb-4">
          {f.features.map((point, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 font-body leading-relaxed"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
              {point}
            </li>
          ))}
        </ul>
      )}

      {/* Cost, payments, languages */}
      {(fee || payments.length > 0 || (f.languages || []).length > 0) && (
        <div className="space-y-2 mb-4">
          {fee && (
            <p className="flex items-center gap-1.5 text-xs text-slate-600 font-body">
              <IndianRupee size={12} className="text-slate-400" />
              Consultation: <span className="font-semibold">{fee}</span>
            </p>
          )}
          {payments.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {payments.map((p) => (
                <Pill_ key={p} tone="teal">
                  {p}
                </Pill_>
              ))}
            </div>
          )}
          {(f.languages || []).length > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-slate-600 font-body">
              <Languages size={12} className="text-slate-400" />
              {f.languages.join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Expandable details */}
      {hasDetails && (
        <details className="group border-t border-slate-100 pt-3 mb-4">
          <summary className="flex items-center justify-between cursor-pointer text-xs font-semibold text-teal-700 font-body list-none">
            Hours, services &amp; doctors
            <ChevronDown
              size={14}
              className="transition-transform group-open:rotate-180"
            />
          </summary>

          <div className="mt-3">
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
              <DetailSection title="Services" icon={Stethoscope}>
                <div className="flex flex-wrap gap-1.5">
                  {services.map((s) => (
                    <Pill_ key={s.name}>{s.name}</Pill_>
                  ))}
                </div>
              </DetailSection>
            )}

            {doctors.length > 0 && (
              <DetailSection title="Doctors" icon={User}>
                <ul className="space-y-2.5">
                  {doctors.map((d) => (
                    <li key={d.name} className="text-xs font-body text-slate-600">
                      <p className="font-semibold text-slate-800">{d.name}</p>
                      <p>
                        {[d.qualification, d.specialization]
                          .filter(Boolean)
                          .join(" · ")}
                        {d.experience_years ? ` · ${d.experience_years} yrs` : ""}
                      </p>
                      {(d.available_days?.length > 0 || d.timing) && (
                        <p className="text-slate-500">
                          {(d.available_days || []).map((n) => DAYS[n]).join(", ")}
                          {d.timing ? ` · ${d.timing}` : ""}
                        </p>
                      )}
                      {d.fee != null && (
                        <p className="text-slate-500">Fee ₹{d.fee}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}
          </div>
        </details>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-auto">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 px-3 py-1.5 rounded-full transition-colors"
        >
          <Navigation size={13} />
          Get Directions
        </a>
        {f.phone && (
          <a
            href={`tel:${f.phone}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            <Phone size={12} />
            {f.phone}
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
        {f.website && (
          <a
            href={f.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            <Globe size={12} />
            Website
          </a>
        )}
        {f.map_url && (
          <a
            href={f.map_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
          >
            View on Map
            <ExternalLink size={11} />
          </a>
        )}
      </div>

      <p className="text-[11px] text-slate-400 font-body mt-3">
        {f.is_verified && f.last_verified
          ? `Verified ${formatDate(f.last_verified)}`
          : "Details not yet verified. Please call ahead."}
      </p>
    </div>
  );
}

/* ---- Page ------------------------------------------------------------ */
export default function MedicalFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 'idle' | 'loading' | 'granted' | 'denied' | 'unsupported'
  const [geoStatus, setGeoStatus] = useState("idle");
  const [position, setPosition] = useState(null);

  const [category, setCategory] = useState("all");
  const [specialty, setSpecialty] = useState("all");
  const [language, setLanguage] = useState("all");
  const [search, setSearch] = useState("");
  const [toggles, setToggles] = useState({});

  // Re-check "open now" once a minute
  const [now, setNow] = useState(nowInIST);
  useEffect(() => {
    const id = setInterval(() => setNow(nowInIST()), 60000);
    return () => clearInterval(id);
  }, []);

  // Load facilities from the API
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/medical-facilities`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setFacilities(data);
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

  // Add distance and open-now to every facility
  const enriched = useMemo(
    () =>
      facilities.map((f) => ({
        ...f,
        distanceKm: position
          ? haversineKm(position.lat, position.lng, f.lat, f.lng)
          : null,
        openNow: isOpenNow(f, now),
      })),
    [facilities, position, now]
  );

  const availableCategories = useMemo(() => {
    const present = new Set(facilities.map((f) => f.category));
    return CATEGORIES.filter((c) => c.key === "all" || present.has(c.key));
  }, [facilities]);

  const specialties = useMemo(() => {
    const set = new Set(
      enriched
        .filter((f) => category === "all" || f.category === category)
        .map((f) => f.specialty)
    );
    return Array.from(set).sort();
  }, [enriched, category]);

  const languages = useMemo(() => {
    const set = new Set(enriched.flatMap((f) => f.languages || []));
    return Array.from(set).sort();
  }, [enriched]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = enriched.filter((f) => {
      if (category !== "all" && f.category !== category) return false;
      if (specialty !== "all" && f.specialty !== specialty) return false;
      if (language !== "all" && !(f.languages || []).includes(language)) return false;
      if (!Object.entries(toggles).every(([key, on]) => !on || f[key] === true))
        return false;
      if (q) {
        const haystack = [
          f.name,
          f.specialty,
          f.area,
          f.address,
          f.landmark,
          ...(f.services || []).map((s) => s.name),
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
  }, [enriched, category, specialty, language, toggles, search, position]);

  const nearest = position && visible.length > 0 ? visible[0] : null;
  const filtersActive =
    category !== "all" ||
    specialty !== "all" ||
    language !== "all" ||
    search.trim() !== "" ||
    Object.values(toggles).some(Boolean);

  const clearFilters = () => {
    setCategory("all");
    setSpecialty("all");
    setLanguage("all");
    setSearch("");
    setToggles({});
  };

  const pickCategory = (key) => {
    setCategory(key);
    setSpecialty("all");
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
        .rt-card:hover { transform: translateY(-4px); box-shadow: 0 26px 50px -18px rgba(15,118,110,0.3); }
        details > summary::-webkit-details-marker { display: none; }
        @media (prefers-reduced-motion: reduce) { .rt-card, .rt-card:hover { transition: none; transform: none; } }
      `}</style>

      {/* ================= Hero ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 to-teal-900 px-5 sm:px-10 lg:px-16 py-16 sm:py-20">
        <div className="relative max-w-[1680px] mx-auto">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] text-white/80 mb-3 font-body">
            Resources &middot; Medical Facilities
          </p>
          <h1 className="font-display text-white text-4xl sm:text-5xl lg:text-6xl mb-3">
            Medical Facilities in Ratnagiri
          </h1>
          <p className="text-white/85 text-sm sm:text-base max-w-2xl font-body leading-relaxed">
            Hospitals, clinics, diagnostic centres and pharmacies, sorted by
            how close they are to you.
          </p>
        </div>
      </section>

      {/* ================= Emergency strip ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-4 bg-rose-600">
        <div className="max-w-[1680px] mx-auto flex flex-wrap items-center gap-x-6 gap-y-2 text-white font-body">
          <span className="flex items-center gap-2 text-sm font-bold">
            <Ambulance size={18} />
            In an emergency, call now
          </span>
          <a
            href="tel:108"
            className="text-sm font-semibold bg-white text-rose-700 px-4 py-1.5 rounded-full hover:bg-rose-50 transition-colors"
          >
            108 &middot; Ambulance
          </a>
          <a
            href="tel:112"
            className="text-sm font-semibold bg-white text-rose-700 px-4 py-1.5 rounded-full hover:bg-rose-50 transition-colors"
          >
            112 &middot; All emergencies
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
            <p className="flex items-center gap-2 text-sm text-teal-700 font-semibold font-body">
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
                  className="text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 px-3 py-1.5 rounded-full"
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
              <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
                <LocateFixed size={16} />
                Nearest to you
              </div>
              <div className="max-w-xl">
                <FacilityCard f={nearest} now={now} highlight />
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
              aria-label="Search medical facilities"
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
                    ? "bg-teal-700 text-white"
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
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              aria-label="Filter by specialty"
              className="text-sm font-body border border-slate-300 rounded-full px-4 py-2 bg-white text-slate-700"
            >
              <option value="all">All specialties</option>
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

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
              Loading facilities...
            </p>
          )}

          {error && (
            <p className="text-rose-700 font-body">
              Couldn't load medical facilities ({error}). Please try again
              later.
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
                      className="text-sm font-semibold text-teal-700 hover:text-teal-800 font-body"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                  {visible.map((f) => (
                    <FacilityCard key={f.id} f={f} now={now} />
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
                <span className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                  <Clock size={16} />
                </span>
                <div>
                  <p className="text-white font-semibold text-sm font-body">
                    Open now
                  </p>
                  <p className="text-slate-400 text-xs font-body mt-1 leading-relaxed">
                    Use the "Open now" or "Open 24 hours" filters to find
                    places that are open at this moment.
                  </p>
                </div>
              </div>
              <div className="rt-card bg-slate-800 rounded-xl p-5 flex items-start gap-3">
                <span className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </span>
                <div>
                  <p className="text-white font-semibold text-sm font-body">
                    Payments &amp; insurance
                  </p>
                  <p className="text-slate-400 text-xs font-body mt-1 leading-relaxed">
                    Filter for cashless insurance or free care, and check
                    each card for UPI and card acceptance.
                  </p>
                </div>
              </div>
              <div className="rt-card bg-slate-800 rounded-xl p-5 flex items-start gap-3">
                <span className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                  <Calendar size={16} />
                </span>
                <div>
                  <p className="text-white font-semibold text-sm font-body">
                    Plan Ahead
                  </p>
                  <p className="text-slate-400 text-xs font-body mt-1 leading-relaxed">
                    Some specialist clinics need appointments booked in
                    advance. Look for the "Appointment needed" tag.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= Closing note ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-16 sm:py-20 bg-teal-50/50">
        <div className="max-w-[1680px] mx-auto text-center">
          <Reveal>
            <HeartPulse className="mx-auto text-teal-700 mb-4" size={28} />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Healthcare Support Wherever You're Staying
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-2xl mx-auto">
              Distances are straight-line estimates. Tap "Get Directions" for
              the actual route and travel time. Hours and services can
              change, so please call ahead to confirm.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}