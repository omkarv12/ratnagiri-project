import { useEffect, useMemo, useState } from "react";
import * as ReactLeaflet from "react-leaflet";
import L from "leaflet";
import {
  X, Route as RouteIcon, Clock, Plus, Check, Copy, Download, Map as MapIcon,
  Share2, Wand2, GripVertical, ChevronDown, ChevronUp, Undo2, AlertTriangle,
  IndianRupee, ArrowUp, ArrowDown, Link2,
} from "lucide-react";

const { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } = ReactLeaflet;

/* ==================================================================
   TripPlanner v2

   Exports are unchanged (default TripPlanner, AddToTripButton,
   useTripPlanner) so SustainabilityMap.jsx keeps working as-is.

   Features
   1. Day-wise split (Day 1, Day 2 ...)
   2. Time spent per stop + arrival times + estimated end of day
   3. Short note per stop
   4. Undo after removing a stop
   5. Drag & drop reorder (drag the grip handle, works on touch)
   6. Named trips, saved on the device
   7. Share link that opens the same trip on another phone
      (trip is packed inside the link itself - no backend needed)
   8. Opening hours + entry fee warnings (pass openTime / closeTime / fee
      to <AddToTripButton />; without them nothing is shown)
================================================================== */

const STORE_KEY = "rt_trips_v2";
const OLD_KEY = "rt_trip_planner_v1";
const MAX_DAYS = 7;
const DAY_COLORS = ["#B4532A", "#2563eb", "#16a34a", "#9333ea", "#db2777", "#0891b2", "#ca8a04"];
const DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240, 360];

/* ---------------------------------------------------------------
   small helpers
--------------------------------------------------------------- */
const uid = () => Math.random().toString(36).slice(2, 9);
const keyOf = (s) => `${s.type}:${s.id}`;

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const fmtKm = (km) => (km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`);
const fmtMin = (min) => {
  if (min < 60) return `${Math.round(min)} min`;
  return `${Math.floor(min / 60)}h ${Math.round(min % 60)}min`;
};
const fmtDur = (mins) => {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

// Accepts "09:00", "9:30 AM", "17:30", or minutes as a number.
function parseTime(v) {
  if (v == null || v === "") return null;
  if (typeof v === "number") return v;
  const m = String(v).trim().match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*(am|pm)?$/i);
  if (!m) return null;
  let h = +m[1];
  const mi = +(m[2] || 0);
  const ap = m[3] && m[3].toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  if (h > 24 || mi > 59) return null;
  return h * 60 + mi;
}
function fmtClock(min) {
  const m = Math.round(min) % 1440;
  const h = Math.floor(m / 60);
  const mi = m % 60;
  return `${h % 12 || 12}:${String(mi).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function fmtFee(fee) {
  if (fee == null || fee === "") return null;
  if (/^\d+(\.\d+)?$/.test(String(fee).trim())) return Number(fee) === 0 ? "Free entry" : `₹${fee}`;
  return String(fee);
}
const numericFee = (fee) => (/^\d+(\.\d+)?$/.test(String(fee ?? "").trim()) ? Number(fee) : 0);

const escapeHtml = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const googleMapsUrl = (points) =>
  `https://www.google.com/maps/dir/${points.map((p) => `${p.lat},${p.lng}`).join("/")}`;

const CATEGORY_ICON = { village: "📍", homestay: "🏡", driver: "🛺", busstop: "🚌", eco: "🌿" };

/* ---------------------------------------------------------------
   trip store (module level, shared by every button + the tab)
--------------------------------------------------------------- */
const newTrip = (name) => ({ id: uid(), name, numDays: 1, startTime: "09:00", stops: [] });

function normStop(s, numDays = 1) {
  return {
    note: "",
    ...s,
    day: Math.min(Math.max(Number(s.day) || 1, 1), numDays),
    mins: Number(s.mins) || 60,
  };
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d.trips && d.trips.length) {
        d.trips = d.trips.map((t) => ({ ...t, stops: (t.stops || []).map((s) => normStop(s, t.numDays || 1)) }));
        if (!d.trips.find((t) => t.id === d.activeId)) d.activeId = d.trips[0].id;
        return d;
      }
    }
    // migrate the old single-trip format
    const t = newTrip("My trip");
    const old = localStorage.getItem(OLD_KEY);
    if (old) t.stops = JSON.parse(old).map((s) => normStop(s));
    return { trips: [t], activeId: t.id };
  } catch {
    const t = newTrip("My trip");
    return { trips: [t], activeId: t.id };
  }
}

let _store = loadStore();
let _undo = null; // { stop, index, tripId }
const _subs = new Set();
const _emit = () => _subs.forEach((fn) => fn());

