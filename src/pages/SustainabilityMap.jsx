import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ReactLeaflet from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import {
  TreePine, BedDouble, MapPin, Image as ImageIcon,
  ShieldCheck, Search, X, Bus, List, Map as MapIcon,
  Heart, LayoutGrid, RotateCcw, ArrowRight, Frown, Route as RouteIcon,
} from 'lucide-react';
import { useLocations } from '../context/LocationsContext';
import ProfileDetails from './ProfileDetails';
import API_BASE_URL from '../config';
import RatnagiriCinematic from '../components/RatnagiriCinematic';
import { AddToTripButton, useTripPlanner } from '../components/TripPlanner';
import PlanYourTripPanel from '../components/PlanYourTripPanel';

const {
  MapContainer,
  TileLayer,
  LayerGroup,
  Marker,
  Popup,
  Tooltip,
  LayersControl,
  GeoJSON,
  Polyline,
  useMap,
  useMapEvents,
  ZoomControl,
} = ReactLeaflet;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Maps each category to an emoji + color (used for pins, legend, list thumbnails).
const CATEGORY_ICON_MAP = {
  "Beach Tourism": { emoji: "🏖️", color: "#0ea5e9" },
  "Heritage Tourism": { emoji: "🏛️", color: "#a855f7" },
  "Religious Tourism": { emoji: "🛕", color: "#f97316" },
  "Nature & Eco Tourism": { emoji: "🌿", color: "#16a34a" },
  "Adventure & Marine Tourism": { emoji: "🚤", color: "#0891b2" },
  "Homestays": { emoji: "🏡", color: "#e08b01" },
  "Taxi & Auto": { emoji: "🛺", color: "#0006a7" },
  "Bus Stand": { emoji: "🚌", color: "#487c00" },
  "ATM": { emoji: "🏧", color: "#0f766e" },
};
const DEFAULT_ICON = { emoji: "📍", color: "#e08b01" };

// Page behind "Discover Your Stay" under the Experiences menu (config/navMenus).
// The Homestays section of the map links here.
const STAY_ROUTE = "/experiences/discover-your-stay";

// Links tourism categories to the interests in the "Plan for me" wizard.
const CATEGORY_TAGS = {
  "Beach Tourism": ["beach"],
  "Heritage Tourism": ["fort", "culture"],
  "Religious Tourism": ["temple"],
  "Nature & Eco Tourism": ["nature"],
  "Adventure & Marine Tourism": ["adventure"],
};

const TOURISM_TYPES = [
  { value: "All", label: "All Types" },
  { value: "Beach Tourism", label: "🏖️ Beach Tourism" },
  { value: "Heritage Tourism", label: "🏛️ Heritage Tourism" },
  { value: "Religious Tourism", label: "🛕 Religious Tourism" },
  { value: "Nature & Eco Tourism", label: "🌿 Nature & Eco Tourism" },
  { value: "Adventure & Marine Tourism", label: "🚤 Adventure & Marine Tourism" },
];

// localStorage-backed favorites, keyed as "type:id" so different tables never collide.
const FAVORITES_KEY = "rt_favorites";

// Remembers that the user has already seen the "tap a numbered circle" hint.
const CLUSTER_HINT_KEY = "rt_cluster_hint_seen";

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadClusterHintVisible() {
  try {
    return !localStorage.getItem(CLUSTER_HINT_KEY);
  } catch {
    return true;
  }
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

// Haversine distance in km.
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// "12.3" or null when we don't know where the user is.
function distanceKm(user, lat, lng) {
  if (!user) return null;
  const d = calculateDistance(user.lat, user.lng, lat, lng);
  return d == null ? null : d.toFixed(1);
}

// Google Drive link -> thumbnail URL of a given width.
function driveThumb(link, width = 400) {
  if (!link) return null;
  const match = link.match(/[-\w]{25,}/);
  if (!match) return null;
  return `https://drive.google.com/thumbnail?id=${match[0]}&sz=w${width}`;
}
const driveIdToImageUrl = (link) => driveThumb(link, 1000);

const firstPhone = (p) => (p || '').split('/')[0].trim();
const hasCoords = (p, latKey = 'latitude', lngKey = 'longitude') => !!(p[latKey] && p[lngKey]);
const truncate = (s, n) => (s && s.length > n ? `${s.slice(0, n)}…` : s || '');

async function fetchRoute(lat1, lon1, lat2, lon2) {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`
    );
    const data = await response.json();
    if (data.routes && data.routes[0]) {
      return {
        distance: (data.routes[0].distance / 1000).toFixed(1),
        duration: Math.round(data.routes[0].duration / 60),
        geometry: data.routes[0].geometry,
      };
    }
    return null;
  } catch (err) {
    console.error("Route fetch failed:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Leaflet icons — cached so markers aren't re-created on every render
// ---------------------------------------------------------------------------

const markerIconCache = new Map();

function getMarkerIcon(category, isSelected) {
  const key = `${category || 'default'}:${isSelected ? 1 : 0}`;
  if (markerIconCache.has(key)) return markerIconCache.get(key);

  const { emoji, color } = CATEGORY_ICON_MAP[category] || DEFAULT_ICON;
  const bg = isSelected ? "#dc2626" : color;
  const size = isSelected ? 42 : 32;
  const fontSize = isSelected ? 20 : 16;

  const icon = L.divIcon({
    html: `
      <div style="
        width:${size}px;height:${size}px;background:${bg};
        border:2px solid white;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);box-shadow:0 2px 5px rgba(0,0,0,0.4);
        display:flex;align-items:center;justify-content:center;">
        <span style="transform:rotate(45deg);font-size:${fontSize}px;line-height:1;">${emoji}</span>
      </div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
  markerIconCache.set(key, icon);
  return icon;
}

const nearbyIconCache = new Map();

function getNearbyIcon(zoom) {
  const scale = Math.max(0.55, Math.min(1, (zoom - 9) / 5));
  const size = Math.round(26 * scale);
  if (nearbyIconCache.has(size)) return nearbyIconCache.get(size);
  const fontSize = Math.round(13 * scale);
  const icon = L.divIcon({
    html: `
      <div style="
        width:${size}px;height:${size}px;background:#2563eb;
        border:2px solid white;border-radius:50%;
        box-shadow:0 2px 5px rgba(0,0,0,0.4);
        display:flex;align-items:center;justify-content:center;
        font-size:${fontSize}px;">📍</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
  nearbyIconCache.set(size, icon);
  return icon;
}

// Pulsing blue dot for "you are here". (animate-ping is a Tailwind utility.)
const USER_ICON = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:20px;height:20px;">
      <span class="animate-ping" style="position:absolute;inset:0;border-radius:50%;background:#2563eb66;"></span>
      <span style="position:absolute;inset:4px;border-radius:50%;background:#2563eb;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);"></span>
    </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// ---------------------------------------------------------------------------
// Small presentational components
// ---------------------------------------------------------------------------

// Floating category chips on the map — filter pins without leaving the map.
function MapCategoryChips({ value, onChange }) {
  return (
    <div className="absolute top-3 left-3 right-16 z-[1000] flex gap-2 overflow-x-auto hide-scrollbar pb-1">
      {TOURISM_TYPES.map((t) => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md border transition-colors ${
              active
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-white'
            }`}
          >
            {t.value === 'All' ? 'All' : t.label}
          </button>
        );
      })}
    </div>
  );
}

// One-time hint explaining the numbered circles (clusters) on the map.
// Styles for the pulsing ring live here so no global CSS file needs editing.
function ClusterHint({ onDismiss }) {
  return (
    <>
      <style>{`
        .cluster-pulse { animation: clusterPulse 2s ease-out infinite; }
        @keyframes clusterPulse {
          0%   { box-shadow: 0 0 0 0 rgba(180, 83, 42, 0.6); }
          70%  { box-shadow: 0 0 0 12px rgba(180, 83, 42, 0); }
          100% { box-shadow: 0 0 0 0 rgba(180, 83, 42, 0); }
        }
      `}</style>
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[1000] w-max max-w-[92%] bg-slate-900 text-white rounded-xl shadow-xl px-3 py-2.5 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
        <span className="w-8 h-8 rounded-full bg-[#B4532A] border-2 border-white flex items-center justify-center text-xs font-bold shrink-0 animate-bounce">
          14
        </span>
        <p className="text-xs leading-snug">
          <strong>🎁 Psst! Those numbered circles are treasure chests.</strong>{' '}
          Tap one to unwrap the hidden gems inside — go on, explore! 🗺️✨
        </p>
        <button
          onClick={onDismiss}
          className="text-xs font-semibold text-orange-300 hover:text-orange-200 shrink-0"
        >
          Let's go!
        </button>
      </div>
    </>
  );
}

