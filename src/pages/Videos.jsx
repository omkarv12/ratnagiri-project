import { useEffect, useState } from "react";
import { PlayCircle, Video } from "lucide-react";
import { getYoutubeVideos } from "../api/blogApi";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getYoutubeVideos()
      .then((data) => {
        setVideos(data.videos || []);
        if (data.videos?.length > 0) setActiveVideo(data.videos[0]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="bg-orange-600 text-white py-10 sm:py-12 text-center rounded-2xl mb-6 sm:mb-8">
          <Video size={48} className="mx-auto mb-3 sm:mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold">Videos</h1>
          <p className="text-white/90 mt-2 text-sm sm:text-base px-4">
            Watch Ratnagiri's beaches, forts, food and culture come alive
          </p>
        </div>

        {loading && <p className="text-center text-slate-400 py-16 animate-pulse">Loading videos...</p>}
        {error && <p className="text-center text-red-500 py-16">Couldn't load videos: {error}</p>}
        {!loading && !error && videos.length === 0 && (
          <p className="text-center text-slate-500 bg-white border border-slate-200 rounded-xl py-16">
            No videos available yet.
          </p>
        )}

        {!loading && !error && videos.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* MAIN PLAYER */}
            <div className="flex-1 min-w-0">
              {activeVideo && (
                <>
                  <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-black">
                    <iframe
                      key={activeVideo.video_id}
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${activeVideo.video_id}`}
                      title={activeVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mt-4">{activeVideo.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">{formatDate(activeVideo.published_at)}</p>
                  {activeVideo.description && (
                    <p className="text-sm text-slate-600 mt-3 whitespace-pre-line line-clamp-4">
                      {activeVideo.description}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* PLAYLIST SIDEBAR */}
            <aside className="w-full lg:w-80 shrink-0">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide px-1">
                  All Videos ({videos.length})
                </h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {videos.map((v) => (
                    <div
                      key={v.video_id}
                      onClick={() => setActiveVideo(v)}
                      className={`flex gap-3 p-2 rounded-xl cursor-pointer transition-colors ${
                        activeVideo?.video_id === v.video_id ? "bg-orange-100" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="relative w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-200">
                        {v.thumbnail && <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />}
                        <PlayCircle size={20} className="absolute inset-0 m-auto text-white drop-shadow" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 line-clamp-2 leading-snug">{v.title}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{formatDate(v.published_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}