function setStore(next) {
  _store = next;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(_store));
  } catch {
    /* storage unavailable - trip just won't survive a refresh */
  }
  _emit();
}
const activeTrip = () => _store.trips.find((t) => t.id === _store.activeId) || _store.trips[0];
function updateActive(fn) {
  const id = activeTrip().id;
  setStore({ ..._store, trips: _store.trips.map((t) => (t.id === id ? fn(t) : t)) });
}

/* ---------- share link: the trip is packed into the URL ---------- */
function b64enc(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64dec(str) {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(s + "=".repeat((4 - (s.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}
function buildShareUrl(trip) {
  const payload = {
    n: trip.name,
    d: trip.numDays,
    t: trip.startTime,
    s: trip.stops.map((s) => [s.type, s.id, s.name, s.lat, s.lng, s.day, s.mins, s.note || "", s.openTime || "", s.closeTime || "", s.fee ?? ""]),
  };
  const base = window.location.origin + window.location.pathname;
  return `${base}?trip=${b64enc(JSON.stringify(payload))}`;
}

const actions = {
  addStop(item) {
    const t = activeTrip();
    if (t.stops.some((s) => s.type === item.type && s.id === item.id)) return;
    updateActive((tr) => ({ ...tr, stops: [...tr.stops, normStop({ ...item, day: tr.numDays }, tr.numDays)] }));
  },
  removeStop(idx) {
    const t = activeTrip();
    const stop = t.stops[idx];
    if (!stop) return;
    _undo = { stop, index: idx, tripId: t.id };
    updateActive((tr) => ({ ...tr, stops: tr.stops.filter((_, i) => i !== idx) }));
  },
  undoRemove() {
    if (!_undo) return;
    const u = _undo;
    _undo = null;
    setStore({
      ..._store,
      trips: _store.trips.map((t) => {
        if (t.id !== u.tripId || t.stops.some((s) => keyOf(s) === keyOf(u.stop))) return t;
        const next = [...t.stops];
        next.splice(Math.min(u.index, next.length), 0, u.stop);
        return { ...t, stops: next };
      }),
    });
  },
  clearUndo() {
    if (_undo) {
      _undo = null;
      _emit();
    }
  },
  moveStop(idx, dir) {
    const to = idx + dir;
    updateActive((tr) => {
      if (to < 0 || to >= tr.stops.length) return tr;
      const next = [...tr.stops];
      [next[idx], next[to]] = [next[to], next[idx]];
      return { ...tr, stops: next };
    });
  },
  // move a stop up/down but only among the stops of its own day
  nudgeStop(key, dir) {
    updateActive((tr) => {
      const i = tr.stops.findIndex((s) => keyOf(s) === key);
      if (i < 0) return tr;
      const day = tr.stops[i].day;
      let j = i + dir;
      while (j >= 0 && j < tr.stops.length && tr.stops[j].day !== day) j += dir;
      if (j < 0 || j >= tr.stops.length) return tr;
      const next = [...tr.stops];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...tr, stops: next };
    });
  },
  // drag & drop: put `fromKey` where `toKey` is (same day only)
  moveStopTo(fromKey, toKey) {
    updateActive((tr) => {
      const from = tr.stops.findIndex((s) => keyOf(s) === fromKey);
      const to = tr.stops.findIndex((s) => keyOf(s) === toKey);
      if (from < 0 || to < 0 || from === to || tr.stops[from].day !== tr.stops[to].day) return tr;
      const next = [...tr.stops];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return { ...tr, stops: next };
    });
  },
  reorderStops(next) {
    updateActive((tr) => ({ ...tr, stops: next }));
  },
  clearTrip() {
    updateActive((tr) => ({ ...tr, stops: [] }));
  },
  updateStop(key, patch) {
    updateActive((tr) => ({ ...tr, stops: tr.stops.map((s) => (keyOf(s) === key ? { ...s, ...patch } : s)) }));
  },
  setNumDays(n) {
    const v = Math.min(Math.max(n, 1), MAX_DAYS);
    updateActive((tr) => ({
      ...tr,
      numDays: v,
      stops: tr.stops.map((s) => (s.day > v ? { ...s, day: v } : s)),
    }));
  },
  setStartTime(v) {
    updateActive((tr) => ({ ...tr, startTime: v || "09:00" }));
  },
  createTrip(name) {
    const t = newTrip(name || `Trip ${_store.trips.length + 1}`);
    setStore({ trips: [..._store.trips, t], activeId: t.id });
  },
  renameTrip(name) {
    if (!name || !name.trim()) return;
    updateActive((tr) => ({ ...tr, name: name.trim().slice(0, 40) }));
  },
  deleteTrip() {
    const id = activeTrip().id;
    let trips = _store.trips.filter((t) => t.id !== id);
    if (!trips.length) trips = [newTrip("My trip")];
    setStore({ trips, activeId: trips[0].id });
  },
  switchTrip(id) {
    if (_store.trips.some((t) => t.id === id)) setStore({ ..._store, activeId: id });
  },
};

export function useTripPlanner() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick((n) => n + 1);
    _subs.add(fn);
    fn(); // catch any change between first render and subscribe
    return () => _subs.delete(fn);
  }, []);

  const trip = activeTrip();
  const stops = trip.stops;
  return {
    stops,
    trip,
    trips: _store.trips,
    lastRemoved: _undo && _undo.tripId === trip.id ? _undo.stop : null,
    ...actions,
    isInTrip: (type, id) => stops.some((s) => s.type === type && s.id === id),
  };
}

/* ---------- open a trip that arrived through a share link ---------- */
export let hasSharedTripOnLoad = false;
(function importSharedTrip() {
  try {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("trip");
    if (!raw) return;
    const d = JSON.parse(b64dec(raw));
    const numDays = Math.min(Math.max(Number(d.d) || 1, 1), MAX_DAYS);
    const t = {
      id: uid(),
      name: `Shared: ${String(d.n || "trip").slice(0, 30)}`,
      numDays,
      startTime: String(d.t || "09:00").slice(0, 5),
      stops: (Array.isArray(d.s) ? d.s : []).slice(0, 40).map((a) =>
        normStop(
          {
            type: String(a[0]),
            id: a[1],
            name: String(a[2]).slice(0, 80),
            lat: Number(a[3]),
            lng: Number(a[4]),
            day: a[5],
            mins: a[6],
            note: String(a[7] || "").slice(0, 80),
            openTime: a[8] || undefined,
            closeTime: a[9] || undefined,
            fee: a[10] === "" ? undefined : a[10],
          },
          numDays
        )
      ).filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng)),
    };
    if (t.stops.length) {
      setStore({ trips: [..._store.trips, t], activeId: t.id });
      hasSharedTripOnLoad = true;
    }
    params.delete("trip");
    const qs = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash);
  } catch {
    /* bad link - ignore */
  }
})();

