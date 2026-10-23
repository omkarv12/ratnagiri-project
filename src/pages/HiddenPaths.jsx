import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Crosshair, MapPin, Clock, TrendingUp, Sun,
  Navigation, AlertTriangle, Loader2, Plus,
} from 'lucide-react';
import API_BASE_URL from '../config';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Matches the About > Geography > Hidden Paths entry in navMenus.
const SUBMIT_ROUTE = '/experiences/hidden-paths/submit';
const detailRoute = (id) => `/experiences/hidden-paths/${id}`;

const PATH_TYPES = ['Forest trail', 'Secret beach', 'Waterfall', 'Viewpoint', 'Village walk'];
const DIFFICULTIES = ['Easy', 'Moderate', 'Hard'];

const SORTS = [
  { value: 'nearest', label: 'Nearest first' },
  { value: 'shortest', label: 'Shortest first' },
  { value: 'newest', label: 'Newest first' },
];

// Placeholder gradient per type (used until a real cover photo exists).
const TYPE_GRADIENT = {
  'Village walk': 'from-[#5b8a5a] to-[#8fb07f]',
  'Secret beach': 'from-[#3b6a85] to-[#9cc7cc]',
  'Waterfall': 'from-[#3f6b55] to-[#6f9e86]',
  'Forest trail': 'from-[#5f8040] to-[#b0c27a]',
  'Viewpoint': 'from-[#7a5a2e] to-[#d9b060]',
};

const DIFFICULTY_STYLE = {
  Easy: 'bg-emerald-100 text-emerald-800',
  Moderate: 'bg-amber-100 text-amber-800',
  Hard: 'bg-red-100 text-red-800',
};

// Shown (with a "Showing sample paths" label) until the API returns approved paths.
const SAMPLE_PATHS = [
  { id: 's1', title: 'Mangrove Boardwalk at Kajali', path_type: 'Village walk', difficulty: 'Easy', village: 'Kajali', taluka: 'Ratnagiri', duration_min: 90, length_km: 3.2, best_season: 'Oct to Feb', safety_notes: 'Tidal. Check the tide table before you start.', locals_pick: true, verified_by_dept: true, open_in_monsoon: false, distance_km: 4, start_lat: 17.0, start_lng: 73.3 },
  { id: 's2', title: 'Cliff Edge Trail to a Quiet Cove', path_type: 'Secret beach', difficulty: 'Moderate', village: 'Ladghar', taluka: 'Dapoli', duration_min: 150, length_km: 5.6, best_season: 'Nov to Mar', safety_notes: 'Steep drop near the cliff. No mobile network.', locals_pick: true, verified_by_dept: true, open_in_monsoon: false, distance_km: 38, start_lat: 17.7, start_lng: 73.1 },
  { id: 's3', title: 'Seasonal Waterfall Footpath', path_type: 'Waterfall', difficulty: 'Moderate', village: 'Pawas', taluka: 'Ratnagiri', duration_min: 120, length_km: 4.1, best_season: 'Jul to Sep', safety_notes: 'Slippery rocks in the monsoon. Go with a local.', locals_pick: false, verified_by_dept: true, open_in_monsoon: true, distance_km: 21, start_lat: 17.0, start_lng: 73.3 },
  { id: 's4', title: 'Old Forest Footpath', path_type: 'Forest trail', difficulty: 'Easy', village: 'Velneshwar', taluka: 'Guhagar', duration_min: 60, length_km: 2.4, best_season: 'Year round', safety_notes: 'Leeches after rain. Wear closed shoes.', locals_pick: false, verified_by_dept: true, open_in_monsoon: true, distance_km: 52, start_lat: 17.4, start_lng: 73.2 },
  { id: 's5', title: 'Ridge Walk with a Sunset View', path_type: 'Viewpoint', difficulty: 'Hard', village: 'Anjarle', taluka: 'Dapoli', duration_min: 240, length_km: 9, best_season: 'Nov to Feb', safety_notes: 'Long, exposed climb. Carry water.', locals_pick: true, verified_by_dept: true, open_in_monsoon: false, distance_km: 44, start_lat: 17.8, start_lng: 73.1 },
  { id: 's6', title: 'Fisher Village Lane Walk', path_type: 'Village walk', difficulty: 'Easy', village: 'Mirya', taluka: 'Ratnagiri', duration_min: 60, length_km: 1.8, best_season: 'Year round', safety_notes: 'Respect homes and boats. Ask before photos.', locals_pick: false, verified_by_dept: true, open_in_monsoon: true, distance_km: 12, start_lat: 16.98, start_lng: 73.28 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(min) {
  if (!min) return null;
  if (min < 60) return `${min} min`;
  const hr = Math.round((min / 60) * 10) / 10;
  return `${hr} hr`;
}

const directionsUrl = (p) =>
  `https://www.google.com/maps/dir/?api=1&destination=${p.start_lat},${p.start_lng}`;

// ---------------------------------------------------------------------------
// Small components
// ---------------------------------------------------------------------------

function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
        active
          ? 'bg-[#16301f] text-white border-[#16301f]'
          : 'bg-white text-slate-800 border-stone-300 hover:border-[#16301f]'
      }`}
    >
      {children}
    </button>
  );
}

function Tag({ className, children }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${className}`}>
      {children}
    </span>
  );
}