// A removable filter pill.
function FilterChip({ label, onClear }) {
  return (
    <button
      onClick={onClear}
      className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold hover:bg-orange-200 transition-colors"
    >
      {label}
      <X size={12} />
    </button>
  );
}

function FavoriteFilterButton({ active, onClick }) {
  return (
    <button
      onClick={onClick}
      title="Show favorites only"
      className={`p-1.5 border rounded-lg shrink-0 transition-colors ${
        active ? "bg-rose-50 border-rose-300" : "border-slate-300 hover:bg-slate-100"
      }`}
    >
      <Heart size={14} className={active ? "fill-rose-500 text-rose-500" : "text-slate-600"} />
    </button>
  );
}

// Search icon that expands into an input.
function SearchToggle({ open, setOpen, value, onChange, placeholder, title }) {
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-100 shrink-0"
        title={title}
      >
        <Search className="w-3.5 h-3.5 text-slate-600" />
      </button>
    );
  }
  return (
    <div className="flex items-center border border-slate-300 rounded-lg px-2 py-1 bg-white">
      <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
      <input
        autoFocus
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="outline-none text-xs w-24 sm:w-32 bg-transparent"
      />
      <button
        onClick={() => { setOpen(false); onChange(""); }}
        className="ml-1 shrink-0"
        aria-label="Close search"
      >
        <X className="w-3.5 h-3.5 text-slate-400" />
      </button>
    </div>
  );
}

function WhatsAppLink({ phone }) {
  // Use the last 10 digits so numbers saved as "098…", "+91 98…" or "98…" all work.
  const digits = firstPhone(phone).replace(/\D/g, '').slice(-10);
  if (digits.length < 10) return null;
  return (
    <a
      href={`https://wa.me/91${digits}`}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="text-green-600 text-xs font-medium flex items-center gap-1 hover:text-green-700 py-1"
      title="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.36.101 11.943c0 2.105.549 4.161 1.595 5.972L0 24l6.238-1.635a11.918 11.918 0 005.804 1.477h.005c6.585 0 11.941-5.362 11.943-11.943a11.86 11.86 0 00-3.47-8.45zM12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.36-.214-3.735.98.998-3.641-.235-.374a9.86 9.86 0 01-1.51-5.264C2.176 6.463 6.634 2.006 12.05 2.006c2.629 0 5.098 1.024 6.955 2.883a9.788 9.788 0 012.876 6.966c-.003 5.416-4.46 9.93-9.831 9.93z"/>
      </svg>
      WhatsApp
    </a>
  );
}

function PhoneLink({ phone }) {
  const first = firstPhone(phone);
  if (!first) return <span className="text-slate-400">Not provided</span>;
  return (
    <a
      href={`tel:${first}`}
      onClick={(e) => e.stopPropagation()}
      className="text-blue-600 hover:underline font-medium"
    >
      {phone}
    </a>
  );
}

function ShowRouteButton({ onClick }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="text-emerald-600 text-xs font-medium flex items-center gap-1 hover:text-emerald-800 py-1"
    >
      🧭 Show Route
    </button>
  );
}

function EmptyState({ message, onClear, buttonClass, big }) {
  return (
    <div className={`text-center ${big ? 'py-10' : 'py-6'}`}>
      <Frown className="mx-auto mb-2 text-slate-300" size={big ? 32 : 28} />
      <p className="text-sm text-slate-500 mb-3">{message}</p>
      <button
        onClick={onClear}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${buttonClass}`}
      >
        <RotateCcw size={12} /> Clear filters
      </button>
    </div>
  );
}

// "All" tab pieces ----------------------------------------------------------

function OverviewHeader({ title, accent, linkClass, onSeeAll }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className={`text-lg font-bold text-slate-800 border-l-4 pl-3 ${accent}`}>{title}</h2>
      <button
        onClick={onSeeAll}
        className={`text-xs font-semibold flex items-center gap-1 shrink-0 ${linkClass}`}
      >
        See all <ArrowRight size={13} />
      </button>
    </div>
  );
}

function Thumb({ src, emoji, bg, bgClass = '' }) {
  if (src) {
    return <img src={src} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-100" />;
  }
  return (
    <span
      className={`w-14 h-14 rounded-lg shrink-0 flex items-center justify-center text-xl ${bgClass}`}
      style={bg ? { backgroundColor: bg } : undefined}
    >
      {emoji}
    </span>
  );
}

function OverviewRow({ onClick, hoverClass, thumb, title, subtitle, distance }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.99] ${hoverClass}`}
    >
      {thumb}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm text-slate-800 truncate">{title}</p>
        {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
        {distance && <p className="text-xs text-emerald-700 font-medium">{distance} km away</p>}
      </div>
    </div>
  );
}

