import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { useLocations } from "../context/LocationsContext";
import PlanYourTripPanel from "../components/PlanYourTripPanel";

// Same mapping the map page uses, so "Plan for me" can match interests to places.
const CATEGORY_TAGS = {
  "Beach Tourism": ["beach"],
  "Heritage Tourism": ["fort", "culture"],
  "Religious Tourism": ["temple"],
  "Nature & Eco Tourism": ["nature"],
  "Adventure & Marine Tourism": ["adventure"],
};

function driveThumb(link, width = 400) {
  if (!link) return null;
  const match = link.match(/[-\w]{25,}/);
  return match ? `https://drive.google.com/thumbnail?id=${match[0]}&sz=w${width}` : null;
}

const hasCoords = (p) => !!(p.latitude && p.longitude);

export default function PlanYourTrip() {
  const { locations, homestays, loading } = useLocations();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {} // permission denied: the planner still works without it
    );
  }, []);

  // Everything the "Plan for me" wizard can choose from.
  const places = useMemo(
    () => [
      ...locations.filter(hasCoords).map((l) => ({
        type: "village",
        id: l.id,
        name: l.location_name,
        lat: l.latitude,
        lng: l.longitude,
        tags: CATEGORY_TAGS[l.category] || [],
        image: driveThumb(l.photo_location),
      })),
      ...homestays.filter(hasCoords).map((h) => ({
        type: "homestay",
        id: h.id,
        name: h.name,
        lat: h.latitude,
        lng: h.longitude,
        image: driveThumb(h.photo_homestay),
      })),
    ],
    [locations, homestays]
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8 py-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Plan Your Trip</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Let us suggest a plan, or build your own. Your stops, times and route are all on this page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/map")}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#0b3149] ring-1 ring-slate-200 shadow-sm hover:shadow-md transition"
        >
          <Compass size={16} className="text-[#B4532A]" /> Pick places on the Interactive Map
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 py-10 text-center">Loading places…</p>
      ) : (
        <PlanYourTripPanel places={places} userLocation={userLocation} layout="split" />
      )}
    </div>
  );
}