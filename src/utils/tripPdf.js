import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { NATIONAL_CONTACTS, DISTRICT_CONTACTS, FACILITIES, EMERGENCY_STEPS } from "../data/emergencyContacts";

/* ------------------------------------------------------------------
   Trip guide PDF generator
   Sections: cover, contents, trip at a glance, trip map, plan health check,
   budget, day-by-day itinerary (brief + map + rich stop details),
   bookings checklist, help and services near each day (ATMs, hospitals,
   police, local drivers, bus stands), emergency page, tips, packing list.

   Fonts: jsPDF's built-in fonts can't draw emoji, the rupee sign or
   Devanagari, so everything goes through clean() and money is "Rs.".
------------------------------------------------------------------- */

const C = {
  brand: [234, 88, 12],
  brandDark: [194, 65, 12],
  dark: [30, 41, 59],
  mid: [100, 116, 139],
  soft: [248, 250, 252],
  line: [226, 232, 240],
  green: [22, 163, 74],
  red: [220, 38, 38],
  blue: [37, 99, 235],
  amber: [255, 247, 237],
  amberLine: [253, 186, 116],
  teal: [15, 118, 110],
  yellow: [202, 138, 4],
  ink: [15, 23, 42],
};

const DAY_COLORS = [
  [234, 88, 12], [37, 99, 235], [22, 163, 74], [147, 51, 234],
  [219, 39, 119], [8, 145, 178], [202, 138, 4],
];

const W = 210;
const H = 297;
const M = 14;

const clean = (s) =>
  String(s ?? "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u20B9/g, "Rs. ")
    .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// keeps line breaks (for multi-line table cells)
const cleanLines = (arr) => arr.filter(Boolean).map(clean).filter(Boolean).join("\n");
const truncate = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1)}...` : s || "");
const inr = (n) => `Rs. ${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;
const num = (v) => (v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? null : Number(v));

const TYPE_LABEL = {
  village: "Place to visit",
  eco: "Nature / eco",
  homestay: "Stay",
  driver: "Local driver",
  busstop: "Bus stand",
  atm: "ATM",
};

const DEFAULT_VISIT_MINS = { village: 90, eco: 90, busstop: 15, driver: 0, homestay: 0, atm: 10 };

/* ------------------------------------------------------------------
   Small helpers
------------------------------------------------------------------- */

function haversine(a, b) {
  if (!a?.lat || !a?.lng || !b?.lat || !b?.lng) return null;
  const R = 6371;
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

const ROAD_FACTOR = 1.35; // straight line -> rough road distance
const AVG_KMH = 35; // winding Konkan roads

function fmtTime(mins) {
  const h24 = Math.floor(mins / 60) % 24;
  const m = Math.round(mins % 60);
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, "0")} ${suffix}`;
}

function fmtDuration(mins) {
  if (mins == null) return "";
  mins = Math.round(mins);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

const fmtDate = (d) =>
  d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

const toMin = (t) => {
  const m = String(t || "").match(/(\d{1,2}):(\d{2})/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

const firstPhone = (p) => String(p || "").split(/[\/,;]/)[0].trim();
const phoneDigits = (p) => firstPhone(p).replace(/\D/g, "").slice(-10);
const telUrl = (p) => (phoneDigits(p).length === 10 ? `tel:+91${phoneDigits(p)}` : null);
const waUrl = (p) => (phoneDigits(p).length === 10 ? `https://wa.me/91${phoneDigits(p)}` : null);

const hasXY = (o) => o && Number(o.lat) && Number(o.lng);
const mapsPin = (s) => `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`;
const mapsDir = (o) => `https://www.google.com/maps/dir/?api=1&destination=${o.lat},${o.lng}`;

function mapsRoute(stops) {
  const pts = stops.filter(hasXY);
  if (pts.length < 2) return null;
  const f = (s) => `${s.lat},${s.lng}`;
  const mid = pts.slice(1, -1).map(f).join("|");
  return (
    `https://www.google.com/maps/dir/?api=1&origin=${f(pts[0])}&destination=${f(pts[pts.length - 1])}` +
    (mid ? `&waypoints=${encodeURIComponent(mid)}` : "")
  );
}

/* ------------------------------------------------------------------
   Data layer: turns your raw records into one catalog the PDF can use.
   dataset = { locations, homestays, drivers, busStops, atms }
------------------------------------------------------------------- */

function buildCatalog(ds = {}) {
  const byKey = {};
  const places = [];
  const stays = [];
  const atms = [];
  const drivers = [];
  const buses = [];

  (ds.locations || []).forEach((l) => {
    const o = {
      type: "village", id: l.id, name: l.location_name,
      lat: num(l.latitude), lng: num(l.longitude),
      category: l.category, village: l.village_name, taluka: l.taluka_name,
      description: l.description || l.about || l.short_description || l.details || l.highlights || "",
      fee: num(l.entry_fee ?? l.entryFee ?? l.fee),
      openTime: l.open_time ?? l.openTime,
      closeTime: l.close_time ?? l.closeTime,
      bestTime: l.best_time ?? l.bestTime ?? l.best_time_to_visit,
    };
    byKey[`village:${l.id}`] = o;
    places.push(o);
  });

  (ds.homestays || []).forEach((h) => {
    const o = {
      type: "homestay", id: h.id, name: h.name,
      lat: num(h.latitude), lng: num(h.longitude),
      category: h.type, village: h.village, taluka: h.taluka,
      owner: h.owner, phone: h.phone, amenities: h.amenities,
      description: h.description || h.about || "",
      price: num(h.pricePerNight ?? h.price_per_night ?? h.price ?? h.rate),
    };
    byKey[`homestay:${h.id}`] = o;
    stays.push(o);
  });

  (ds.drivers || []).forEach((d) => {
    const o = {
      type: "driver", id: d.id, name: d.name,
      lat: num(d.lat), lng: num(d.lng),
      category: d.vehicleType, village: d.village, taluka: d.taluka,
      phone: d.phone, serviceArea: d.serviceArea,
    };
    byKey[`driver:${d.id}`] = o;
    drivers.push(o);
  });

  (ds.busStops || []).forEach((b) => {
    const o = {
      type: "busstop", id: b.id, name: b.name,
      lat: num(b.lat), lng: num(b.lng), taluka: b.taluka,
      timetableLink: b.timetableLink,
    };
    byKey[`busstop:${b.id}`] = o;
    buses.push(o);
  });

  (ds.atms || []).forEach((a) => {
    const o = {
      type: "atm", id: a.id, name: a.name, bank: a.bank,
      lat: num(a.lat), lng: num(a.lng),
      village: a.village, taluka: a.taluka, address: a.address,
      is24x7: a.is24x7, hasCashDeposit: a.hasCashDeposit,
    };
    byKey[`atm:${a.id}`] = o;
    atms.push(o);
  });

  return { byKey, places, stays, atms, drivers, buses };
}

const mergeDefined = (...objs) => {
  const out = {};
  objs.forEach((o) => Object.entries(o || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  }));
  return out;
};

function normalizeStops(stops, catalog, details) {
  return stops.map((s, i) => {
    const key = `${s.type}:${s.id}`;
    const m = mergeDefined(catalog.byKey[key], details[key], s);
    return { ...m, day: s.day || 1, _order: i };
  });
}

/* ------------------------------------------------------------------
   Day scheduling
------------------------------------------------------------------- */

function buildDays(stops, numDays) {
  const days = [];
  for (let d = 1; d <= numDays; d++) {
    const dayStops = stops
      .filter((s) => s.day === d)
      // homestays last: you check in at the end of the day
      .sort((a, b) => (a.type === "homestay") - (b.type === "homestay") || a._order - b._order);

    let clock = 9 * 60;
    let prev = null;
    let km = 0;
    let driveMin = 0;
    const rows = dayStops.map((s) => {
      let legKm = null;
      let legMin = null;
      if (prev) {
        const straight = haversine(prev, s);
        if (straight != null) {
          legKm = straight * ROAD_FACTOR;
          legMin = Math.round((legKm / AVG_KMH) * 60);
          km += legKm;
          driveMin += legMin;
          clock += legMin;
        }
      }
      let arrive = clock;
      if (s.type === "homestay") arrive = Math.max(clock, 17 * 60);
      const stay = Number(s.mins) || DEFAULT_VISIT_MINS[s.type] || 60;
      clock = arrive + (s.type === "homestay" ? 0 : stay);
      prev = s;
      return { stop: s, arrive, stay: s.type === "homestay" ? null : stay, legKm, legMin };
    });
    days.push({ day: d, rows, km, driveMin, end: clock, stops: dayStops });
  }
  return days;
}

/* ------------------------------------------------------------------
   MAP RENDERING (pure vector, no images, no CORS)
------------------------------------------------------------------- */

function ringsOf(geo) {
  const out = [];
  const walk = (g) => {
    if (!g) return;
    if (g.type === "FeatureCollection") g.features.forEach(walk);
    else if (g.type === "Feature") walk(g.geometry);
    else if (g.type === "GeometryCollection") g.geometries.forEach(walk);
    else if (g.type === "Polygon") out.push(g.coordinates[0]);
    else if (g.type === "MultiPolygon") g.coordinates.forEach((p) => out.push(p[0]));
  };
  walk(geo);
  return out;
}

let ringCache = null;
async function loadRings(border) {
  if (border) return ringsOf(border);
  if (ringCache) return ringCache;
  try {
    const res = await fetch("/ratnagiri-border.geojson");
    ringCache = ringsOf(await res.json());
    return ringCache;
  } catch {
    return [];
  }
}

function clipPoly(pts, r) {
  const x2 = r.x + r.w, y2 = r.y + r.h;
  const edges = [
    [(p) => p[0] >= r.x, (a, b) => [r.x, a[1] + ((r.x - a[0]) / (b[0] - a[0])) * (b[1] - a[1])]],
    [(p) => p[0] <= x2, (a, b) => [x2, a[1] + ((x2 - a[0]) / (b[0] - a[0])) * (b[1] - a[1])]],
    [(p) => p[1] >= r.y, (a, b) => [a[0] + ((r.y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]), r.y]],
    [(p) => p[1] <= y2, (a, b) => [a[0] + ((y2 - a[1]) / (b[1] - a[1])) * (b[0] - a[0]), y2]],
  ];
  let out = pts;
  for (const [inside, cross] of edges) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i];
      const prev = input[(i + input.length - 1) % input.length];
      if (inside(cur)) {
        if (!inside(prev)) out.push(cross(prev, cur));
        out.push(cur);
      } else if (inside(prev)) {
        out.push(cross(prev, cur));
      }
    }
    if (!out.length) break;
  }
  return out;
}

