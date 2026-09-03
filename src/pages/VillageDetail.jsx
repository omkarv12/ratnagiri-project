import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Sparkles, Compass, Calendar, Leaf,
  BedDouble, Car, Train, Plane, Camera, Heart,
} from "lucide-react";
import { useLocations } from "../context/LocationsContext";
import { getVillageProfile } from "../api/blogApi";

function driveIdToImageUrl(link) {
  if (!link) return null;
  const match = link.match(/[-\w]{25,}/);
  if (!match) return null;
  return `https://drive.google.com/thumbnail?id=${match[0]}&sz=w1000`;
}

const COLOR_MAP = {
  emerald: { bar: "bg-emerald-700", ring: "ring-emerald-100" },
  blue: { bar: "bg-blue-700", ring: "ring-blue-100" },
  purple: { bar: "bg-purple-700", ring: "ring-purple-100" },
  amber: { bar: "bg-amber-500", ring: "ring-amber-100" },
  orange: { bar: "bg-orange-600", ring: "ring-orange-100" },
  rose: { bar: "bg-rose-600", ring: "ring-rose-100" },
  teal: { bar: "bg-teal-700", ring: "ring-teal-100" },
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

  // ============ CURATED DESIGN ============
  if (profile) {
    return (
      <div className="min-h-screen bg-[#faf8f3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <button
            onClick={() => navigate(`/villages/${encodeURIComponent(taluka)}`)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700 mb-5"
          >
            <ArrowLeft size={16} /> Back to {taluka}
          </button>

          {/* ===== HERO ===== */}
          <div className="relative rounded-3xl overflow-hidden mb-10">
            <div className="h-72 sm:h-[420px] bg-slate-800">
              {profile.hero_image && (
                <img src={profile.hero_image} alt={village} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* top-right location badge */}
            <div className="absolute top-5 right-5 bg-white/95 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-lg">
              <MapPin size={18} className="text-emerald-700" />
              <div className="leading-tight">
                <p className="text-xs font-bold text-slate-800 uppercase">{taluka} Taluka</p>
                <p className="text-[10px] text-slate-500">Ratnagiri, Maharashtra</p>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 p-6 sm:p-10 text-white">
              <p className="font-serif italic text-lg sm:text-2xl text-emerald-200 mb-1">Discover</p>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-1">{village}</h1>
              {profile.tagline && (
                <p className="font-serif italic text-base sm:text-xl text-white/90 mb-3">{profile.tagline}</p>
              )}
              {profile.intro_text && (
                <p className="text-sm sm:text-base text-white/90 max-w-2xl">{profile.intro_text}</p>
              )}
            </div>
          </div>

          {/* ===== ABOUT + EXPERIENCES ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2 bg-[#f6f1e4] border border-[#e8dfc8] rounded-2xl p-6 sm:p-7">
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-emerald-900 mb-3 uppercase tracking-wide">
                <Leaf size={18} className="text-emerald-700" /> About the Village
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{profile.about_text}</p>
            </div>

            {profile.experiences?.length > 0 && (
              <div className="bg-emerald-900 text-white rounded-2xl p-6 sm:p-7">
                <h2 className="text-lg font-extrabold mb-4 uppercase tracking-wide">Experiences to Enjoy</h2>
                <ul className="space-y-3.5">
                  {profile.experiences.map((exp, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center shrink-0">
                        <Sparkles size={13} className="text-emerald-100" />
                      </span>
                      {exp.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ===== SERVICES WE PROMOTE ===== */}
          {profile.services?.length > 0 && (
            <div className="mb-10">
              <div className="bg-emerald-900 text-white text-center py-3 rounded-full mb-7 text-sm sm:text-base font-extrabold uppercase tracking-widest shadow-md">
                Services We Promote at Village Level
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {profile.services.map((cat, i) => {
                  const c = COLOR_MAP[cat.color] || COLOR_MAP.emerald;
                  return (
                    <div key={i} className={`bg-white rounded-2xl overflow-hidden shadow-md ring-4 ${c.ring}`}>
                      <div className={`${c.bar} text-white flex items-center gap-2 px-4 py-3`}>
                        <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-base">
                          {cat.icon}
                        </span>
                        <span className="text-[11px] font-extrabold uppercase tracking-wide leading-tight">
                          {cat.title}
                        </span>
                      </div>
                      <div className="p-4">
                        <ol className="text-xs text-slate-700 space-y-1.5 mb-3 list-decimal list-inside">
                          {(cat.items || []).filter(Boolean).map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </ol>
                        {cat.photos?.length > 0 && (
                          <div className="grid grid-cols-2 gap-1.5">
                            {cat.photos.slice(0, 4).map((url, k) => (
                              <img key={k} src={url} alt="" className="w-full h-16 object-cover rounded-lg" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== TOP ATTRACTIONS ===== */}
          {profile.top_attractions?.length > 0 && (
            <div className="mb-10">
              <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-extrabold text-emerald-900 mb-1">
                <Compass size={22} className="text-orange-600" /> Top Attractions
              </h2>
              <div className="h-1 w-16 bg-emerald-700 rounded-full mb-5" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {profile.top_attractions.map((a, i) => (
                  <div key={i} className="bg-[#f6f1e4] border border-[#e8dfc8] rounded-2xl overflow-hidden">
                    <div className="relative h-44">
                      {a.image && <img src={a.image} alt={a.title} className="w-full h-full object-cover" />}
                      <span className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-emerald-800 flex items-center justify-center shadow">
                        <MapPin size={13} className="text-white" />
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="font-extrabold text-slate-800 text-sm uppercase tracking-wide mb-1">{a.title}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== HOW TO REACH + BEST TIME ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 mb-10">
            {(profile.how_to_reach_road || profile.how_to_reach_rail || profile.how_to_reach_air) && (
              <div className="bg-white border border-[#e8dfc8] rounded-2xl p-6 sm:p-7">
                <h2 className="text-lg font-extrabold text-emerald-900 mb-5 uppercase tracking-wide">How to Reach</h2>
                <div className="space-y-5 text-sm text-slate-700">
                  {profile.how_to_reach_road && (
                    <div className="flex items-start gap-4">
                      <Car size={20} className="text-emerald-700 shrink-0 mt-0.5" />
                      <div><strong className="block text-slate-800">By Road</strong>{profile.how_to_reach_road}</div>
                    </div>
                  )}
                  {profile.how_to_reach_rail && (
                    <div className="flex items-start gap-4">
                      <Train size={20} className="text-emerald-700 shrink-0 mt-0.5" />
                      <div><strong className="block text-slate-800">By Rail</strong>{profile.how_to_reach_rail}</div>
                    </div>
                  )}
                  {profile.how_to_reach_air && (
                    <div className="flex items-start gap-4">
                      <Plane size={20} className="text-emerald-700 shrink-0 mt-0.5" />
                      <div><strong className="block text-slate-800">By Air</strong>{profile.how_to_reach_air}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {profile.best_time_to_visit && (
              <div className="bg-emerald-100 border border-emerald-200 rounded-2xl p-6 sm:p-7 flex flex-col justify-center">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-emerald-900 mb-3 uppercase tracking-wide">
                  <Calendar size={18} /> Best Time to Visit
                </h2>
                <p className="text-sm text-emerald-900/80 leading-relaxed">{profile.best_time_to_visit}</p>
              </div>
            )}
          </div>

          {/* ===== SUSTAINABILITY + STAY OPTIONS ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {profile.sustainability_tips?.length > 0 && (
              <div className="bg-[#f6f1e4] border border-[#e8dfc8] rounded-2xl p-6 sm:p-7">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-emerald-900 mb-5 uppercase tracking-wide">
                  <Leaf size={18} /> Sustainable Tourism
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {profile.sustainability_tips.map((tip, i) => (
                    <div key={i} className="flex flex-col items-center text-center gap-2">
                      <span className="w-14 h-14 rounded-full border-2 border-emerald-700 flex items-center justify-center">
                        <Heart size={20} className="text-emerald-700" />
                      </span>
                      <p className="text-[11px] font-bold text-slate-700 leading-tight">{tip.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(profile.stay_options_text || profile.stay_options_image) && (
              <div className="bg-white border border-[#e8dfc8] rounded-2xl overflow-hidden">
                {profile.stay_options_image && (
                  <img src={profile.stay_options_image} alt="Stay options" className="w-full h-40 object-cover" />
                )}
                <div className="p-6">
                  <h2 className="flex items-center gap-2 text-lg font-extrabold text-emerald-900 mb-2 uppercase tracking-wide">
                    <BedDouble size={18} /> Stay Options
                  </h2>
                  <p className="text-sm text-slate-600">{profile.stay_options_text}</p>
                </div>
              </div>
            )}
          </div>

          {/* ===== ATTRACTIONS FROM LOCATIONS TABLE ===== */}
          {attractions.length > 0 && (
            <div className="mb-10">
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-emerald-900 mb-5">
                <Camera size={20} /> Visit These Spots
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attractions.map((loc) => {
                  const img = driveIdToImageUrl(loc.photo_location);
                  return (
                    <button
                      key={loc.id}
                      onClick={() => navigate(`/profile/village/${loc.id}`)}
                      className="bg-white border border-[#e8dfc8] rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-400 transition-all text-left flex items-center gap-4"
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

          {/* ===== FOOTER STRIP ===== */}
          <div className="bg-emerald-900 text-white rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
            <p className="text-sm font-semibold">Together, let's build a better future for our villages.</p>
            {profile.hashtags && (
              <p className="text-xs text-emerald-200">{profile.hashtags}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============ FALLBACK (no curated profile yet) ============
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