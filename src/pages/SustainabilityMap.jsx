import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents, LayersControl, GeoJSON} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { TreePine, BedDouble, MapPin, Image as ImageIcon, Crosshair, Trash2, ShieldCheck, Link, Search, X, Bus } from 'lucide-react';
import { useLocations } from '../context/LocationsContext';
import ProfileDetails from './ProfileDetails';
import RegistrationForm from '../components/forms/RegistrationForm';

function MapLegend() {
  return (
    <div className="absolute top-1 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur px-5 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-4 whitespace-nowrap overflow-x-auto max-w-[95%]">
      {Object.entries(CATEGORY_ICON_MAP).map(([category, { emoji, color }]) => (
        <div key={category} className="flex items-center gap-1.5 shrink-0">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: color }}
          >
            <span style={{ fontSize: '10px', lineHeight: 1 }}>{emoji}</span>
          </div>
          <span className="text-xs font-semibold text-slate-700">
            {category}
          </span>
        </div>
      ))}
    </div>
  );
}

// Fix Leaflet's default icon missing issue in webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
// Maps each tourism category to an emoji symbol + color
const CATEGORY_ICON_MAP = {
  "Beach Tourism": { emoji: "🏖️", color: "#0ea5e9" },
  "Heritage Tourism": { emoji: "🏛️", color: "#a855f7" },
  "Religious Tourism": { emoji: "🛕", color: "#f97316" },
  "Nature & Eco Tourism": { emoji: "🌿", color: "#16a34a" },
  "Homestays": { emoji: "🏡", color: "#ffc1b6" },
  "Taxi & Auto": { emoji: "🛺", color: "#0006a7" },
  "Bus Stand": { emoji: "🚌", color: "#487c00" },
};
const DEFAULT_ICON = { emoji: "🏡", color: "#e08b01" };

