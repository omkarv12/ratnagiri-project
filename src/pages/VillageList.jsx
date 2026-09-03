import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLocations } from "../context/LocationsContext";

const COLOR_MAP = {
  emerald: "bg-emerald-600",
  blue: "bg-blue-600",
  purple: "bg-purple-600",
  amber: "bg-amber-500",
  orange: "bg-orange-600",
  rose: "bg-rose-500",
  teal: "bg-teal-600",
};

function driveIdToImageUrl(link) {
  if (!link) return null;
  const match = link.match(/[-\w]{25,}/);
  if (!match) return null;
  return `https://drive.google.com/thumbnail?id=${match[0]}&sz=w1000`;
}

export default function VillageList() {
  const { taluka } = useParams();
  const { locations, loading } = useLocations();
  const navigate = useNavigate();

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading villages...</div>;
  }

  const inTaluka = locations.filter((l) => l.taluka_name === taluka);
  const villageNames = [...new Set(inTaluka.map((l) => l.village_name).filter(Boolean))].sort();

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 lg:p-10">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/villages")}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-600 mb-6"
        >
          <ArrowLeft size={16} /> Back to Talukas
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">{taluka} Taluka</h1>
        <p className="text-sm text-slate-500 mb-8">Choose a village to explore</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {villageNames.map((village) => {
            const sample = inTaluka.find((l) => l.village_name === village && l.photo_location);
            const img = sample ? driveIdToImageUrl(sample.photo_location) : null;
            return (
              <button
                key={village}
                onClick={() => navigate(`/villages/${encodeURIComponent(taluka)}/${encodeURIComponent(village)}`)}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-orange-400 hover:shadow-md transition-all text-left flex items-center gap-4"
              >
                <div className="w-28 h-24 shrink-0 bg-slate-100">
                  {img && <img src={img} alt={village} className="w-full h-full object-cover" />}
                </div>
                <div className="p-3">
                  <p className="font-bold text-slate-800">{village}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {inTaluka.filter((l) => l.village_name === village).length} attraction(s)
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {villageNames.length === 0 && (
          <p className="text-center text-slate-500 py-16">No villages found in {taluka}.</p>
        )}
      </div>
    </div>
  );
}