import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { listVillageProfiles } from "../api/blogApi";

export default function VillageList() {
  const { taluka } = useParams();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    listVillageProfiles()
      .then(setProfiles)
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading villages...</div>;
  }

  const inTaluka = profiles.filter((p) => p.taluka_name === taluka);

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
          {inTaluka.map((p) => (
            <button
              key={p.village_name}
              onClick={() => navigate(`/villages/${encodeURIComponent(taluka)}/${encodeURIComponent(p.village_name)}`)}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-orange-400 hover:shadow-md transition-all text-left flex items-center gap-4"
            >
              <div className="w-28 h-24 shrink-0 bg-slate-100">
                {p.hero_image && <img src={p.hero_image} alt={p.village_name} className="w-full h-full object-cover" />}
              </div>
              <div className="p-3">
                <p className="font-bold text-slate-800">{p.village_name}</p>
                {p.tagline && <p className="text-xs text-slate-400 mt-1">{p.tagline}</p>}
              </div>
            </button>
          ))}
        </div>

        {inTaluka.length === 0 && (
          <p className="text-center text-slate-500 py-16">No villages found in {taluka}.</p>
        )}
      </div>
    </div>
  );
}