// Creates a pin-shaped divIcon with a category emoji inside.
// Bigger + red when selected.
function createMarkerIcon(category, isSelected) {
  const { emoji, color } = CATEGORY_ICON_MAP[category] || DEFAULT_ICON;
  const bg = isSelected ? "#dc2626" : color;
  const size = isSelected ? 42 : 32;
  const fontSize = isSelected ? 20 : 16;

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: ${bg};
      border: 2px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 5px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="
        transform: rotate(45deg);
        font-size: ${fontSize}px;
        line-height: 1;
      ">${emoji}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}
// ⬇️ ADD fetchRoute HERE ⬇️
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


// Calculates distance in km between two lat/lng points using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
// Component to handle map flyTo logic
function MapController({ position }) {
  const map = useMap();

  // Watch the map container's size and tell Leaflet whenever it changes
  useEffect(() => {
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [map]);

  useEffect(() => {
    if (position) {
      // let layout settle first, then invalidate size, then fly
      const timer = setTimeout(() => {
        map.invalidateSize();
        map.flyTo(position, 14, { animate: true, duration: 1.5 });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [position, map]);

  return null;
}

// Component to handle map click events
function MapClickHandler({ isActive, onPinDropped }) {
  useMapEvents({
    click(e) {
      if (isActive) {
        onPinDropped(e.latlng);
      }
    },
  });
  return null;
}

export default function SustainabilityMap() {
  const navigate = useNavigate();
  const { locations, homestays, eco, drivers, busStops, loading } = useLocations();
  const [activeTab, setActiveTab] = useState('villages');
  const [mapPosition, setMapPosition] = useState(null); // Used to trigger flyTo
  const [pinMode, setPinMode] = useState(false);
  const [customPins, setCustomPins] = useState([]);
  const [selectedTaluka, setSelectedTaluka] = useState("All");
  const [selectedTourismType, setSelectedTourismType] = useState("All");
  const [locationSearch, setLocationSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [roadsData, setRoadsData] = useState(null);
  const [selectedHomestayTaluka, setSelectedHomestayTaluka] = useState("All");
const [selectedHomestayType, setSelectedHomestayType] = useState("All");
const [homestaySearch, setHomestaySearch] = useState("");
const [isHomestaySearchOpen, setIsHomestaySearchOpen] = useState(false);
const [selectedDriverTaluka, setSelectedDriverTaluka] = useState("All");
const [selectedVehicleType, setSelectedVehicleType] = useState("All");
const [driverSearch, setDriverSearch] = useState("");
const [isDriverSearchOpen, setIsDriverSearchOpen] = useState(false);
const [selectedBusStopTaluka, setSelectedBusStopTaluka] = useState("All");
const [selectedItem, setSelectedItem] = useState(null); // { data, type }
const markerRefs = useRef({});
const [districtBorder, setDistrictBorder] = useState(null);   // 👈 ADD THIS LINE
const [userLocation, setUserLocation] = useState(null);
const [activeRoute, setActiveRoute] = useState(null);

const handleShowRoute = async (destLat, destLng) => {
  if (!userLocation) {
    alert("Please allow location access to see directions.");
    return;
  }
  const route = await fetchRoute(userLocation.lat, userLocation.lng, destLat, destLng);
  if (route) {
    setActiveRoute(route);
    setMapPosition([destLat, destLng]);
  } else {
    alert("Could not calculate route.");
  }
};





  /*useEffect(() => {

  fetch("/roads.geojson")
    .then((res) => res.json())
    .then((data) => {
      setRoadsData(data);
    })
    .catch((err) => {
      console.error("Failed to load roads:", err);
    });

}, []); */
// 👇 ADD THIS NEW BLOCK
useEffect(() => {
  fetch("/ratnagiri-border.geojson")
    .then((res) => res.json())
    .then((data) => setDistrictBorder(data))
    .catch((err) => console.error("Failed to load district border:", err));
}, []);
  // 👇 ADD GEOLOCATION BLOCK HERE
useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.log("Location access denied or unavailable:", error.message);
      }
    );
  }
}, []);

  const handleFlyTo = (lat, lng) => {
    setMapPosition([lat, lng]);
  };
  
  useEffect(() => {
    if (selectedItem?.data?.id) {
      const marker = markerRefs.current[selectedItem.data.id];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedItem]);
  const handlePinDropped = (latlng) => {
    const name = window.prompt("Enter a Name for this Custom Pinned Location:");
    if (name) {
      setCustomPins(prev => [...prev, { id: Date.now(), name, lat: latlng.lat, lng: latlng.lng }]);
    }
    setPinMode(false);
  };

  const tabs = [
    { id: "villages", label: "Locations", icon: TreePine },
    { id: "homestays", label: "Homestays", icon: BedDouble },
    { id: "transportation", label: "Transportation", icon: Bus },
    { id: "pins", label: "Add Location", icon: MapPin },
  ];

  if (loading) return <div className="p-8 text-center animate-pulse font-medium text-slate-500 h-full flex items-center justify-center">Loading live database for map...</div>;
  const talukas = [
  "All",
  ...new Set(
    locations
      .map((loc) => loc.taluka_name)
      .filter(Boolean)
      .sort()
  ),
];

const tourismTypes = [
  { value: "All", label: "All Types" },
  { value: "Beach Tourism", label: "🏖️ Beach Tourism" },
  { value: "Heritage Tourism", label: "🏛️ Heritage Tourism" },
  { value: "Religious Tourism", label: "🛕 Religious Tourism" },
  { value: "Nature & Eco Tourism", label: "🌿 Nature & Eco Tourism" },
  { value: "Adventure & Marine Tourism", label: "🚤 Adventure & Marine Tourism" },
];



const filteredLocations = locations.filter((loc) => {

  const talukaMatch =
    selectedTaluka === "All" ||
    loc.taluka_name === selectedTaluka;

  const tourismTypeMatch =
    selectedTourismType === "All" ||
    loc.category === selectedTourismType;

  const searchMatch =
    (loc.location_name || "")
      .toLowerCase()
      .includes(locationSearch.toLowerCase());

  return talukaMatch && tourismTypeMatch && searchMatch;

});
console.log("selectedTourismType:", JSON.stringify(selectedTourismType));
console.log("Sample category:", JSON.stringify(locations[0]?.category));
console.log("All categories:", locations.map(l => l.category));
console.log("filteredLocations count:", filteredLocations.length);
console.log("Full first location object:", JSON.stringify(locations[0], null, 2));


const homestayTypes = [
  "All",
  ...new Set(
    homestays
      .map((h) => h.type)
      .filter(Boolean)
      .sort()
  ),
];

const filteredHomestays = homestays.filter((home) => {
  const talukaMatch =
    selectedHomestayTaluka === "All" || home.taluka === selectedHomestayTaluka;

  const typeMatch =
    selectedHomestayType === "All" || home.type === selectedHomestayType;

  const searchMatch =
    home.name.toLowerCase().includes(homestaySearch.toLowerCase()) ||
    (home.owner &&
      home.owner.toLowerCase().includes(homestaySearch.toLowerCase()));

  return talukaMatch && typeMatch && searchMatch;
});

const driverTalukas = [
  "All",
  ...new Set(
    drivers
      .map((d) => d.taluka)
      .filter(Boolean)
      .sort()
  ),
];

const vehicleTypes = [
  "All",
  ...new Set(
    drivers
      .map((d) => d.vehicleType)
      .filter(Boolean)
      .sort()
  ),
];

const filteredDrivers = drivers
  .filter((d) => {
    const talukaMatch =
      selectedDriverTaluka === "All" || d.taluka === selectedDriverTaluka;

    const typeMatch =
      selectedVehicleType === "All" || d.vehicleType === selectedVehicleType;

    const query = driverSearch.toLowerCase();
    const searchMatch =
      query === "" ||
      (d.village || "").toLowerCase().includes(query) ||
      (d.taluka || "").toLowerCase().includes(query) ||
      (d.serviceArea || "").toLowerCase().includes(query);

    return talukaMatch && typeMatch && searchMatch;
  })
  .sort((a, b) => {
    if (!userLocation) return 0;
    const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
    const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
    return (distA ?? Infinity) - (distB ?? Infinity);
  });

const busStopTalukas = [
  "All",
  ...new Set(
    busStops
      .map((b) => b.taluka)
      .filter(Boolean)
      .sort()
  ),
];

const filteredBusStops = busStops
  .filter((b) => selectedBusStopTaluka === "All" || b.taluka === selectedBusStopTaluka)
  .sort((a, b) => {
    if (!userLocation) return 0;
    const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
    const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
    return (distA ?? Infinity) - (distB ?? Infinity);
  });

  const renderActivePins = () => {
    if (activeTab === 'villages') {
      return filteredLocations.map(loc => (
        <Marker 
          key={loc.id} 
          position={[loc.latitude, loc.longitude]}

          ref={(ref) => { markerRefs.current[loc.id] = ref; }}
icon={createMarkerIcon(loc.category, selectedItem?.type === 'village' && selectedItem?.data?.id === loc.id)}
>
          <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent className="font-bold text-xs bg-white/90 shadow-sm border-0 text-slate-800">{loc.location_name}</Tooltip>
          <Popup>
  <div className="text-center">
    {loc.photo_location && (
      <img
        src={loc.photo_location}
        alt={loc.location_name}
        className="w-full h-32 rounded-lg object-cover mb-2 border border-slate-200"
      />
    )}
    <strong className="block text-base mb-1">{loc.location_name}</strong>
    <span className="text-xs text-slate-500 mb-2 block">{loc.category}</span>
    {userLocation && (
      <span className="text-xs text-emerald-700 font-medium mb-2 block">
        {calculateDistance(userLocation.lat, userLocation.lng, loc.latitude, loc.longitude)?.toFixed(1)} km away from your current location
      </span>
    )}
    <button 
      onClick={() => setSelectedItem({ data: loc, type: 'village' })}
      className="w-full py-1.5 mt-1 bg-orange-600 text-white rounded text-xs font-bold hover:bg-orange-700 transition-colors"
    >
      View Detailed Profile
    </button>
  </div>
</Popup>
        </Marker>
      ));
    }
    if (activeTab === 'homestays') {
      return filteredHomestays.map(home => (

        <Marker 
          key={home.id} 
          position={[home.latitude, home.longitude]}
          ref={(ref) => { markerRefs.current[home.id] = ref; }}
          icon={createMarkerIcon(null, selectedItem?.type === 'homestay' && selectedItem?.data?.id === home.id)}
        >
          <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent className="font-bold text-xs bg-amber-500/90 shadow-sm border-0 text-white">{home.name}</Tooltip>
          <Popup>
  <div className="text-center">
    {home.photo_homestay && (
      <img
        src={home.photo_homestay}
        alt={home.name}
        className="w-full h-32 rounded-lg object-cover mb-2 border border-slate-200"
      />
    )}
    <strong className="block text-base mb-1">{home.name}</strong>
    <span className="text-xs text-slate-500 mb-2 block">{home.type}</span>
    {userLocation && (
      <span className="text-xs text-emerald-700 font-medium mb-1 block">
        {calculateDistance(userLocation.lat, userLocation.lng, home.latitude, home.longitude)?.toFixed(1)} km away from your current location
      </span>
    )}
    <span className="text-xs text-slate-500 block mb-1">Owner: {home.owner}</span>
              <button 
                onClick={() => setSelectedItem({ data: home, type: 'homestay' })}
                className="w-full py-1.5 mt-1 bg-amber-500 text-slate-900 rounded text-xs font-bold hover:bg-amber-600 transition-colors mb-2"
              >
                View Homestay Profile
              </button>
            </div>
          </Popup>
        </Marker>
      ));
    }
    if (activeTab === 'eco') {
      return eco.map(e => (
        <Marker 
          key={e.id} 
          position={[e.latitude, e.longitude]}
          ref={(ref) => { markerRefs.current[e.id] = ref; }}
          icon={createMarkerIcon(null, selectedItem?.type === 'eco' && selectedItem?.data?.id === e.id)}
        >
          <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent className="font-bold text-xs bg-emerald-600/90 shadow-sm border-0 text-white">{e.name}</Tooltip>
          <Popup>
            <div className="text-left">
              <strong className="block text-base mb-1 border-b pb-1">{e.name}</strong>
              <div className="mt-2 text-xs mb-3">
                <strong className="block text-emerald-700">Waste Management:</strong>
                <a href={e.waste} target="_blank" rel="noreferrer" className="text-blue-600 truncate block w-40">View Doc</a>
              </div>
              <button 
                onClick={() => setSelectedItem({ data: e, type: 'eco' })}
                className="w-full py-1.5 mt-1 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                View Facility Profile
              </button>
            </div>
          </Popup>
        </Marker>
      ));
    }
    if (activeTab === 'transportation') {
      const driverMarkers = filteredDrivers
        .filter(d => d.lat && d.lng)
        .map(d => (
          <Marker
            key={`driver-${d.id}`}
            position={[d.lat, d.lng]}
            ref={(ref) => { markerRefs.current[d.id] = ref; }}
            icon={createMarkerIcon('Buses & Auto', selectedItem?.type === 'driver' && selectedItem?.data?.id === d.id)}
          >
            <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent className="font-bold text-xs bg-lime-500/90 shadow-sm border-0 text-slate-900">{d.name}</Tooltip>
            <Popup>
              <div className="text-left">
                <strong className="block text-base mb-1 border-b pb-1">{d.name}</strong>
                <span className="text-xs text-slate-500 mb-2 block">{d.vehicleType}</span>
                {userLocation && (
                  <span className="text-xs text-emerald-700 font-medium mb-2 block">
                    {calculateDistance(userLocation.lat, userLocation.lng, d.lat, d.lng)?.toFixed(1)} km away from your current location
                  </span>
                )}
                <button
                  onClick={() => setSelectedItem({ data: d, type: 'driver' })}
                  className="w-full py-1.5 mt-1 bg-lime-500 text-slate-900 rounded text-xs font-bold hover:bg-lime-600 transition-colors"
                >
                  View Driver Profile
                </button>
              </div>
            </Popup>
          </Marker>
        ));

      const busStopMarkers = filteredBusStops
        .filter(b => b.lat && b.lng)
        .map(b => (
          <Marker
            key={`busstop-${b.id}`}
            position={[b.lat, b.lng]}
            ref={(ref) => { markerRefs.current[b.id] = ref; }}
            icon={createMarkerIcon('Bus Stand', selectedItem?.type === 'busstop' && selectedItem?.data?.id === b.id)}
          >
            <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent className="font-bold text-xs bg-lime-700/90 shadow-sm border-0 text-white">{b.name}</Tooltip>
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
    {userLocation && (
      <span className="text-xs text-emerald-700 font-medium mb-2 block">
        {calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)?.toFixed(1)} km away from your current location
      </span>
    )}
    {b.timetableLink ? (
      
        <a href={b.timetableLink}
        target="_blank"
        rel="noreferrer"
        className="w-full block text-center py-1.5 mt-1 bg-lime-600 text-white rounded text-xs font-bold hover:bg-lime-700 transition-colors"
      >
        ⬇ Download Timetable PDF
      </a>
    ) : (
      <span className="text-xs text-slate-400 italic">No timetable uploaded yet.</span>
    )}
  </div>
</Popup>
          </Marker>
        ));

      return [...driverMarkers, ...busStopMarkers];
    }
    return null;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      
      {/* INNER SIDEBAR */}
      <div className="w-96 flex flex-col border-r border-slate-200 bg-slate-50 z-10">
        <div className="p-6 bg-gradient-to-br from-orange-600 to-amber-600 text-white shadow-md relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80')] opacity-30 bg-cover bg-center"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold tracking-tight mb-1">Ratnagiri Tourism</h1>
            <p className="text-sm font-light italic opacity-90">Explore the Jewel of Konkan Ecosystem</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto bg-slate-800 text-slate-400 hide-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id ? 'bg-slate-700 text-white border-orange-500' : 'border-transparent hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* VILLAGES TAB */}
          {activeTab === 'villages' && (
            <div className="animate-in slide-in-from-right-4 duration-300">




<div className="mb-6">

  <div className="flex items-center gap-2 mb-2">
    <label className="text-sm font-semibold text-slate-700 flex-1">
      Choose by Taluka
    </label>

    {isSearchOpen ? (
      <div className="flex items-center border border-slate-300 rounded-lg px-2 py-1 bg-white">
        <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
        <input
          autoFocus
          type="text"
          placeholder="Search location..."
          value={locationSearch}
          onChange={(e) => setLocationSearch(e.target.value)}
          className="outline-none text-xs w-32 bg-transparent"
        />
        <button
          onClick={() => { setIsSearchOpen(false); setLocationSearch(""); }}
          className="ml-1 shrink-0"
        >
          <X className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    ) : (
      <button
        onClick={() => setIsSearchOpen(true)}
        className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-100 shrink-0"
        title="Search by location"
      >
        <Search className="w-3.5 h-3.5 text-slate-600" />
      </button>
    )}
  </div>

  <select
    value={selectedTaluka}
    onChange={(e) => setSelectedTaluka(e.target.value)}
    className="w-full border rounded-lg p-2"
  >
    {talukas.map((taluka) => (
      <option key={taluka} value={taluka}>
        {taluka}
      </option>
    ))}
  </select>

  <label className="block text-sm font-semibold text-slate-700 mb-2 mt-4">
    Choose Type of Attractions
  </label>

  <select
    value={selectedTourismType}
    onChange={(e) => setSelectedTourismType(e.target.value)}
    className="w-full border rounded-lg p-2"
  >
    {tourismTypes.map((type) => (
      <option key={type.value} value={type.value}>
        {type.label}
      </option>
    ))}
  </select>

</div>


              <div className="space-y-4">
                {filteredLocations.map(loc => (
                     <div 
                    key={loc.id} 
                    onClick={() => { handleFlyTo(loc.latitude, loc.longitude); setSelectedItem({ data: loc, type: 'village' }); }}
                    
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-orange-500 hover:shadow-md cursor-pointer transition-all"
                  >
                    <h3 className="font-bold text-slate-800 mb-2">{loc.location_name}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded font-medium flex items-center gap-1"><MapPin size={12}/> {loc.village_name}</span>
  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded font-medium">Taluka: {loc.taluka_name}</span>
  {userLocation && (
    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded font-medium">
      {calculateDistance(userLocation.lat, userLocation.lng, loc.latitude, loc.longitude)?.toFixed(1)} km away
    </span>
  )}
</div>
      <div className="flex items-center gap-3">
  <button 
    onClick={(e) => { e.stopPropagation(); setSelectedItem({ data: loc, type: 'village' }); }}
    className="text-blue-600 text-xs font-medium flex items-center gap-1 hover:text-blue-800"
  >
    <ImageIcon size={14} /> View Profile
  </button>
  <button
    onClick={(e) => { e.stopPropagation(); handleShowRoute(loc.latitude, loc.longitude); }}
    className="text-emerald-600 text-xs font-medium flex items-center gap-1 hover:text-emerald-800"
  >
    🧭 Show Route
  </button>
</div>              
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* HOMESTAYS TAB */}
{activeTab === 'homestays' && (
  <div className="animate-in slide-in-from-right-4 duration-300">
    <h2 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-orange-500 pl-3">Local Authentic Homestays</h2>

    <div className="mb-6">

      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm font-semibold text-slate-700 flex-1">
          Choose by Taluka
        </label>

        {isHomestaySearchOpen ? (
          <div className="flex items-center border border-slate-300 rounded-lg px-2 py-1 bg-white">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Search homestay..."
              value={homestaySearch}
              onChange={(e) => setHomestaySearch(e.target.value)}
              className="outline-none text-xs w-32 bg-transparent"
            />
            <button
              onClick={() => { setIsHomestaySearchOpen(false); setHomestaySearch(""); }}
              className="ml-1 shrink-0"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsHomestaySearchOpen(true)}
            className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-100 shrink-0"
            title="Search by homestay"
          >
            <Search className="w-3.5 h-3.5 text-slate-600" />
          </button>
        )}
      </div>

      <select
        value={selectedHomestayTaluka}
        onChange={(e) => setSelectedHomestayTaluka(e.target.value)}
        className="w-full border rounded-lg p-2"
      >
        {talukas.map((taluka) => (
          <option key={taluka} value={taluka}>
            {taluka}
          </option>
        ))}
      </select>

      <label className="block text-sm font-semibold text-slate-700 mb-2 mt-4">
        Choose Type of Homestays
      </label>

      <select
        value={selectedHomestayType}
        onChange={(e) => setSelectedHomestayType(e.target.value)}
        className="w-full border rounded-lg p-2"
      >
        {homestayTypes.map((type) => (
          <option key={type} value={type}>
            {type === "All" ? "All Types" : type}
          </option>
        ))}
      </select>

    </div>

    <div className="space-y-4">
      {filteredHomestays.map(home => (
        <div 
          key={home.id}
          onClick={() => { handleFlyTo(home.latitude, home.longitude); setSelectedItem({ data: home, type: 'homestay' }); }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-orange-500 hover:shadow-md cursor-pointer transition-all"
        >
          <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
            {home.name} <ShieldCheck size={14} className="text-emerald-500" />
          </h3>
          <p className="text-sm text-slate-600 mb-1">
  <strong>Location:</strong> {home.village}, {home.taluka}
  {userLocation && (
  <span className="ml-2 text-emerald-700 font-medium">
    · {calculateDistance(userLocation.lat, userLocation.lng, home.latitude, home.longitude)?.toFixed(1)} km away from your current location
  </span>
)}
</p>
          <p className="text-sm text-slate-600 mb-2">
  <strong>Owner:</strong> {home.owner} (
  <a href={`tel:${home.phone.split('/')[0].trim()}`} onClick={(e) => e.stopPropagation()} className="text-blue-600 hover:underline font-medium">
    {home.phone}
  </a>
  )
</p>
          <p className="text-xs text-slate-500 mb-3 italic">{home.amenities.substring(0, 60)}...</p>
          <div className="flex justify-between items-center">
  <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded font-bold">{home.type}</span>
  <div className="flex items-center gap-3">
    <a
       href={`https://wa.me/91${home.phone.split('/')[0].replace(/\D/g, '')}`}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="text-green-600 text-xs font-medium flex items-center gap-1 hover:text-green-700"
      title="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.36.101 11.943c0 2.105.549 4.161 1.595 5.972L0 24l6.238-1.635a11.918 11.918 0 005.804 1.477h.005c6.585 0 11.941-5.362 11.943-11.943a11.86 11.86 0 00-3.47-8.45zM12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.36-.214-3.735.98.998-3.641-.235-.374a9.86 9.86 0 01-1.51-5.264C2.176 6.463 6.634 2.006 12.05 2.006c2.629 0 5.098 1.024 6.955 2.883a9.788 9.788 0 012.876 6.966c-.003 5.416-4.46 9.93-9.831 9.93z"/>
      </svg>
      WhatsApp
    </a>
    <button
      onClick={(e) => { e.stopPropagation(); handleShowRoute(home.latitude, home.longitude); }}
      className="text-emerald-600 text-xs font-medium flex items-center gap-1 hover:text-emerald-800"
    >
      🧭 Show Route
    </button>
  </div>
</div>
        </div>
      ))}
      {filteredHomestays.length === 0 && (
        <p className="text-sm text-slate-500 bg-slate-100 p-3 rounded text-center">
          No homestays match your filters.
        </p>
      )}
    </div>
  </div>
)} 

          {/* SUSTAINABILITY TAB */}
          {activeTab === 'eco' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-orange-500 pl-3">Environmental Infrastructure</h2>
              <div className="space-y-4">
                {eco.map(e => (
                  <div 
                    key={e.id}
                    onClick={() => { handleFlyTo(e.latitude, e.longitude); setSelectedItem({ data: e, type: 'eco' }); }}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-orange-500 hover:shadow-md cursor-pointer transition-all"
                  >
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">{e.name}</h3>
                    <div className="text-sm text-slate-600 space-y-3 mt-3">
                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <strong className="block text-emerald-700 mb-1 text-xs uppercase tracking-wide">Waste Management</strong>
                        <a href={e.waste} target="_blank" rel="noreferrer" onClick={evt => evt.stopPropagation()} className="text-blue-600 flex items-center gap-1 text-xs hover:underline">
                          <Link size={12} /> View Official Document
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          

          {/* TRANSPORTATION TAB */}
          {activeTab === 'transportation' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-slate-800 mb-1 border-l-4 border-orange-500 pl-3">Drivers & Transportation</h2>
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
                  <option key={taluka} value={taluka}>
                    {taluka === "All" ? "All Talukas" : taluka}
                  </option>
                ))}
              </select>

              <select
                value={selectedVehicleType}
                onChange={(e) => setSelectedVehicleType(e.target.value)}
                className="w-full mb-4 p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "All" ? "All Vehicle Types" : type}
                  </option>
                ))}
              </select>

              <div className="space-y-4">
                {filteredDrivers.map(d => (
                  <div
                    key={d.id}
                    onClick={() => { handleFlyTo(d.lat, d.lng); setSelectedItem({ data: d, type: 'driver' }); }}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-orange-500 hover:shadow-md cursor-pointer transition-all"
                  >
                    <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                      {d.name} <ShieldCheck size={14} className="text-emerald-500" />
                    </h3>
                    <p className="text-sm text-slate-600 mb-1">
                      <strong>Base:</strong> {d.village}, {d.taluka}
                      {userLocation && (
                        <span className="ml-2 text-emerald-700 font-medium">
                          · {calculateDistance(userLocation.lat, userLocation.lng, d.lat, d.lng)?.toFixed(1)} km away
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-slate-600 mb-2">
                      <strong>Contact:</strong> (
                      <a href={`tel:${(d.phone || '').split('/')[0].trim()}`} onClick={(e) => e.stopPropagation()} className="text-blue-600 hover:underline font-medium">
                        {d.phone}
                      </a>
                      )
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-1 bg-lime-100 text-lime-800 text-xs rounded font-bold">{d.vehicleType}</span>
                      <div className="flex items-center gap-3">
                        

                          <a href={`https://wa.me/91${(d.phone || '').split('/')[0].replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-green-600 text-xs font-medium flex items-center gap-1 hover:text-green-700"
                          title="Chat on WhatsApp"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                            <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.36.101 11.943c0 2.105.549 4.161 1.595 5.972L0 24l6.238-1.635a11.918 11.918 0 005.804 1.477h.005c6.585 0 11.941-5.362 11.943-11.943a11.86 11.86 0 00-3.47-8.45zM12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.36-.214-3.735.98.998-3.641-.235-.374a9.86 9.86 0 01-1.51-5.264C2.176 6.463 6.634 2.006 12.05 2.006c2.629 0 5.098 1.024 6.955 2.883a9.788 9.788 0 012.876 6.966c-.003 5.416-4.46 9.93-9.831 9.93z"/>
                          </svg>
                          WhatsApp
                        </a>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleShowRoute(d.lat, d.lng); }}
                          className="text-emerald-600 text-xs font-medium flex items-center gap-1 hover:text-emerald-800"
                        >
                          🧭 Show Route
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredDrivers.length === 0 && (
                  <p className="text-sm text-slate-500 bg-slate-100 p-3 rounded text-center">
                    No drivers match your filters.
                  </p>
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
                  className="w-full mb-4 p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  {busStopTalukas.map((taluka) => (
                    <option key={taluka} value={taluka}>
                      {taluka === "All" ? "All Talukas" : taluka}
                    </option>
                  ))}
                </select>
              )}

              <div className="space-y-4">
                {filteredBusStops.map(b => (
                  <div
                    key={b.id}
                    onClick={() => { handleFlyTo(b.lat, b.lng); setSelectedItem({ data: b, type: 'busstop' }); }}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-lime-500 hover:shadow-md cursor-pointer transition-all"
                  >
                    <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                      🚏 {b.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-2">
                      <strong>Taluka:</strong> {b.taluka}
                      {userLocation && (
                        <span className="ml-2 text-emerald-700 font-medium">
                          · {calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)?.toFixed(1)} km away
                        </span>
                      )}
                    </p>
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
                  </div>
                ))}
                {filteredBusStops.length === 0 && (
                  <p className="text-sm text-slate-500 bg-slate-100 p-3 rounded text-center">
                    No bus stands added yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ADD LOCATION TAB - REGISTRATION FORM */}
{activeTab === 'pins' && (
  <div className="animate-in slide-in-from-right-4 duration-300">
    <h2 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-orange-500 pl-3">
      Register a New Location or Homestay
    </h2>
    <RegistrationForm
      onSuccess={() => {
        alert("Submitted! Waiting for admin approval.");
      }}
    />
  </div>
)}
</div>
      </div>

      {/* MAP AREA */}
<div className="flex-1 relative bg-slate-200" style={{ cursor: pinMode ? 'crosshair' : 'grab' }}>
  <MapLegend />
{activeRoute && (
  <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] bg-white shadow-lg rounded-xl px-4 py-2 flex items-center gap-3">
    <span className="text-sm font-bold text-slate-800">
      🚗 {activeRoute.distance} km · {activeRoute.duration} min
    </span>
    <button
      onClick={() => setActiveRoute(null)}
      className="text-slate-400 hover:text-slate-600 text-sm"
    >
      ✕
    </button>
  </div>
)}
  <MapContainer center={[17.7554, 73.1923]} zoom={11} className="w-full h-full z-0">
    <LayersControl position="bottomleft">
  <LayersControl.BaseLayer checked name="Satellite">
    <TileLayer
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
    />
  </LayersControl.BaseLayer>

  <LayersControl.BaseLayer name="Street Map">
    <TileLayer
      url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
      attribution="&copy; OpenStreetMap contributors &copy; CARTO"
    />
  </LayersControl.BaseLayer>
</LayersControl>

<TileLayer
  url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
  attribution=""
/>

    {districtBorder && (
      <GeoJSON
        data={districtBorder}
        style={{
          color: "#dc2626",
          weight: 2.5,
          fillOpacity: 0,
          dashArray: "5, 4"
        }}
        interactive={false}
      />
    )}

    <MapController position={mapPosition} />
    <MapClickHandler isActive={pinMode} onPinDropped={handlePinDropped} />

    {/* Render Active Data Pins */}
{renderActivePins()}

{/* User's current location marker */}
{userLocation && (
  <Marker position={[userLocation.lat, userLocation.lng]}>
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

    {/* User Custom Pins */}
    {customPins.map(pin => (
      <Marker key={pin.id} position={[pin.lat, pin.lng]}>
        <Popup>
          <strong>{pin.name}</strong><br />User Contributed Profile Pin.
        </Popup>
      </Marker>
    ))}
  </MapContainer>
</div>

{selectedItem && (
  <div className="w-[420px] border-l border-slate-200 bg-white overflow-y-auto">
    <ProfileDetails
      loc={selectedItem.data}
      type={selectedItem.type}
      onBack={() => setSelectedItem(null)}
      compact
    />
  </div>
)}

</div>
);
}