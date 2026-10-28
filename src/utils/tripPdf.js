import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { NATIONAL_CONTACTS, DISTRICT_CONTACTS, FACILITIES, EMERGENCY_STEPS } from "../data/emergencyContacts";

/* ------------------------------------------------------------------
   Trip PDF generator (with vector maps)
   NOTE: jsPDF's built-in fonts can't draw emoji, the rupee sign or Devanagari.
   Everything goes through clean() and money is written as "Rs.".
   To print Marathi/Hindi names, embed a Noto Sans Devanagari font with
   doc.addFileToVFS / doc.addFont.
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
  amber: [255, 247, 237],
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

const inr = (n) => `Rs. ${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

const TYPE_LABEL = {
  village: "Place to visit",
  eco: "Nature / eco",
  homestay: "Stay",
  driver: "Local driver",
  busstop: "Bus stand",
};

const DEFAULT_VISIT_MINS = { village: 90, eco: 90, busstop: 15, driver: 0, homestay: 0 };

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

// Straight-line -> rough road distance for Konkan's winding roads, ~35 km/h average.
const ROAD_FACTOR = 1.35;
const AVG_KMH = 35;

function fmtTime(mins) {
  const h24 = Math.floor(mins / 60) % 24;
  const m = Math.round(mins % 60);
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, "0")} ${suffix}`;
}

function fmtDuration(mins) {
  if (mins == null) return "";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

function fmtDate(d) {
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

const mapsPin = (s) => `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`;

function mapsRoute(stops) {
  const pts = stops.filter((s) => s.lat && s.lng);
  if (pts.length < 2) return null;
  const f = (s) => `${s.lat},${s.lng}`;
  const mid = pts.slice(1, -1).map(f).join("|");
  return (
    `https://www.google.com/maps/dir/?api=1&origin=${f(pts[0])}&destination=${f(pts[pts.length - 1])}` +
    (mid ? `&waypoints=${encodeURIComponent(mid)}` : "")
  );
}

function normalizeStops(stops, details) {
  return stops.map((s, i) => {
    const d = details[`${s.type}:${s.id}`] || {};
    return { ...d, ...s, day: s.day || 1, _order: i };
  });
}

// Builds per-day schedule with times and travel legs.
function buildDays(stops, numDays) {
  const days = [];
  for (let d = 1; d <= numDays; d++) {
    const dayStops = stops
      .filter((s) => s.day === d)
      // homestays go last: you check in at the end of the day
      .sort((a, b) => (a.type === "homestay") - (b.type === "homestay") || a._order - b._order);

    let clock = 9 * 60;
    let prev = null;
    let km = 0;
    const rows = dayStops.map((s) => {
      let legKm = null;
      let legMin = null;
      if (prev) {
        const straight = haversine(prev, s);
        if (straight != null) {
          legKm = straight * ROAD_FACTOR;
          legMin = Math.round((legKm / AVG_KMH) * 60);
          km += legKm;
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
    days.push({ day: d, rows, km, stops: dayStops });
  }
  return days;
}

/* ------------------------------------------------------------------
   MAP RENDERING (pure vector, no images, no CORS)
------------------------------------------------------------------- */

// GeoJSON -> array of outer rings, each [[lng, lat], ...]
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
    return []; // the map still draws, just without the district outline
  }
}

// Sutherland-Hodgman: clip a polygon to the map rectangle.
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

// Liang-Barsky: clip one line segment to the map rectangle.
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

/* pins:  [{ lat, lng, n, color, name?, url? }]
   lines: [{ pts: [{lat,lng}], color }]
   Returns the y coordinate of the map's bottom edge. */
