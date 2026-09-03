import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useLocations } from "../context/LocationsContext";

export default function VillagesTaluka() {
  const { locations, loading } = useLocations();
  const navigate = useNavigate();

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading talukas...</div>;
  }

  const talukas = [...new Set(locations.map((l) => l.taluka_name).filter(Boolean))].sort();

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 lg:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-orange-600 text-white py-10 sm:py-12 text-center rounded-2xl mb-8">
          <MapPin size={44} className="mx-auto mb-3" />
          <h1 className="text-3xl sm:text-4xl font-bold">Explore Ratnagiri's Villages</h1>
          <p className="text-white/90 mt-2 text-sm sm:text-base px-4">
            Choose a taluka to discover its villages
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {talukas.map((taluka) => (
            <button
              key={taluka}
              onClick={() => navigate(`/villages/${encodeURIComponent(taluka)}`)}
              className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm hover:border-orange-400 hover:shadow-md transition-all"
            >
              <p className="font-bold text-slate-800">{taluka}</p>
              <p className="text-xs text-slate-400 mt-1">Taluka</p>
            </button>
          ))}
        </div>

        {talukas.length === 0 && (
          <p className="text-center text-slate-500 py-16">No talukas found.</p>
        )}
      </div>
    </div>
  );
}