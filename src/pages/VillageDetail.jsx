import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Sparkles, Compass, Calendar, Leaf, BedDouble } from "lucide-react";
import { useLocations } from "../context/LocationsContext";
import { getVillageProfile } from "../api/blogApi";

function driveIdToImageUrl(link) {
  if (!link) return null;
  const match = link.match(/[-\w]{25,}/);
  if (!match) return null;
  return `https://drive.google.com/thumbnail?id=${match[0]}&sz=w1000`;
}

const COLOR_MAP = {
  emerald: "bg-emerald-600",
  blue: "bg-blue-600",
  purple: "bg-purple-600",
  amber: "bg-amber-500",
  orange: "bg-orange-600",
  rose: "bg-rose-500",
  teal: "bg-teal-600",
};

export default function VillageDetail() {
  const { taluka, village } = useParams();
  const { locations, loading: locLoading } = useLocations();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    setProfileLoading(true);
    getVillageProfile(taluka, village)
      .then((data) => setProfile(data.profile))
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));
  }, [taluka, village]);

  if (locLoading || profileLoading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading village...</div>;
  }

  const attractions = locations.filter(
    (l) => l.taluka_name === taluka && l.village_name === village
  );

  // ---------- CURATED DESIGN (admin-managed profile exists) ----------
  if (profile) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8 lg:p-10">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate(`/villages/${encodeURIComponent(taluka)}`)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-600 mb-6"
          >
            <ArrowLeft size={16} /> Back to {taluka}
          </button>

          {/* HERO */}
          <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden mb-8 bg-slate-800">
            {profile.hero_image && (
              <img src={profile.hero_image} alt={village} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 sm:p-8">
              <span className="inline-flex items-center gap-1 text-white/90 text-xs font-semibold uppercase tracking-wide mb-2 bg-white/20 backdrop-blur px-2.5 py-1 rounded-full w-fit">
                <MapPin size={12} /> {taluka} Taluka, Ratnagiri, Maharashtra
              </span>
              {profile.tagline && (
                <p className="text-white/80 text-sm italic mb-1">{profile.tagline}</p>
              )}
              <h1 className="text-4xl sm:text-5xl font-bold text-white">{village}</h1>
              {profile.intro_text && (
                <p className="text-white/90 text-sm sm:text-base mt-3 max-w-2xl">{profile.intro_text}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* ABOUT */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-3">
                <Leaf size={18} className="text-emerald-600" /> About the Village
              </h2>
              <p className="text-sm text-slate-600 whitespace-pre-line">{profile.about_text}</p>
            </div>

            {/* EXPERIENCES */}
            {profile.experiences?.length > 0 && (
              <div className="bg-emerald-800 text-white rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Experiences to Enjoy</h2>
                <ul className="space-y-3">
                  {profile.experiences.map((exp, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Sparkles size={14} className="text-emerald-300 shrink-0" /> {exp.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* SERVICES WE PROMOTE */}
          {profile.services?.length > 0 && (
            <div className="mb-8">
              <div className="bg-slate-800 text-white text-center py-2.5 rounded-full mb-6 text-sm font-bold uppercase tracking-wide">
                Services We Promote at Village Level
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {profile.services.map((cat, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className={`${COLOR_MAP[cat.color] || "bg-emerald-600"} text-white flex items-center gap-2 px-4 py-2.5`}>
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-xs font-bold uppercase tracking-wide">{cat.title}</span>
                    </div>
                    <div className="p-4">
                      <ol className="text-xs text-slate-600 space-y-1.5 mb-3 list-decimal list-inside">
                        {(cat.items || []).filter(Boolean).map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ol>
                      {cat.photos?.length > 0 && (
                        <div className="grid grid-cols-2 gap-1.5">
                          {cat.photos.slice(0, 4).map((url, k) => (
                            <img key={k} src={url} alt="" className="w-full h-14 object-cover rounded" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TOP ATTRACTIONS */}
          {profile.top_attractions?.length > 0 && (
            <div className="mb-8">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800 mb-4">
                <Compass size={20} className="text-orange-600" /> Top Attractions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.top_attractions.map((a, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {a.image && <img src={a.image} alt={a.title} className="w-full h-40 object-cover" />}
                    <div className="p-4">
                      <p className="font-bold text-slate-800 text-sm mb-1">{a.title}</p>
                      <p className="text-xs text-slate-500">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* HOW TO REACH */}
            {(profile.how_to_reach_road || profile.how_to_reach_rail || profile.how_to_reach_air) && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">How to Reach</h2>
                <div className="space-y-3 text-sm text-slate-600">
                  {profile.how_to_reach_road && <p><strong>By Road:</strong> {profile.how_to_reach_road}</p>}
                  {profile.how_to_reach_rail && <p><strong>By Rail:</strong> {profile.how_to_reach_rail}</p>}
                  {profile.how_to_reach_air && <p><strong>By Air:</strong> {profile.how_to_reach_air}</p>}
                </div>
              </div>
            )}

            {/* BEST TIME */}
            {profile.best_time_to_visit && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-3">
                  <Calendar size={18} className="text-emerald-700" /> Best Time to Visit
                </h2>
                <p className="text-sm text-slate-600">{profile.best_time_to_visit}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* SUSTAINABILITY */}
            {profile.sustainability_tips?.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
                  <Leaf size={18} className="text-emerald-600" /> Sustainable Tourism
                </h2>
                <div className="flex flex-wrap gap-3">
                  {profile.sustainability_tips.map((tip, i) => (
                    <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                      {tip.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* STAY OPTIONS */}
            {(profile.stay_options_text || profile.stay_options_image) && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                {profile.stay_options_image && (
                  <img src={profile.stay_options_image} alt="Stay options" className="w-full h-40 object-cover" />
                )}
                <div className="p-6">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-2">
                    <BedDouble size={18} className="text-orange-600" /> Stay Options
                  </h2>
                  <p className="text-sm text-slate-600">{profile.stay_options_text}</p>
                </div>
              </div>
            )}
          </div>

          {/* ATTRACTIONS FROM LOCATIONS TABLE */}
          {attractions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Visit These Spots</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attractions.map((loc) => {
                  const img = driveIdToImageUrl(loc.photo_location);
                  return (
                    <button
                      key={loc.id}
                      onClick={() => navigate(`/profile/village/${loc.id}`)}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-orange-400 hover:shadow-md transition-all text-left flex items-center gap-4"
                    >
                      <div className="w-24 h-20 shrink-0 bg-slate-100">
                        {img && <img src={img} alt={loc.location_name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="p-2">
                        <p className="font-bold text-slate-800 text-sm">{loc.location_name}</p>
                        <p className="text-xs text-slate-500">{loc.category}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {profile.hashtags && (
            <p className="text-xs text-slate-400 text-center">{profile.hashtags}</p>
          )}
        </div>
      </div>
    );
  }

  // ---------- FALLBACK (no curated profile yet) ----------
  const heroPhoto = attractions.find((l) => l.photo_location);
  const heroImg = heroPhoto ? driveIdToImageUrl(heroPhoto.photo_location) : null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 lg:p-10">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(`/villages/${encodeURIComponent(taluka)}`)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-600 mb-6"
        >
          <ArrowLeft size={16} /> Back to {taluka}
        </button>

        <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden mb-8 bg-slate-200">
          {heroImg && <img src={heroImg} alt={village} className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
            <span className="flex items-center gap-1 text-white/90 text-xs mb-1">
              <MapPin size={13} /> {taluka} Taluka
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{village}</h1>
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-4">Attractions in {village}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {attractions.map((loc) => {
            const img = driveIdToImageUrl(loc.photo_location);
            return (
              <button
                key={loc.id}
                onClick={() => navigate(`/profile/village/${loc.id}`)}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-orange-400 hover:shadow-md transition-all text-left"
              >
                <div className="h-36 bg-slate-100">
                  {img && <img src={img} alt={loc.location_name} className="w-full h-full object-cover" />}
                </div>
                <div className="p-4">
                  <p className="font-bold text-slate-800">{loc.location_name}</p>
                  <p className="text-xs text-slate-500 mt-1">{loc.category}</p>
                  {loc.nearest_landmark && (
                    <p className="text-xs text-slate-400 mt-2">Near {loc.nearest_landmark}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {attractions.length === 0 && (
          <p className="text-center text-slate-500 py-16">No attractions listed for {village} yet.</p>
        )}
      </div>
    </div>
  );
}