function drawTripMap(doc, { x, y, w, h, pins, lines = [], rings = [], showNames = false, extras = [] }) {
  const r = { x, y, w, h };
  doc.setFillColor(238, 242, 247).rect(x, y, w, h, "F");

  // projection fitted to the pins (equirectangular, corrected for latitude)
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
  const s = Math.min(w / (spanLng * 1.35), h / (spanLat * 1.35)); // mm per degree of latitude
  const cx = x + w / 2, cy = y + h / 2;
  const proj = (lat, lng) => [cx + (lng - cLng) * cosLat * s, cy - (lat - cLat) * s];
  const kmPerMm = 111.32 / s;

  // district land (white) with a dashed outline
  const projected = rings.map((ring) => {
    const pts = [];
    ring.forEach(([lng, lat]) => {
      const p = proj(lat, lng);
      const last = pts[pts.length - 1];
      if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) > 0.2) pts.push(p); // thin dense borders
    });
    return pts;
  });
  doc.setFillColor(255, 255, 255);
  projected.forEach((pts) => fillPoly(doc, clipPoly(pts, r)));

  // light graticule
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

  // district border
  doc.setDrawColor(...C.red).setLineWidth(0.5).setLineDashPattern([2, 1.4], 0);
  projected.forEach((pts) => {
    for (let i = 0; i < pts.length; i++) {
      const seg = clipSeg(pts[i], pts[(i + 1) % pts.length], r);
      if (seg) doc.line(seg[0][0], seg[0][1], seg[1][0], seg[1][1]);
    }
  });

  // route lines between stops (straight, in visiting order)
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

  // help markers: ATM (A), hospital (H), police (P) - drawn under the stop pins
  extras.forEach((e) => {
    const [ex, ey] = proj(e.lat, e.lng);
    doc.setFillColor(...e.color).setDrawColor(255).setLineWidth(0.5);
    doc.roundedRect(ex - 2.4, ey - 2.4, 4.8, 4.8, 0.9, 0.9, "FD");
    doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(6.5);
    doc.text(e.letter, ex, ey + 0.9, { align: "center" });
    if (e.url) doc.link(ex - 2.4, ey - 2.4, 4.8, 4.8, { url: e.url });
  });

  // pins
  const pos = pins.map((p) => ({ ...p, xy: proj(p.lat, p.lng) }));
  pos.forEach((p) => {
    const [px, py] = p.xy;
    doc.setFillColor(...p.color).setDrawColor(255).setLineWidth(0.6);
    doc.circle(px, py, 3.2, "FD");
    doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(7);
    doc.text(String(p.n), px, py + 0.95, { align: "center" });
    if (p.url) doc.link(px - 3.2, py - 3.2, 6.4, 6.4, { url: p.url });
  });

  // name labels with simple overlap avoidance
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

  // scale bar
  const nice = [1, 2, 5, 10, 20, 50, 100].filter((k) => k / kmPerMm <= w * 0.28).pop() || 1;
  const barLen = nice / kmPerMm;
  doc.setFillColor(255).rect(x + 2, y + h - 11, barLen + 12, 9, "F");
  doc.setDrawColor(...C.dark).setLineWidth(0.5);
  doc.line(x + 4, y + h - 5, x + 4 + barLen, y + h - 5);
  doc.line(x + 4, y + h - 6.5, x + 4, y + h - 3.5);
  doc.line(x + 4 + barLen, y + h - 6.5, x + 4 + barLen, y + h - 3.5);
  doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(...C.dark);
  doc.text(`${nice} km`, x + 4, y + h - 7.2);

  // north arrow
  const nx = x + w - 8, ny = y + 5;
  doc.setFillColor(255).circle(nx, ny + 3, 5.2, "F");
  doc.setFillColor(...C.dark).triangle(nx, ny - 0.5, nx - 2, ny + 4.5, nx + 2, ny + 4.5, "F");
  doc.setFont("helvetica", "bold").setFontSize(6.5).setTextColor(...C.dark);
  doc.text("N", nx, ny + 8, { align: "center" });

  // frame
  doc.setDrawColor(...C.mid).setLineWidth(0.3).rect(x, y, w, h, "S");
  return y + h;
}

function mapCaption(doc, y, text) {
  doc.setFont("helvetica", "italic").setFontSize(7.5).setTextColor(...C.mid);
  doc.text(clean(text), M, y + 4);
  return y + 8;
}

// Colour key for the overview map
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
   HELP NEAR THE ROUTE: nearest ATMs / hospitals / police
------------------------------------------------------------------- */

const HELP_STYLE = {
  atm: { letter: "A", color: [37, 99, 235], label: "ATM" },
  hospital: { letter: "H", color: [220, 38, 38], label: "Hospital" },
  police: { letter: "P", color: [30, 41, 59], label: "Police" },
};

const mapsDir = (o) => `https://www.google.com/maps/dir/?api=1&destination=${o.lat},${o.lng}`;
const hasXY = (o) => o && Number(o.lat) && Number(o.lng);

// Nearest items to any of the given stop points: [{ item, km, near }]
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

