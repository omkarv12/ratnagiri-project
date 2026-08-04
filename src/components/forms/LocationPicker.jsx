import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon paths (common Leaflet + bundler issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER = [17.0, 73.3]; // Roughly centered on Ratnagiri district
const DEFAULT_ZOOM = 9;

export default function LocationPicker({ latitude, longitude, onChange }) {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    // Initialize map once
    useEffect(() => {
        if (mapRef.current) return; // already initialized

        const initialCenter =
            latitude != null && longitude != null
                ? [latitude, longitude]
                : DEFAULT_CENTER;

        const map = L.map(mapContainerRef.current).setView(
            initialCenter,
            latitude != null ? 15 : DEFAULT_ZOOM
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        const marker = L.marker(initialCenter, { draggable: true }).addTo(map);

        marker.on("dragend", () => {
            const pos = marker.getLatLng();
            onChange(pos.lat, pos.lng);
        });

        map.on("click", (e) => {
            marker.setLatLng(e.latlng);
            onChange(e.latlng.lat, e.latlng.lng);
        });

        mapRef.current = map;
        markerRef.current = marker;

        // Leaflet sometimes needs a nudge to size correctly inside flex/grid layouts
        setTimeout(() => map.invalidateSize(), 200);

        return () => {
            map.remove();
            mapRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep marker in sync if parent-provided coordinates change externally
    useEffect(() => {
        if (!mapRef.current || !markerRef.current) return;
        if (latitude == null || longitude == null) return;

        const current = markerRef.current.getLatLng();
        if (current.lat !== latitude || current.lng !== longitude) {
            markerRef.current.setLatLng([latitude, longitude]);
            mapRef.current.setView([latitude, longitude], 15);
        }
    }, [latitude, longitude]);

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!searchQuery.trim()) return;

        setSearching(true);
        setSearchResults([]);

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    searchQuery
                )}&countrycodes=in&limit=5`,
                {
                    headers: {
                        "Accept-Language": "en",
                    },
                }
            );

            const data = await res.json();
            setSearchResults(data);
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectResult = (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        markerRef.current.setLatLng([lat, lng]);
        mapRef.current.setView([lat, lng], 15);

        onChange(lat, lng);

        setSearchResults([]);
        setSearchQuery(result.display_name);
    };

    return (
        <div>
            <form onSubmit={handleSearch} className="flex gap-2 mb-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a village, landmark, or place..."
                    className="flex-1 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
                />
                <button
                    type="submit"
                    disabled={searching}
                    className="px-4 py-2 bg-orange-600 text-white rounded disabled:opacity-60"
                >
                    {searching ? "..." : "Search"}
                </button>
            </form>

            {searchResults.length > 0 && (
                <div className="border border-slate-300 rounded mb-2 max-h-40 overflow-y-auto bg-white">
                    {searchResults.map((result) => (
                        <button
                            type="button"
                            key={result.place_id}
                            onClick={() => handleSelectResult(result)}
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-orange-50 border-b border-slate-100 last:border-b-0"
                        >
                            {result.display_name}
                        </button>
                    ))}
                </div>
            )}

            <div
                ref={mapContainerRef}
                style={{ height: "300px", width: "100%" }}
                className="rounded border border-slate-300"
            />

            <p className="text-xs text-slate-400 mt-1">
                Search above, or click/drag the pin directly on the map to set the
                exact location.
                {latitude != null && longitude != null && (
                    <span className="block mt-1">
                        Selected: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </span>
                )}
            </p>
        </div>
    );
}