function clipSeg(a, b, r) {
  let t0 = 0, t1 = 1;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const p = [-dx, dx, -dy, dy];
  const q = [a[0] - r.x, r.x + r.w - a[0], a[1] - r.y, r.y + r.h - a[1]];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return null;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) { if (t > t1) return null; if (t > t0) t0 = t; }
      else { if (t < t0) return null; if (t < t1) t1 = t; }
    }
  }
  return [[a[0] + t0 * dx, a[1] + t0 * dy], [a[0] + t1 * dx, a[1] + t1 * dy]];
}

function fillPoly(doc, pts) {
  if (pts.length < 3) return;
  const segs = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]);
  doc.lines(segs, pts[0][0], pts[0][1], [1, 1], "F", true);
}

/* pins:   [{ lat, lng, n, color, name?, url? }]
   lines:  [{ pts: [{lat,lng}], color }]
   extras: [{ lat, lng, letter, color, url? }]  (ATM / hospital / police markers) */
function drawTripMap(doc, { x, y, w, h, pins, lines = [], rings = [], showNames = false, extras = [] }) {
  const r = { x, y, w, h };
  doc.setFillColor(238, 242, 247).rect(x, y, w, h, "F");

  const fitPts = [...pins, ...extras];
  const lats = fitPts.map((p) => p.lat);
  const lngs = fitPts.map((p) => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const cLat = (minLat + maxLat) / 2;
  const cLng = (minLng + maxLng) / 2;
  const cosLat = Math.cos((cLat * Math.PI) / 180);
  const spanLat = Math.max(maxLat - minLat, 0.08);
  const spanLng = Math.max((maxLng - minLng) * cosLat, 0.08);
  const s = Math.min(w / (spanLng * 1.35), h / (spanLat * 1.35));
  const cx = x + w / 2, cy = y + h / 2;
  const proj = (lat, lng) => [cx + (lng - cLng) * cosLat * s, cy - (lat - cLat) * s];
  const kmPerMm = 111.32 / s;

  const projected = rings.map((ring) => {
    const pts = [];
    ring.forEach(([lng, lat]) => {
      const p = proj(lat, lng);
      const last = pts[pts.length - 1];
      if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) > 0.2) pts.push(p);
    });
    return pts;
  });
  doc.setFillColor(255, 255, 255);
  projected.forEach((pts) => fillPoly(doc, clipPoly(pts, r)));

  const steps = [0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1];
  const step = steps.find((st) => h / s / st <= 6) || 1;
  doc.setDrawColor(215, 222, 232).setLineWidth(0.1);
  const latMin = cLat - h / 2 / s, latMax = cLat + h / 2 / s;
  const lngMin = cLng - w / 2 / (cosLat * s), lngMax = cLng + w / 2 / (cosLat * s);
  for (let v = Math.ceil(latMin / step) * step; v <= latMax; v += step) {
    const yy = cy - (v - cLat) * s;
    doc.line(x, yy, x + w, yy);
  }
  for (let v = Math.ceil(lngMin / step) * step; v <= lngMax; v += step) {
    const xx = cx + (v - cLng) * cosLat * s;
    doc.line(xx, y, xx, y + h);
  }

  doc.setDrawColor(...C.red).setLineWidth(0.5).setLineDashPattern([2, 1.4], 0);
  projected.forEach((pts) => {
    for (let i = 0; i < pts.length; i++) {
      const seg = clipSeg(pts[i], pts[(i + 1) % pts.length], r);
      if (seg) doc.line(seg[0][0], seg[0][1], seg[1][0], seg[1][1]);
    }
  });

  doc.setLineWidth(0.7);
  lines.forEach((ln) => {
    doc.setDrawColor(...ln.color).setLineDashPattern([1.6, 1.2], 0);
    for (let i = 0; i < ln.pts.length - 1; i++) {
      const a = proj(ln.pts[i].lat, ln.pts[i].lng);
      const b = proj(ln.pts[i + 1].lat, ln.pts[i + 1].lng);
      const seg = clipSeg(a, b, r);
      if (seg) doc.line(seg[0][0], seg[0][1], seg[1][0], seg[1][1]);
    }
  });
  doc.setLineDashPattern([], 0);

  extras.forEach((e) => {
    const [ex, ey] = proj(e.lat, e.lng);
    doc.setFillColor(...e.color).setDrawColor(255).setLineWidth(0.5);
    doc.roundedRect(ex - 2.4, ey - 2.4, 4.8, 4.8, 0.9, 0.9, "FD");
    doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(6.5);
    doc.text(e.letter, ex, ey + 0.9, { align: "center" });
    if (e.url) doc.link(ex - 2.4, ey - 2.4, 4.8, 4.8, { url: e.url });
  });

  const pos = pins.map((p) => ({ ...p, xy: proj(p.lat, p.lng) }));
  pos.forEach((p) => {
    const [px, py] = p.xy;
    doc.setFillColor(...p.color).setDrawColor(255).setLineWidth(0.6);
    doc.circle(px, py, 3.2, "FD");
    doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(7);
    doc.text(String(p.n), px, py + 0.95, { align: "center" });
    if (p.url) doc.link(px - 3.2, py - 3.2, 6.4, 6.4, { url: p.url });
  });

  if (showNames) {
    const placed = [];
    doc.setFont("helvetica", "bold").setFontSize(7.2);
    pos.forEach((p) => {
      const text = clean(p.name).slice(0, 24);
      if (!text) return;
      const tw = doc.getTextWidth(text) + 3;
      const [px, py] = p.xy;
      const right = px + 4.4 + tw <= x + w - 1;
      const lx = right ? px + 4.4 : px - 4.4 - tw;
      for (const dy of [0, -4.6, 4.6, -9.2, 9.2]) {
        const ly = Math.min(Math.max(py - 2.6 + dy, y + 1), y + h - 6);
        const hit = placed.some((b) => lx < b.x + b.w && lx + tw > b.x && ly < b.y + b.h && ly + 5 > b.y);
        if (hit) continue;
        placed.push({ x: lx, y: ly, w: tw, h: 5 });
        doc.setFillColor(255).setDrawColor(...C.line).setLineWidth(0.15);
        doc.roundedRect(lx, ly, tw, 5, 1, 1, "FD");
        doc.setTextColor(...C.dark).text(text, lx + 1.5, ly + 3.5);
        break;
      }
    });
  }

  const nice = [1, 2, 5, 10, 20, 50, 100].filter((k) => k / kmPerMm <= w * 0.28).pop() || 1;
  const barLen = nice / kmPerMm;
  doc.setFillColor(255).rect(x + 2, y + h - 11, barLen + 12, 9, "F");
  doc.setDrawColor(...C.dark).setLineWidth(0.5);
  doc.line(x + 4, y + h - 5, x + 4 + barLen, y + h - 5);
  doc.line(x + 4, y + h - 6.5, x + 4, y + h - 3.5);
  doc.line(x + 4 + barLen, y + h - 6.5, x + 4 + barLen, y + h - 3.5);
  doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(...C.dark);
  doc.text(`${nice} km`, x + 4, y + h - 7.2);

  const nx = x + w - 8, ny = y + 5;
  doc.setFillColor(255).circle(nx, ny + 3, 5.2, "F");
  doc.setFillColor(...C.dark).triangle(nx, ny - 0.5, nx - 2, ny + 4.5, nx + 2, ny + 4.5, "F");
  doc.setFont("helvetica", "bold").setFontSize(6.5).setTextColor(...C.dark);
  doc.text("N", nx, ny + 8, { align: "center" });

  doc.setDrawColor(...C.mid).setLineWidth(0.3).rect(x, y, w, h, "S");
  return y + h;
}

function mapCaption(doc, y, text) {
  doc.setFont("helvetica", "italic").setFontSize(7.5).setTextColor(...C.mid);
  doc.text(clean(text), M, y + 4);
  return y + 8;
}

function dayLegend(doc, y, numDays) {
  let x = M;
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...C.dark);
  for (let d = 1; d <= numDays; d++) {
    doc.setFillColor(...DAY_COLORS[(d - 1) % DAY_COLORS.length]).circle(x + 2, y + 2, 2, "F");
    doc.text(`Day ${d}`, x + 6, y + 3.2);
    x += 22;
  }
  return y + 8;
}

/* ------------------------------------------------------------------
   Help near the route
------------------------------------------------------------------- */

const HELP_STYLE = {
  atm: { letter: "A", color: [37, 99, 235], label: "ATM" },
  hospital: { letter: "H", color: [220, 38, 38], label: "Hospital" },
  police: { letter: "P", color: [30, 41, 59], label: "Police" },
};

function nearestOf(items, pts, limit, maxKm) {
  if (!pts.length) return [];
  const scored = items.filter(hasXY).map((item) => {
    let best = null;
    pts.forEach((p) => {
      const km = haversine({ lat: Number(item.lat), lng: Number(item.lng) }, p);
      if (km != null && (!best || km < best.km)) best = { km, near: p };
    });
    return best ? { item, km: best.km, near: best.near } : null;
  }).filter(Boolean).sort((a, b) => a.km - b.km);
  const close = scored.filter((x) => x.km <= maxKm);
  return (close.length ? close : scored.slice(0, 2)).slice(0, limit);
}

function helpLegend(doc, y) {
  let x = M;
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...C.dark);
  Object.values(HELP_STYLE).forEach((st) => {
    doc.setFillColor(...st.color).roundedRect(x, y, 4.4, 4.4, 0.8, 0.8, "F");
    doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(6.5).text(st.letter, x + 2.2, y + 3.2, { align: "center" });
    doc.setTextColor(...C.dark).setFont("helvetica", "normal").setFontSize(8).text(st.label, x + 6.5, y + 3.4);
    x += 28;
  });
  doc.setFillColor(...C.brand).circle(x + 2.2, y + 2.2, 2.2, "F");
  doc.text("Your stops", x + 6.5, y + 3.4);
  return y + 9;
}

/* ------------------------------------------------------------------
   Layout helpers
------------------------------------------------------------------- */

let TOC = null; // filled by sectionTitle while a PDF is being built

function sectionTitle(doc, text, y, sub) {
  if (TOC) TOC.push({ title: text, page: doc.internal.getCurrentPageInfo().pageNumber });
  doc.setFillColor(...C.brand);
  doc.roundedRect(M, y, 2.6, sub ? 13 : 8.5, 1.3, 1.3, "F");
  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...C.ink);
  doc.text(clean(text), M + 6, y + 6.4);
  if (sub) {
    doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...C.mid);
    const lines = doc.splitTextToSize(clean(sub), W - 2 * M - 6);
    doc.text(lines.slice(0, 2), M + 6, y + 11.8);
    return y + 12 + Math.min(lines.length, 2) * 4.2 + 2;
  }
  return y + 14;
}