/* ---------------------------------------------------------------
   routing + scheduling
--------------------------------------------------------------- */
function nearestNeighbourOrder(start, stops) {
  const remaining = [...stops];
  const ordered = [];
  let current = start;
  while (remaining.length) {
    let best = 0;
    let bestD = Infinity;
    remaining.forEach((s, i) => {
      const dist = haversine(current.lat, current.lng, s.lat, s.lng);
      if (dist < bestD) {
        bestD = dist;
        best = i;
      }
    });
    current = remaining.splice(best, 1)[0];
    ordered.push(current);
  }
  return ordered;
}

async function fetchDrivingRoute(points) {
  if (points.length < 2) return null;
  const coordStr = points.map((p) => `${p.lng},${p.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson&steps=false`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const r = data.routes && data.routes[0];
    if (!r) return null;
    return {
      distanceKm: r.distance / 1000,
      durationMin: r.duration / 60,
      geometry: r.geometry,
      legs: r.legs.map((l) => ({ distanceKm: l.distance / 1000, durationMin: l.duration / 60 })),
    };
  } catch {
    return null;
  }
}

function getWarnings(p, arrive, depart) {
  const out = [];
  const open = parseTime(p.openTime);
  const close = parseTime(p.closeTime);
  if (open != null && arrive < open) out.push(`Opens at ${fmtClock(open)} - you'd arrive at ${fmtClock(arrive)}`);
  if (close != null) {
    if (arrive >= close) out.push(`Closes at ${fmtClock(close)} - you'd arrive after closing`);
    else if (depart > close) out.push(`Closes at ${fmtClock(close)} - your plan runs past closing`);
  }
  return out;
}

function scheduleDay(points, route, startMin) {
  let t = startMin;
  let km = 0;
  let travelMin = 0;
  const legsOk = route && route.legs && route.legs.length === points.length - 1;
  const rows = points.map((p, i) => {
    let legKm = 0;
    let legMin = 0;
    if (i > 0) {
      if (legsOk) {
        legKm = route.legs[i - 1].distanceKm;
        legMin = route.legs[i - 1].durationMin;
      } else {
        legKm = haversine(points[i - 1].lat, points[i - 1].lng, p.lat, p.lng) * 1.3; // rough road estimate
        legMin = (legKm / 35) * 60;
      }
      t += legMin;
      km += legKm;
      travelMin += legMin;
    }
    const arrive = t;
    t += p.type === "you" ? 0 : p.mins || 60;
    return { p, arrive, depart: t, legKm, legMin, warnings: p.type === "you" ? [] : getWarnings(p, arrive, t) };
  });
  return { rows, end: t, km, travelMin, exact: !!legsOk };
}

