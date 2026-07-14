import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from "react";
import { useLocations } from '../context/LocationsContext';
import { ArrowLeft, Image as ImageIcon, MapPin, CheckCircle, Droplets, BedDouble } from 'lucide-react';
import placeholderImage from '../assets/placeholder.png';
import API_BASE_URL from "../config";
import InfoCard from "../components/profile/InfoCard";
import InfoRow from "../components/profile/InfoRow";
import ChipList from "../components/profile/ChipList";

export default function LocationProfile() {

  const { id } = useParams();
  const navigate = useNavigate();

  const { locations, homestays, eco, loading } = useLocations();

  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const numericId = Number(id);

  const { loc, type } = useMemo(() => {

  let found = locations.find(x => x.id === numericId);

  if (found) {
    return { loc: found, type: "village" };
  }

  found = homestays.find(x => x.id === numericId);

  if (found) {
    return { loc: found, type: "homestay" };
  }

  found = eco.find(x => x.id === numericId);

  if (found) {
    return { loc: found, type: "eco" };
  }

  return {
    loc: null,
    type: "village"
  };

}, [numericId, locations, homestays, eco]);

  useEffect(() => {

    if (loading || !loc) {
      return;
    }


    if (type === "eco") {
      setPhotos([]);
      return;
    }

    const loadPhotos = async () => {

      if (!loc?.name) return;

      try {

        setLoadingPhotos(true);

        const response = await fetch(
          `${API_BASE_URL}/api/location-photos/${encodeURIComponent(loc.name)}`
        );

        const data = await response.json();

        console.log("Drive API response:", data);

        if (data.success) {
          setPhotos(data.photos || []);
        } else {
          setPhotos([]);
        }

      } catch (err) {

        console.error(err);
        setPhotos([]);

      } finally {

        setLoadingPhotos(false);

      }

    };

    loadPhotos();

  }, [loading, type, loc?.id, loc?.name]);

  if (loading) {
    return (
      <div className="p-8 text-center animate-pulse font-medium text-slate-500">
        Loading live database...
      </div>
    );
  }

  

  

  if (!loc) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold">
          Location Not Found
        </h2>

        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-orange-600 font-bold hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  console.log("Photos:", photos);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      {/* HEADER SECTION */}
<div
  className="relative h-[420px] text-white overflow-hidden"
  style={{
    backgroundImage: `url(${
  photos.length
    ? photos[0].url
    : placeholderImage
})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>

  {/* Dark overlay */}
  <div className="absolute inset-0 bg-black/45"></div>

  <div className="relative z-10 flex flex-col justify-between h-full p-8">

    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-white hover:text-orange-300 transition-colors text-sm font-medium"
    >
      <ArrowLeft size={16} />
      Back to Directory
    </button>

    <div className="flex items-end justify-between">

      <div>

        <div className="flex items-center gap-3 mb-3">

          <span className="px-3 py-1 bg-orange-500/80 rounded-full text-xs font-bold uppercase tracking-wider">
            {type === "homestay"
              ? "Homestay"
              : type === "eco"
              ? "Eco Unit"
              : loc.category}
          </span>

          <span className="flex items-center gap-1 text-white/90 text-sm">
            <MapPin size={14} />
            {loc.village_name || loc.village},
            {type === "eco" ? "" : ` ${loc.taluka_name || loc.taluka}`}
          </span>

        </div>

        <h1 className="text-5xl font-bold drop-shadow-lg">
          {loc.location_name || loc.name}
        </h1>

        {type === "homestay" && (
          <p className="text-white/90 mt-2">
            Hosted by {loc.owner}
          </p>
        )}

      </div>

      <div className="text-right">

        <div className="text-sm text-white/80">
          ID Ref
        </div>

        <div className="text-3xl font-bold">
          #{loc.id.toString().padStart(4, "0")}
        </div>

      </div>

    </div>

  </div>

</div>





      {/* CONTENT SECTION */}
      <div className="p-8">
        <div className="space-y-6">
          
          

<div className="space-y-6">

    <InfoCard title="Basic Information">

    <InfoRow
        label="Location Name"
        value={loc.location_name || loc.name}
    />

    <InfoRow
        label="Village"
        value={loc.village_name || loc.village}
    />

    <InfoRow
        label="Taluka"
        value={loc.taluka_name || loc.taluka}
    />

    <InfoRow
        label="District"
        value={loc.district_name}
    />

    <InfoRow
        label="Located In"
        value={loc.located_in}
    />

    <InfoRow
        label="Owned By"
        value={loc.owned_by}
    />

    <InfoRow
        label="Managed By"
        value={loc.managed_by}
    />

    <InfoRow
        label="Nearest Landmark"
        value={loc.nearest_landmark || loc.landmark}
    />

    <InfoRow
        label="Nearest Bus Stand"
        value={loc.nearest_bus_stand}
    />

    <InfoRow
        label="Nearest Railway Station"
        value={loc.nearest_railway_station}
    />

    {loc.google_maps_link && (
        <div className="flex justify-between gap-6">

            <span className="font-semibold text-slate-600">
                Google Maps
            </span>

            <a
                href={loc.google_maps_link}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
            >
                Open Location
            </a>

        </div>
    )}

</InfoCard>

    <InfoCard title="Tourism Information">

    <InfoRow
        label="Attraction Type"
        value={loc.attraction_type}
    />

    <InfoRow
        label="Visiting Hours"
        value={loc.visiting_hours}
    />

    <InfoRow
        label="Peak Period"
        value={loc.peak_period}
    />

    <InfoRow
        label="Seasonal Availability"
        value={loc.seasonal_availability}
    />

    <InfoRow
        label="Average Time Spent"
        value={loc.avg_time_spent || loc.duration}
    />

    <InfoRow
        label="Road Condition"
        value={loc.road_condition || loc.roadStatus}
    />

    <InfoRow
        label="Crowd Level"
        value={loc.crowd_level}
    />

</InfoCard>

    <div>
            <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2 mb-6">Database Coordinates</h3>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <div className="font-bold text-slate-800">Verified Location</div>
                  <div className="text-sm text-slate-500">Coordinates actively mapped</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase">Latitude</div>
                  <div className="font-mono text-lg text-slate-700">{loc.lat.toFixed(4)}° N</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase">Longitude</div>
                  <div className="font-mono text-lg text-slate-700">{loc.lng.toFixed(4)}° E</div>
                </div>
              </div>
            </div>
          </div>

    <InfoCard title="Visitor Facilities">

        <ChipList
            title="Amenities Available"
            values={loc.amenities_available}
        />

        <ChipList
            title="Visitor Type"
            values={loc.visitor_type}
        />

        <InfoRow
    label="Site Activities"
    value={loc.site_activities}
/>

        <InfoRow label="Parking" value={loc.parking_space} />

        <InfoRow label="Food Stalls" value={loc.food_stalls} />

        <InfoRow label="Public Transport" value={loc.public_transport} />

        <InfoRow label="Signboards" value={loc.signboards_available} />

        <InfoRow label="Entry Fee" value={loc.entry_fee} />

        <InfoRow label="Entry Fee Amount" value={loc.entry_fee_amount} />

        

    </InfoCard>

    <InfoCard title="Community & Regulations">

        <InfoRow
            label="Formal Regulations"
            value={loc.formal_regulations}
        />

        <InfoRow
            label="Local Residents Involved"
            value={loc.local_residents_involved}
        />

        <InfoRow
            label="Job Type"
            value={loc.job_type}
        />

        

        <InfoRow
    label="Description"
    value={loc.user_description}
/>

    </InfoCard>



    <InfoCard title="Suggestions">

        <div className="text-slate-700 whitespace-pre-line">

            {loc.suggestions_improvements || "No suggestions available."}

        </div>

    </InfoCard>


    

</div>





          
        </div>

        <div className="mt-10">
          

          {/* Photo Gallery Simulation */}
          <div className="border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{type === 'homestay' ? 'Property Gallery' : type === 'eco' ? 'Facility Gallery' : 'Site Photo Gallery'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loadingPhotos ? (

  <div className="col-span-full text-center py-8">
    Loading photos...
  </div>

) : photos.length > 1 ? (

  photos.slice(1).map(photo => (

    <div
      key={photo.url}
      className="rounded-xl overflow-hidden shadow-sm border border-slate-200"
    >

      <img
        src={photo.url}
        alt={photo.name}
        className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
      />

    </div>

  ))

) : (

  <div className="col-span-full text-center text-slate-500 py-10">
    No additional site photographs available.
  </div>

)}
              
              
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