function PathCard({ path, onOpen }) {
  const gradient = TYPE_GRADIENT[path.path_type] || 'from-slate-500 to-slate-300';
  const canNavigate = path.start_lat != null && path.start_lng != null;
  const cover = path.cover_photo;

  return (
    <article className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
      <div className={`relative h-44 bg-gradient-to-br ${gradient}`}>
        {cover && <img src={cover} alt={path.title} className="absolute inset-0 w-full h-full object-cover" />}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 text-[10px] font-bold tracking-wider text-slate-800 uppercase">
          {path.path_type}
        </span>
        {path.distance_km != null && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#16301f] text-white text-[11px] font-semibold">
            {Math.round(path.distance_km)} km away
          </span>
        )}
        {!cover && (
          <span className="absolute bottom-3 left-3 text-[11px] font-semibold text-white/90">Photo placeholder</span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          <Tag className={DIFFICULTY_STYLE[path.difficulty] || 'bg-slate-100 text-slate-700'}>{path.difficulty}</Tag>
          {path.verified_by_dept && <Tag className="bg-green-100 text-green-800">Verified by department</Tag>}
          {path.locals_pick && <Tag className="bg-orange-100 text-orange-800">Locals' pick</Tag>}
        </div>

        <h3 className="font-serif text-xl font-bold text-[#16301f] leading-snug mb-1">{path.title}</h3>
        <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-2.5">
          <MapPin size={13} className="text-amber-600 shrink-0" />
          {[path.village, path.taluka].filter(Boolean).join(', ')}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mb-3">
          {path.duration_min && (
            <span className="flex items-center gap-1"><Clock size={13} /> {formatDuration(path.duration_min)}</span>
          )}
          {path.length_km != null && (
            <span className="flex items-center gap-1"><TrendingUp size={13} /> {path.length_km} km</span>
          )}
          {path.best_season && (
            <span className="flex items-center gap-1"><Sun size={13} /> {path.best_season}</span>
          )}
        </div>

        {path.safety_notes && (
          <p className="text-xs text-amber-900 bg-amber-50 rounded-lg px-3 py-2 mb-4">
            <strong>Safety:</strong> {path.safety_notes}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2">
          <button
            onClick={onOpen}
            className="flex-1 py-2.5 rounded-lg bg-[#1f3d2b] text-white text-sm font-bold hover:bg-[#16301f] transition-colors"
          >
            View path
          </button>
          {canNavigate ? (
            <a
              href={directionsUrl(path)}
              target="_blank"
              rel="noreferrer"
              title="Directions to the start point"
              aria-label="Directions to the start point"
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-stone-300 text-[#16301f] hover:bg-stone-50"
            >
              <Navigation size={16} />
            </a>
          ) : (
            <span
              title="Exact location is kept private for this path"
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-stone-200 text-stone-300 cursor-not-allowed"
            >
              <Navigation size={16} />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HiddenPaths() {
  const navigate = useNavigate();

  const [paths, setPaths] = useState([]);
  const [isSample, setIsSample] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);

  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [localsOnly, setLocalsOnly] = useState(false);
  const [monsoonOnly, setMonsoonOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const loadPaths = async (coords) => {
    setLoading(true);
    try {
      const qs = coords ? `?lat=${coords.lat}&lng=${coords.lng}` : '';
      const res = await fetch(`${API_BASE_URL}/api/hidden-paths${qs}`);
      const data = await res.json();
      if (data.success && data.paths?.length) {
        setPaths(data.paths);
        setIsSample(false);
      } else {
        setPaths(SAMPLE_PATHS);
        setIsSample(true);
      }
    } catch {
      setPaths(SAMPLE_PATHS);
      setIsSample(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPaths(); }, []);

  // Only asks for location when the visitor taps the button.
  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert('Location is not available on this device.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await loadPaths({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortBy('nearest');
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert('Please allow location access to find paths near you.');
      }
    );
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = paths.filter((p) =>
      (type === 'All' || p.path_type === type) &&
      (difficulty === 'All' || p.difficulty === difficulty) &&
      (!localsOnly || p.locals_pick) &&
      (!monsoonOnly || p.open_in_monsoon) &&
      (!q || [p.title, p.village, p.taluka].some((v) => (v || '').toLowerCase().includes(q)))
    );
    const num = (v) => (v == null ? Infinity : v);
    if (sortBy === 'nearest') list.sort((a, b) => num(a.distance_km) - num(b.distance_km));
    else if (sortBy === 'shortest') list.sort((a, b) => num(a.length_km) - num(b.length_km));
    // 'newest' keeps the API order (newest first)
    return list;
  }, [paths, query, type, difficulty, localsOnly, monsoonOnly, sortBy]);

  const clearFilters = () => {
    setQuery(''); setType('All'); setDifficulty('All'); setLocalsOnly(false); setMonsoonOnly(false);
  };

  return (
    <div className="bg-[#f5f1e6] min-h-screen">
      {/* HERO */}
      <section className="bg-gradient-to-br from-[#12271a] to-[#2b5a3c] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-10">
          <p className="text-[11px] font-bold tracking-[0.18em] text-amber-400 uppercase mb-3">
            Off the beaten track · Konkan
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">Hidden Paths</h1>
          <p className="text-base text-white/80 max-w-xl mb-8">
            Quiet trails, secret coves and village walks shared by the people who live here.
            Every path is reviewed by the tourism department before it appears.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-3">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by path, village or taluka"
                className="w-full outline-none text-sm text-slate-800 bg-transparent"
              />
            </div>
            <button
              onClick={handleNearMe}
              disabled={locating}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#e0a63b] text-[#16301f] font-bold text-sm hover:bg-[#d09a30] transition-colors disabled:opacity-70"
            >
              {locating ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
              Paths near me
            </button>
          </div>
        </div>
      </section>

      {/* FILTERS + GRID */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-3 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-24 text-[11px] font-bold tracking-widest text-slate-500 uppercase">Type</span>
            <FilterPill active={type === 'All'} onClick={() => setType('All')}>All</FilterPill>
            {PATH_TYPES.map((t) => (
              <FilterPill key={t} active={type === t} onClick={() => setType(t)}>{t}</FilterPill>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-24 text-[11px] font-bold tracking-widest text-slate-500 uppercase">Difficulty</span>
            {DIFFICULTIES.map((d) => (
              <FilterPill key={d} active={difficulty === d} onClick={() => setDifficulty(difficulty === d ? 'All' : d)}>
                {d}
              </FilterPill>
            ))}
            <span className="hidden sm:block w-px h-5 bg-stone-300 mx-1" />
            <FilterPill active={localsOnly} onClick={() => setLocalsOnly((v) => !v)}>Locals' pick</FilterPill>
            <FilterPill active={monsoonOnly} onClick={() => setMonsoonOnly((v) => !v)}>Open in monsoon</FilterPill>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mb-5">
          <p className="text-sm text-slate-600">
            {isSample ? 'Showing sample paths' : `${visible.length} ${visible.length === 1 ? 'path' : 'paths'} found`}
          </p>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-stone-300 rounded-lg px-3 py-2 bg-white"
              aria-label="Sort paths"
            >
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button
              onClick={() => navigate(SUBMIT_ROUTE)}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#e0a63b] text-[#16301f] text-sm font-bold hover:bg-[#d09a30] transition-colors"
            >
              <Plus size={15} /> Submit a path
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-slate-500">
            <Loader2 className="animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-600 mb-3">No paths match your filters.</p>
            <button onClick={clearFilters} className="text-sm font-semibold text-[#1f3d2b] underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <PathCard
                key={p.id}
                path={p}
                onOpen={() => !isSample && navigate(detailRoute(p.id))}
              />
            ))}
          </div>
        )}

        {/* Mobile submit button */}
        <button
          onClick={() => navigate(SUBMIT_ROUTE)}
          className="sm:hidden w-full mt-6 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#e0a63b] text-[#16301f] font-bold text-sm"
        >
          <Plus size={16} /> Submit a path
        </button>

        {/* SAFETY NOTE */}
        <div className="mt-8 flex items-start gap-3 bg-white rounded-xl border border-stone-200 px-4 py-3.5">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600">
            <strong className="text-[#16301f]">Walk safely.</strong> Paths are shared by the community and
            reviewed by the department, but conditions change, especially in the monsoon. Download the map
            before you go, tell someone your route, follow local guidance and respect private land. See a
            problem? Use "Report a problem" on any path page.
          </p>
        </div>
      </section>
    </div>
  );
}