function sectionTitle(doc, text, y, sub) {
  doc.setFillColor(...C.brand);
  doc.rect(M, y, 3, 8, "F");
  doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(...C.dark);
  doc.text(clean(text), M + 6, y + 6.2);
  if (sub) {
    doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...C.mid);
    doc.text(clean(sub), M + 6, y + 11.5);
    return y + 16;
  }
  return y + 12;
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

/* ==================================================================
   downloadTripPdf  (async: loads the district border for the maps)
   opts: {
     name, stops, places (for extra details), people, days, startDate (YYYY-MM-DD),
     cost {entry, stay, food, transport, km, total}, budget, notes[],
     border (optional parsed GeoJSON)
   }
================================================================== */
export async function downloadTripPdf(opts) {
  const {
    name = "My Ratnagiri Trip",
    stops: rawStops = [],
    places = [],
    people = 2,
    days: plannedDays = 1,
    startDate = "",
    budget = 0,
    notes = [],
    atms = [],
    facilities = FACILITIES,
    tripUrl = "",
  } = opts;

  const details = {};
  places.forEach((p) => { details[`${p.type}:${p.id}`] = p; });

  const stops = normalizeStops(rawStops, details);
  const numDays = Math.max(plannedDays || 1, ...stops.map((s) => s.day), 1);
  const dayPlans = buildDays(stops, numDays);
  const rings = await loadRings(opts.border);
  const totalKm = dayPlans.reduce((a, d) => a + d.km, 0);
  const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const dayDate = (n) => {
    if (!start) return "";
    const d = new Date(start);
    d.setDate(d.getDate() + n - 1);
    return fmtDate(d);
  };

  // Cost: use the wizard's numbers when we have them, else a fees-only fallback.
  const cost = opts.cost || {
    entry: stops.reduce((a, s) => a + (Number(s.fee) || 0) * people, 0),
    total: stops.reduce((a, s) => a + (Number(s.fee) || 0) * people, 0),
    fallback: true,
  };

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setProperties({ title: clean(name), subject: "Ratnagiri trip itinerary", author: "Ratnagiri Tourism" });

  /* ---------------- COVER ---------------- */
  doc.setFillColor(...C.brand).rect(0, 0, W, 112, "F");
  doc.setFillColor(...C.brandDark).rect(0, 104, W, 8, "F");
  doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(10);
  doc.text("RATNAGIRI TOURISM  |  JEWEL OF KONKAN", M, 22);
  doc.setFontSize(30);
  const titleLines = doc.splitTextToSize(clean(name), W - 2 * M);
  doc.text(titleLines.slice(0, 3), M, 52);
  doc.setFont("helvetica", "normal").setFontSize(13);
  doc.text("Your personal trip itinerary", M, 52 + titleLines.slice(0, 3).length * 12 + 4);
  if (start) {
    doc.setFontSize(11);
    doc.text(`${dayDate(1)}${numDays > 1 ? "  to  " + dayDate(numDays) : ""}`, M, 100);
  }

  const stats = [
    [String(numDays), numDays === 1 ? "Day" : "Days"],
    [String(people), people === 1 ? "Traveller" : "Travellers"],
    [String(stops.filter((s) => s.type !== "homestay" && s.type !== "driver").length), "Places"],
    [`${Math.round(totalKm)} km`, "Approx. driving"],
  ];
  const bw = (W - 2 * M - 3 * 5) / 4;
  stats.forEach(([v, l], i) => {
    const x = M + i * (bw + 5);
    doc.setFillColor(255).setDrawColor(...C.line).roundedRect(x, 124, bw, 26, 3, 3, "FD");
    doc.setTextColor(...C.brandDark).setFont("helvetica", "bold").setFontSize(17).text(v, x + bw / 2, 136, { align: "center" });
    doc.setTextColor(...C.mid).setFont("helvetica", "normal").setFontSize(8.5).text(l, x + bw / 2, 144, { align: "center" });
  });

  doc.setFillColor(...C.amber).setDrawColor(253, 186, 116).roundedRect(M, 160, W - 2 * M, 30, 3, 3, "FD");
  doc.setTextColor(...C.dark).setFont("helvetica", "bold").setFontSize(11);
  doc.text("Estimated trip cost", M + 6, 171);
  doc.setFontSize(20).setTextColor(...C.brandDark);
  doc.text(inr(cost.total), M + 6, 183);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...C.mid);
  const perPerson = people > 1 ? `${inr(cost.total / people)} per person  |  ` : "";
  doc.text(`${perPerson}Estimates only, confirm prices with hosts and drivers`, M + 70, 183);

  doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(...C.dark);
  doc.text("How to use this guide", M, 206);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...C.mid);
  const howTo = [
    "Tap any stop name in the itinerary to open it in Google Maps.",
    "Tap any numbered pin on the maps to open that stop in Google Maps.",
    "Times are suggestions starting at 9:00 AM. Adjust to your own pace.",
    "Drive times assume ~35 km/h on Konkan roads. Add buffer for ghats and monsoon.",
    "Keep this PDF offline on your phone; mobile signal can drop in rural areas.",
  ];
  howTo.forEach((t, i) => doc.text(`-  ${t}`, M, 214 + i * 6));
  if (tripUrl) {
    doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(37, 99, 235);
    doc.textWithLink("Open this trip online  >", M, 214 + howTo.length * 6 + 4, { url: tripUrl });
  }

  /* ---------------- AT A GLANCE ---------------- */
  doc.addPage();
  let y = sectionTitle(doc, "Trip at a glance", 22, "Your days, summarised");
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [["Day", start ? "Date" : "", "Stops", "Approx. km", "Highlights"].filter((_, i) => start || i !== 1)],
    body: dayPlans.map((d) => {
      const highlights = d.stops.map((s) => clean(s.name)).join(", ");
      const row = [`Day ${d.day}`, String(d.stops.length), `${Math.round(d.km)} km`, highlights];
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
      .filter(({ r }) => r.stop.lat && r.stop.lng)
      .map(({ r, i }) => ({
        lat: r.stop.lat,
        lng: r.stop.lng,
        n: i + 1,
        color: DAY_COLORS[(dp.day - 1) % DAY_COLORS.length],
        url: mapsPin(r.stop),
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
        pts: dp.rows.filter((r) => r.stop.lat && r.stop.lng).map((r) => r.stop),
      })),
      rings,
    });
    y = dayLegend(doc, mapBottom + 3, numDays);
    y = mapCaption(doc, y, "Dashed red outline: Ratnagiri district. Lines join stops in order and are straight-line, not road routes.");
    y += 4;
  }

  /* ---------------- BUDGET ---------------- */
  y = ensureSpace(doc, y, 80);
  y = sectionTitle(doc, "Budget breakdown", y, `For ${people} ${people === 1 ? "person" : "people"}`);
  const costRows = [
    ["Entry fees", cost.entry],
    ["Stay", cost.stay],
    [`Travel${cost.km ? ` (about ${Math.round(cost.km)} km)` : ""}`, cost.transport],
    ["Food (estimate)", cost.food],
  ].filter(([, v]) => v != null);

  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [["Item", "Amount"]],
    body: [...costRows.map(([l, v]) => [l, inr(v)]), ["Total", inr(cost.total)]],
    columnStyles: { 1: { halign: "right" } },
    didParseCell: (d) => {
      if (d.section === "body" && d.row.index === costRows.length) {
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
    doc.setFillColor(...(over ? C.red : C.green)).roundedRect(M, y, ((W - 2 * M) * pct) / 100, 4, 2, 2, "F");
    doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...(over ? C.red : C.green));
    doc.text(
      over
        ? `${inr(cost.total - budget)} over your ${inr(budget)} budget`
        : `${inr(budget - cost.total)} left of your ${inr(budget)} budget`,
      M, y + 10
    );
    y += 16;
  }
  if (cost.fallback) {
    doc.setFont("helvetica", "italic").setFontSize(8.5).setTextColor(...C.mid);
    doc.text("Only entry fees are counted here. Use 'Plan for me' for a full stay, food and travel estimate.", M, y + 3);
    y += 8;
  }
  if (notes.length) {
    y = ensureSpace(doc, y, 10 + notes.length * 8);
    doc.setFillColor(...C.amber).setDrawColor(253, 186, 116);
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
    const dayHasCoords = dp.rows.some((r) => r.stop.lat && r.stop.lng);
    y = ensureSpace(doc, y, dayHasCoords ? 110 : 50);
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

    // Day map
    if (dayHasCoords) {
      const color = DAY_COLORS[(dp.day - 1) % DAY_COLORS.length];
      const dayPins = dp.rows
        .map((r, i) => ({ r, i }))
        .filter(({ r }) => r.stop.lat && r.stop.lng)
        .map(({ r, i }) => ({
          lat: r.stop.lat, lng: r.stop.lng, n: i + 1, color,
          name: r.stop.name, url: mapsPin(r.stop),
        }));
      const bottom = drawTripMap(doc, {
        x: M, y, w: W - 2 * M, h: 70,
        pins: dayPins,
        lines: [{ color, pts: dayPins }],
        rings,
        showNames: true,
      });
      y = mapCaption(doc, bottom + 1, "Pin numbers match the table below. Lines are straight-line, not road routes.");
    }

    const body = dp.rows.map((r, i) => {
      const s = r.stop;
      const area = [s.village || s.village_name, s.taluka || s.taluka_name].filter(Boolean).join(", ");
      const extra = [
        s.category || s.type_label,
        s.type && s.type === "homestay" && s.owner ? `Host: ${s.owner}` : null,
        s.note,
      ].filter(Boolean).join(" | ");
      const detail = [TYPE_LABEL[s.type] || "Stop", area, extra].filter(Boolean).map(clean).join("\n");
      const timing =
        s.type === "homestay"
          ? `${fmtTime(r.arrive)}\nCheck-in`
          : `${fmtTime(r.arrive)}\n${r.stay ? "~" + fmtDuration(r.stay) : ""}`;
      const leg = i === 0 ? "Start of day" : r.legKm != null ? `~${Math.round(r.legKm)} km\n~${fmtDuration(r.legMin)}` : "-";
      return [`${i + 1}`, timing, clean(s.name), detail, leg];
    });

    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [["#", "Time", "Stop", "Details", "From previous"]],
      body,
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: 24 },
        2: { cellWidth: 44, fontStyle: "bold", textColor: C.brandDark },
        4: { cellWidth: 26 },
      },
      didDrawCell: (d) => {
        if (d.section === "body" && d.column.index === 2) {
          const s = dp.rows[d.row.index].stop;
          if (s.lat && s.lng) {
            doc.link(d.cell.x, d.cell.y, d.cell.width, d.cell.height, { url: mapsPin(s) });
          }
        }
      },
    });
    y = doc.lastAutoTable.finalY + 4;

    const route = mapsRoute(dp.stops);
    if (route) {
      doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(37, 99, 235);
      doc.textWithLink("Open Day " + dp.day + " full route in Google Maps  >", M, y + 3, { url: route });
      y += 4;
    }
    y += 10;
  });

  /* ---------------- STAYS & CONTACTS ---------------- */
  const contacts = stops.filter((s) => s.phone || s.owner || s.type === "homestay" || s.type === "driver");
  if (contacts.length) {
    y = ensureSpace(doc, y, 50);
    y = sectionTitle(doc, "Stays and local contacts", y, "Call ahead to confirm availability, price and directions");
    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [["Type", "Name", "Contact person", "Phone", "Area"]],
      body: contacts.map((s) => [
        TYPE_LABEL[s.type] || "Contact",
        clean(s.name),
        clean(s.owner || "-"),
        clean((s.phone || "").split("/").join(" / ") || "Not provided"),
        clean([s.village, s.taluka].filter(Boolean).join(", ") || "-"),
      ]),
      columnStyles: { 1: { fontStyle: "bold" } },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  /* ---------------- HELP NEAR YOUR ROUTE ---------------- */
  doc.addPage();
  y = sectionTitle(doc, "Help near your route", 22, "Nearest ATMs, hospitals and police for each day. Distances are straight-line, so allow more on the road.");
  y = helpLegend(doc, y);

  const helpTable = (title, head, rows, urls, accent) => {
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
        if (d.section === "body" && d.column.index === 0 && urls[d.row.index]) {
          doc.link(d.cell.x, d.cell.y, d.cell.width, d.cell.height, { url: urls[d.row.index] });
        }
      },
    });
    y = doc.lastAutoTable.finalY + 6;
  };

  dayPlans.forEach((dp) => {
    const pts = dp.rows
      .map((r, i) => ({ ...r.stop, n: i + 1 }))
      .filter((s) => hasXY(s))
      .map((s) => ({ ...s, lat: Number(s.lat), lng: Number(s.lng) }));
    const talukas = new Set(
      dp.stops.map((s) => String(s.taluka || s.taluka_name || "").toLowerCase()).filter(Boolean)
    );
    const color = DAY_COLORS[(dp.day - 1) % DAY_COLORS.length];

    const nearAtms = nearestOf(atms, pts, 3, 15);
    const nearHosp = nearestOf(facilities.filter((f) => f.kind === "hospital"), pts, 3, 30);
    const nearPol = nearestOf(facilities.filter((f) => f.kind === "police"), pts, 3, 30);
    const talukaOnly = (kind) =>
      facilities.filter((f) => f.kind === kind && !hasXY(f) && talukas.has(String(f.taluka || "").toLowerCase()));

    y = ensureSpace(doc, y, pts.length ? 125 : 60);
    doc.setFillColor(...C.dark).roundedRect(M, y, W - 2 * M, 10, 2, 2, "F");
    doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(11);
    doc.text(`Day ${dp.day}${start ? "  -  " + dayDate(dp.day) : ""}  |  help nearby`, M + 4, y + 6.8);
    y += 13;

    if (pts.length) {
      const extras = [
        ...nearAtms.map((x) => ({ ...HELP_STYLE.atm, lat: Number(x.item.lat), lng: Number(x.item.lng), url: mapsDir(x.item) })),
        ...nearHosp.map((x) => ({ ...HELP_STYLE.hospital, lat: Number(x.item.lat), lng: Number(x.item.lng), url: mapsDir(x.item) })),
        ...nearPol.map((x) => ({ ...HELP_STYLE.police, lat: Number(x.item.lat), lng: Number(x.item.lng), url: mapsDir(x.item) })),
      ];
      const bottom = drawTripMap(doc, {
        x: M, y, w: W - 2 * M, h: 75,
        pins: pts.map((p) => ({ lat: p.lat, lng: p.lng, n: p.n, color, name: p.name, url: mapsPin(p) })),
        lines: [{ color, pts }],
        rings,
        extras,
        showNames: true,
      });
      y = mapCaption(doc, bottom + 1, "Tap an A, H or P marker for Google Maps directions. Stop numbers match the itinerary.");
    }

    // ATMs
    if (nearAtms.length) {
      helpTable(
        "Nearest ATMs",
        ["Bank", "ATM and area", "Hours", "Cash deposit", "Distance"],
        nearAtms.map((x) => {
          const a = x.item;
          return [
            clean(a.bank || "ATM"),
            clean([a.name, a.village || a.taluka].filter(Boolean).join(" - ") || "-"),
            a.is24x7 ? "24x7" : "Limited hours",
            a.hasCashDeposit ? "Yes" : "-",
            `~${x.km.toFixed(1)} km from stop ${x.near.n}`,
          ];
        }),
        nearAtms.map((x) => mapsDir(x.item)),
        HELP_STYLE.atm.color
      );
    } else {
      doc.setFont("helvetica", "italic").setFontSize(8.5).setTextColor(...C.mid);
      doc.text("No ATM data near this day's stops. Withdraw cash before heading to rural areas.", M, y + 3);
      y += 9;
    }

    // Hospitals
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
        hospRows.map((r) => r.url),
        HELP_STYLE.hospital.color
      );
    } else {
      doc.setFont("helvetica", "italic").setFontSize(8.5).setTextColor(...C.red);
      doc.text("No hospital listed near this day. For any medical emergency call 108 or 112.", M, y + 3);
      y += 9;
    }

    // Police
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
        polRows.map((r) => r.url),
        HELP_STYLE.police.color
      );
    } else {
      doc.setFont("helvetica", "italic").setFontSize(8.5).setTextColor(...C.mid);
      doc.text("No police station listed near this day. Dial 100 or 112, or the Ratnagiri Police HQ control room: 02352-222222.", M, y + 3);
      y += 9;
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
    body: tips.map(([a, b]) => [a, b]),
    columnStyles: { 0: { cellWidth: 40, fontStyle: "bold", textColor: C.brandDark } },
    headStyles: { ...tableDefaults.headStyles, halign: "left" },
  });
  y = doc.lastAutoTable.finalY + 12;

  /* ---------------- PACKING CHECKLIST ---------------- */
  y = ensureSpace(doc, y, 80);
  y = sectionTitle(doc, "Packing checklist", y, "Tick as you pack");
  const lists = [
    ["Documents & money", ["Photo ID for every traveller", "Booking / homestay confirmations", "Cash in small notes", "This itinerary (offline copy)"]],
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

  const safe = clean(name).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "trip";
  doc.save(`${safe}-itinerary.pdf`);
}