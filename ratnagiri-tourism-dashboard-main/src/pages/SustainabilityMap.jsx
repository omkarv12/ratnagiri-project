import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents, LayersControl, GeoJSON} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { TreePine, BedDouble, MapPin, Image as ImageIcon, Crosshair, Trash2, ShieldCheck, Link, Search, X } from 'lucide-react';
import { useLocations } from '../context/LocationsContext';
import ProfileDetails from './ProfileDetails';


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
  "Adventure & Marine Tourism": { emoji: "🚤", color: "#0284c7" },
};
const DEFAULT_ICON = { emoji: "📍", color: "#334155" };

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
  const { locations, homestays, eco, loading } = useLocations();
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
const [selectedItem, setSelectedItem] = useState(null); // { data, type }
const markerRefs = useRef({});
const [districtBorder, setDistrictBorder] = useState(null);   // 👈 ADD THIS LINE



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
    { id: "pins", label: "Add Location", icon: MapPin },
  ];

  if (loading) return <div className="p-8 text-center animate-pulse font-medium text-slate-500 h-full flex items-center justify-center">Loading live database for map...</div>;
  const talukas = [
  "All",
  ...new Set(
    locations
      .map((loc) => loc.taluka)
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
    loc.taluka === selectedTaluka;

  const tourismTypeMatch =
    selectedTourismType === "All" ||
    loc.category === selectedTourismType;

  const searchMatch =
    loc.name
      .toLowerCase()
      .includes(locationSearch.toLowerCase());

  return talukaMatch && tourismTypeMatch && searchMatch;

});

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

  const renderActivePins = () => {
    if (activeTab === 'villages') {
      return locations.map(loc => (
        <Marker 
          key={loc.id} 
          position={[loc.lat, loc.lng]}
          ref={(ref) => { markerRefs.current[loc.id] = ref; }}
icon={createMarkerIcon(loc.category, selectedItem?.type === 'village' && selectedItem?.data?.id === loc.id)}
>
          <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent className="font-bold text-xs bg-white/90 shadow-sm border-0 text-slate-800">{loc.name}</Tooltip>
          <Popup>
            <div className="text-center">
              <strong className="block text-base mb-1">{loc.name}</strong>
              <span className="text-xs text-slate-500 mb-2 block">{loc.category}</span>
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
      return homestays.map(home => (
        <Marker 
          key={home.id} 
          position={[home.lat, home.lng]}
          ref={(ref) => { markerRefs.current[home.id] = ref; }}
          icon={createMarkerIcon(null, selectedItem?.type === 'homestay' && selectedItem?.data?.id === home.id)}
        >
          <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent className="font-bold text-xs bg-amber-500/90 shadow-sm border-0 text-white">{home.name}</Tooltip>
          <Popup>
            <div className="text-center">
              <strong className="block text-base mb-1">{home.name}</strong>
              <span className="text-xs text-slate-500 mb-2 block">{home.type}</span>
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
          position={[e.lat, e.lng]}
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
                    onClick={() => { handleFlyTo(loc.lat, loc.lng); setSelectedItem({ data: loc, type: 'village' }); }}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-orange-500 hover:shadow-md cursor-pointer transition-all"
                  >
                    <h3 className="font-bold text-slate-800 mb-2">{loc.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded font-medium flex items-center gap-1"><MapPin size={12}/> {loc.village}</span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded font-medium">Taluka: {loc.taluka}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedItem({ data: loc, type: 'village' }); }}
                      className="text-blue-600 text-xs font-medium flex items-center gap-1 hover:text-blue-800"
                    >
                      <ImageIcon size={14} /> View Profile
                    </button>
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
          onClick={() => { handleFlyTo(home.lat, home.lng); setSelectedItem({ data: home, type: 'homestay' }); }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-orange-500 hover:shadow-md cursor-pointer transition-all"
        >
          <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
            {home.name} <ShieldCheck size={14} className="text-emerald-500" />
          </h3>
          <p className="text-sm text-slate-600 mb-1"><strong>Location:</strong> {home.village}, {home.taluka}</p>
          <p className="text-sm text-slate-600 mb-2"><strong>Owner:</strong> {home.owner} ({home.phone})</p>
          <p className="text-xs text-slate-500 mb-3 italic">{home.amenities.substring(0, 60)}...</p>
          <div className="flex justify-between items-center">
            <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded font-bold">{home.type}</span>
            <a href={home.mediaDriveUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1">
              <ImageIcon size={12} /> Photos
            </a>
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
                    onClick={() => { handleFlyTo(e.lat, e.lng); setSelectedItem({ data: e, type: 'eco' }); }}
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

          

          {/* CUSTOM PINS TAB */}
          {activeTab === 'pins' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-orange-500 pl-3">Interactive Placement</h2>
              
              <button 
                onClick={() => setPinMode(!pinMode)}
                className={`w-full py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 mb-4 transition-colors ${
                  pinMode ? 'bg-slate-800 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                <Crosshair size={18} />
                {pinMode ? "Click Map to Drop Pin" : "Activate Map Pin Mode"}
              </button>
              
              <p className="text-xs text-slate-500 mb-6 italic">
                *Click the button above, then click anywhere directly on the map to record custom pin coordinates.
              </p>

              <h3 className="font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2">Active User Pins</h3>
              {customPins.length === 0 ? (
                <p className="text-sm text-slate-500 bg-slate-100 p-3 rounded text-center">No custom locations dropped yet.</p>
              ) : (
                <div className="space-y-3">
                  {customPins.map(pin => (
                    <div key={pin.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-800">{pin.name}</p>
                        <p className="text-xs text-slate-500 font-mono mt-1">Lat: {pin.lat.toFixed(4)}, Lng: {pin.lng.toFixed(4)}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setCustomPins(prev => prev.filter(p => p.id !== pin.id));
                          if(mapPosition && mapPosition[0] === pin.lat) setMapPosition(null);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MAP AREA */}
<div className="flex-1 relative bg-slate-200" style={{ cursor: pinMode ? 'crosshair' : 'grab' }}>
  <MapContainer center={[17.7554, 73.1923]} zoom={11} className="w-full h-full z-0">
    <TileLayer
      url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
      attribution="&copy; OpenStreetMap contributors &copy; CARTO"
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
          