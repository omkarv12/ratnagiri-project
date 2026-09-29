import { useEffect, useMemo, useRef, useState } from "react";
import * as ReactLeaflet from "react-leaflet";
import L from "leaflet";
import {
  X, Route as RouteIcon, Clock, Navigation,
  Printer, Trash2, Plus, ArrowUp, ArrowDown, Copy, Check,
  Car, Footprints, Bike,
} from "lucide-react";

const { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } = ReactLeaflet;

/* ==================================================================
   TripPlanner — a free, no-AI-key "plan my trip" tab.

   - Add stops from anywhere in the app via <AddToTripButton /> or
     `useTripPlanner().addStop(...)`
   - Reorder with up/down (no drag lib dependency)
   - "Optimise order" = nearest-neighbour heuristic (pure math, no API)
   - One OSRM call routes all stops together (multi-waypoint), giving a
     single polyline + total distance/duration.
   - Trip persists to localStorage so it survives a refresh.
================================================================== */

const TRIP_KEY = "rt_trip_planner_v1";
const PROFILES = [
  { id: "driving", label: "Drive", icon: Car },
  { id: "cycling", label: "Cycle", icon: Bike },
  { id: "walking", label: "Walk", icon: Footprints },
];

function loadTrip() {
  try {
    const raw = localStorage.getItem(TRIP_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveTrip(stops) {
  try {
    localStorage.setItem(TRIP_KEY, JSON.stringify(stops));
  } catch {
    /* private browsing / storage full — trip just won't persist */
  }
}

/* ---------- shared trip state (simple pub/sub, no context boilerplate) ---------- */
let _stops = loadTrip();
const _subs = new Set();
function _emit() {
  _subs.forEach((fn) => fn(_stops));
}
export function useTripPlanner() {
  const [stops, setStops] = useState(_stops);
  useEffect(() => {
    const fn = (s) => setStops(s);
    _subs.add(fn);
    // catch any change that happened between first render and subscribe
    setStops(_stops);
    return () => _subs.delete(fn);
  }, []);

  const addStop = (item) => {
    // item: { type, id, name, lat, lng }
    if (_stops.some((s) => s.type === item.type && s.id === item.id)) return;
    _stops = [..._stops, item];
    saveTrip(_stops);
    _emit();
  };
  const removeStop = (idx) => {
    _stops = _stops.filter((_, i) => i !== idx);
    saveTrip(_stops);
    _emit();
  };
  const moveStop = (idx, dir) => {
    const to = idx + dir;
    if (to < 0 || to >= _stops.length) return;
    const next = [..._stops];
    [next[idx], next[to]] = [next[to], next[idx]];
    _stops = next;
    saveTrip(_stops);
    _emit();
  };
  const reorderStops = (next) => {
    _stops = next;
    saveTrip(_stops);
    _emit();
  };
  const clearTrip = () => {
    _stops = [];
    saveTrip(_stops);
    _emit();
  };
  const isInTrip = (type, id) => stops.some((s) => s.type === type && s.id === id);

  return { stops, addStop, removeStop, moveStop, reorderStops, clearTrip, isInTrip };
}

/* ---------- pure-math helpers (no external calls) ---------- */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Nearest-neighbour heuristic TSP — good enough for <15 stops, pure math.
function nearestNeighbourOrder(start, stops) {
  const remaining = [...stops];
  const ordered = [];
  let current = start;
  while (remaining.length) {
    let bestIdx = 0;
    let bestDist = Infinity;
    remaining.forEach((s, i) => {
      const d = haversine(current.lat, current.lng, s.lat, s.lng);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    current = remaining.splice(bestIdx, 1)[0];
    ordered.push(current);
  }
  return ordered;
}

// One OSRM call, N waypoints -> one polyline + totals. Free, no key.
async function fetchMultiStopRoute(points, profile = "driving") {
  if (points.length < 2) return null;
  const coordStr = points.map((p) => `${p.lng},${p.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/${profile}/${coordStr}?overview=full&geometries=geojson&steps=false`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes[0]) {
      const route = data.routes[0];
      return {
        distanceKm: route.distance / 1000,
        durationMin: route.duration / 60,
        geometry: route.geometry,
        legs: route.legs.map((l) => ({ distanceKm: l.distance / 1000, durationMin: l.duration / 60 })),
      };
    }
    return null;
  } catch {
    return null;
  }
}

function fmtKm(km) {
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}
function fmtMin(min) {
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}h ${m}min`;
}

const CATEGORY_ICON = {
  village: "📍", homestay: "🏡", driver: "🛺", busstop: "🚌", eco: "🌿",
};

/* ---------- fit-bounds helper for the preview map ---------- */
function FitToStops({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 13);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [points, map]);
  return null;
}

function numberedIcon(n, color = "#B4532A") {
  return L.divIcon({
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:2px solid white;transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 5px rgba(0,0,0,.4);">
      <span style="transform:rotate(45deg);color:#fff;font-size:12px;font-weight:700;">${n}</span>
    </div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

/* ================================================================== */

export default function TripPlanner({ userLocation }) {
  const { stops, removeStop, moveStop, reorderStops, clearTrip } = useTripPlanner();
  const [profile, setProfile] = useState("driving");
  const [route, setRoute] = useState(null);
  const [routing, setRouting] = useState(false);
  const [routeError, setRouteError] = useState(false);
  const [startFromMe, setStartFromMe] = useState(false);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef(null);

  const orderedPoints = useMemo(() => {
    const pts = stops.map((s) => ({ ...s }));
    if (startFromMe && userLocation) {
      return [{ type: "you", id: "you", name: "Your location", lat: userLocation.lat, lng: userLocation.lng }, ...pts];
    }
    return pts;
  }, [stops, startFromMe, userLocation]);

  // Re-fetch the combined route whenever stops, order, profile or start point change.
  useEffect(() => {
    setRoute(null);
    setRouteError(false);
    if (orderedPoints.length < 2) {
      setRouting(false);
      return;
    }
    setRouting(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const r = await fetchMultiStopRoute(orderedPoints, profile);
      if (r) setRoute(r);
      else setRouteError(true);
      setRouting(false);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [orderedPoints, profile]);

  const handleOptimise = () => {
    if (stops.length < 2) return;
    const anchor = startFromMe && userLocation ? userLocation : stops[0];
    const rest = startFromMe && userLocation ? stops : stops.slice(1);
    const ordered = nearestNeighbourOrder(anchor, rest);
    reorderStops(startFromMe && userLocation ? ordered : [stops[0], ...ordered]);
  };

  const handlePrint = () => window.print();

  const handleShare = async () => {
    const text = orderedPoints
      .map((p, i) => `${i + 1}. ${p.name}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(`My Ratnagiri trip:\n${text}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  if (stops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-6">
        <span className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-3xl mb-4">🗺️</span>
        <h2 className="text-lg font-bold text-slate-800 mb-1">Your trip is empty</h2>
        <p className="text-sm text-slate-500 max-w-xs">
          Browse Places to Visit or Homestays and tap "Add to Trip" on anything
          you like. Come back here to order your stops and see the route.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold text-slate-800 border-l-4 border-orange-500 pl-3">Plan Your Trip</h2>
        <button
          onClick={clearTrip}
          className="text-xs font-medium text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors"
        >
          <Trash2 size={12} /> Clear
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-4 pl-3">
        {stops.length} {stops.length === 1 ? "stop" : "stops"} · routed with OpenStreetMap (free, no account needed)
      </p>

      {/* travel mode */}
      <div className="flex gap-2 mb-4">
        {PROFILES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setProfile(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              profile === id
                ? "bg-orange-600 text-white border-orange-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-orange-300"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {userLocation && (
        <label className="flex items-center gap-2 mb-4 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer">
          <input
            type="checkbox"
            checked={startFromMe}
            onChange={(e) => setStartFromMe(e.target.checked)}
            className="accent-orange-600"
          />
          Start the route from my current location
        </label>
      )}

      {/* route summary */}
      <div className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl p-4 text-white mb-4 shadow-sm">
        {routing && <p className="text-sm font-medium opacity-90">Calculating route…</p>}
        {!routing && routeError && (
          <p className="text-sm font-medium opacity-90">Couldn't calculate a route right now. Try again shortly.</p>
        )}
        {!routing && route && (
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <RouteIcon size={16} />
              <span className="font-bold text-sm">{fmtKm(route.distanceKm)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={16} />
              <span className="font-bold text-sm">{fmtMin(route.durationMin)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Navigation size={16} />
              <span className="font-bold text-sm">{orderedPoints.length} stops</span>
            </div>
          </div>
        )}
        {!routing && !route && !routeError && orderedPoints.length < 2 && (
          <p className="text-sm font-medium opacity-90">Add one more stop to see a route.</p>
        )}
      </div>

      {/* actions */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={handleOptimise}
          disabled={stops.length < 2}
          className="flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-full transition-colors"
        >
          <RouteIcon size={12} /> Optimise order
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
        >
          <Printer size={12} /> Print itinerary
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied!" : "Copy list"}
        </button>
      </div>

      {/* preview map — CHANGED: same Stadia Maps "outdoors" tile layer as the main map */}
      <div className="h-56 rounded-xl overflow-hidden border border-slate-200 mb-5">
        <MapContainer center={[17.7554, 73.1923]} zoom={11} className="w-full h-full" scrollWheelZoom={false}>
          <TileLayer
            url={`https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png?api_key=${import.meta.env.VITE_STADIA_KEY}`}
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={20}
          />
          <FitToStops points={orderedPoints} />
          {orderedPoints.map((p, i) => (
            <Marker key={`${p.type}-${p.id}`} position={[p.lat, p.lng]} icon={numberedIcon(i + 1, p.type === "you" ? "#2563eb" : "#B4532A")}>
              <Popup>{p.name}</Popup>
            </Marker>
          ))}
          {route && (
            <GeoJSON key={JSON.stringify(route.geometry)} data={route.geometry} style={{ color: "#B4532A", weight: 4, opacity: 0.85 }} />
          )}
        </MapContainer>
      </div>

      {/* itinerary list */}
      <div className="space-y-3">
        {orderedPoints.map((p, i) => {
          const isYou = p.type === "you";
          const leg = route?.legs?.[i - 1]; // distance/time from the previous stop
          const stopIdx = () => stops.findIndex((s) => s.type === p.type && s.id === p.id);
          return (
            <div
              key={`${p.type}-${p.id}`}
              className={`flex items-center gap-3 p-3 rounded-xl border shadow-sm ${
                isYou ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"
              }`}
            >
              <span
                className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  isYou ? "bg-blue-600" : "bg-orange-600"
                }`}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-slate-800 truncate flex items-center gap-1.5">
                  {!isYou && <span>{CATEGORY_ICON[p.type] || "📍"}</span>}
                  {p.name}
                </p>
                {leg && (
                  <p className="text-xs text-slate-500">
                    {fmtKm(leg.distanceKm)} · {fmtMin(leg.durationMin)} from previous stops
                  </p>
                )}
                {!leg && i === 0 && <p className="text-xs text-slate-400">Starting point</p>}
              </div>
              {!isYou && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveStop(stopIdx(), -1)}
                    disabled={i === (startFromMe && userLocation ? 1 : 0)}
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-500"
                    aria-label="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => moveStop(stopIdx(), 1)}
                    disabled={i === orderedPoints.length - 1}
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-500"
                    aria-label="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => removeStop(stopIdx())}
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                    aria-label="Remove stop"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==================================================================
   AddToTripButton — drop this next to "Show Route" on any card
   (village, homestay, driver, busstop). Self-contained toggle using
   the shared trip state, so no prop drilling is needed.
================================================================== */
export function AddToTripButton({ type, id, name, lat, lng, className = "" }) {
  const { addStop, removeStop, isInTrip, stops } = useTripPlanner();
  const inTrip = isInTrip(type, id);

  const handleClick = (e) => {
    e.stopPropagation();
    if (inTrip) {
      removeStop(stops.findIndex((s) => s.type === type && s.id === id));
    } else {
      addStop({ type, id, name, lat, lng });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`text-xs font-medium flex items-center gap-1 py-1 transition-colors ${
        inTrip ? "text-orange-700" : "text-slate-500 hover:text-orange-700"
      } ${className}`}
    >
      {inTrip ? <Check size={13} /> : <Plus size={13} />}
      {inTrip ? "Added to Trip" : "Add to Trip"}
    </button>
  );
}