function ensureSpace(doc, y, needed) {
  if (y + needed > H - 22) {
    doc.addPage();
    return 22;
  }
  return y;
}

const tableDefaults = {
  margin: { top: 22, bottom: 20, left: M, right: M },
  styles: { font: "helvetica", fontSize: 9, cellPadding: 2.6, textColor: C.dark, lineColor: C.line, lineWidth: 0.1, valign: "middle" },
  headStyles: { fillColor: C.dark, textColor: 255, fontStyle: "bold" },
  alternateRowStyles: { fillColor: C.soft },
};

function statCards(doc, y, items) {
  const gap = 3;
  const bw = (W - 2 * M - gap * (items.length - 1)) / items.length;
  items.forEach(([value, label], i) => {
    const x = M + i * (bw + gap);
    doc.setFillColor(255).setDrawColor(...C.line).setLineWidth(0.2).roundedRect(x, y, bw, 14, 2, 2, "FD");
    doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(...C.brandDark);
    doc.text(clean(value), x + bw / 2, y + 6.2, { align: "center" });
    doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(...C.mid);
    doc.text(clean(label), x + bw / 2, y + 11, { align: "center" });
  });
  return y + 18;
}

function stopDetails(s) {
  const lines = [TYPE_LABEL[s.type] || "Stop"];
  const area = [s.village, s.taluka].filter(Boolean).join(", ");
  if (area) lines.push(area);
  if (s.category) lines.push(s.category);
  if (s.type === "homestay") {
    if (s.owner) lines.push(`Host: ${s.owner}`);
    if (s.phone) lines.push(`Phone: ${s.phone}`);
    if (s.price) lines.push(`From ${inr(s.price)} per night`);
    if (s.amenities) lines.push(`Amenities: ${truncate(String(s.amenities), 90)}`);
  }
  if (s.type === "driver") {
    if (s.phone) lines.push(`Phone: ${s.phone}`);
    if (s.serviceArea) lines.push(`Area: ${truncate(String(s.serviceArea), 60)}`);
  }
  if (s.type === "busstop") lines.push(s.timetableLink ? "Timetable: tap to download" : "No timetable uploaded");
  if (s.description) lines.push(truncate(String(s.description), 120));
  if (Number(s.fee) > 0) lines.push(`Entry: ${inr(s.fee)} per person`);
  if (s.note) lines.push(String(s.note));
  return cleanLines(lines);
}


/* ------------------------------------------------------------------
   Report design helpers
------------------------------------------------------------------- */

const nearestOne = (items, p) => {
  let best = null;
  items.filter(hasXY).forEach((it) => {
    const km = haversine({ lat: Number(it.lat), lng: Number(it.lng) }, p);
    if (km != null && (!best || km < best.km)) best = { item: it, km };
  });
  return best;
};

const pillW = (doc, text, size = 7) => {
  doc.setFont("helvetica", "bold").setFontSize(size);
  return doc.getTextWidth(clean(text)) + 5;
};

function pill(doc, x, y, text, fill, size = 7) {
  const w = pillW(doc, text, size);
  doc.setFillColor(...fill).roundedRect(x, y, w, 5, 2.5, 2.5, "F");
  doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(size);
  doc.text(clean(text), x + w / 2, y + 3.5, { align: "center" });
  return w;
}

function gauge(doc, x, y, w, score, color) {
  doc.setFillColor(...C.line).roundedRect(x, y, w, 4, 2, 2, "F");
  doc.setFillColor(...color).roundedRect(x, y, Math.max(4, (w * score) / 100), 4, 2, 2, "F");
}

function stackedBar(doc, x, y, w, h, parts) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  let cx = x;
  parts.forEach((p) => {
    const pw = (w * p.value) / total;
    doc.setFillColor(...p.color).rect(cx, y, pw, h, "F");
    cx += pw;
  });
  let lx = x;
  let ly = y + h + 5;
  doc.setFont("helvetica", "normal").setFontSize(7.5);
  parts.forEach((p) => {
    const t = `${p.label}  ${inr(p.value)} (${Math.round((100 * p.value) / total)}%)`;
    const tw = doc.getTextWidth(t) + 9;
    if (lx + tw > x + w + 2) { lx = x; ly += 5; }
    doc.setFillColor(...p.color).circle(lx + 1.6, ly - 1, 1.6, "F");
    doc.setTextColor(...C.dark).text(t, lx + 5, ly);
    lx += tw + 4;
  });
  return ly + 5;
}

const subhead = (doc, y, text, color = C.dark) => {
  doc.setFont("helvetica", "bold").setFontSize(10.5).setTextColor(...color);
  doc.text(clean(text), M, y + 4);
  doc.setDrawColor(...color).setLineWidth(0.4).line(M, y + 6.2, M + 14, y + 6.2);
  return y + 11;
};

/* One detail card per place or stay.
   c: { title, sub, badge, color, desc, meta[], links[{label,url}], url } */
function stopCard(doc, y, c) {
  const x = M, w = W - 2 * M, pad = 5, inner = w - 2 * pad - 2;
  doc.setFont("helvetica", "normal").setFontSize(8.5);
  const descL = c.desc ? doc.splitTextToSize(clean(c.desc), inner) : [];
  const metaL = c.meta.length ? doc.splitTextToSize(clean(c.meta.join("   |   ")), inner) : [];
  let cur = 11.5;
  if (descL.length) cur += 5 + (descL.length - 1) * 4;
  if (metaL.length) cur += 5.5 + (metaL.length - 1) * 4;
  if (c.links.length) cur += 7;
  const h = cur + 3.5;

  y = ensureSpace(doc, y, h + 4);
  doc.setFillColor(255).setDrawColor(...C.line).setLineWidth(0.25).roundedRect(x, y, w, h, 2.5, 2.5, "FD");
  doc.setFillColor(...c.color).roundedRect(x, y, 2.4, h, 1.2, 1.2, "F");

  doc.setFont("helvetica", "bold").setFontSize(10.5).setTextColor(...C.ink);
  const title = clean(truncate(c.title, 44));
  doc.text(title, x + pad + 2, y + 6.5);
  if (c.url) doc.link(x + pad + 2, y + 2.5, doc.getTextWidth(title), 5, { url: c.url });
  const pw = pillW(doc, c.badge);
  pill(doc, x + w - pad - pw, y + 3, c.badge, c.color);

  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...C.mid);
  doc.text(clean(truncate(c.sub, 90)), x + pad + 2, y + 11.5);

  let ty = y + 11.5;
  if (descL.length) {
    ty += 5;
    doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...C.dark);
    doc.text(descL, x + pad + 2, ty);
    ty += (descL.length - 1) * 4;
  }
  if (metaL.length) {
    ty += 5.5;
    doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(...C.brandDark);
    doc.text(metaL, x + pad + 2, ty);
    ty += (metaL.length - 1) * 4;
  }
  if (c.links.length) {
    ty += 6;
    let lx = x + pad + 2;
    doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(...C.blue);
    c.links.forEach((l) => {
      doc.textWithLink(`${clean(l.label)} >`, lx, ty, { url: l.url });
      lx += doc.getTextWidth(`${clean(l.label)} >`) + 8;
    });
  }
  return y + h + 4;
}

const LEVEL_NAME = { Fix: "High", Watch: "Medium", Tip: "Low", OK: "OK" };
const LEVEL_RANK = { Fix: 0, Watch: 1, Tip: 2, OK: 3 };
const LEVEL_COLOR = { Fix: C.red, Watch: C.yellow, Tip: C.blue, OK: C.green };


