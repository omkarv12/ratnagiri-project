/* ==================================================================
   planTrip.js  -  builds a suggested trip from the visitor's answers.
   Pure functions, no React, no network. Put it in src/utils/planTrip.js

   Change the constants below to match real Ratnagiri prices.
================================================================== */

export const INTERESTS = [
  { id: "beach", label: "Beaches", emoji: "🏖️" },
  { id: "fort", label: "Forts & history", emoji: "🏰" },
  { id: "temple", label: "Temples", emoji: "🛕" },
  { id: "waterfall", label: "Waterfalls", emoji: "💧" },
  { id: "food", label: "Local food", emoji: "🍽️" },
  { id: "nature", label: "Nature & eco", emoji: "🌿" },
  { id: "culture", label: "Villages & culture", emoji: "🎭" },
  { id: "adventure", label: "Adventure", emoji: "🧗" },
];

export const PACES = {
  relaxed: { label: "Relaxed", hint: "about 3 stops a day", perDay: 3 },
  normal: { label: "Normal", hint: "about 4 stops a day", perDay: 4 },
  packed: { label: "Packed", hint: "about 5 stops a day", perDay: 5 },
};

// perKm is in rupees. perPerson = charged for each traveller (bus/auto),
// otherwise it is one price for the whole vehicle.
export const TRANSPORT = {
  own: { label: "My own vehicle", hint: "fuel only", perKm: 7, perPerson: false },
  driver: { label: "Car with driver", hint: "hired for the trip", perKm: 14, perPerson: false },
  public: { label: "Bus / auto", hint: "per person", perKm: 3, perPerson: true },
};

export const FOOD_PER_PERSON_PER_DAY = 400; // rupees
export const DEFAULT_VISIT_MINS = 60;
const DAY_MAX_MIN = 10 * 60; // stops + driving should fit in 10 hours
const ROAD_FACTOR = 1.3; // straight line -> rough road distance
const AVG_SPEED_KMH = 35;
const STAY_SHARE_OF_BUDGET = 0.35; // used to pick a homestay price cap
const NON_SPOT_TYPES = ["homestay", "driver", "busstop"];

/* ---------------- helpers ---------------- */
const clamp = (n, lo, hi) => Math.min(Math.max(Number(n) || lo, lo), hi);

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
const roadKm = (a, b) => haversine(a.lat, a.lng, b.lat, b.lng) * ROAD_FACTOR;

const feeNum = (fee) => (/^\d+(\.\d+)?$/.test(String(fee ?? "").trim()) ? Number(fee) : 0);

// Used only when a place has no `tags` of its own.
const TAG_WORDS = {
  beach: /beach|bay\b|sea\s?face|coast/i,
  fort: /fort|gad\b|durg\b|palace|museum|lighthouse|heritage/i,
  temple: /temple|mandir|devasthan|ganpati|dargah|mosque|church/i,
  waterfall: /waterfall|falls\b|dhabdhaba/i,
  food: /food|restaurant|mango|alphonso|cashew|kokum|thali|seafood/i,
  nature: /nature|forest|eco\b|sanctuary|hill|lake|garden|river|creek|mangrove/i,
  culture: /village|culture|craft|farm|festival/i,
  adventure: /trek|adventure|kayak|surf|dolphin|camp|zip|rafting/i,
};

export function tagsOf(place) {
  if (Array.isArray(place.tags) && place.tags.length) return place.tags.map((t) => String(t).toLowerCase());
  const text = `${place.name || ""} ${place.description || ""} ${place.category || ""}`;
  return Object.keys(TAG_WORDS).filter((k) => TAG_WORDS[k].test(text));
}

function scorePlace(p, interests) {
  const hits = interests.length ? p.tags.filter((t) => interests.includes(t)).length : 0;
  const base = interests.length ? hits * 3 : 1;
  return base + (Number(p.popularity) || 0) * 0.5 + (p.type === "eco" ? 0.5 : 0);
}

function nnOrder(anchor, list) {
  const rest = [...list];
  const out = [];
  let cur = anchor;
  while (rest.length) {
    let bi = 0;
    let bd = Infinity;
    rest.forEach((s, i) => {
      const d = haversine(cur.lat, cur.lng, s.lat, s.lng);
      if (d < bd) {
        bd = d;
        bi = i;
      }
    });
    cur = rest.splice(bi, 1)[0];
    out.push(cur);
  }
  return out;
}