// Banner that sends people from the map's Homestays section to the
// "Discover Your Stay" page.
function DiscoverStayLink({ onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-3 text-left shadow-sm hover:shadow-md hover:from-amber-600 hover:to-orange-700 transition-all active:scale-[0.99] ${className}`}
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <BedDouble size={18} className="shrink-0" />
        <span className="min-w-0">
          <span className="block text-sm font-bold leading-tight">Discover Your Stay</span>
          <span className="block text-[11px] text-white/85 leading-tight truncate">
            Browse all homestays, details and booking info
          </span>
        </span>
      </span>
      <ArrowRight size={16} className="shrink-0" />
    </button>
  );
}

function EmptyNote({ children }) {
  return <p className="text-sm text-slate-500 bg-slate-100 p-3 rounded text-center">{children}</p>;
}

// ---------------------------------------------------------------------------
// Map helper components (render nothing, drive the Leaflet map)
// ---------------------------------------------------------------------------

function MapController({ position }) {
  const map = useMap();

  // Tell Leaflet whenever its container changes size.
  useEffect(() => {
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [map]);

  useEffect(() => {
    if (position) {
      const timer = setTimeout(() => {
        map.invalidateSize();
        map.flyTo(position, 14, { animate: true, duration: 1.5 });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [position, map]);

  return null;
}

// Fits the map to the Ratnagiri district border on open; falls back to the pins.
function InitialView({ border, points }) {
  const map = useMap();
  const settled = useRef(false);

  const fit = () => {
    const el = map.getContainer();
    if (!el.clientWidth || !el.clientHeight) return false; // hidden (mobile list view)
    let bounds = null;
    if (border) bounds = L.geoJSON(border).getBounds();
    else if (points.length) bounds = L.latLngBounds(points);
    if (!bounds || !bounds.isValid()) return false;
    map.invalidateSize();
    map.fitBounds(bounds, { padding: [24, 24], animate: false });
    return !!border;
  };

  useEffect(() => {
    if (!settled.current) settled.current = fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [border, points.length]);

  // On mobile the map starts hidden; fit again the first time it becomes visible.
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (!settled.current) settled.current = fit();
    });
    ro.observe(map.getContainer());
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, border, points.length]);

  return null;
}

function NearbyBoundsController({ origin, nearby }) {
  const map = useMap();
  useEffect(() => {
    if (origin && nearby.length > 0) {
      const bounds = L.latLngBounds([
        [origin.lat, origin.lng],
        ...nearby.map((n) => [n.lat, n.lng]),
      ]);
      map.flyToBounds(bounds, { padding: [70, 70], maxZoom: 15, duration: 1.2 });
    }
  }, [origin, nearby, map]);
  return null;
}

function ZoomWatcher({ onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });
  useEffect(() => {
    onZoomChange(map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SustainabilityMap() {
  const { locations, homestays, drivers, busStops, atms, loading } = useLocations();
  // Trip stop count for the badge on the "Plan Trip" tab.
  // (Hooks must stay above the early `if (loading) return` below.)
  const { stops: tripStops } = useTripPlanner();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all');
  const [mapPosition, setMapPosition] = useState(null);

  // Places filters (selectedTourismType is also driven by the chips on the map)
  const [selectedTaluka, setSelectedTaluka] = useState("All");
  const [selectedTourismType, setSelectedTourismType] = useState("All");
  const [locationSearch, setLocationSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Homestay filters
  const [selectedHomestayTaluka, setSelectedHomestayTaluka] = useState("All");
  const [selectedHomestayType, setSelectedHomestayType] = useState("All");
  const [homestaySearch, setHomestaySearch] = useState("");
  const [isHomestaySearchOpen, setIsHomestaySearchOpen] = useState(false);

  // Driver + bus stop + ATM filters
  const [selectedDriverTaluka, setSelectedDriverTaluka] = useState("All");
  const [selectedVehicleType, setSelectedVehicleType] = useState("All");
  const [driverSearch, setDriverSearch] = useState("");
  const [selectedBusStopTaluka, setSelectedBusStopTaluka] = useState("All");
  const [selectedAtmTaluka, setSelectedAtmTaluka] = useState("All");
  const [selectedBank, setSelectedBank] = useState("All");

  const [selectedItem, setSelectedItem] = useState(null); // { data, type }
  const markerRefs = useRef({});
  const clusterRef = useRef(null);
  const [districtBorder, setDistrictBorder] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  // Mobile: which pane is visible. Ignored on md+ where both show.
  const [mobileView, setMobileView] = useState('list');
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [nearbyOrigin, setNearbyOrigin] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(11);

  // Favorites ("save for later"), persisted to localStorage.
  const [favorites, setFavorites] = useState(loadFavorites);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // One-time hint that explains the numbered cluster circles on the map.
  const [showClusterHint, setShowClusterHint] = useState(loadClusterHintVisible);

  const dismissClusterHint = () => {
    setShowClusterHint(false);
    try {
      localStorage.setItem(CLUSTER_HINT_KEY, "1");
    } catch {
      // localStorage unavailable — the hint is simply hidden for this session.
    }
  };

  const refKey = (type, id) => `${type}:${id}`;
  const isFavorite = (type, id) => favorites.includes(refKey(type, id));

  const toggleFavorite = (type, id) => {
    const key = refKey(type, id);
    const next = favorites.includes(key) ? favorites.filter((k) => k !== key) : [...favorites, key];
    setFavorites(next);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch {
      // localStorage unavailable (private browsing, etc.) — the toggle still works this session.
    }
  };

  const handleShowRoute = async (destLat, destLng) => {
    if (!userLocation) {
      alert("Please allow location access to see directions.");
      return;
    }
    const route = await fetchRoute(userLocation.lat, userLocation.lng, destLat, destLng);
    if (route) {
      setActiveRoute(route);
      setMapPosition([destLat, destLng]);
      setMobileView('map');
    } else {
      alert("Could not calculate route.");
    }
  };

  useEffect(() => {
    fetch("/ratnagiri-border.geojson")
      .then((res) => res.json())
      .then((data) => setDistrictBorder(data))
      .catch((err) => console.error("Failed to load district border:", err));
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.log("Location access denied or unavailable:", error.message)
      );
    }
  }, []);

  const handleFlyTo = (lat, lng) => {
    setMapPosition([lat, lng]);
    setMobileView('map');
  };

  const fetchNearbyLocations = async (locationName, mainLat, mainLng) => {
    try {
      const url = `${API_BASE_URL}/api/nearby-locations/${encodeURIComponent(locationName)}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.success) {
        setNearbyLocations([]);
        setNearbyOrigin(null);
        return;
      }

      const withDistance = data.nearby.map((n) => ({
        ...n,
        distance: calculateDistance(mainLat, mainLng, n.lat, n.lng)?.toFixed(1),
        duration: null,
      }));

      setNearbyLocations(withDistance);
      setNearbyOrigin({ lat: mainLat, lng: mainLng });
    } catch {
      setNearbyLocations([]);
      setNearbyOrigin(null);
    }
  };

  // With clustering, the selected marker may be hidden inside a cluster:
  // reveal it first, then open its popup.
  useEffect(() => {
    if (selectedItem?.data?.id && selectedItem?.type) {
      const marker = markerRefs.current[refKey(selectedItem.type, selectedItem.data.id)];
      if (!marker) return;
      const cluster = clusterRef.current;
      if (cluster?.zoomToShowLayer) {
        cluster.zoomToShowLayer(marker, () => marker.openPopup());
      } else {
        marker.openPopup();
      }
    }
  }, [selectedItem]);

  // Open a village's profile + nearby spots (shared by list rows, cards and popups).
  const openVillage = (loc) => {
    setSelectedItem({ data: loc, type: 'village' });
    fetchNearbyLocations(loc.location_name, loc.latitude, loc.longitude);
  };

  // "Plan for me" and the trip planner now share one tab ("Plan Trip").
  const tabs = [
    { id: "all", label: "All", icon: LayoutGrid },
    { id: "villages", label: "Places to Visit", icon: TreePine },
    { id: "homestays", label: "Homestays", icon: BedDouble },
    { id: "transportation", label: "Local Resources", icon: Bus },
    { id: "trip", label: "Plan Trip", icon: RouteIcon },
  ];

  if (loading) return <RatnagiriCinematic />;

  // ---- Derived data -------------------------------------------------------

  // Everything the "Plan for me" wizard can choose from.
  const allPlaces = [
    ...locations.filter((l) => hasCoords(l)).map((l) => ({
      type: 'village',
      id: l.id,
      name: l.location_name,
      lat: l.latitude,
      lng: l.longitude,
      tags: CATEGORY_TAGS[l.category] || [],
      image: driveThumb(l.photo_location),
    })),
    ...homestays.filter((h) => hasCoords(h)).map((h) => ({
      type: 'homestay',
      id: h.id,
      name: h.name,
      lat: h.latitude,
      lng: h.longitude,
      image: driveThumb(h.photo_homestay),
    })),
  ];

  const uniqueSorted = (arr) => ["All", ...new Set(arr.filter(Boolean).sort())];

  const talukas = uniqueSorted(locations.map((l) => l.taluka_name));
  // Built from homestays themselves so every homestay's taluka can be selected.
  const homestayTalukas = uniqueSorted(homestays.map((h) => h.taluka));
  const homestayTypes = uniqueSorted(homestays.map((h) => h.type));
  const driverTalukas = uniqueSorted(drivers.map((d) => d.taluka));
  const vehicleTypes = uniqueSorted(drivers.map((d) => d.vehicleType));
  const busStopTalukas = uniqueSorted(busStops.map((b) => b.taluka));
  const atmTalukas = uniqueSorted(atms.map((a) => a.taluka));
  const banks = uniqueSorted(atms.map((a) => a.bank));

  const filteredLocations = locations.filter((loc) => {
    const talukaMatch = selectedTaluka === "All" || loc.taluka_name === selectedTaluka;
    const typeMatch = selectedTourismType === "All" || loc.category === selectedTourismType;
    const searchMatch = (loc.location_name || "").toLowerCase().includes(locationSearch.toLowerCase());
    const favoriteMatch = !showFavoritesOnly || isFavorite('village', loc.id);
    return talukaMatch && typeMatch && searchMatch && favoriteMatch;
  });

  const filteredHomestays = homestays.filter((home) => {
    const q = homestaySearch.toLowerCase();
    const talukaMatch = selectedHomestayTaluka === "All" || home.taluka === selectedHomestayTaluka;
    const typeMatch = selectedHomestayType === "All" || home.type === selectedHomestayType;
    const searchMatch =
      (home.name || "").toLowerCase().includes(q) ||
      (home.owner || "").toLowerCase().includes(q);
    const favoriteMatch = !showFavoritesOnly || isFavorite('homestay', home.id);
    return talukaMatch && typeMatch && searchMatch && favoriteMatch;
  });

  const byDistance = (latKey, lngKey) => (a, b) => {
    if (!userLocation) return 0;
    const distA = calculateDistance(userLocation.lat, userLocation.lng, a[latKey], a[lngKey]);
    const distB = calculateDistance(userLocation.lat, userLocation.lng, b[latKey], b[lngKey]);
    return (distA ?? Infinity) - (distB ?? Infinity);
  };

  const filteredDrivers = drivers
    .filter((d) => {
      const query = driverSearch.toLowerCase();
      const talukaMatch = selectedDriverTaluka === "All" || d.taluka === selectedDriverTaluka;
      const typeMatch = selectedVehicleType === "All" || d.vehicleType === selectedVehicleType;
      const searchMatch =
        query === "" ||
        (d.village || "").toLowerCase().includes(query) ||
        (d.taluka || "").toLowerCase().includes(query) ||
        (d.serviceArea || "").toLowerCase().includes(query);
      return talukaMatch && typeMatch && searchMatch;
    })
    .sort(byDistance('lat', 'lng'));

  const filteredBusStops = busStops
    .filter((b) => selectedBusStopTaluka === "All" || b.taluka === selectedBusStopTaluka)
    .sort(byDistance('lat', 'lng'));

  const filteredAtms = atms
    .filter((a) =>
      (selectedAtmTaluka === "All" || a.taluka === selectedAtmTaluka) &&
      (selectedBank === "All" || a.bank === selectedBank))
    .sort(byDistance('lat', 'lng'));

  // Nearest-first previews for the "All" tab. Places respect the map's category chips.
  const sortByDistance = (arr, latKey = 'latitude', lngKey = 'longitude') =>
    userLocation ? [...arr].sort(byDistance(latKey, lngKey)) : arr;

  const overviewPlaceSource =
    selectedTourismType === "All" ? locations : locations.filter((l) => l.category === selectedTourismType);
  const overviewLocations = sortByDistance(overviewPlaceSource).slice(0, 4);
  const overviewHomestays = sortByDistance(homestays).slice(0, 4);
  const overviewDrivers = sortByDistance(drivers.filter((d) => hasCoords(d, 'lat', 'lng')), 'lat', 'lng').slice(0, 3);
  const overviewBusStops = sortByDistance(busStops.filter((b) => hasCoords(b, 'lat', 'lng')), 'lat', 'lng').slice(0, 3);
  const overviewAtms = sortByDistance(atms.filter((a) => hasCoords(a, 'lat', 'lng')), 'lat', 'lng').slice(0, 3);

  // Labels only appear once there's room for them (zoom >= 12).
  const renderLabel = (text, className) =>
    currentZoom >= 12 ? (
      <Tooltip
        direction="top"
        offset={[0, -20]}
        opacity={1}
        permanent
        className={`font-bold text-xs shadow-sm border-0 ${className}`}
      >
        {text}
      </Tooltip>
    ) : null;

  const isSelected = (type, id) => selectedItem?.type === type && selectedItem?.data?.id === id;

  const distanceLabel = (lat, lng, suffix = "km away from your current location") => {
    const km = distanceKm(userLocation, lat, lng);
    return km ? `${km} ${suffix}` : null;
  };

  // ---- Marker builders (shared by the per-tab views and the "All" tab) ----

  const buildLocationMarkers = (arr) => arr.filter((l) => hasCoords(l)).map((loc) => {
    const img = driveIdToImageUrl(loc.photo_location);
    const dist = distanceLabel(loc.latitude, loc.longitude);
    return (
      <Marker
        key={`village-${loc.id}`}
        position={[loc.latitude, loc.longitude]}
        ref={(ref) => { markerRefs.current[refKey('village', loc.id)] = ref; }}
        icon={getMarkerIcon(loc.category, isSelected('village', loc.id))}
      >
        {renderLabel(loc.location_name, "bg-white/90 text-slate-800")}
        <Popup>
          <div className="text-center">
            {img && (
              <img
                src={img}
                alt={loc.location_name}
                className="w-full h-32 rounded-lg object-cover mb-2 border border-slate-200"
              />
            )}
            <strong className="block text-base mb-1">{loc.location_name}</strong>
            <span className="text-xs text-slate-500 mb-2 block">{loc.category}</span>
            {dist && <span className="text-xs text-emerald-700 font-medium mb-2 block">{dist}</span>}
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => openVillage(loc)}
                className="flex-1 py-1.5 bg-orange-600 text-white rounded text-xs font-bold hover:bg-orange-700 transition-colors"
              >
                View Detailed Profile
              </button>
              <button
                onClick={() => {
                  fetchNearbyLocations(loc.location_name, loc.latitude, loc.longitude);
                  markerRefs.current[refKey('village', loc.id)]?.closePopup();
                }}
                title="Show nearby locations"
                className="shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                📍
              </button>
            </div>
            <div className="flex justify-center mt-1">
              <AddToTripButton
                type="village"
                id={loc.id}
                name={loc.location_name}
                lat={loc.latitude}
                lng={loc.longitude}
                image={driveThumb(loc.photo_location)}
              />
            </div>
          </div>
        </Popup>
      </Marker>
    );
  });

  const buildHomestayMarkers = (arr) => arr.filter((h) => hasCoords(h)).map((home) => {
    const img = driveIdToImageUrl(home.photo_homestay);
    const dist = distanceLabel(home.latitude, home.longitude);
    return (
      <Marker
        key={`homestay-${home.id}`}
        position={[home.latitude, home.longitude]}
        ref={(ref) => { markerRefs.current[refKey('homestay', home.id)] = ref; }}
        icon={getMarkerIcon('Homestays', isSelected('homestay', home.id))}
      >
        {renderLabel(home.name, "bg-amber-500/90 text-white")}
        <Popup>
          <div className="text-center">
            {img && (
              <img
                src={img}
                alt={home.name}
                className="w-full h-32 rounded-lg object-cover mb-2 border border-slate-200"
              />
            )}
            <strong className="block text-base mb-1">{home.name}</strong>
            <span className="text-xs text-slate-500 mb-2 block">{home.type}</span>
            {dist && <span className="text-xs text-emerald-700 font-medium mb-1 block">{dist}</span>}
            {home.owner && <span className="text-xs text-slate-500 block mb-1">Owner: {home.owner}</span>}
            <button
              onClick={() => setSelectedItem({ data: home, type: 'homestay' })}
              className="w-full py-1.5 mt-1 bg-amber-500 text-slate-900 rounded text-xs font-bold hover:bg-amber-600 transition-colors mb-1"
            >
              View Homestay Profile
            </button>
            <div className="flex justify-center">
              <AddToTripButton
                type="homestay"
                id={home.id}
                name={home.name}
                lat={home.latitude}
                lng={home.longitude}
                image={driveThumb(home.photo_homestay)}
              />
            </div>
          </div>
        </Popup>
      </Marker>
    );
  });

  const buildDriverMarkers = (arr) => arr.filter((d) => hasCoords(d, 'lat', 'lng')).map((d) => {
    const dist = distanceLabel(d.lat, d.lng);
    return (
      <Marker
        key={`driver-${d.id}`}
        position={[d.lat, d.lng]}
        ref={(ref) => { markerRefs.current[refKey('driver', d.id)] = ref; }}
        icon={getMarkerIcon('Taxi & Auto', isSelected('driver', d.id))}
      >
        {renderLabel(d.name, "bg-lime-500/90 text-slate-900")}
        <Popup>
          <div className="text-left">
            <strong className="block text-base mb-1 border-b pb-1">{d.name}</strong>
            <span className="text-xs text-slate-500 mb-2 block">{d.vehicleType}</span>
            {dist && <span className="text-xs text-emerald-700 font-medium mb-2 block">{dist}</span>}
            <button
              onClick={() => setSelectedItem({ data: d, type: 'driver' })}
              className="w-full py-1.5 mt-1 bg-lime-500 text-slate-900 rounded text-xs font-bold hover:bg-lime-600 transition-colors"
            >
              View Driver Profile
            </button>
            <AddToTripButton type="driver" id={d.id} name={d.name} lat={d.lat} lng={d.lng} />
          </div>
        </Popup>
      </Marker>
    );
  });

  const buildBusStopMarkers = (arr) => arr.filter((b) => hasCoords(b, 'lat', 'lng')).map((b) => {
    const dist = distanceLabel(b.lat, b.lng);
    return (
      <Marker
        key={`busstop-${b.id}`}
        position={[b.lat, b.lng]}
        ref={(ref) => { markerRefs.current[refKey('busstop', b.id)] = ref; }}
        icon={getMarkerIcon('Bus Stand', isSelected('busstop', b.id))}
      >
        {renderLabel(b.name, "bg-lime-700/90 text-white")}
        <Popup>
          <div className="text-left">
            {b.photo_url && (
              <img
                src={b.photo_url}
                alt={b.name}
                className="w-full h-32 rounded-lg object-cover mb-2 border border-slate-200 mx-auto"
              />
            )}
            <strong className="block text-base mb-1 border-b pb-1">🚏 {b.name}</strong>
            <span className="text-xs text-slate-500 mb-2 block">{b.taluka}</span>
            {dist && <span className="text-xs text-emerald-700 font-medium mb-2 block">{dist}</span>}
            {b.timetableLink ? (
              <a
                href={b.timetableLink}
                target="_blank"
                rel="noreferrer"
                className="w-full block text-center py-1.5 mt-1 bg-lime-600 text-white rounded text-xs font-bold hover:bg-lime-700 transition-colors"
              >
                ⬇ Download Timetable PDF
              </a>
            ) : (
              <span className="text-xs text-slate-400 italic">No timetable uploaded yet.</span>
            )}
            <AddToTripButton type="busstop" id={b.id} name={b.name} lat={b.lat} lng={b.lng} image={b.photo_url} />
          </div>
        </Popup>
      </Marker>
    );
  });

  const buildAtmMarkers = (arr) => arr.filter((a) => hasCoords(a, 'lat', 'lng')).map((a) => {
    const dist = distanceLabel(a.lat, a.lng);
    return (
      <Marker
        key={`atm-${a.id}`}
        position={[a.lat, a.lng]}
        ref={(ref) => { markerRefs.current[refKey('atm', a.id)] = ref; }}
        icon={getMarkerIcon('ATM', false)}
      >
        {renderLabel(a.bank, "bg-teal-700/90 text-white")}
        <Popup>
          <div className="text-left">
            {a.photoUrl && (
              <img
                src={a.photoUrl}
                alt={a.name}
                className="w-full h-28 rounded-lg object-cover mb-2 border border-slate-200"
              />
            )}
            <strong className="block text-base mb-1 border-b pb-1">🏧 {a.name}</strong>
            <span className="text-xs text-slate-500 block">{a.bank}</span>
            <span className="text-xs text-slate-500 mb-1 block">{[a.village, a.taluka].filter(Boolean).join(', ')}</span>
            {a.address && <span className="text-xs text-slate-500 mb-1 block">{a.address}</span>}
            <span className="text-xs mb-1 block">
              {a.is24x7 ? "🕒 24x7" : "Limited hours"}{a.hasCashDeposit ? " · 💵 Cash deposit" : ""}
            </span>
            {dist && <span className="text-xs text-emerald-700 font-medium mb-1 block">{dist}</span>}
            <button
              onClick={() => handleShowRoute(a.lat, a.lng)}
              className="w-full py-1.5 mt-1 bg-teal-700 text-white rounded text-xs font-bold hover:bg-teal-800 transition-colors"
            >
              🧭 Show Route
            </button>
          </div>
        </Popup>
      </Marker>
    );
  });

  const renderActivePins = () => {
    if (activeTab === 'all') {
      const typeFilterOn = selectedTourismType !== "All";
      const places = typeFilterOn
        ? locations.filter((l) => l.category === selectedTourismType)
        : locations;
      return [
        ...buildLocationMarkers(places),
        // A category chip means "show me only this kind of place".
        ...(typeFilterOn ? [] : buildHomestayMarkers(homestays)),
        // Drivers, bus stops and ATMs are hyper-local, so only show them when zoomed in.
        ...(!typeFilterOn && currentZoom >= 13
          ? [...buildDriverMarkers(drivers), ...buildBusStopMarkers(busStops), ...buildAtmMarkers(atms)]
          : []),
      ];
    }
    if (activeTab === 'villages') return buildLocationMarkers(filteredLocations);
    if (activeTab === 'homestays') return buildHomestayMarkers(filteredHomestays);
    if (activeTab === 'transportation') {
      return [
        ...buildDriverMarkers(filteredDrivers),
        ...buildBusStopMarkers(filteredBusStops),
        ...buildAtmMarkers(filteredAtms),
      ];
    }
    // The 'trip' tab shows no data pins on the main map.
    return null;
  };

  const showMapChips = activeTab === 'all' || activeTab === 'villages';

  // ---- Render --------------------------------------------------------------

  return (
    // Fixed height (viewport minus the 4rem header) so the sidebar, map and profile
    // panel each scroll on their own. Change 4rem if your header height differs.
    <div className="flex flex-col md:flex-row h-[calc(100dvh-4rem)] bg-white md:rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500 relative">

      {/* SIDEBAR — full-screen pane on mobile (toggled), fixed column on desktop.
          (No z-index here: it must not compete with the site navbar dropdowns.) */}
      <div
        className={`w-full md:w-96 flex-col border-r border-slate-200 bg-slate-50 min-h-0
          ${mobileView === 'list' ? 'flex' : 'hidden'} md:flex flex-1 md:flex-none`}
      >
        <div className="p-4 md:p-6 bg-gradient-to-br from-orange-600 to-amber-600 text-white shadow-md relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80')] opacity-30 bg-cover bg-center"></div>
          <div className="relative z-10">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-1">Ratnagiri Tourism</h1>
            <p className="text-xs md:text-sm font-light italic opacity-90">Explore the Jewel of Konkan Ecosystem</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto bg-slate-800 text-slate-400 hide-scrollbar shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-all border-b-2 shrink-0 ${
                  activeTab === tab.id ? 'bg-slate-700 text-white border-orange-500' : 'border-transparent hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon size={15} className="sm:w-4 sm:h-4" /> {tab.label}
                {tab.id === 'trip' && tripStops.length > 0 && (
                  <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {tripStops.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-6 min-h-0">

          {/* ALL TAB — nearest picks per category with "See all" hand-offs */}
          {activeTab === 'all' && (
            <div className="animate-in slide-in-from-right-4 duration-300 space-y-8">

              {favorites.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Heart size={16} className="fill-rose-500 text-rose-500" /> Your Favorites
                  </h2>
                  <div className="space-y-3">
                    {favorites.slice(0, 5).map((key) => {
                      const [type, idStr] = key.split(':');
                      const item =
                        type === 'village' ? locations.find((l) => String(l.id) === idStr) :
                        type === 'homestay' ? homestays.find((h) => String(h.id) === idStr) :
                        null;
                      if (!item) return null;
                      const name = type === 'village' ? item.location_name : item.name;
                      return (
                        <button
                          key={key}
                          onClick={() => { handleFlyTo(item.latitude, item.longitude); setSelectedItem({ data: item, type }); }}
                          className="w-full flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-rose-400 hover:shadow-md transition-all text-left"
                        >
                          <span className="font-semibold text-sm text-slate-800 truncate">{name}</span>
                          <Heart size={14} className="fill-rose-500 text-rose-500 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <OverviewHeader
                  title="Places to Visit"
                  accent="border-orange-500"
                  linkClass="text-orange-600 hover:text-orange-700"
                  onSeeAll={() => setActiveTab('villages')}
                />
                <div className="space-y-3">
                  {overviewLocations.map((loc) => {
                    const cat = CATEGORY_ICON_MAP[loc.category] || DEFAULT_ICON;
                    return (
                      <OverviewRow
                        key={loc.id}
                        hoverClass="hover:border-orange-500"
                        onClick={() => { handleFlyTo(loc.latitude, loc.longitude); openVillage(loc); }}
                        thumb={<Thumb src={driveIdToImageUrl(loc.photo_location)} emoji={cat.emoji} bg={cat.color + "22"} />}
                        title={loc.location_name}
                        subtitle={loc.category}
                        distance={distanceKm(userLocation, loc.latitude, loc.longitude)}
                      />
                    );
                  })}
                  {overviewLocations.length === 0 && <EmptyNote>No places added yet.</EmptyNote>}
                </div>
              </div>

              <div>
                <OverviewHeader
                  title="Where to Stay"
                  accent="border-amber-500"
                  linkClass="text-amber-600 hover:text-amber-700"
                  onSeeAll={() => setActiveTab('homestays')}
                />
                <div className="space-y-3">
                  {overviewHomestays.map((home) => (
                    <OverviewRow
                      key={home.id}
                      hoverClass="hover:border-amber-500"
                      onClick={() => { handleFlyTo(home.latitude, home.longitude); setSelectedItem({ data: home, type: 'homestay' }); }}
                      thumb={<Thumb src={driveIdToImageUrl(home.photo_homestay)} emoji="🏡" bgClass="bg-amber-50" />}
                      title={home.name}
                      subtitle={[home.village, home.taluka].filter(Boolean).join(', ')}
                      distance={distanceKm(userLocation, home.latitude, home.longitude)}
                    />
                  ))}
                  {overviewHomestays.length === 0 && <EmptyNote>No homestays added yet.</EmptyNote>}
                  <DiscoverStayLink onClick={() => navigate(STAY_ROUTE)} />
                </div>
              </div>

              <div>
                <OverviewHeader
                  title="Getting Around"
                  accent="border-lime-500"
                  linkClass="text-lime-700 hover:text-lime-800"
                  onSeeAll={() => setActiveTab('transportation')}
                />
                <div className="space-y-3">
                  {overviewDrivers.map((d) => (
                    <OverviewRow
                      key={`ov-driver-${d.id}`}
                      hoverClass="hover:border-lime-500"
                      onClick={() => { handleFlyTo(d.lat, d.lng); setSelectedItem({ data: d, type: 'driver' }); }}
                      thumb={<Thumb emoji="🛺" bgClass="bg-lime-50" />}
                      title={d.name}
                      subtitle={[d.vehicleType, d.village].filter(Boolean).join(' · ')}
                    />
                  ))}
                  {overviewBusStops.map((b) => (
                    <OverviewRow
                      key={`ov-bus-${b.id}`}
                      hoverClass="hover:border-lime-700"
                      onClick={() => { handleFlyTo(b.lat, b.lng); setSelectedItem({ data: b, type: 'busstop' }); }}
                      thumb={<Thumb emoji="🚌" bgClass="bg-lime-50" />}
                      title={b.name}
                      subtitle={b.taluka}
                    />
                  ))}
                  {overviewAtms.map((a) => (
                    <OverviewRow
                      key={`ov-atm-${a.id}`}
                      hoverClass="hover:border-teal-600"
                      onClick={() => handleFlyTo(a.lat, a.lng)}
                      thumb={<Thumb emoji="🏧" bgClass="bg-teal-50" />}
                      title={a.name}
                      subtitle={a.bank}
                      distance={distanceKm(userLocation, a.lat, a.lng)}
                    />
                  ))}
                  {overviewDrivers.length === 0 && overviewBusStops.length === 0 && overviewAtms.length === 0 && (
                    <EmptyNote>No transport resources added yet.</EmptyNote>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* VILLAGES TAB */}
          {activeTab === 'villages' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-slate-700 flex-1">Choose by Taluka</label>
                  <FavoriteFilterButton active={showFavoritesOnly} onClick={() => setShowFavoritesOnly((v) => !v)} />
                  <SearchToggle
                    open={isSearchOpen}
                    setOpen={setIsSearchOpen}
                    value={locationSearch}
                    onChange={setLocationSearch}
                    placeholder="Search location..."
                    title="Search by location"
                  />
                </div>

                <select
                  value={selectedTaluka}
                  onChange={(e) => setSelectedTaluka(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                >
                  {talukas.map((taluka) => (
                    <option key={taluka} value={taluka}>{taluka}</option>
                  ))}
                </select>

                <label className="block text-sm font-semibold text-slate-700 mb-2 mt-4">Choose Type of Attractions</label>
                <select
                  value={selectedTourismType}
                  onChange={(e) => setSelectedTourismType(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                >
                  {TOURISM_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>

                {(selectedTaluka !== "All" || selectedTourismType !== "All" || showFavoritesOnly) && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedTaluka !== "All" && (
                      <FilterChip label={`Taluka: ${selectedTaluka}`} onClear={() => setSelectedTaluka("All")} />
                    )}
                    {selectedTourismType !== "All" && (
                      <FilterChip
                        label={TOURISM_TYPES.find((t) => t.value === selectedTourismType)?.label || selectedTourismType}
                        onClear={() => setSelectedTourismType("All")}
                      />
                    )}
                    {showFavoritesOnly && (
                      <FilterChip label="❤ Favorites only" onClear={() => setShowFavoritesOnly(false)} />
                    )}
                  </div>
                )}

                <p className="text-xs text-slate-500 mt-3">
                  {filteredLocations.length} {filteredLocations.length === 1 ? "place" : "places"} found
                </p>
              </div>

              <div className="space-y-4">
                {filteredLocations.map((loc) => {
                  const img = driveIdToImageUrl(loc.photo_location);
                  const km = distanceKm(userLocation, loc.latitude, loc.longitude);
                  return (
                    <div
                      key={loc.id}
                      onClick={() => { handleFlyTo(loc.latitude, loc.longitude); openVillage(loc); }}
                      className="relative bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-orange-500 hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite('village', loc.id); }}
                        aria-label={isFavorite('village', loc.id) ? "Remove from favorites" : "Save to favorites"}
                        className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-sm hover:scale-110 transition-transform"
                      >
                        <Heart size={16} className={isFavorite('village', loc.id) ? "fill-rose-500 text-rose-500" : "text-slate-300"} />
                      </button>

                      {img && (
                        <img
                          src={img}
                          alt={loc.location_name}
                          className="w-full h-28 rounded-lg object-cover mb-3 border border-slate-100"
                        />
                      )}

                      <h3 className="font-bold text-slate-800 mb-2 pr-8">{loc.location_name}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded font-medium flex items-center gap-1">
                          <MapPin size={12} /> {loc.village_name}
                        </span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded font-medium">
                          Taluka: {loc.taluka_name}
                        </span>
                        {km && (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded font-medium">
                            {km} km away
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          onClick={(e) => { e.stopPropagation(); openVillage(loc); }}
                          className="w-full py-1.5 mt-1 bg-orange-600 text-white rounded text-xs font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <ImageIcon size={14} /> View Profile
                        </button>
                        <ShowRouteButton onClick={() => handleShowRoute(loc.latitude, loc.longitude)} />
                        <AddToTripButton
                          type="village"
                          id={loc.id}
                          name={loc.location_name}
                          lat={loc.latitude}
                          lng={loc.longitude}
                          image={driveThumb(loc.photo_location)}
                        />
                      </div>
                    </div>
                  );
                })}
                {filteredLocations.length === 0 && (
                  <EmptyState
                    big
                    message="No places match your filters."
                    buttonClass="text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100"
                    onClear={() => {
                      setSelectedTaluka("All");
                      setSelectedTourismType("All");
                      setLocationSearch("");
                      setShowFavoritesOnly(false);
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* HOMESTAYS TAB */}
          {activeTab === 'homestays' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-orange-500 pl-3">Local Authentic Homestays</h2>

              <DiscoverStayLink onClick={() => navigate(STAY_ROUTE)} className="mb-5" />

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-slate-700 flex-1">Choose by Taluka</label>
                  <FavoriteFilterButton active={showFavoritesOnly} onClick={() => setShowFavoritesOnly((v) => !v)} />
                  <SearchToggle
                    open={isHomestaySearchOpen}
                    setOpen={setIsHomestaySearchOpen}
                    value={homestaySearch}
                    onChange={setHomestaySearch}
                    placeholder="Search homestay..."
                    title="Search by homestay"
                  />
                </div>

                <select
                  value={selectedHomestayTaluka}
                  onChange={(e) => setSelectedHomestayTaluka(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                >
                  {homestayTalukas.map((taluka) => (
                    <option key={taluka} value={taluka}>{taluka}</option>
                  ))}
                </select>

                <label className="block text-sm font-semibold text-slate-700 mb-2 mt-4">Choose Type of Homestays</label>
                <select
                  value={selectedHomestayType}
                  onChange={(e) => setSelectedHomestayType(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                >
                  {homestayTypes.map((type) => (
                    <option key={type} value={type}>{type === "All" ? "All Types" : type}</option>
                  ))}
                </select>

                {(selectedHomestayTaluka !== "All" || selectedHomestayType !== "All" || showFavoritesOnly) && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedHomestayTaluka !== "All" && (
                      <FilterChip label={`Taluka: ${selectedHomestayTaluka}`} onClear={() => setSelectedHomestayTaluka("All")} />
                    )}
                    {selectedHomestayType !== "All" && (
                      <FilterChip label={selectedHomestayType} onClear={() => setSelectedHomestayType("All")} />
                    )}
                    {showFavoritesOnly && (
                      <FilterChip label="❤ Favorites only" onClear={() => setShowFavoritesOnly(false)} />
                    )}
                  </div>
                )}

                <p className="text-xs text-slate-500 mt-3">
                  {filteredHomestays.length} {filteredHomestays.length === 1 ? "homestay" : "homestays"} found
                </p>
              </div>

              <div className="space-y-4">
                {filteredHomestays.map((home) => {
                  const img = driveIdToImageUrl(home.photo_homestay);
                  const km = distanceKm(userLocation, home.latitude, home.longitude);
                  return (
                    <div
                      key={home.id}
                      onClick={() => { handleFlyTo(home.latitude, home.longitude); setSelectedItem({ data: home, type: 'homestay' }); }}
                      className="relative bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-orange-500 hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite('homestay', home.id); }}
                        aria-label={isFavorite('homestay', home.id) ? "Remove from favorites" : "Save to favorites"}
                        className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-sm hover:scale-110 transition-transform"
                      >
                        <Heart size={16} className={isFavorite('homestay', home.id) ? "fill-rose-500 text-rose-500" : "text-slate-300"} />
                      </button>

                      {img && (
                        <img
                          src={img}
                          alt={home.name}
                          className="w-full h-28 rounded-lg object-cover mb-3 border border-slate-100"
                        />
                      )}

                      <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2 pr-8">
                        {home.name} <ShieldCheck size={14} className="text-emerald-500" />
                      </h3>
                      <p className="text-sm text-slate-600 mb-1">
                        <strong>Location:</strong> {home.village}, {home.taluka}
                        {km && (
                          <span className="block sm:inline sm:ml-2 text-emerald-700 font-medium">
                            · {km} km away from your current location
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-slate-600 mb-2">
                        <strong>Owner:</strong> {home.owner} (<PhoneLink phone={home.phone} />)
                      </p>
                      {home.amenities && (
                        <p className="text-xs text-slate-500 mb-3 italic">{truncate(home.amenities, 60)}</p>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedItem({ data: home, type: 'homestay' }); }}
                        className="w-full py-1.5 mb-3 bg-amber-500 text-slate-900 rounded text-xs font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ImageIcon size={14} /> View Profile
                      </button>
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded font-bold">{home.type}</span>
                        <div className="flex items-center gap-3 flex-wrap">
                          <WhatsAppLink phone={home.phone} />
                          <ShowRouteButton onClick={() => handleShowRoute(home.latitude, home.longitude)} />
                          <AddToTripButton
                            type="homestay"
                            id={home.id}
                            name={home.name}
                            lat={home.latitude}
                            lng={home.longitude}
                            image={driveThumb(home.photo_homestay)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredHomestays.length === 0 && (
                  <EmptyState
                    message="No homestays match your filters."
                    buttonClass="text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100"
                    onClear={() => {
                      setSelectedHomestayTaluka("All");
                      setSelectedHomestayType("All");
                      setHomestaySearch("");
                      setShowFavoritesOnly(false);
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* TRANSPORTATION TAB */}
          {activeTab === 'transportation' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-slate-800 mb-1 border-l-4 border-orange-500 pl-3">Local Resources and guides</h2>
              <p className="text-xs text-slate-500 mb-4 pl-3">
                {userLocation ? "Sorted by nearest to your current location." : "Enable location access to see drivers nearest to you first."}
              </p>

              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by village, taluka, or area..."
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                    className="w-full pl-7 pr-2 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <select
                value={selectedDriverTaluka}
                onChange={(e) => setSelectedDriverTaluka(e.target.value)}
                className="w-full mb-2 p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {driverTalukas.map((taluka) => (
                  <option key={taluka} value={taluka}>{taluka === "All" ? "All Talukas" : taluka}</option>
                ))}
              </select>

              <select
                value={selectedVehicleType}
                onChange={(e) => setSelectedVehicleType(e.target.value)}
                className="w-full mb-4 p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>{type === "All" ? "All Vehicle Types" : type}</option>
                ))}
              </select>

              {(selectedDriverTaluka !== "All" || selectedVehicleType !== "All" || driverSearch.trim()) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedDriverTaluka !== "All" && (
                    <FilterChip label={`Taluka: ${selectedDriverTaluka}`} onClear={() => setSelectedDriverTaluka("All")} />
                  )}
                  {selectedVehicleType !== "All" && (
                    <FilterChip label={selectedVehicleType} onClear={() => setSelectedVehicleType("All")} />
                  )}
                  {driverSearch.trim() && (
                    <FilterChip label={`"${driverSearch}"`} onClear={() => setDriverSearch("")} />
                  )}
                </div>
              )}

              <p className="text-xs text-slate-500 mb-3">
                {filteredDrivers.length} {filteredDrivers.length === 1 ? "driver" : "drivers"} found
              </p>

              <div className="space-y-4">
                {filteredDrivers.map((d) => {
                  const km = distanceKm(userLocation, d.lat, d.lng);
                  return (
                    <div
                      key={d.id}
                      onClick={() => { handleFlyTo(d.lat, d.lng); setSelectedItem({ data: d, type: 'driver' }); }}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-orange-500 hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                        {d.name} <ShieldCheck size={14} className="text-emerald-500" />
                      </h3>
                      <p className="text-sm text-slate-600 mb-1">
                        <strong>Base:</strong> {d.village}, {d.taluka}
                        {km && (
                          <span className="block sm:inline sm:ml-2 text-emerald-700 font-medium">· {km} km away</span>
                        )}
                      </p>
                      <p className="text-sm text-slate-600 mb-2">
                        <strong>Contact:</strong> (<PhoneLink phone={d.phone} />)
                      </p>
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <span className="px-2 py-1 bg-lime-100 text-lime-800 text-xs rounded font-bold">{d.vehicleType}</span>
                        <div className="flex items-center gap-3 flex-wrap">
                          <WhatsAppLink phone={d.phone} />
                          <ShowRouteButton onClick={() => handleShowRoute(d.lat, d.lng)} />
                          <AddToTripButton type="driver" id={d.id} name={d.name} lat={d.lat} lng={d.lng} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredDrivers.length === 0 && (
                  <EmptyState
                    message="No drivers match your filters."
                    buttonClass="text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100"
                    onClear={() => {
                      setSelectedDriverTaluka("All");
                      setSelectedVehicleType("All");
                      setDriverSearch("");
                    }}
                  />
                )}
              </div>

              {/* BUS TIMETABLES SECTION */}
              <h2 className="text-lg font-bold text-slate-800 mt-8 mb-1 border-l-4 border-lime-500 pl-3">Bus Timetables</h2>
              <p className="text-xs text-slate-500 mb-4 pl-3">
                Tap a bus stand to view it on the map, or download its timetable directly.
              </p>

              {busStopTalukas.length > 2 && (
                <select
                  value={selectedBusStopTaluka}
                  onChange={(e) => setSelectedBusStopTaluka(e.target.value)}
                  className="w-full mb-2 p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  {busStopTalukas.map((taluka) => (
                    <option key={taluka} value={taluka}>{taluka === "All" ? "All Talukas" : taluka}</option>
                  ))}
                </select>
              )}

              <p className="text-xs text-slate-500 mb-3">
                {filteredBusStops.length} bus {filteredBusStops.length === 1 ? "stand" : "stands"} found
              </p>

              <div className="space-y-4">
                {filteredBusStops.map((b) => {
                  const km = distanceKm(userLocation, b.lat, b.lng);
                  return (
                    <div
                      key={b.id}
                      onClick={() => { handleFlyTo(b.lat, b.lng); setSelectedItem({ data: b, type: 'busstop' }); }}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-lime-500 hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">🚏 {b.name}</h3>
                      <p className="text-sm text-slate-600 mb-2">
                        <strong>Taluka:</strong> {b.taluka}
                        {km && (
                          <span className="block sm:inline sm:ml-2 text-emerald-700 font-medium">· {km} km away</span>
                        )}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        {b.timetableLink ? (
                          <a
                            href={b.timetableLink}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs font-bold text-white bg-lime-600 hover:bg-lime-700 px-3 py-1.5 rounded transition-colors"
                          >
                            ⬇ Download bus timetable
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No timetable uploaded yet.</span>
                        )}
                        <AddToTripButton type="busstop" id={b.id} name={b.name} lat={b.lat} lng={b.lng} image={b.photo_url} />
                      </div>
                    </div>
                  );
                })}
                {filteredBusStops.length === 0 && <EmptyNote>No bus stands added yet.</EmptyNote>}
              </div>

              {/* ATM SECTION */}
              <h2 className="text-lg font-bold text-slate-800 mt-8 mb-1 border-l-4 border-teal-600 pl-3">ATMs</h2>
              <p className="text-xs text-slate-500 mb-4 pl-3">Tap an ATM to see it on the map.</p>

              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full mb-2 p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {banks.map((b) => (
                  <option key={b} value={b}>{b === "All" ? "All Banks" : b}</option>
                ))}
              </select>

              {atmTalukas.length > 2 && (
                <select
                  value={selectedAtmTaluka}
                  onChange={(e) => setSelectedAtmTaluka(e.target.value)}
                  className="w-full mb-2 p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  {atmTalukas.map((t) => (
                    <option key={t} value={t}>{t === "All" ? "All Talukas" : t}</option>
                  ))}
                </select>
              )}

              <p className="text-xs text-slate-500 mb-3">
                {filteredAtms.length} {filteredAtms.length === 1 ? "ATM" : "ATMs"} found
              </p>

              <div className="space-y-4">
                {filteredAtms.map((a) => {
                  const km = distanceKm(userLocation, a.lat, a.lng);
                  return (
                    <div
                      key={a.id}
                      onClick={() => handleFlyTo(a.lat, a.lng)}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-teal-500 hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <h3 className="font-bold text-slate-800 mb-1">🏧 {a.name}</h3>
                      <p className="text-sm text-slate-600 mb-1">
                        <strong>{a.bank}</strong> · {[a.village, a.taluka].filter(Boolean).join(', ')}
                        {km && (
                          <span className="block sm:inline sm:ml-2 text-emerald-700 font-medium">· {km} km away</span>
                        )}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap mt-2">
                        <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded font-bold">
                          {a.is24x7 ? "24x7" : "Limited hours"}
                        </span>
                        {a.hasCashDeposit && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded font-bold">Cash deposit</span>
                        )}
                        <ShowRouteButton onClick={() => handleShowRoute(a.lat, a.lng)} />
                      </div>
                    </div>
                  );
                })}
                {filteredAtms.length === 0 && <EmptyNote>No ATMs added yet.</EmptyNote>}
              </div>
            </div>
          )}

          {/* PLAN TRIP TAB — "Plan for me" wizard + trip planner together */}
          {activeTab === 'trip' && (
            <PlanYourTripPanel places={allPlaces} userLocation={userLocation} />
          )}
        </div>
      </div>

      {/* MAP AREA — full-screen pane on mobile (toggled), flexible column on desktop.
          `isolate` gives the map its own stacking context, so Leaflet's high z-indexes
          (panes, controls, chips, route badge) stay inside the map and never appear
          above the site navbar's dropdown menus. */}
      <div className={`relative isolate bg-slate-200 min-h-0 ${mobileView === 'map' ? 'flex' : 'hidden'} md:flex flex-1`}>
        {showMapChips && (
          <MapCategoryChips value={selectedTourismType} onChange={setSelectedTourismType} />
        )}
        {activeRoute && (
          <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-[1000] bg-white shadow-lg rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              🚗 {activeRoute.distance} km · {activeRoute.duration} min
            </span>
            <button
              onClick={() => setActiveRoute(null)}
              className="text-slate-400 hover:text-slate-600 text-sm"
              aria-label="Clear route"
            >
              ✕
            </button>
          </div>
        )}

        {/* One-time hint: explains that the numbered circles can be tapped. */}
        {showClusterHint && activeTab !== 'trip' && !activeRoute && (
          <ClusterHint onDismiss={dismissClusterHint} />
        )}

        <MapContainer center={[17.7554, 73.1923]} zoom={11} zoomControl={false} className="w-full h-full z-0">
          <ZoomControl position="topright" />
          <LayersControl position="bottomleft">
            <LayersControl.BaseLayer checked name="Street Map">
              <TileLayer
                url={`https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png?api_key=${import.meta.env.VITE_STADIA_KEY}`}
                attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                maxZoom={20}
              />
            </LayersControl.BaseLayer>

            {/* Satellite imagery + its place-name labels, grouped so the labels
                only show on satellite (Street Map already has its own labels). */}
            <LayersControl.BaseLayer name="Satellite">
              <LayerGroup>
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
                  maxNativeZoom={19}
                  maxZoom={20}
                />
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                  maxNativeZoom={19}
                  maxZoom={20}
                />
              </LayerGroup>
            </LayersControl.BaseLayer>
          </LayersControl>

          {districtBorder && (
            <GeoJSON
              data={districtBorder}
              style={{ color: "#dc2626", weight: 2.5, fillOpacity: 0, dashArray: "5, 4" }}
              interactive={false}
            />
          )}

          <InitialView
            border={districtBorder}
            points={locations.filter((l) => hasCoords(l)).map((l) => [l.latitude, l.longitude])}
          />
          <MapController position={mapPosition} />
          <NearbyBoundsController origin={nearbyOrigin} nearby={nearbyLocations} />
          <ZoomWatcher onZoomChange={setCurrentZoom} />

          {/* Active data pins, clustered so the district view stays readable */}
          <MarkerClusterGroup
            ref={clusterRef}
            chunkedLoading
            maxClusterRadius={50}
            showCoverageOnHover={false}
            spiderfyOnMaxZoom
            eventHandlers={{ clusterclick: dismissClusterHint }}
            iconCreateFunction={(cluster) => {
              const count = cluster.getChildCount();
              return L.divIcon({
                html: `<div class="cluster-pulse" title="🎁 ${count} hidden gems inside – tap to unwrap!" style="
                  background:#B4532A;color:#fff;width:38px;height:38px;
                  border-radius:50%;display:flex;align-items:center;justify-content:center;
                  font-weight:700;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,.35);
                  border:2px solid white;cursor:pointer;">${count}</div>`,
                className: "",
                iconSize: [38, 38],
              });
            }}
          >
            {renderActivePins()}
          </MarkerClusterGroup>

          {nearbyOrigin && nearbyLocations.map((n, idx) => (
            <Polyline
              key={`nearby-line-${idx}`}
              positions={[[nearbyOrigin.lat, nearbyOrigin.lng], [n.lat, n.lng]]}
              pathOptions={{ color: '#2563eb', weight: 2, dashArray: '6, 6', opacity: 0.8 }}
            />
          ))}

          {nearbyLocations.map((n, idx) => (
            <Marker key={`nearby-marker-${idx}`} position={[n.lat, n.lng]} icon={getNearbyIcon(currentZoom)}>
              {currentZoom >= 12 && (
                <Tooltip
                  direction="top"
                  offset={[0, -16]}
                  opacity={1}
                  permanent
                  className="text-xs font-semibold !bg-blue-600 !text-white shadow-sm border-0 rounded px-2 py-1"
                >
                  {n.name}{n.duration ? ` · ${n.duration} min` : n.distance ? ` · ${n.distance} km` : ''}
                </Tooltip>
              )}
            </Marker>
          ))}

          {/* User's current location */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={USER_ICON} zIndexOffset={1000}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {/* Active route line */}
          {activeRoute && (
            <GeoJSON
              key={JSON.stringify(activeRoute.geometry)}
              data={activeRoute.geometry}
              style={{ color: "#2563eb", weight: 5, opacity: 0.8 }}
            />
          )}
        </MapContainer>
      </div>

      {/* Floating List/Map toggle — mobile only */}
      <button
        onClick={() => setMobileView((v) => (v === 'list' ? 'map' : 'list'))}
        className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-[1500] flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-full shadow-xl font-semibold text-sm active:scale-95 transition-transform"
      >
        {mobileView === 'list' ? (
          <><MapIcon size={16} /> View Map</>
        ) : (
          <><List size={16} /> View List</>
        )}
      </button>

      {selectedItem && (
        <div className="fixed inset-0 z-[2000] bg-white overflow-y-auto overscroll-contain md:static md:inset-auto md:z-auto md:w-[420px] md:border-l md:border-slate-200">
          <ProfileDetails
            loc={selectedItem.data}
            type={selectedItem.type}
            onBack={() => { setSelectedItem(null); setNearbyLocations([]); setNearbyOrigin(null); }}
            compact
          />
        </div>
      )}
    </div>
  );
}