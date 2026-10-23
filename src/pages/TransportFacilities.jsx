// src/pages/TransportFacilities.jsx  ->  route: /resources/transport-facilities
//
// Bus stands (with timetable + directions) and taxi / auto drivers (call + WhatsApp).
// Uses the data you already load in LocationsContext (/api/dashboard): busStops and drivers.
// Same look as Medical Facilities and Police Stations (Fraunces + Plus Jakarta Sans, navy hero).

import { useMemo, useState } from "react";
import {
  Bus, Car, Search, MapPin, Phone, MessageCircle, Clock, Navigation,
  LocateFixed, Loader2, SearchX, RefreshCw, ExternalLink,
} from "lucide-react";
import { useLocations } from "../context/LocationsContext";

/* Depot photos that already exist in /public/bus-stands (file extension per town) */
const DEPOT_PHOTOS = { chiplun: "jpg", dapoli: "png", devrukh: "jpg", guhagar: "jpg", khed: "png", mandangad: "jpg", rajapur: "jpg" };

const depotPhoto = (stop) => {
  const text = `${stop.name} ${stop.taluka}`.toLowerCase();
  const key = Object.keys(DEPOT_PHOTOS).find((k) => text.includes(k));
  return key ? `/bus-stands/${key}-depot.${DEPOT_PHOTOS[key]}` : null;
};

const known = (v) => v && String(v).trim() && !/^unknown$/i.test(String(v).trim());
const hasCoords = (x) => Number.isFinite(Number(x.lat)) && Number.isFinite(Number(x.lng)) && x.lat !== null && x.lng !== null;
const uniqueSorted = (arr) => [...new Set(arr.filter(known))].sort((a, b) => a.localeCompare(b));

const kmBetween = (a, b) => {
  const R = 6371, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const tenDigits = (phone) => {
  const first = String(phone || "").split(/[,/;]/)[0];
  const d = first.replace(/\D/g, "").slice(-10);
  return d.length === 10 ? d : null;
};

const directionsUrl = (x) =>
  x.googleMapsLink || (hasCoords(x) ? `https://www.google.com/maps/dir/?api=1&destination=${x.lat},${x.lng}` : null);

/* ---------- small pieces ---------- */
const Pill = ({ children }) => (
  <span className="inline-block rounded-full bg-[#e2f0ed] px-3 py-1 text-xs font-semibold text-[#0f766e]">{children}</span>
);

const ActionLink = ({ href, icon: Icon, children, solid }) => (
  <a
    href={href}
    target={href.startsWith("http") ? "_blank" : undefined}
    rel="noreferrer"
    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
      solid ? "bg-[#B4532A] text-white hover:bg-[#9c4522]" : "border border-[#0b3149]/25 text-[#0b3149] hover:bg-[#0b3149] hover:text-white"
    }`}
  >
    <Icon size={15} /> {children}
  </a>
);

function BusCard({ stop, km }) {
  const photo = depotPhoto(stop);
  const maps = directionsUrl(stop);
  return (
    <article className="rt-card overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {photo ? (
        <img src={photo} alt={`${stop.name} depot`} loading="lazy" className="h-44 w-full object-cover" />
      ) : (
        <div className="grid h-44 place-items-center bg-gradient-to-br from-[#0b3149] to-[#173b45] text-white/80">
          <Bus size={44} />
        </div>
      )}
      <div className="p-5">
        <h3 className="font-display text-xl text-[#0b3149]">{stop.name}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Pill>{known(stop.taluka) ? `${stop.taluka} taluka` : stop.district}</Pill>
          {km != null && <span className="text-xs font-semibold text-slate-500">{km.toFixed(1)} km away</span>}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {stop.timetableLink && <ActionLink href={stop.timetableLink} icon={Clock} solid>Timetable</ActionLink>}
          {maps && <ActionLink href={maps} icon={Navigation}>Directions</ActionLink>}
        </div>
      </div>
    </article>
  );
}

function DriverCard({ driver, km }) {
  const digits = tenDigits(driver.phone);
  const photos = known(driver.vehiclePhotos) && driver.vehiclePhotos !== "#" ? driver.vehiclePhotos : null;
  const rate = known(driver.rate) ? (/^\d+$/.test(String(driver.rate).trim()) ? `₹${driver.rate} per day` : driver.rate) : null;
  return (
    <article className="rt-card flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-[#0b3149] text-white"><Car size={20} /></span>
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-tight text-[#0b3149]">{driver.name}</h3>
          <p className="text-sm text-slate-600">
            {known(driver.vehicleType) ? driver.vehicleType : "Vehicle"}
            {known(driver.vehicleNumber) && <> · {driver.vehicleNumber}</>}
          </p>
        </div>
      </div>

      <dl className="mt-4 space-y-1.5 text-sm text-slate-700">
        {known(driver.village) && (
          <div className="flex gap-2"><MapPin size={15} className="mt-0.5 flex-none text-[#B4532A]" />
            <span>Based in {driver.village}{known(driver.taluka) && `, ${driver.taluka}`}{km != null && ` · ${km.toFixed(1)} km away`}</span></div>
        )}
        {known(driver.serviceArea) && <div className="flex gap-2"><Navigation size={15} className="mt-0.5 flex-none text-[#B4532A]" /><span>Serves {driver.serviceArea}</span></div>}
        {rate && <div className="font-semibold text-[#0f766e]">{rate}</div>}
      </dl>

      <div className="mt-5 flex flex-wrap gap-2 pt-1">
        {digits ? (
          <>
            <ActionLink href={`tel:+91${digits}`} icon={Phone} solid>Call</ActionLink>
            <ActionLink href={`https://wa.me/91${digits}`} icon={MessageCircle}>WhatsApp</ActionLink>
          </>
        ) : (
          <span className="text-sm text-slate-500">No phone number listed</span>
        )}
        {photos && <ActionLink href={photos} icon={ExternalLink}>Vehicle photos</ActionLink>}
      </div>
    </article>
  );
}