/* ---------------- one full arrangement of the chosen places ---------------- */
function assemble(chosen, cfg) {
  const { days, people, transport, includeStay, stayCap, homestays } = cfg;
  const n = chosen.length;
  const d = Math.min(days, n);

  // Split into days by location: sort along the direction the places spread
  // the most (the coast runs roughly north-south) and cut into equal chunks.
  const spread = (arr) => Math.max(...arr) - Math.min(...arr);
  const byLat = spread(chosen.map((p) => p.lat)) >= spread(chosen.map((p) => p.lng));
  const sorted = [...chosen].sort((a, b) => (byLat ? b.lat - a.lat : a.lng - b.lng));
  const base = Math.floor(n / d);
  const extra = n % d;
  const chunks = [];
  let at = 0;
  for (let k = 0; k < d; k++) {
    const size = base + (k < extra ? 1 : 0);
    chunks.push(sorted.slice(at, at + size));
    at += size;
  }

  const usedStays = new Set();
  const timeDropped = [];
  const all = [];
  let anchor = null;

  for (let k = 0; k < d; k++) {
    const list = chunks[k];
    let ordered;
    if (anchor) ordered = nnOrder(anchor, list);
    else {
      const [first, ...rest] = list;
      ordered = [first, ...nnOrder(first, rest)];
    }

    // keep the day realistic: stops + driving must fit in DAY_MAX_MIN
    const dayMin = (arr) =>
      arr.reduce((s, p, i) => s + p.mins + (i ? (roadKm(arr[i - 1], p) / AVG_SPEED_KMH) * 60 : 0), 0);
    while (ordered.length > 1 && dayMin(ordered) > DAY_MAX_MIN) {
      let worst = 0;
      ordered.forEach((p, i) => {
        if (p.score < ordered[worst].score) worst = i;
      });
      timeDropped.push(ordered[worst]);
      ordered = ordered.filter((_, i) => i !== worst);
    }

    const stops = ordered.map((p) => ({ ...p, day: k + 1 }));

    // overnight stay near the last stop of the day
    if (includeStay && k < d - 1 && homestays.length) {
      const last = ordered[ordered.length - 1];
      const free = homestays.filter((h) => !usedStays.has(h.id));
      const cheap = stayCap ? free.filter((h) => (Number(h.pricePerNight) || 0) <= stayCap) : free;
      const pool = cheap.length
        ? cheap
        : [...free].sort((a, b) => (Number(a.pricePerNight) || 0) - (Number(b.pricePerNight) || 0)).slice(0, 1);
      if (pool.length) {
        const h = pool.reduce((best, x) =>
          haversine(last.lat, last.lng, x.lat, x.lng) < haversine(last.lat, last.lng, best.lat, best.lng) ? x : best
        );
        usedStays.add(h.id);
        stops.push({ ...h, day: k + 1, mins: 30, note: "Overnight stay", isStay: true });
      }
    }

    all.push(...stops);
    anchor = stops[stops.length - 1];
  }

  // cost estimate for the whole group
  const rooms = Math.ceil(people / 2);
  const entry = all.reduce((s, p) => s + (p.isStay ? 0 : p.feeN * people), 0);
  const stay = all.reduce((s, p) => s + (p.isStay ? (Number(p.pricePerNight) || 0) * rooms : 0), 0);
  const food = FOOD_PER_PERSON_PER_DAY * people * d;
  let km = 0;
  for (let i = 1; i < all.length; i++) km += roadKm(all[i - 1], all[i]);
  const tr = TRANSPORT[transport] || TRANSPORT.own;
  const transportCost = km * tr.perKm * (tr.perPerson ? people : 1);
  const total = entry + stay + food + transportCost;

  return {
    stops: all,
    days: d,
    timeDropped,
    cost: { entry, stay, food, transport: transportCost, total, km },
  };
}

/* ---------------- public: build the plan ---------------- */
/**
 * places: [{ type, id, name, lat, lng, tags?, fee?, mins?, openTime?, closeTime?,
 *            popularity?, pricePerNight? (homestays) }]
 * opts:   { days, people, budget (total rupees, 0 = no limit), interests[],
 *           pace, transport, includeStay }
 */