/* ---------------------------------------------------------------
   text + PDF output
--------------------------------------------------------------- */
function tripText(trip, days, url) {
  const lines = [`My Ratnagiri trip - ${trip.name}`];
  days.forEach((d) => {
    const real = d.rows.filter((r) => r.p.type !== "you");
    if (!real.length) return;
    if (trip.numDays > 1) lines.push(`\nDay ${d.day}`);
    real.forEach((r, i) => {
      lines.push(`${i + 1}. ${fmtClock(r.arrive)} ${r.p.name}${r.p.note ? ` (${r.p.note})` : ""}`);
    });
  });
  if (url) lines.push(`\nOpen this trip: ${url}`);
  return lines.join("\n");
}

// Builds a clean itinerary page and prints it from a hidden iframe.
// The visitor chooses "Save as PDF". Only the itinerary is printed.
function downloadItineraryPdf(trip, days, url) {
  const totalFee = days.reduce(
    (sum, d) => sum + d.rows.reduce((s, r) => s + (r.p.type === "you" ? 0 : numericFee(r.p.fee)), 0),
    0
  );
  const sections = days
    .filter((d) => d.rows.some((r) => r.p.type !== "you"))
    .map((d) => {
      let n = 0;
      const rows = d.rows
        .map((r) => {
          const isYou = r.p.type === "you";
          if (!isYou) n += 1;
          const fee = isYou ? null : fmtFee(r.p.fee);
          return `<tr>
            <td class="n">${isYou ? "" : n}</td>
            <td class="t">${fmtClock(r.arrive)}</td>
            <td><b>${escapeHtml(r.p.name)}</b>
              <div class="sub">${isYou ? "Start" : `Stay ${fmtDur(r.p.mins || 60)}`}${r.legKm ? ` · ${fmtKm(r.legKm)} drive from previous` : ""}${fee ? ` · ${escapeHtml(fee)}` : ""}</div>
              ${r.p.note ? `<div class="note">Note: ${escapeHtml(r.p.note)}</div>` : ""}
              ${r.warnings.map((w) => `<div class="warn">! ${escapeHtml(w)}</div>`).join("")}
            </td>
            <td class="map"><a href="https://www.google.com/maps?q=${r.p.lat},${r.p.lng}">Map</a></td>
          </tr>`;
        })
        .join("");
      return `<h2>${trip.numDays > 1 ? `Day ${d.day}` : "Itinerary"} <span>${fmtClock(d.rows[0].arrive)} to about ${fmtClock(d.end)} · ${fmtKm(d.km)} driving</span></h2>
        <table>${rows}</table>
        ${d.rows.length > 1 ? `<p class="foot">Route: <a href="${googleMapsUrl(d.rows.map((r) => r.p))}">open in Google Maps</a></p>` : ""}`;
    })
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(trip.name)} - Ratnagiri trip</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;color:#1e293b;margin:32px}
    h1{margin:0 0 4px;color:#c2410c;font-size:24px}
    h2{font-size:16px;margin:22px 0 6px;color:#0f172a}
    h2 span{font-weight:normal;font-size:12px;color:#64748b;margin-left:8px}
    .date{color:#64748b;font-size:12px;margin-bottom:6px}
    table{width:100%;border-collapse:collapse}
    td{padding:9px 6px;border-bottom:1px solid #e2e8f0;vertical-align:top;font-size:13px}
    .n{width:24px;font-weight:bold;color:#c2410c}
    .t{width:70px;color:#475569;white-space:nowrap}
    .sub{color:#64748b;font-size:11px;margin-top:2px}
    .note{font-size:12px;margin-top:3px;color:#334155}
    .warn{font-size:11px;margin-top:3px;color:#b91c1c;font-weight:bold}
    .map{text-align:right;width:40px;font-size:12px}
    a{color:#2563eb}
    .foot{margin-top:8px;font-size:11px;color:#94a3b8}
    tr{page-break-inside:avoid}
  </style></head><body>
    <h1>${escapeHtml(trip.name)}</h1>
    <div class="date">${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}${
      totalFee ? ` · Entry fees about ₹${totalFee} per person` : ""
    }</div>
    ${sections}
    <p class="foot">Open this trip online: <a href="${url}">${url.length > 90 ? "trip link" : url}</a></p>
    <p class="foot">Timings are estimates. Check opening hours before you go. Made with Ratnagiri Tourism.</p>
  </body></html>`;

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 2000);
  }, 300);
}

/* ---------------------------------------------------------------
   preview map
--------------------------------------------------------------- */
function FitToStops({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 13);
      return;
    }
    map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), { padding: [40, 40] });
  }, [points, map]);
  return null;
}

function numberedIcon(label, color) {
  return L.divIcon({
    html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${color};border:2px solid white;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(0,0,0,.4);">
      <span style="transform:rotate(45deg);color:#fff;font-size:12px;font-weight:700;">${label}</span></div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

/* ================================================================== */

export default function TripPlanner({ userLocation }) {
  const {
    stops, trip, trips, lastRemoved,
    removeStop, undoRemove, clearUndo, nudgeStop, moveStopTo, reorderStops, updateStop,
    setNumDays, setStartTime, createTrip, renameTrip, deleteTrip, switchTrip,
  } = useTripPlanner();

  const [routes, setRoutes] = useState([]);
  const [routing, setRouting] = useState(false);
  const [routeError, setRouteError] = useState(false);
  const [startFromMe, setStartFromMe] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [openKey, setOpenKey] = useState(null); // stop whose editor is open
  const [dragKey, setDragKey] = useState(null);
  const [flash, setFlash] = useState(""); // "link" | "list"

  const useMe = !!(startFromMe && userLocation);

  // points for each day (day 1 can start from the visitor's location)
  const dayPoints = useMemo(() => {
    const out = [];
    for (let d = 1; d <= trip.numDays; d++) {
      const pts = stops.filter((s) => s.day === d).map((s) => ({ ...s }));
      if (d === 1 && useMe) {
        pts.unshift({ type: "you", id: "you", name: "Your location", lat: userLocation.lat, lng: userLocation.lng, day: 1 });
      }
      out.push(pts);
    }
    return out;
  }, [stops, trip.numDays, useMe, userLocation]);

  // fetch one road route per day
  const sig = JSON.stringify(dayPoints.map((pts) => pts.map((p) => [p.lat, p.lng])));
  useEffect(() => {
    let cancelled = false;
    setRouteError(false);
    const timer = setTimeout(async () => {
      if (!dayPoints.some((pts) => pts.length >= 2)) {
        setRoutes([]);
        setRouting(false);
        return;
      }
      setRouting(true);
      const res = await Promise.all(dayPoints.map((pts) => (pts.length >= 2 ? fetchDrivingRoute(pts) : null)));
      if (cancelled) return;
      setRoutes(res);
      setRouteError(dayPoints.some((pts, i) => pts.length >= 2 && !res[i]));
      setRouting(false);
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  const startMin = parseTime(trip.startTime) ?? 540;
  const days = useMemo(
    () => dayPoints.map((pts, i) => ({ day: i + 1, ...scheduleDay(pts, routes[i], startMin), route: routes[i] })),
    [dayPoints, routes, startMin]
  );

  const totalKm = days.reduce((s, d) => s + d.km, 0);
  const totalDriveMin = days.reduce((s, d) => s + d.travelMin, 0);
  const totalFee = stops.reduce((s, x) => s + numericFee(x.fee), 0);
  const warningCount = days.reduce((s, d) => s + d.rows.filter((r) => r.warnings.length).length, 0);
  const allExact = days.every((d) => d.rows.length < 2 || d.exact);

  // undo bar disappears after a few seconds
  useEffect(() => {
    if (!lastRemoved) return;
    const t = setTimeout(clearUndo, 6000);
    return () => clearTimeout(t);
  }, [lastRemoved, clearUndo]);

  // drag & drop (listeners on window so it keeps working while rows re-order)
  useEffect(() => {
    if (!dragKey) return;
    const onMove = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const row = el && el.closest && el.closest("[data-stopkey]");
      if (row && row.dataset.stopkey !== dragKey) moveStopTo(dragKey, row.dataset.stopkey);
    };
    const onUp = () => setDragKey(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragKey, moveStopTo]);

  const flashMsg = (m) => {
    setFlash(m);
    setTimeout(() => setFlash(""), 2000);
  };

  /* ---------- actions ---------- */
  const handleBestOrder = () => {
    const out = [];
    for (let d = 1; d <= trip.numDays; d++) {
      const ds = stops.filter((s) => s.day === d);
      if (ds.length < 2) {
        out.push(...ds);
        continue;
      }
      const meHere = d === 1 && useMe;
      const anchor = meHere ? userLocation : ds[0];
      const rest = meHere ? ds : ds.slice(1);
      const ordered = nearestNeighbourOrder(anchor, rest);
      out.push(...(meHere ? ordered : [ds[0], ...ordered]));
    }
    reorderStops(out);
  };

  const shareUrl = () => buildShareUrl(trip);

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(tripText(trip, days, shareUrl()))}`, "_blank", "noopener");
  };
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      flashMsg("link");
    } catch {
      window.prompt("Copy this link:", shareUrl());
    }
  };
  const handleCopyList = async () => {
    try {
      await navigator.clipboard.writeText(tripText(trip, days, shareUrl()));
      flashMsg("list");
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleNew = () => {
    const name = window.prompt("Name your new trip:", `Trip ${trips.length + 1}`);
    if (name !== null) createTrip(name.trim().slice(0, 40));
  };
  const handleRename = () => {
    const name = window.prompt("Rename trip:", trip.name);
    if (name !== null) renameTrip(name);
  };
  const handleDelete = () => {
    if (window.confirm(`Delete "${trip.name}"? This cannot be undone.`)) deleteTrip();
  };

  /* ---------- pieces of UI ---------- */
  const header = (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1.5">
        <select
          value={trip.id}
          onChange={(e) => switchTrip(e.target.value)}
          className="flex-1 min-w-0 border border-slate-300 rounded-lg p-2 text-sm font-semibold text-slate-800 bg-white"
        >
          {trips.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.stops.length})
            </option>
          ))}
        </select>
        <button
          onClick={handleNew}
          className="shrink-0 flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-lg"
        >
          <Plus size={13} /> New trip
        </button>
      </div>
      <div className="flex gap-4 text-xs pl-1">
        <button onClick={handleRename} className="text-slate-500 hover:text-slate-800 font-medium">Rename</button>
        <button onClick={handleDelete} className="text-slate-400 hover:text-red-600 font-medium">Delete trip</button>
      </div>
    </div>
  );

  if (stops.length === 0) {
    return (
      <div className="animate-in slide-in-from-right-4 duration-300">
        {header}
        <div className="flex flex-col items-center justify-center text-center py-12 px-6">
          <span className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-3xl mb-4">🗺️</span>
          <h2 className="text-lg font-bold text-slate-800 mb-1">This trip is empty</h2>
          <p className="text-sm text-slate-500 max-w-xs">
            Tap <strong>Add to Trip</strong> on any place or homestay. Your stops will show up here with times and the route.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      {header}

      {/* summary */}
      <div className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl px-4 py-3 text-white mb-3 shadow-sm">
        {routing && <p className="text-sm font-medium">Working out the route…</p>}
        {!routing && (
          <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-sm font-bold">
            <span className="flex items-center gap-1.5"><RouteIcon size={15} /> {allExact ? "" : "~"}{fmtKm(totalKm)}</span>
            <span className="flex items-center gap-1.5"><Clock size={15} /> {fmtMin(totalDriveMin)} driving</span>
            {totalFee > 0 && <span className="flex items-center gap-1"><IndianRupee size={14} /> {totalFee} entry / person</span>}
          </div>
        )}
        {!routing && routeError && (
          <p className="text-xs mt-1 opacity-90">Couldn't get exact road times, so these are estimates.</p>
        )}
      </div>

      {warningCount > 0 && (
        <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>
            {warningCount} {warningCount === 1 ? "stop has" : "stops have"} an opening-hours problem. Look for the red notes below.
          </span>
        </div>
      )}

      {/* undo */}
      {lastRemoved && (
        <div className="flex items-center justify-between gap-2 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 mb-3">
          <span className="truncate">Removed {lastRemoved.name}</span>
          <button onClick={undoRemove} className="shrink-0 flex items-center gap-1 font-bold text-amber-300 hover:text-amber-200">
            <Undo2 size={13} /> Undo
          </button>
        </div>
      )}

      {/* start settings */}
      <div className="flex items-center gap-3 flex-wrap mb-4 text-xs text-slate-600">
        <label className="flex items-center gap-1.5">
          Start each day at
          <input
            type="time"
            value={trip.startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border border-slate-300 rounded px-1.5 py-1 text-xs bg-white"
          />
        </label>
        {userLocation && (
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={startFromMe} onChange={(e) => setStartFromMe(e.target.checked)} className="accent-orange-600" />
            Day 1 starts from my location
          </label>
        )}
      </div>

      {/* days */}
      <div className="space-y-5 mb-4">
        {days.map((d, di) => {
          const realCount = d.rows.filter((r) => r.p.type !== "you").length;
          let n = 0;
          return (
            <div key={d.day}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: DAY_COLORS[di % DAY_COLORS.length] }} />
                <h3 className="font-bold text-sm text-slate-800">{trip.numDays > 1 ? `Day ${d.day}` : "Your stops"}</h3>
                {realCount > 0 && (
                  <span className="text-xs text-slate-500 truncate">
                    {fmtClock(d.rows[0].arrive)} to about {fmtClock(d.end)}
                  </span>
                )}
                <div className="ml-auto flex items-center gap-2 shrink-0">
                  {d.rows.length > 1 && (
                    <a
                      href={googleMapsUrl(d.rows.map((r) => r.p))}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      <MapIcon size={12} /> Directions
                    </a>
                  )}
                  {trip.numDays > 1 && d.day === trip.numDays && (
                    <button onClick={() => setNumDays(trip.numDays - 1)} className="text-xs text-slate-400 hover:text-red-600" title="Remove this day (stops move to the previous day)">
                      Remove day
                    </button>
                  )}
                </div>
              </div>

              {realCount === 0 && (
                <p className="text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-lg p-3 text-center">
                  No stops on this day. Open a stop's edit panel and pick this day.
                </p>
              )}

              <div className="space-y-2">
                {d.rows.map((r) => {
                  const p = r.p;
                  const isYou = p.type === "you";
                  const k = keyOf(p);
                  const isOpen = openKey === k;
                  const fee = isYou ? null : fmtFee(p.fee);
                  if (!isYou) n += 1;
                  return (
                    <div
                      key={k}
                      data-stopkey={k}
                      className={`rounded-xl border transition-shadow ${
                        isYou ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"
                      } ${dragKey === k ? "ring-2 ring-orange-400 shadow-lg" : ""} ${r.warnings.length ? "border-red-200" : ""}`}
                    >
                      <div className="flex items-start gap-2 p-2.5">
                        {!isYou ? (
                          <span
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setDragKey(k);
                            }}
                            style={{ touchAction: "none" }}
                            className="w-6 h-7 shrink-0 flex items-center justify-center text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing select-none"
                            title="Drag to reorder"
                            aria-label="Drag to reorder"
                          >
                            <GripVertical size={16} />
                          </span>
                        ) : (
                          <span className="w-6 shrink-0" />
                        )}
                        <span
                          className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: isYou ? "#2563eb" : DAY_COLORS[di % DAY_COLORS.length] }}
                        >
                          {isYou ? "•" : n}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-slate-800 truncate">
                            {!isYou && <span className="mr-1">{CATEGORY_ICON[p.type] || "📍"}</span>}
                            {p.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {fmtClock(r.arrive)}
                            {!isYou && ` · stay ${fmtDur(p.mins || 60)}`}
                            {r.legKm > 0 && ` · ${fmtKm(r.legKm)} drive`}
                            {isYou && " · start"}
                          </p>
                          {p.note && <p className="text-xs text-slate-700 mt-0.5">📝 {p.note}</p>}
                          {fee && (
                            <p className="text-xs text-emerald-700 mt-0.5 flex items-center gap-1">
                              <IndianRupee size={11} /> {fee}
                            </p>
                          )}
                          {r.warnings.map((w, i) => (
                            <p key={i} className="text-xs text-red-600 font-medium mt-0.5 flex items-start gap-1">
                              <AlertTriangle size={11} className="shrink-0 mt-0.5" /> {w}
                            </p>
                          ))}
                        </div>
                        {!isYou && (
                          <div className="flex items-center shrink-0">
                            <button
                              onClick={() => setOpenKey(isOpen ? null : k)}
                              className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500"
                              aria-label="Edit stop"
                              title="Time, day and note"
                            >
                              {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </button>
                            <button
                              onClick={() => removeStop(stops.findIndex((s) => keyOf(s) === k))}
                              className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                              aria-label="Remove stop"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      {isOpen && !isYou && (
                        <div className="border-t border-slate-100 px-3 py-3 space-y-3 bg-slate-50 rounded-b-xl">
                          <div className="flex gap-3 flex-wrap">
                            <label className="text-xs text-slate-600 flex-1 min-w-[110px]">
                              Time spent here
                              <select
                                value={p.mins || 60}
                                onChange={(e) => updateStop(k, { mins: Number(e.target.value) })}
                                className="mt-1 w-full border border-slate-300 rounded-lg p-1.5 text-xs bg-white"
                              >
                                {[...new Set([...DURATIONS, p.mins || 60])].sort((a, b) => a - b).map((m) => (
                                  <option key={m} value={m}>{fmtDur(m)}</option>
                                ))}
                              </select>
                            </label>
                            {trip.numDays > 1 && (
                              <label className="text-xs text-slate-600 flex-1 min-w-[110px]">
                                Day
                                <select
                                  value={p.day}
                                  onChange={(e) => updateStop(k, { day: Number(e.target.value) })}
                                  className="mt-1 w-full border border-slate-300 rounded-lg p-1.5 text-xs bg-white"
                                >
                                  {Array.from({ length: trip.numDays }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                                  ))}
                                </select>
                              </label>
                            )}
                          </div>
                          <label className="block text-xs text-slate-600">
                            Note
                            <input
                              type="text"
                              maxLength={80}
                              value={p.note || ""}
                              onChange={(e) => updateStop(k, { note: e.target.value })}
                              placeholder="e.g. Book table, Sunset here"
                              className="mt-1 w-full border border-slate-300 rounded-lg p-1.5 text-xs bg-white"
                            />
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => nudgeStop(k, -1)}
                              className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg py-1.5"
                            >
                              <ArrowUp size={13} /> Move up
                            </button>
                            <button
                              onClick={() => nudgeStop(k, 1)}
                              className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg py-1.5"
                            >
                              <ArrowDown size={13} /> Move down
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {trip.numDays < MAX_DAYS && (
        <button
          onClick={() => setNumDays(trip.numDays + 1)}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 border border-dashed border-slate-300 hover:border-orange-400 hover:text-orange-700 rounded-lg py-2.5 mb-4 transition-colors"
        >
          <Plus size={13} /> Add Day {trip.numDays + 1}
        </button>
      )}

      {/* actions */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button
          onClick={handleBestOrder}
          disabled={stops.length < 2}
          className="flex items-center justify-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 disabled:opacity-40 py-2.5 rounded-lg transition-colors"
        >
          <Wand2 size={14} /> Best order
        </button>
        <button
          onClick={() => downloadItineraryPdf(trip, days, shareUrl())}
          className="flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 py-2.5 rounded-lg transition-colors"
        >
          <Download size={14} /> Download PDF
        </button>
        <button
          onClick={handleWhatsApp}
          className="flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 py-2.5 rounded-lg transition-colors"
        >
          <Share2 size={14} /> WhatsApp
        </button>
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg transition-colors"
        >
          {flash === "link" ? <Check size={14} /> : <Link2 size={14} />} {flash === "link" ? "Link copied!" : "Copy share link"}
        </button>
      </div>
      <button
        onClick={handleCopyList}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 py-1.5 mb-3"
      >
        {flash === "list" ? <Check size={12} /> : <Copy size={12} />} {flash === "list" ? "Copied!" : "Copy as text"}
      </button>

      {/* map */}
      <button
        onClick={() => setShowMap((v) => !v)}
        className="w-full text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 py-2 rounded-lg mb-3 transition-colors"
      >
        {showMap ? "Hide map" : "Show map"}
      </button>
      {showMap && (
        <div className="h-56 rounded-xl overflow-hidden border border-slate-200 mb-2">
          <MapContainer center={[17.7554, 73.1923]} zoom={11} className="w-full h-full" scrollWheelZoom={false}>
            <TileLayer
              url={`https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png?api_key=${import.meta.env.VITE_STADIA_KEY}`}
              attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={20}
            />
            <FitToStops points={dayPoints.flat()} />
            {dayPoints.map((pts, di) => {
              const color = DAY_COLORS[di % DAY_COLORS.length];
              let n = 0;
              return pts.map((p) => {
                const isYou = p.type === "you";
                if (!isYou) n += 1;
                return (
                  <Marker
                    key={`${di}-${keyOf(p)}`}
                    position={[p.lat, p.lng]}
                    icon={numberedIcon(isYou ? "•" : n, isYou ? "#2563eb" : color)}
                  >
                    <Popup>{p.name}</Popup>
                  </Marker>
                );
              });
            })}
            {days.map(
              (d, di) =>
                d.route && (
                  <GeoJSON
                    key={`route-${di}-${JSON.stringify(d.route.geometry).length}`}
                    data={d.route.geometry}
                    style={{ color: DAY_COLORS[di % DAY_COLORS.length], weight: 4, opacity: 0.85 }}
                  />
                )
            )}
          </MapContainer>
        </div>
      )}

      <p className="text-[11px] text-slate-400 text-center mt-3">
        Saved on this device. Times are estimates, so check opening hours before you go.
      </p>
    </div>
  );
}

/* ==================================================================
   AddToTripButton - same as before, plus optional opening hours + fee.
   <AddToTripButton type="village" id={loc.id} name={loc.location_name}
       lat={loc.latitude} lng={loc.longitude}
       openTime="09:00" closeTime="17:30" fee={50} />
================================================================== */
export function AddToTripButton({ type, id, name, lat, lng, openTime, closeTime, fee, className = "" }) {
  const { addStop, removeStop, isInTrip, stops } = useTripPlanner();
  const inTrip = isInTrip(type, id);

  const handleClick = (e) => {
    e.stopPropagation();
    if (inTrip) {
      removeStop(stops.findIndex((s) => s.type === type && s.id === id));
    } else {
      const item = { type, id, name, lat, lng };
      if (openTime) item.openTime = openTime;
      if (closeTime) item.closeTime = closeTime;
      if (fee !== undefined && fee !== null && fee !== "") item.fee = fee;
      addStop(item);
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