/* ---------- page ---------- */
export default function TransportFacilities() {
  const { busStops = [], drivers = [], loading, error, reload } = useLocations();
  const [tab, setTab] = useState("bus");
  const [query, setQuery] = useState("");
  const [taluka, setTaluka] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [pos, setPos] = useState(null);
  const [geo, setGeo] = useState("idle"); // idle | loading | denied

  const findMe = () => {
    if (!("geolocation" in navigator)) return setGeo("denied");
    setGeo("loading");
    navigator.geolocation.getCurrentPosition(
      (p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setGeo("idle"); },
      () => setGeo("denied"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const list = tab === "bus" ? busStops : drivers;
  const talukas = useMemo(() => uniqueSorted(list.map((x) => x.taluka)), [list]);
  const vehicles = useMemo(() => uniqueSorted(drivers.map((d) => d.vehicleType)), [drivers]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list
      .filter((x) => !taluka || x.taluka === taluka)
      .filter((x) => tab !== "taxi" || !vehicle || x.vehicleType === vehicle)
      .filter((x) => !q || [x.name, x.village, x.taluka, x.serviceArea, x.vehicleType].some((v) => String(v || "").toLowerCase().includes(q)))
      .map((x) => ({ item: x, km: pos && hasCoords(x) ? kmBetween(pos, { lat: Number(x.lat), lng: Number(x.lng) }) : null }))
      .sort((a, b) => (a.km != null && b.km != null ? a.km - b.km : a.km != null ? -1 : b.km != null ? 1 : String(a.item.name).localeCompare(String(b.item.name))));
  }, [list, tab, query, taluka, vehicle, pos]);

  const switchTab = (t) => { setTab(t); setTaluka(""); setVehicle(""); setQuery(""); };

  const tabBtn = (key, label, Icon, count) => (
    <button
      onClick={() => switchTab(key)}
      aria-pressed={tab === key}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
        tab === key ? "bg-[#0b3149] text-white" : "bg-white text-[#0b3149] border border-[#0b3149]/20 hover:border-[#0b3149]"
      }`}
    >
      <Icon size={16} /> {label} <span className={tab === key ? "text-white/70" : "text-slate-500"}>{count}</span>
    </button>
  );

  const selectCls = "rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#0b3149] focus:outline-none focus:ring-2 focus:ring-[#0f766e]";

  return (
    <div className="animate-in fade-in bg-white duration-500">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .tf .font-display { font-family: 'Fraunces', Georgia, serif; }
        .tf { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .tf .rt-card { box-shadow: 0 10px 28px -14px rgba(15,23,42,.18); transition: transform .3s ease, box-shadow .3s ease; }
        .tf .rt-card:hover { transform: translateY(-4px); box-shadow: 0 24px 46px -18px rgba(11,49,73,.35); }
        @media (prefers-reduced-motion: reduce) { .tf .rt-card, .tf .rt-card:hover { transition: none; transform: none; } }
      `}</style>

      <div className="tf">
        {/* hero */}
        <section className="bg-gradient-to-br from-[#0b3149] to-slate-900 px-5 py-16 sm:px-10 sm:py-20 lg:px-16">
          <div className="mx-auto max-w-[1680px]">
            <p className="mb-3 text-xs font-semibold text-white/80">Resources · Transport Facilities</p>
            <h1 className="font-display mb-3 text-4xl text-white sm:text-5xl lg:text-6xl">Getting around Ratnagiri</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
              Find your nearest bus stand with its timetable, or call a local taxi or auto driver directly.
            </p>
          </div>
        </section>

        <section className="px-5 py-8 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-[1680px]">
            {/* tabs + filters */}
            <div className="flex flex-wrap items-center gap-3">
              {tabBtn("bus", "Bus stands", Bus, busStops.length)}
              {tabBtn("taxi", "Taxi and auto", Car, drivers.length)}
              <button
                onClick={findMe}
                className="ml-auto inline-flex items-center gap-2 rounded-full border border-[#0f766e] px-4 py-2.5 text-sm font-semibold text-[#0f766e] hover:bg-[#0f766e] hover:text-white transition-colors"
              >
                {geo === "loading" ? <Loader2 size={15} className="animate-spin" /> : <LocateFixed size={15} />}
                {pos ? "Sorted by nearest" : "Show nearest first"}
              </button>
            </div>
            {geo === "denied" && <p className="mt-3 text-sm text-amber-700">Location is blocked. Allow location access in your browser to sort by distance.</p>}

            <div className="mt-5 flex flex-wrap gap-3">
              <label className="relative min-w-[220px] flex-1 sm:max-w-sm">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tab === "bus" ? "Search bus stands" : "Search by name, village or area"}
                  className="w-full rounded-full border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                />
              </label>
              <select value={taluka} onChange={(e) => setTaluka(e.target.value)} className={selectCls} aria-label="Filter by taluka">
                <option value="">All talukas</option>
                {talukas.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {tab === "taxi" && (
                <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} className={selectCls} aria-label="Filter by vehicle type">
                  <option value="">All vehicles</option>
                  {vehicles.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              )}
            </div>

            {/* results */}
            <div className="mt-8">
              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
                  {[0, 1, 2, 3].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-100" />)}
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
                  <p className="font-semibold">Could not load transport data ({error}).</p>
                  <button onClick={reload} className="mt-3 inline-flex items-center gap-2 rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800">
                    <RefreshCw size={14} /> Try again
                  </button>
                </div>
              ) : rows.length === 0 ? (
                <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-600">
                  <SearchX size={32} />
                  <p className="font-semibold text-[#0b3149]">Nothing matches your filters.</p>
                  <button onClick={() => { setQuery(""); setTaluka(""); setVehicle(""); }} className="text-sm font-semibold text-[#B4532A] underline">Clear filters</button>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-sm text-slate-600">
                    {rows.length} {tab === "bus" ? (rows.length === 1 ? "bus stand" : "bus stands") : (rows.length === 1 ? "driver" : "drivers")} found
                  </p>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {rows.map(({ item, km }) =>
                      tab === "bus"
                        ? <BusCard key={item.id} stop={item} km={km} />
                        : <DriverCard key={item.id} driver={item} km={km} />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}