export function buildPlan(places, opts) {
  const days = clamp(opts.days, 1, 7);
  const people = clamp(opts.people, 1, 20);
  const budget = Number(opts.budget) || 0;
  const interests = opts.interests || [];
  const perDay = (PACES[opts.pace] || PACES.normal).perDay;
  const transport = TRANSPORT[opts.transport] ? opts.transport : "own";
  const includeStay = !!opts.includeStay;

  const ok = (p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng));
  const fix = (p) => ({ ...p, lat: Number(p.lat), lng: Number(p.lng) });

  const spots = places
    .filter((p) => !NON_SPOT_TYPES.includes(p.type) && ok(p))
    .map(fix)
    .map((p) => {
      const q = { ...p, tags: tagsOf(p), feeN: feeNum(p.fee), mins: Number(p.mins) || DEFAULT_VISIT_MINS };
      return { ...q, score: scorePlace(q, interests) };
    })
    .sort((a, b) => b.score - a.score || a.feeN - b.feeN);

  if (!spots.length) return { empty: true };

  const homestays = places.filter((p) => p.type === "homestay" && ok(p)).map(fix);
  const rooms = Math.ceil(people / 2);
  const nights = Math.max(days - 1, 0);
  const stayCap = budget && nights ? (budget * STAY_SHARE_OF_BUDGET) / (nights * rooms) : 0;
  const cfg = { days, people, transport, includeStay, stayCap, homestays };

  let chosen = spots.slice(0, Math.min(days * perDay, spots.length));
  let plan = assemble(chosen, cfg);
  const budgetDropped = [];

  // Over budget: remove the stop that saves the most money for the least loss of interest.
  // Keep at least 2 stops a day so the plan does not shrink to almost nothing.
  while (budget && plan.cost.total > budget && chosen.length > days * 2) {
    let best = null;
    for (const c of chosen) {
      const trial = assemble(chosen.filter((x) => x !== c), cfg);
      const saving = plan.cost.total - trial.cost.total;
      const ratio = saving / (c.score + 0.5);
      if (saving > 0 && (!best || ratio > best.ratio)) best = { c, ratio, trial };
    }
    if (!best) break;
    budgetDropped.push(best.c);
    chosen = chosen.filter((x) => x !== best.c);
    plan = best.trial;
  }

  const notes = [];
  if (plan.days < days) notes.push(`Only ${plan.days} ${plan.days === 1 ? "day" : "days"} of places were available, so the plan is shorter than you asked.`);
  if (interests.length) {
    const spotsInPlan = plan.stops.filter((s) => !s.isStay);
    const matched = spotsInPlan.filter((s) => s.tags.some((t) => interests.includes(t))).length;
    if (matched < spotsInPlan.length)
      notes.push(`Only ${matched} of ${spotsInPlan.length} stops match your interests exactly. The rest are popular places nearby.`);
  }
  if (budgetDropped.length)
    notes.push(`Removed ${budgetDropped.length} ${budgetDropped.length === 1 ? "stop" : "stops"} to stay closer to your budget.`);
  if (plan.timeDropped.length)
    notes.push(`Left out ${plan.timeDropped.length} ${plan.timeDropped.length === 1 ? "stop" : "stops"} that would not fit in a day.`);
  if (includeStay && plan.days > 1 && !homestays.length) notes.push("No homestays are listed yet, so stay costs are not included.");

  return {
    empty: false,
    name: `${plan.days}-day Ratnagiri plan`,
    numDays: plan.days,
    startTime: "09:00",
    // shape expected by the trip store
    stops: plan.stops.map((s) => ({
      type: s.type,
      id: s.id,
      name: s.name,
      lat: s.lat,
      lng: s.lng,
      day: s.day,
      mins: s.mins,
      note: s.note || "",
      ...(s.openTime ? { openTime: s.openTime } : {}),
      ...(s.closeTime ? { closeTime: s.closeTime } : {}),
      ...(!s.isStay && s.fee !== undefined && s.fee !== null && s.fee !== "" ? { fee: s.fee } : {}),
    })),
    cost: plan.cost,
    budget,
    overBudget: !!budget && plan.cost.total > budget,
    notes,
  };
}