export async function downloadTripPdf(opts) {
  const {
    name = "My Ratnagiri Trip",
    stops: rawStops = [],
    places = [],
    dataset = {},
    people = 2,
    days: plannedDays = 1,
    startDate = "",
    budget = 0,
    notes = [],
    facilities = FACILITIES,
    tripUrl = "",
  } = opts;

  const dsWithAtms = { ...dataset, atms: dataset.atms || opts.atms || [] };
  const catalog = buildCatalog(dsWithAtms);
  const details = {};
  places.forEach((p) => { details[`${p.type}:${p.id}`] = p; });

  const stops = normalizeStops(rawStops, catalog, details);
  const numDays = Math.max(plannedDays || 1, ...stops.map((s) => s.day), 1);
  const dayPlans = buildDays(stops, numDays);
  const rings = await loadRings(opts.border);
  const totalKm = dayPlans.reduce((a, d) => a + d.km, 0);
  const totalDrive = dayPlans.reduce((a, d) => a + d.driveMin, 0);
  const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const dayDate = (n) => {
    if (!start) return "";
    const d = new Date(start);
    d.setDate(d.getDate() + n - 1);
    return fmtDate(d);
  };

  const cost = opts.cost || {
    entry: stops.reduce((a, s) => a + (Number(s.fee) || 0) * people, 0),
    total: stops.reduce((a, s) => a + (Number(s.fee) || 0) * people, 0),
    fallback: true,
  };

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setProperties({ title: clean(name), subject: "Ratnagiri trip guide", author: "Ratnagiri Tourism" });
  TOC = [];

  /* ---------------- ANALYSIS (done once, used by every section) ---------------- */
  const nights = Math.max(numDays - 1, 0);
  const placeStops = stops.filter((s) => ["village", "eco"].includes(s.type));
  const stayStops = stops.filter((s) => s.type === "homestay");
  const perPerson = cost.total / Math.max(people, 1);
  const perPersonDay = perPerson / numDays;
  const hospitals = facilities.filter((f) => f.kind === "hospital");
  const policeList = facilities.filter((f) => f.kind === "police");
  const lvl = (km, good, ok) => (km == null ? "none" : km <= good ? "good" : km <= ok ? "ok" : "far");
  const STATUS = { good: C.green, ok: C.yellow, far: C.red, none: C.mid };

  const coverage = [];
  dayPlans.forEach((dp) => dp.rows.forEach((r, i) => {
    const s = r.stop;
    if (!hasXY(s) || !["village", "eco", "homestay"].includes(s.type)) return;
    const p = { lat: Number(s.lat), lng: Number(s.lng) };
    const tk = String(s.taluka || "").toLowerCase();
    const hosp = nearestOne(hospitals, p);
    const pol = nearestOne(policeList, p);
    coverage.push({
      day: dp.day, n: i + 1, s,
      atm: nearestOne(catalog.atms, p),
      bus: nearestOne(catalog.buses, p),
      hosp, pol,
      hospTaluka: !hosp && tk ? hospitals.find((f) => String(f.taluka || "").toLowerCase() === tk) : null,
      polTaluka: !pol && tk ? policeList.find((f) => String(f.taluka || "").toLowerCase() === tk) : null,
    });
  }));
  const coverOf = (s) => coverage.find((c) => c.s === s);
  const atmOk = coverage.filter((c) => c.atm && c.atm.km <= 12).length;
  const atmPct = coverage.length && catalog.atms.length ? Math.round((atmOk / coverage.length) * 100) : null;

  const cashBase = (Number(cost.food) || 0) + (Number(cost.transport) || 0) + (Number(cost.entry) || 0);
  const cashSuggest = cashBase > 0 ? Math.max(1000, Math.round((cashBase * 0.6) / 500) * 500) : 0;
  const contingency = Math.round(cost.total * 0.1);

  /* ---------------- PLAN HEALTH CHECKS ---------------- */
  const checks = [];
  dayPlans.forEach((dp) => {
    if (dp.driveMin >= 180)
      checks.push(["Watch", `Day ${dp.day}: about ${fmtDuration(dp.driveMin)} of driving`, "Start earlier, or move one stop to another day."]);
    if (dp.rows.filter((r) => r.stop.type !== "homestay").length > 5)
      checks.push(["Watch", `Day ${dp.day} has ${dp.rows.length} stops`, "A packed day leaves no buffer. Drop the least important stop."]);
    if (dp.end > 19 * 60)
      checks.push(["Watch", `Day ${dp.day} runs until about ${fmtTime(dp.end)}`, "Winding roads are harder after dark. Finish earlier if you can."]);
    dp.rows.forEach((r) => {
      const open = toMin(r.stop.openTime), close = toMin(r.stop.closeTime);
      if (open != null && r.arrive < open)
        checks.push(["Fix", `${r.stop.name}: you arrive ${fmtTime(r.arrive)}, it opens ${fmtTime(open)}`, "Swap the order or shift the day's start time."]);
      if (close != null && r.arrive + (r.stay || 0) > close)
        checks.push(["Fix", `${r.stop.name}: closes ${fmtTime(close)}, you would still be there`, "Visit earlier in the day."]);
    });
  });
  for (let d = 1; d <= nights; d++) {
    if (!stayStops.some((s) => s.day === d))
      checks.push(["Watch", `Night ${d}: no stay chosen`, "Pick a homestay from the Homestays tab, or book somewhere in advance."]);
  }
  stayStops.forEach((s) => {
    if (!phoneDigits(s.phone))
      checks.push(["Watch", `${s.name}: no phone number on file`, "Ask the Ratnagiri Tourism desk for a contact before you travel."]);
  });
  if (!catalog.atms.length) {
    checks.push(["Tip", "ATM locations were not available for this guide", "Withdraw cash in Ratnagiri town and carry enough for the whole trip."]);
  } else {
    const far = coverage.filter((c) => c.atm && c.atm.km > 12);
    if (far.length)
      checks.push(["Watch",
        `${far.length} ${far.length === 1 ? "stop is" : "stops are"} more than 12 km from an ATM: ${far.slice(0, 3).map((c) => c.s.name).join(", ")}`,
        "Withdraw cash before heading out and keep small notes."]);
  }
  if (budget > 0 && cost.total > budget)
    checks.push(["Fix", `Estimate is ${inr(cost.total - budget)} over your ${inr(budget)} budget`, "Cut a day, choose cheaper transport or raise the budget."]);
  if (start) {
    const mo = start.getMonth() + 1;
    if (mo >= 6 && mo <= 9)
      checks.push(["Watch", "You are travelling in the monsoon", "Expect heavy rain, slippery ghats and rough seas. Keep plans flexible."]);
    else if (mo === 4 || mo === 5)
      checks.push(["Tip", "Summer and mango season", "Start early to avoid midday heat. Alphonso mangoes are in season."]);
    else
      checks.push(["OK", "Good travel season", "Pleasant weather for most outdoor stops."]);
  }
  if (!checks.some((c) => c[0] === "Fix" || c[0] === "Watch"))
    checks.unshift(["OK", "No major issues found", "Your day lengths, timings and budget look comfortable."]);
  checks.sort((a, b) => LEVEL_RANK[a[0]] - LEVEL_RANK[b[0]]);

  const nFix = checks.filter((c) => c[0] === "Fix").length;
  const nWatch = checks.filter((c) => c[0] === "Watch").length;
  const nTip = checks.filter((c) => c[0] === "Tip").length;
  const attention = nFix + nWatch;
  const score = Math.max(35, 100 - nFix * 14 - nWatch * 6 - nTip * 2);
  const verdict = score >= 85 ? ["Ready to go", C.green] : score >= 65 ? ["Almost ready", C.yellow] : ["Needs attention", C.red];

  /* ---------------- COVER ---------------- */
  doc.setFillColor(...C.brand).rect(0, 0, W, 112, "F");
  doc.setFillColor(...C.brandDark).circle(W - 4, 20, 52, "F");
  doc.setFillColor(251, 146, 60).circle(W + 14, 78, 30, "F");
  doc.setFillColor(...C.brandDark).rect(0, 104, W, 8, "F");
  pill(doc, M, 14, "TRIP GUIDE", [154, 52, 18], 7.5);
  doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(9);
  doc.text("RATNAGIRI TOURISM  |  JEWEL OF KONKAN", M + 30, 17.6);
  doc.setFontSize(30);
  const titleLines = doc.splitTextToSize(clean(name), 140);
  doc.text(titleLines.slice(0, 3), M, 46);
  doc.setFont("helvetica", "normal").setFontSize(13);
  doc.text("Your personal trip guide", M, 46 + titleLines.slice(0, 3).length * 12 + 2);
  if (start) {
    doc.setFontSize(11);
    doc.text(`${dayDate(1)}${numDays > 1 ? "  to  " + dayDate(numDays) : ""}`, M, 98);
  }
  doc.setFontSize(8);
  doc.text(`Prepared ${fmtDate(new Date())}  |  for ${people} ${people === 1 ? "traveller" : "travellers"}`, M, 109);

  // readiness badge
  doc.setFillColor(255).circle(W - M - 17, 84, 17, "F");
  doc.setFont("helvetica", "bold").setFontSize(22).setTextColor(...verdict[1]);
  doc.text(String(score), W - M - 17, 85, { align: "center" });
  doc.setFontSize(6.5).setTextColor(...C.mid);
  doc.text("TRIP READINESS", W - M - 17, 91, { align: "center" });

  const stats = [
    [String(numDays), numDays === 1 ? "Day" : "Days"],
    [String(placeStops.length), "Places"],
    [`${Math.round(totalKm)} km`, "Approx. driving"],
    [fmtDuration(totalDrive) || "-", "Time on the road"],
  ];
  const bw = (W - 2 * M - 3 * 5) / 4;
  stats.forEach(([v, l], i) => {
    const x = M + i * (bw + 5);
    doc.setFillColor(255).setDrawColor(...C.line).roundedRect(x, 124, bw, 26, 3, 3, "FD");
    doc.setTextColor(...C.brandDark).setFont("helvetica", "bold").setFontSize(16).text(v, x + bw / 2, 136, { align: "center" });
    doc.setTextColor(...C.mid).setFont("helvetica", "normal").setFontSize(8.5).text(l, x + bw / 2, 144, { align: "center" });
  });

  doc.setFillColor(...C.amber).setDrawColor(...C.amberLine).roundedRect(M, 160, W - 2 * M, 30, 3, 3, "FD");
  doc.setTextColor(...C.dark).setFont("helvetica", "bold").setFontSize(11);
  doc.text("Estimated trip cost", M + 6, 171);
  doc.setFontSize(20).setTextColor(...C.brandDark);
  doc.text(inr(cost.total), M + 6, 183);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...C.mid);
  const perPersonTxt = people > 1 ? `${inr(perPerson)} per person  |  ` : "";
  doc.text(`${perPersonTxt}${inr(perPersonDay)} per person per day`, M + 70, 178);
  doc.text("Estimates only. Confirm prices with hosts and drivers.", M + 70, 184);

  doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(...C.dark);
  doc.text("How to use this guide", M, 206);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...C.mid);
  const howTo = [
    "Start with the Trip brief: readiness score, top actions and the map.",
    "Tap any stop name or numbered map pin to open it in Google Maps.",
    "Tap phone numbers to call, or WhatsApp to chat with hosts and drivers.",
    "Times start at 9:00 AM. Drive times assume ~35 km/h on Konkan roads.",
    "Save this PDF offline on your phone; mobile signal drops in rural areas.",
  ];
  howTo.forEach((t, i) => doc.text(`-  ${t}`, M, 214 + i * 6));
  if (tripUrl) {
    doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...C.blue);
    doc.textWithLink("Open this trip online  >", M, 214 + howTo.length * 6 + 4, { url: tripUrl });
  }

  /* ---------------- CONTENTS (page 2, filled in at the end) ---------------- */
  doc.addPage();

  /* ---------------- TRIP BRIEF ---------------- */
  doc.addPage();
  let y = sectionTitle(doc, "Trip brief", 22, "The whole trip on one page: how ready you are, what it costs and what to do first.");

  doc.setFillColor(...C.soft).setDrawColor(...C.line).setLineWidth(0.25).roundedRect(M, y, W - 2 * M, 32, 3, 3, "FD");
  doc.setFont("helvetica", "bold").setFontSize(26).setTextColor(...verdict[1]);
  doc.text(String(score), M + 8, y + 16);
  const sw = doc.getTextWidth(String(score));
  doc.setFontSize(9).setTextColor(...C.mid).text("/ 100", M + 10 + sw, y + 16);
  gauge(doc, M + 8, y + 22, 52, score, verdict[1]);
  doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(...C.ink);
  doc.text(verdict[0], M + 72, y + 11);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...C.dark);
  const verdictTxt = [
    attention
      ? `${attention} ${attention === 1 ? "item needs" : "items need"} a decision before you travel (${nFix} high, ${nWatch} medium). The top ones are listed below.`
      : "No blockers found. Confirm your bookings and you are set.",
    atmPct != null ? `${atmPct}% of your stops have an ATM within 12 km.` : "",
  ].filter(Boolean).join(" ");
  doc.text(doc.splitTextToSize(clean(verdictTxt), W - 2 * M - 80).slice(0, 4), M + 72, y + 17);
  y += 37;

  y = statCards(doc, y, [
    [inr(perPerson), "Per person"],
    [inr(perPersonDay), "Per person per day"],
    [`${Math.round(totalKm / numDays)} km`, "Driving per day"],
    [(stops.length / numDays).toFixed(1), "Stops per day"],
    [atmPct != null ? `${atmPct}%` : "-", "ATM within 12 km"],
  ]);
  y += 2;

  // top actions
  const topActions = checks.filter((c) => c[0] !== "OK").slice(0, 4);
  y = subhead(doc, y, "Do these first", C.brandDark);
  if (!topActions.length) {
    doc.setFont("helvetica", "italic").setFontSize(9).setTextColor(...C.mid);
    doc.text("Nothing urgent. Work through the Pre-trip action plan and enjoy.", M, y + 3);
    y += 9;
  }
  topActions.forEach(([lv, what, todo]) => {
    doc.setFont("helvetica", "normal").setFontSize(8.5);
    const a = doc.splitTextToSize(clean(todo), W - 2 * M - 34);
    const t = doc.splitTextToSize(clean(what), W - 2 * M - 34);
    const h = 5 + t.length * 4.2 + a.length * 4 + 2;
    y = ensureSpace(doc, y, h + 3);
    doc.setFillColor(255).setDrawColor(...C.line).setLineWidth(0.2).roundedRect(M, y, W - 2 * M, h, 2, 2, "FD");
    doc.setFillColor(...LEVEL_COLOR[lv]).roundedRect(M, y, 2.2, h, 1.1, 1.1, "F");
    pill(doc, M + 6, y + 2.6, LEVEL_NAME[lv], LEVEL_COLOR[lv], 6.5);
    doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...C.ink);
    doc.text(t, M + 28, y + 5.4);
    doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...C.mid);
    doc.text(a, M + 28, y + 5.4 + t.length * 4.2);
    y += h + 2.5;
  });
  y += 4;

  // days at a glance
  y = ensureSpace(doc, y, 40);
  y = subhead(doc, y, "Your days at a glance");
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [["Day", start ? "Date" : "", "Stops", "On the road", "Highlights"].filter((_, i) => start || i !== 1)],
    body: dayPlans.map((d) => {
      const highlights = d.stops.map((s) => clean(s.name)).join(", ");
      const row = [`Day ${d.day}`, String(d.stops.length), `${Math.round(d.km)} km, ${fmtDuration(d.driveMin) || "-"}`, highlights];
      if (start) row.splice(1, 0, dayDate(d.day));
      return row;
    }),
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 18 } },
  });
  y = doc.lastAutoTable.finalY + 10;

  /* ---------------- TRIP MAP ---------------- */
  const overviewPins = dayPlans.flatMap((dp) =>
    dp.rows
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => hasXY(r.stop))
      .map(({ r, i }) => ({
        lat: r.stop.lat, lng: r.stop.lng, n: i + 1,
        color: DAY_COLORS[(dp.day - 1) % DAY_COLORS.length], url: mapsPin(r.stop),
      }))
  );
  if (overviewPins.length) {
    y = ensureSpace(doc, y, 125);
    y = sectionTitle(doc, "Trip map", y, "Colour = day, number = order of the stop that day. Tap a pin to open Google Maps.");
    const mapBottom = drawTripMap(doc, {
      x: M, y, w: W - 2 * M, h: 100,
      pins: overviewPins,
      lines: dayPlans.map((dp) => ({
        color: DAY_COLORS[(dp.day - 1) % DAY_COLORS.length],
        pts: dp.rows.filter((r) => hasXY(r.stop)).map((r) => r.stop),
      })),
      rings,
    });
    y = dayLegend(doc, mapBottom + 3, numDays);
    y = mapCaption(doc, y, "Dashed red outline: Ratnagiri district. Lines join stops in order and are straight-line, not road routes.");
    y += 4;
  }

  /* ---------------- RISKS AND FIXES ---------------- */
  y = ensureSpace(doc, y, 50);
  y = sectionTitle(
    doc, "Risks and fixes", y,
    attention ? `${attention} ${attention === 1 ? "thing" : "things"} worth a look before you go, ranked by priority` : "Automatic checks on your plan"
  );
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [["Priority", "What we noticed", "What to do"]],
    body: checks.map(([lv, a, b]) => [LEVEL_NAME[lv], a, b]),
    columnStyles: { 0: { cellWidth: 20, fontStyle: "bold" }, 1: { cellWidth: 80 } },
    didParseCell: (d) => {
      if (d.section === "body" && d.column.index === 0) {
        const lv = Object.keys(LEVEL_NAME).find((k) => LEVEL_NAME[k] === d.cell.raw);
        d.cell.styles.textColor = LEVEL_COLOR[lv] || C.dark;
      }
    },
  });
  y = doc.lastAutoTable.finalY + 10;

  /* ---------------- BUDGET ---------------- */
  doc.addPage();
  y = sectionTitle(doc, "Budget", 22, `For ${people} ${people === 1 ? "person" : "people"}, ${numDays} ${numDays === 1 ? "day" : "days"}. Where the money goes, and what to hold back.`);
  const costRows = [
    ["Entry fees", cost.entry, [234, 88, 12]],
    ["Stay", cost.stay, [37, 99, 235]],
    [`Travel${cost.km ? ` (about ${Math.round(cost.km)} km)` : ""}`, cost.transport, [22, 163, 74]],
    ["Food (estimate)", cost.food, [147, 51, 234]],
  ].filter(([, v]) => v != null);

  const parts = costRows.filter(([, v]) => Number(v) > 0).map(([label, value, color]) => ({ label: label.replace(/ \(.*\)/, ""), value: Number(value), color }));
  if (parts.length) {
    y = stackedBar(doc, M, y, W - 2 * M, 7, parts) + 2;
  }

  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [["Item", "Amount"]],
    body: [
      ...costRows.map(([l, v]) => [l, inr(v)]),
      ["Total estimate", inr(cost.total)],
      [`Suggested buffer (10%) for surprises`, inr(contingency)],
      ["Total with buffer", inr(cost.total + contingency)],
    ],
    columnStyles: { 1: { halign: "right" } },
    didParseCell: (d) => {
      if (d.section === "body" && (d.row.index === costRows.length || d.row.index === costRows.length + 2)) {
        d.cell.styles.fontStyle = "bold";
        d.cell.styles.fillColor = C.amber;
      }
    },
  });
  y = doc.lastAutoTable.finalY + 5;

  if (budget > 0) {
    const over = cost.total > budget;
    const pct = Math.min(100, (cost.total / budget) * 100);
    doc.setFillColor(...C.line).roundedRect(M, y, W - 2 * M, 4, 2, 2, "F");
    doc.setFillColor(...(over ? C.red : C.green)).roundedRect(M, y, Math.max(4, ((W - 2 * M) * pct) / 100), 4, 2, 2, "F");
    doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...(over ? C.red : C.green));
    doc.text(
      over ? `${inr(cost.total - budget)} over your ${inr(budget)} budget` : `${inr(budget - cost.total)} left of your ${inr(budget)} budget`,
      M, y + 10
    );
    y += 16;
  }
  if (cost.fallback) {
    doc.setFont("helvetica", "italic").setFontSize(8.5).setTextColor(...C.mid);
    doc.text("Only entry fees are counted here. Use 'Plan for me' for a full stay, food and travel estimate.", M, y + 3);
    y += 8;
  }

  y = statCards(doc, y + 2, [
    [inr(perPerson), "Per person"],
    [inr(perPersonDay), "Per person per day"],
    [cashSuggest ? inr(cashSuggest) : "-", "Cash to carry"],
  ]);
  if (cashSuggest) {
    doc.setFont("helvetica", "italic").setFontSize(8).setTextColor(...C.mid);
    doc.text("Cash suggestion covers food, local drivers and entry fees. Pay stays by UPI or transfer where hosts accept it.", M, y + 2);
    y += 8;
  }
  if (notes.length) {
    y = ensureSpace(doc, y, 10 + notes.length * 8);
    doc.setFillColor(...C.amber).setDrawColor(...C.amberLine);
    const noteLines = notes.flatMap((n) => doc.splitTextToSize(`!  ${clean(n)}`, W - 2 * M - 8));
    const boxH = noteLines.length * 4.6 + 6;
    doc.roundedRect(M, y, W - 2 * M, boxH, 2, 2, "FD");
    doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(146, 64, 14);
    doc.text(noteLines, M + 4, y + 6);
    y += boxH + 6;
  }

  /* ---------------- ITINERARY ---------------- */
  doc.addPage();
  y = sectionTitle(doc, "Day-by-day itinerary", 22, "Tap a stop name to open it in Google Maps");

  dayPlans.forEach((dp) => {
    const dayHasCoords = dp.rows.some((r) => hasXY(r.stop));
    y = ensureSpace(doc, y, dayHasCoords ? 125 : 60);
    doc.setFillColor(...C.brand).roundedRect(M, y, W - 2 * M, 10, 2, 2, "F");
    doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(11);
    doc.text(`Day ${dp.day}${start ? "  -  " + dayDate(dp.day) : ""}`, M + 4, y + 6.8);
    doc.setFont("helvetica", "normal").setFontSize(9);
    doc.text(`${dp.stops.length} stops  |  ~${Math.round(dp.km)} km driving`, W - M - 4, y + 6.8, { align: "right" });
    y += 13;

    if (!dp.rows.length) {
      doc.setTextColor(...C.mid).setFont("helvetica", "italic").setFontSize(9);
      doc.text("Free day. Relax, explore on your own or add stops in the planner.", M + 2, y + 4);
      y += 12;
      return;
    }

    y = statCards(doc, y, [
      ["9:00 AM", "Start"],
      [fmtTime(dp.end), "Wrap up (approx.)"],
      [String(dp.stops.length), "Stops"],
      [fmtDuration(dp.driveMin) || "-", "On the road"],
      [`${Math.round(dp.km)} km`, "Distance"],
    ]);

    if (dayHasCoords) {
      const color = DAY_COLORS[(dp.day - 1) % DAY_COLORS.length];
      const dayPins = dp.rows
        .map((r, i) => ({ r, i }))
        .filter(({ r }) => hasXY(r.stop))
        .map(({ r, i }) => ({ lat: r.stop.lat, lng: r.stop.lng, n: i + 1, color, name: r.stop.name, url: mapsPin(r.stop) }));
      const bottom = drawTripMap(doc, {
        x: M, y, w: W - 2 * M, h: 70, pins: dayPins, lines: [{ color, pts: dayPins }], rings, showNames: true,
      });
      y = mapCaption(doc, bottom + 1, "Pin numbers match the table below. Lines are straight-line, not road routes.");
    }

    const body = dp.rows.map((r, i) => {
      const s = r.stop;
      const timing =
        s.type === "homestay"
          ? `${fmtTime(r.arrive)}\nCheck-in`
          : `${fmtTime(r.arrive)}\n${r.stay ? "~" + fmtDuration(r.stay) : ""}`;
      const leg = i === 0 ? "Start of day" : r.legKm != null ? `~${Math.round(r.legKm)} km\n~${fmtDuration(r.legMin)}` : "-";
      return [`${i + 1}`, timing, clean(s.name), stopDetails(s), leg];
    });

    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [["#", "Time", "Stop", "Details", "From previous"]],
      body,
      styles: { ...tableDefaults.styles, fontSize: 8.5 },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: 22 },
        2: { cellWidth: 40, fontStyle: "bold", textColor: C.brandDark },
        4: { cellWidth: 24 },
      },
      didDrawCell: (d) => {
        if (d.section !== "body") return;
        const s = dp.rows[d.row.index].stop;
        if (d.column.index === 2 && hasXY(s)) doc.link(d.cell.x, d.cell.y, d.cell.width, d.cell.height, { url: mapsPin(s) });
        if (d.column.index === 3 && s.type === "busstop" && s.timetableLink)
          doc.link(d.cell.x, d.cell.y, d.cell.width, d.cell.height, { url: s.timetableLink });
        if (d.column.index === 3 && (s.type === "homestay" || s.type === "driver") && telUrl(s.phone))
          doc.link(d.cell.x, d.cell.y, d.cell.width, d.cell.height, { url: telUrl(s.phone) });
      },
    });
    y = doc.lastAutoTable.finalY + 4;

    const route = mapsRoute(dp.stops);
    if (route) {
      doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...C.blue);
      doc.textWithLink("Open Day " + dp.day + " full route in Google Maps  >", M, y + 3, { url: route });
      y += 4;
    }

    // plan B: nearby places that are not already in the trip
    const usedKeys = new Set(stops.map((s) => `${s.type}:${s.id}`));
    const geo = dp.stops.filter(hasXY);
    if (geo.length) {
      const centre = {
        lat: geo.reduce((a, s) => a + Number(s.lat), 0) / geo.length,
        lng: geo.reduce((a, s) => a + Number(s.lng), 0) / geo.length,
      };
      const alts = catalog.places
        .filter((p) => !usedKeys.has(`village:${p.id}`) && hasXY(p))
        .map((p) => ({ p, km: haversine(centre, { lat: Number(p.lat), lng: Number(p.lng) }) }))
        .filter((a) => a.km != null)
        .sort((a, b) => a.km - b.km)
        .slice(0, 3);
      if (alts.length) {
        const txt = doc.splitTextToSize(clean(alts.map((a) => `${a.p.name} (~${Math.round(a.km * ROAD_FACTOR)} km)`).join("   |   ")), W - 2 * M - 8);
        const bh = 9 + txt.length * 4;
        y = ensureSpace(doc, y + 2, bh + 2);
        doc.setFillColor(...C.soft).setDrawColor(...C.line).setLineWidth(0.2).roundedRect(M, y, W - 2 * M, bh, 2, 2, "FD");
        doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(...C.dark).text("If plans change, other places nearby", M + 4, y + 5);
        doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...C.mid).text(txt, M + 4, y + 9.5);
        y += bh;
      }
    }
    y += 10;
  });

  /* ---------------- PLACES AND STAYS ---------------- */
  const atmLine = (c) => (!catalog.atms.length ? null : c?.atm ? `Nearest ATM: ${c.atm.km.toFixed(1)} km (${clean(c.atm.item.bank || c.atm.item.name)})` : "No ATM listed nearby");
  const hospLine = (c) => (c?.hosp ? `Hospital: ${c.hosp.km.toFixed(1)} km` : c?.hospTaluka ? `Hospital: ${clean(c.hospTaluka.name)}` : null);

  doc.addPage();
  y = sectionTitle(doc, "Places and stays", 22, "What each stop is, what it costs, and the nearest cash and medical help.");

  if (placeStops.length) {
    y = subhead(doc, y, "Places you will visit", C.brandDark);
    dayPlans.forEach((dp) => dp.rows.forEach((r, i) => {
      const s = r.stop;
      if (!["village", "eco"].includes(s.type)) return;
      const c = coverOf(s);
      const fee = Number(s.fee) > 0 ? `Entry ${inr(s.fee)} per person (${inr(s.fee * people)} for your group)` : null;
      const hours = s.openTime && s.closeTime ? `Open ${s.openTime} to ${s.closeTime}` : null;
      y = stopCard(doc, y, {
        title: s.name,
        sub: [[s.village, s.taluka].filter(Boolean).join(", "), `Day ${dp.day}, stop ${i + 1}`].filter(Boolean).join("  |  "),
        badge: s.category ? truncate(s.category.replace(" Tourism", ""), 22) : "Place",
        color: DAY_COLORS[(dp.day - 1) % DAY_COLORS.length],
        desc: s.description ? truncate(String(s.description), 240) : "",
        meta: [`Arrive ~${fmtTime(r.arrive)}`, r.stay ? `Plan ${fmtDuration(r.stay)}` : null, fee, hours, s.bestTime ? `Best time: ${s.bestTime}` : null, atmLine(c), hospLine(c)].filter(Boolean),
        links: hasXY(s) ? [{ label: "Open in Maps", url: mapsPin(s) }, { label: "Directions", url: mapsDir(s) }] : [],
        url: hasXY(s) ? mapsPin(s) : null,
      });
    }));
    y += 2;
  }

  if (stayStops.length) {
    y = ensureSpace(doc, y, 40);
    y = subhead(doc, y, "Where you will stay", C.blue);
    stayStops.forEach((s) => {
      const c = coverOf(s);
      const links = [];
      if (telUrl(s.phone)) links.push({ label: "Call host", url: telUrl(s.phone) });
      if (waUrl(s.phone)) links.push({ label: "WhatsApp", url: waUrl(s.phone) });
      if (hasXY(s)) links.push({ label: "Directions", url: mapsDir(s) });
      y = stopCard(doc, y, {
        title: s.name,
        sub: [[s.village, s.taluka].filter(Boolean).join(", "), `Night of Day ${s.day}`].filter(Boolean).join("  |  "),
        badge: s.category ? truncate(String(s.category), 22) : "Homestay",
        color: C.blue,
        desc: [s.description, s.amenities ? `Amenities: ${s.amenities}` : ""].filter(Boolean).join(" ").slice(0, 260),
        meta: [
          "Check-in ~5:00 PM",
          s.price ? `From ${inr(s.price)} per night` : "Price: confirm with host",
          s.owner ? `Host: ${s.owner}` : null,
          s.phone ? `Phone: ${firstPhone(s.phone)}` : "Phone: not on file",
          atmLine(c),
          hospLine(c),
        ].filter(Boolean),
        links,
        url: hasXY(s) ? mapsPin(s) : null,
      });
    });
  } else if (numDays > 1) {
    doc.setFont("helvetica", "italic").setFontSize(9).setTextColor(...C.mid);
    doc.text("No stay is selected for this trip. Add a homestay in the planner or book in advance.", M, y + 4);
    y += 10;
  }
  if (!placeStops.length && !stayStops.length) {
    doc.setFont("helvetica", "italic").setFontSize(9).setTextColor(...C.mid);
    doc.text("Add places or homestays to your trip to see their details here.", M, y + 4);
  }

  /* ---------------- BOOKINGS & CONTACTS ---------------- */
  const bookable = stops.filter((s) => s.type === "homestay" || s.type === "driver");
  if (bookable.length) {
    y = ensureSpace(doc, y, 60);
    y = sectionTitle(doc, "Bookings and contacts", y, "Tick each one off after you have called to confirm. Tap a number to call or WhatsApp.");
    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [["Done", "Who", "Contact", "Day", "Confirm before you go"]],
      body: bookable.map((s) => [
        "",
        cleanLines([s.name, TYPE_LABEL[s.type], [s.village, s.taluka].filter(Boolean).join(", ")]),
        cleanLines([s.owner ? `Host: ${s.owner}` : "", s.phone || "Not provided", waUrl(s.phone) ? "WhatsApp available" : ""]),
        `Day ${s.day}`,
        s.type === "homestay"
          ? "Room and price, check-in time, meals, parking, directions, payment method"
          : "Fare, pick-up point and time, waiting charges, route, payment method",
      ]),
      styles: { ...tableDefaults.styles, fontSize: 8.5 },
      columnStyles: { 0: { cellWidth: 15 }, 1: { cellWidth: 46, fontStyle: "bold" }, 3: { cellWidth: 14 } },
      didDrawCell: (d) => {
        if (d.section !== "body") return;
        if (d.column.index === 0) {
          doc.setDrawColor(...C.mid).setLineWidth(0.4).rect(d.cell.x + 5, d.cell.y + d.cell.height / 2 - 2.5, 5, 5, "S");
        }
        if (d.column.index === 2) {
          const s = bookable[d.row.index];
          const link = waUrl(s.phone) || telUrl(s.phone);
          if (link) doc.link(d.cell.x, d.cell.y, d.cell.width, d.cell.height, { url: link });
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  /* ---------------- PRE-TRIP ACTION PLAN ---------------- */
  y = ensureSpace(doc, y, 90);
  y = sectionTitle(doc, "Pre-trip action plan", y, "A simple timeline so nothing is left to the last day. Tick as you go.");
  const monsoon = start && start.getMonth() + 1 >= 6 && start.getMonth() + 1 <= 9;
  const plan = [
    ["7 days before", bookable.length ? `Call ${bookable.length} ${bookable.length === 1 ? "host or driver" : "hosts and drivers"} from the Bookings list. Confirm price, timing and payment method.` : "Book your stay and a local driver. Confirm price, timing and payment method."],
    ["7 days before", "Share this guide with everyone travelling and agree the start time on Day 1."],
    ["2 days before", `Check weather and road conditions${monsoon ? " (monsoon: ghat roads can close)" : ""}. Download offline Google Maps for Ratnagiri.`],
    ["2 days before", cashSuggest ? `Withdraw about ${inr(cashSuggest)} in small notes. Keep the rest for UPI or cards.` : "Withdraw cash in small notes. Many rural stops do not take cards."],
    ["Day before", "Charge phones and a power bank, refuel if driving yourself and pack from the checklist."],
    ["Every morning", "Re-confirm the driver's pick-up and check the first stop's opening time."],
    ["If something goes wrong", "Call 112, share your Google Maps pin and follow the Travel essentials page."],
  ];
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [["When", "Action", "Done"]],
    body: plan.map(([w, a]) => [w, a, ""]),
    columnStyles: { 0: { cellWidth: 34, fontStyle: "bold", textColor: C.brandDark }, 2: { cellWidth: 16 } },
    didDrawCell: (d) => {
      if (d.section === "body" && d.column.index === 2)
        doc.setDrawColor(...C.mid).setLineWidth(0.4).rect(d.cell.x + 5.5, d.cell.y + d.cell.height / 2 - 2.5, 5, 5, "S");
    },
  });
  y = doc.lastAutoTable.finalY + 10;

  /* ---------------- SERVICES COVERAGE AND CASH PLAN ---------------- */
  doc.addPage();
  y = sectionTitle(doc, "Services and cash plan", 22, "How close an ATM, hospital, police station and bus stand is to each stop. Straight-line distances.");

  const key = [["Close", C.green], ["Moderate", C.yellow], ["Far", C.red], ["No data", C.mid]];
  let kx = M;
  doc.setFont("helvetica", "normal").setFontSize(8);
  key.forEach(([t, col]) => {
    doc.setFillColor(...col).circle(kx + 1.6, y + 1.8, 1.6, "F");
    doc.setTextColor(...C.dark).text(t, kx + 5, y + 3);
    kx += 26;
  });
  y += 8;

  if (coverage.length) {
    const cell = (x, nameFn, good, ok) =>
      x ? { text: `${x.km.toFixed(1)} km\n${clean(truncate(nameFn(x.item), 20))}`, st: lvl(x.km, good, ok) } : { text: "No data", st: "none" };
    const covRows = coverage.map((c) => ({
      label: `D${c.day}-${c.n}`,
      name: clean(truncate(c.s.name, 26)),
      cells: [
        cell(c.atm, (a) => a.bank || a.name, 8, 20),
        c.hosp ? cell(c.hosp, (f) => f.name, 15, 35) : c.hospTaluka ? { text: `In taluka\n${clean(truncate(c.hospTaluka.name, 20))}`, st: "ok" } : { text: "No data", st: "none" },
        c.pol ? cell(c.pol, (f) => f.name, 15, 35) : c.polTaluka ? { text: `In taluka\n${clean(truncate(c.polTaluka.name, 20))}`, st: "ok" } : { text: "No data", st: "none" },
        cell(c.bus, (b) => b.name, 10, 25),
      ],
    }));
    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [["Stop", "Name", "ATM", "Hospital", "Police", "Bus stand"]],
      body: covRows.map((r) => [r.label, r.name, ...r.cells.map((c) => c.text)]),
      styles: { ...tableDefaults.styles, fontSize: 8 },
      columnStyles: { 0: { cellWidth: 14, fontStyle: "bold" }, 1: { cellWidth: 40, fontStyle: "bold" } },
      didParseCell: (d) => {
        if (d.section === "body" && d.column.index >= 2) {
          const c = covRows[d.row.index].cells[d.column.index - 2];
          d.cell.styles.textColor = STATUS[c.st];
          d.cell.styles.fontStyle = "bold";
        }
      },
    });
    y = doc.lastAutoTable.finalY + 4;
    const missing = [];
    if (!hospitals.some(hasXY)) missing.push("hospital");
    if (!policeList.some(hasXY)) missing.push("police");
    if (missing.length) {
      doc.setFont("helvetica", "italic").setFontSize(7.5).setTextColor(...C.mid);
      doc.text(`Distances to ${missing.join(" and ")} points need coordinates in src/data/emergencyContacts.js. Call 108 or 112 in any emergency.`, M, y + 3);
      y += 8;
    }
  } else {
    doc.setFont("helvetica", "italic").setFontSize(9).setTextColor(...C.mid);
    doc.text("Add places or homestays with map locations to see service coverage.", M, y + 3);
    y += 10;
  }

  // ATMs along the route
  y = ensureSpace(doc, y, 50);
  y = subhead(doc, y + 2, "ATMs along your route", HELP_STYLE.atm.color);
  const routePts = coverage.map((c) => ({ ...c.s, lat: Number(c.s.lat), lng: Number(c.s.lng), n: c.n }));
  const routeAtms = nearestOf(catalog.atms, routePts, 8, 25);
  if (routeAtms.length) {
    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [["Bank", "ATM and area", "Hours", "Cash deposit", "Closest to"]],
      body: routeAtms.map((x) => [
        clean(x.item.bank || "ATM"),
        clean([x.item.name, x.item.village || x.item.taluka].filter(Boolean).join(" - ") || "-"),
        x.item.is24x7 ? "24x7" : "Limited hours",
        x.item.hasCashDeposit ? "Yes" : "-",
        `${clean(truncate(x.near.name, 22))}\n~${x.km.toFixed(1)} km`,
      ]),
      headStyles: { ...tableDefaults.headStyles, fillColor: HELP_STYLE.atm.color },
      styles: { ...tableDefaults.styles, fontSize: 8.5 },
      columnStyles: { 0: { fontStyle: "bold" } },
      didDrawCell: (d) => {
        if (d.section === "body" && d.column.index === 0) doc.link(d.cell.x, d.cell.y, d.cell.width, d.cell.height, { url: mapsDir(routeAtms[d.row.index].item) });
      },
    });
    y = doc.lastAutoTable.finalY + 6;
  } else {
    doc.setFont("helvetica", "italic").setFontSize(9).setTextColor(...C.mid);
    doc.text("No ATM data near your route. Withdraw cash in Ratnagiri town before you set off.", M, y + 3);
    y += 10;
  }

  y = ensureSpace(doc, y, 34);
  const cashTips = [
    cashSuggest ? `Suggested cash to carry: about ${inr(cashSuggest)} for food, local drivers and entry fees.` : "Carry enough cash for food, local drivers and entry fees.",
    "Withdraw in a town before rural stretches. Small villages often have no ATM, or an empty one.",
    "Keep Rs. 100 and Rs. 500 notes. Chai stalls, auto drivers and some homestays cannot break large notes.",
    "UPI works in most towns but needs signal. Carry cash as a backup.",
  ];
  doc.setFont("helvetica", "normal").setFontSize(8.5);
  const tipLines = cashTips.map((t) => doc.splitTextToSize(`-  ${clean(t)}`, W - 2 * M - 10));
  const tipH = 12 + tipLines.reduce((a, l) => a + l.length * 4.2, 0);
  doc.setFillColor(...C.amber).setDrawColor(...C.amberLine).roundedRect(M, y, W - 2 * M, tipH, 3, 3, "FD");
  doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(...C.dark).text("Cash plan", M + 5, y + 7);
  let ty2 = y + 12.5;
  doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...C.mid);
  tipLines.forEach((l) => { doc.text(l, M + 5, ty2); ty2 += l.length * 4.2; });
  y += tipH + 8;

  /* ---------------- HELP & SERVICES NEAR EACH DAY ---------------- */
  doc.addPage();
  y = sectionTitle(doc, "Help and services near your route", 22, "Nearest ATMs, hospitals, police, drivers and bus stands for each day. Distances are straight-line.");
  y = helpLegend(doc, y);

  const helpTable = (title, head, rows, linkFn, accent) => {
    y = ensureSpace(doc, y, 34);
    doc.setFont("helvetica", "bold").setFontSize(9.5).setTextColor(...accent);
    doc.text(title, M, y + 3);
    autoTable(doc, {
      ...tableDefaults,
      startY: y + 5,
      head: [head],
      body: rows,
      headStyles: { ...tableDefaults.headStyles, fillColor: accent },
      styles: { ...tableDefaults.styles, fontSize: 8.5 },
      columnStyles: { 0: { fontStyle: "bold" } },
      didDrawCell: (d) => {
        if (d.section !== "body") return;
        const url = linkFn(d.row.index, d.column.index);
        if (url) doc.link(d.cell.x, d.cell.y, d.cell.width, d.cell.height, { url });
      },
    });
    y = doc.lastAutoTable.finalY + 6;
  };

  const note = (text, color = C.mid) => {
    y = ensureSpace(doc, y, 12);
    doc.setFont("helvetica", "italic").setFontSize(8.5).setTextColor(...color);
    doc.text(clean(text), M, y + 3);
    y += 9;
  };

  dayPlans.forEach((dp) => {
    const pts = dp.rows
      .map((r, i) => ({ ...r.stop, n: i + 1 }))
      .filter(hasXY)
      .map((s) => ({ ...s, lat: Number(s.lat), lng: Number(s.lng) }));
    const talukas = new Set(dp.stops.map((s) => String(s.taluka || "").toLowerCase()).filter(Boolean));
    const color = DAY_COLORS[(dp.day - 1) % DAY_COLORS.length];

    const nearAtms = nearestOf(catalog.atms, pts, 3, 15);
    const nearHosp = nearestOf(facilities.filter((f) => f.kind === "hospital"), pts, 3, 30);
    const nearPol = nearestOf(facilities.filter((f) => f.kind === "police"), pts, 3, 30);
    const nearDrivers = nearestOf(catalog.drivers, pts, 3, 25);
    const nearBus = nearestOf(catalog.buses, pts, 2, 25);
    const talukaOnly = (kind) =>
      facilities.filter((f) => f.kind === kind && !hasXY(f) && talukas.has(String(f.taluka || "").toLowerCase()));

    y = ensureSpace(doc, y, pts.length ? 125 : 60);
    doc.setFillColor(...C.dark).roundedRect(M, y, W - 2 * M, 10, 2, 2, "F");
    doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(11);
    doc.text(`Day ${dp.day}${start ? "  -  " + dayDate(dp.day) : ""}  |  help and services nearby`, M + 4, y + 6.8);
    y += 13;

    if (pts.length) {
      const asExtra = (x, st) => ({ ...st, lat: Number(x.item.lat), lng: Number(x.item.lng), url: mapsDir(x.item) });
      const extras = [
        ...nearAtms.map((x) => asExtra(x, HELP_STYLE.atm)),
        ...nearHosp.map((x) => asExtra(x, HELP_STYLE.hospital)),
        ...nearPol.map((x) => asExtra(x, HELP_STYLE.police)),
      ];
      const bottom = drawTripMap(doc, {
        x: M, y, w: W - 2 * M, h: 75,
        pins: pts.map((p) => ({ lat: p.lat, lng: p.lng, n: p.n, color, name: p.name, url: mapsPin(p) })),
        lines: [{ color, pts }], rings, extras, showNames: true,
      });
      y = mapCaption(doc, bottom + 1, "Tap an A, H or P marker for Google Maps directions. Stop numbers match the itinerary.");
    }

    if (nearAtms.length) {
      helpTable(
        "Nearest ATMs",
        ["Bank", "ATM and area", "Hours", "Cash deposit", "Distance"],
        nearAtms.map((x) => [
          clean(x.item.bank || "ATM"),
          clean([x.item.name, x.item.village || x.item.taluka].filter(Boolean).join(" - ") || "-"),
          x.item.is24x7 ? "24x7" : "Limited hours",
          x.item.hasCashDeposit ? "Yes" : "-",
          `~${x.km.toFixed(1)} km from stop ${x.near.n}`,
        ]),
        (r, c) => (c === 0 ? mapsDir(nearAtms[r].item) : null),
        HELP_STYLE.atm.color
      );
    } else note("No ATM data near this day's stops. Withdraw cash before heading to rural areas.");

    const hospRows = [
      ...nearHosp.map((x) => ({ f: x.item, dist: `~${x.km.toFixed(1)} km from stop ${x.near.n}`, url: mapsDir(x.item) })),
      ...talukaOnly("hospital").map((f) => ({ f, dist: `In ${f.taluka}`, url: null })),
    ];
    if (hospRows.length) {
      helpTable(
        "Nearest hospitals and medical help",
        ["Hospital", "Area", "Phone", "Distance"],
        hospRows.map(({ f, dist }) => [
          clean(f.name),
          clean([f.village, f.taluka].filter(Boolean).join(", ") || "-"),
          clean(f.phone || "Not listed - call 108"),
          dist,
        ]),
        (r, c) => (c === 0 ? hospRows[r].url : c === 2 ? telUrl(hospRows[r].f.phone) : null),
        HELP_STYLE.hospital.color
      );
    } else note("No hospital listed near this day. For any medical emergency call 108 or 112.", C.red);

    const polRows = [
      ...nearPol.map((x) => ({ f: x.item, dist: `~${x.km.toFixed(1)} km from stop ${x.near.n}`, url: mapsDir(x.item) })),
      ...talukaOnly("police").map((f) => ({ f, dist: `In ${f.taluka}`, url: null })),
    ];
    if (polRows.length) {
      helpTable(
        "Nearest police stations",
        ["Police station", "Area", "Phone", "Distance"],
        polRows.map(({ f, dist }) => [
          clean(f.name),
          clean([f.village, f.taluka].filter(Boolean).join(", ") || "-"),
          clean(f.phone || "Not listed - dial 100 / 112"),
          dist,
        ]),
        (r, c) => (c === 0 ? polRows[r].url : c === 2 ? telUrl(polRows[r].f.phone) : null),
        HELP_STYLE.police.color
      );
    } else note("No police station listed near this day. Dial 100 or 112, or Ratnagiri Police HQ control room: 02352-222222.");

    if (nearDrivers.length) {
      helpTable(
        "Local drivers and taxis",
        ["Driver", "Vehicle", "Phone", "Base", "Distance"],
        nearDrivers.map((x) => [
          clean(x.item.name),
          clean(x.item.category || "-"),
          clean(x.item.phone || "Not provided"),
          clean([x.item.village, x.item.taluka].filter(Boolean).join(", ") || "-"),
          `~${x.km.toFixed(1)} km from stop ${x.near.n}`,
        ]),
        (r, c) => (c === 0 ? waUrl(nearDrivers[r].item.phone) : c === 2 ? telUrl(nearDrivers[r].item.phone) : null),
        C.brandDark
      );
    }

    if (nearBus.length) {
      helpTable(
        "Nearest bus stands",
        ["Bus stand", "Taluka", "Timetable", "Distance"],
        nearBus.map((x) => [
          clean(x.item.name),
          clean(x.item.taluka || "-"),
          x.item.timetableLink ? "Download PDF" : "Not uploaded",
          `~${x.km.toFixed(1)} km from stop ${x.near.n}`,
        ]),
        (r, c) => (c === 0 ? mapsDir(nearBus[r].item) : c === 2 ? nearBus[r].item.timetableLink || null : null),
        [101, 163, 13]
      );
    }
    y += 6;
  });

  /* ---------------- ESSENTIALS ---------------- */
  doc.addPage();
  y = sectionTitle(doc, "Travel essentials", 22, "Keep these handy");

  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [["Emergency helplines (India)", "Number"]],
    body: NATIONAL_CONTACTS,
    columnStyles: { 1: { fontStyle: "bold", halign: "right", textColor: C.red, cellWidth: 40 } },
  });
  y = doc.lastAutoTable.finalY + 8;

  y = ensureSpace(doc, y, 50);
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [["Ratnagiri district control rooms", "Number"]],
    body: DISTRICT_CONTACTS,
    columnStyles: { 1: { fontStyle: "bold", halign: "right", textColor: C.red, cellWidth: 40 } },
  });
  y = doc.lastAutoTable.finalY + 4;
  doc.setFont("helvetica", "italic").setFontSize(7.5).setTextColor(...C.mid);
  doc.text("District numbers are from the official Ratnagiri district website. Numbers can change, so save 112 first.", M, y + 3);
  y += 10;

  y = ensureSpace(doc, y, 60);
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [["If something goes wrong", "What to do"]],
    body: EMERGENCY_STEPS,
    columnStyles: { 0: { cellWidth: 42, fontStyle: "bold", textColor: C.red } },
    headStyles: { ...tableDefaults.headStyles, halign: "left" },
  });
  y = doc.lastAutoTable.finalY + 10;

  y = ensureSpace(doc, y, 60);
  const tips = [
    ["Best time to visit", "October to March is the most comfortable. Monsoon (June to September) brings heavy rain, slippery ghat roads and rough seas."],
    ["Sea safety", "Swim only where locals do, and stay clear of the water when flags or locals warn of rough conditions. Never swim alone."],
    ["Cash and connectivity", "Carry some cash, since small homestays, stalls and local drivers often prefer it. Mobile signal can be weak in remote villages, so download offline maps."],
    ["Respect the place", "Dress modestly at temples, remove footwear where asked, ask before photographing people and carry your waste back out."],
    ["Local food", "Try fresh seafood thalis, kokum sherbet, modak and Ratnagiri Alphonso mangoes in season (roughly April to June)."],
    ["Timings", "Forts, temples and beaches may have seasonal or festival timings. Confirm locally when you can."],
  ];
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [["Know before you go", ""]],
    body: tips,
    columnStyles: { 0: { cellWidth: 40, fontStyle: "bold", textColor: C.brandDark } },
    headStyles: { ...tableDefaults.headStyles, halign: "left" },
  });
  y = doc.lastAutoTable.finalY + 12;

  /* ---------------- PACKING CHECKLIST ---------------- */
  y = ensureSpace(doc, y, 90);
  y = sectionTitle(doc, "Packing checklist", y, "Tick as you pack");
  const lists = [
    ["Documents & money", ["Photo ID for every traveller", "Booking / homestay confirmations", "Cash in small notes", "This guide (offline copy)"]],
    ["Clothing", ["Light cotton clothes", "Modest outfit for temples", "Swimwear & quick-dry towel", "Rain jacket or umbrella"]],
    ["Health & safety", ["Sunscreen, hat, sunglasses", "Personal medicines", "Insect repellent", "Basic first-aid kit"]],
    ["Gadgets & extras", ["Phone + power bank", "Reusable water bottle", "Comfortable walking shoes", "Camera / binoculars"]],
  ];
  const colW = (W - 2 * M) / 2;
  lists.forEach(([title, items], idx) => {
    const x = M + (idx % 2) * colW;
    const yy = y + Math.floor(idx / 2) * 38;
    doc.setFont("helvetica", "bold").setFontSize(9.5).setTextColor(...C.dark).text(title, x, yy);
    items.forEach((it, i) => {
      const iy = yy + 7 + i * 6.5;
      doc.setDrawColor(...C.mid).setLineWidth(0.3).rect(x, iy - 3, 3.4, 3.4);
      doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...C.dark).text(it, x + 6, iy);
    });
  });

  /* ---------------- CONTENTS PAGE (page 2) ---------------- */
  doc.setPage(2);
  let cy2 = sectionTitle(doc, "Contents", 22, "Tap a line to jump to that section");
  // sectionTitle recorded "Contents" in TOC; drop it so it is not listed
  TOC = TOC.filter((t) => t.title !== "Contents");
  const mainEntries = TOC.filter((t, i, a) => a.findIndex((x) => x.title === t.title) === i);
  mainEntries.forEach((t, i) => {
    const yy = cy2 + 6 + i * 11;
    doc.setFillColor(...C.soft).setDrawColor(...C.line).setLineWidth(0.2).roundedRect(M, yy - 6, W - 2 * M, 9.5, 2, 2, "FD");
    doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...C.brandDark).text(String(i + 1).padStart(2, "0"), M + 4, yy);
    doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(...C.dark).text(clean(t.title), M + 14, yy);
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...C.mid).text(`Page ${t.page}`, W - M - 4, yy, { align: "right" });
    doc.link(M, yy - 6, W - 2 * M, 9.5, { pageNumber: t.page });
  });
  const by = cy2 + 12 + mainEntries.length * 11;
  doc.setFillColor(...C.amber).setDrawColor(...C.amberLine).roundedRect(M, by, W - 2 * M, 26, 3, 3, "FD");
  doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(...C.dark).text("Three things to do before you leave", M + 5, by + 8);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...C.mid);
  doc.text("1.  Call every host and driver in the Bookings page and tick them off.", M + 5, by + 14.5);
  doc.text("2.  Save this PDF offline and download your area on Google Maps.", M + 5, by + 19.5);
  doc.text("3.  Save 112 and the Ratnagiri Police HQ number in your phone.", M + 5, by + 24.5);

  /* ---------------- HEADER / FOOTER ON EVERY PAGE ---------------- */
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    if (p > 1) {
      doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(...C.brand);
      doc.text("RATNAGIRI TOURISM", M, 12);
      doc.setFont("helvetica", "normal").setTextColor(...C.mid);
      doc.text(clean(name), W - M, 12, { align: "right" });
      doc.setDrawColor(...C.line).setLineWidth(0.2).line(M, 14.5, W - M, 14.5);
    }
    doc.setDrawColor(...C.line).setLineWidth(0.2).line(M, H - 14, W - M, H - 14);
    doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(...C.mid);
    doc.text("Costs, times and distances are estimates. Confirm with hosts and drivers before travelling.", M, H - 9);
    doc.text(`Page ${p} of ${pages}`, W - M, H - 9, { align: "right" });
  }

  TOC = null;
  const safe = clean(name).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "trip";
  doc.save(`${safe}-guide.pdf`);
}