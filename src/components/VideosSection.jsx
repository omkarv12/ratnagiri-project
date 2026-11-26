import { useEffect, useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import API_BASE_URL from "../config";

/*
  VIDEOS — your YouTube playlist "Ratnagiri" (channel: Travelling Is Awesome).

  How it works
  1) The list on the right comes from your backend (GET /api/youtube-videos).
     This page now sends the playlist ID itself (?playlist=...), so the list
     always matches PLAYLIST_ID below, whatever YOUTUBE_PLAYLIST_ID is set to
     on the backend. YOUTUBE_API_KEY must still be set on the backend.
  2) If the backend cannot give the list (key wrong, quota, playlist private...),
     the section automatically shows YouTube's own playlist player instead,
     so real videos from this playlist always play.
*/

const PLAYLIST_ID = "PLkGXcFDfFwyDFyYxi7Mx-YK9x7ZM7auMm";
const PLAYLIST_URL = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`;

const thumbOf = (v) => v.thumb || `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`;

export default function VideosSection() {
  const [videos, setVideos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/youtube-videos?playlist=${encodeURIComponent(PLAYLIST_ID)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.success && Array.isArray(data.videos)) {
          const list = data.videos
            .filter((v) => v.video_id && !/^(private|deleted) video$/i.test(v.title || ""))
            .map((v) => ({ id: v.video_id, title: v.title || "Video", thumb: v.thumbnail }));
          setVideos(list);
        }
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const current = videos[active] || videos[0];
  const playlistMode = loaded && videos.length === 0; // backend gave no list -> YouTube's own playlist player

  const pick = (i) => {
    setActive(i);
    setPlaying(true);
  };

  return (
    <section id="videos" className="scroll-mt-24 bg-[#f5f3f0] px-5 py-16 sm:px-10 sm:py-20 lg:px-16">
      <style>{`
        .vs-scroll { scrollbar-width: thin; scrollbar-color: #e03a55 #e5e1db; }
        .vs-scroll::-webkit-scrollbar { width: 6px; }
        .vs-scroll::-webkit-scrollbar-track { background: #e5e1db; }
        .vs-scroll::-webkit-scrollbar-thumb { background: #e03a55; border-radius: 99px; }
      `}</style>

      <h2 className="text-center font-display text-3xl font-semibold uppercase tracking-[0.3em] text-[#4a0a12] sm:text-4xl">
        Videos
      </h2>

      {/* ---------- backend list not available: YouTube's own playlist player ---------- */}
      {playlistMode && (
        <div className="mx-auto mt-10 max-w-[1100px] sm:mt-14">
          <div className="relative aspect-video overflow-hidden border border-black/25 bg-black shadow-[0_14px_30px_-14px_rgba(0,0,0,0.55)]">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/videoseries?list=${PLAYLIST_ID}&rel=0`}
              title="Ratnagiri video playlist"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <a
            href={PLAYLIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-widest text-[#e03a55] hover:underline"
          >
            Open full playlist on YouTube <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      )}

      {/* ---------- loading ---------- */}
      {!loaded && (
        <div className="mx-auto mt-10 grid max-w-[1400px] gap-6 sm:mt-14 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]" aria-busy="true">
          <div className="aspect-video animate-pulse bg-black/10" />
          <div className="hidden space-y-3 lg:block">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse bg-black/10" />
            ))}
          </div>
        </div>
      )}

      {/* ---------- player + playlist ---------- */}
      {loaded && current && (
        <div className="mx-auto mt-10 grid max-w-[1400px] gap-6 sm:mt-14 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] lg:gap-7">
          <div className="min-w-0">
            <div className="relative aspect-video overflow-hidden border border-black/25 bg-black shadow-[0_14px_30px_-14px_rgba(0,0,0,0.55)]">
              {playing ? (
                <iframe
                  key={current.id}
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${current.id}?autoplay=1&rel=0`}
                  title={current.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button
                  onClick={() => setPlaying(true)}
                  aria-label={`Play ${current.title}`}
                  className="group absolute inset-0 h-full w-full"
                >
                  <img
                    src={thumbOf(current)}
                    alt=""
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/10" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-16 w-24 items-center justify-center rounded-2xl bg-[#ff0000] text-white shadow-xl transition group-hover:scale-110">
                      <Play size={30} fill="currentColor" />
                    </span>
                  </span>
                </button>
              )}
            </div>
            <p className="mt-4 font-display text-xl font-medium leading-snug text-[#2a0608] sm:text-2xl">
              {current.title}
            </p>
            <a
              href={PLAYLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-widest text-[#e03a55] hover:underline"
            >
              Open full playlist <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>

          <div className="relative min-h-[300px] min-w-0">
            <ul className="vs-scroll max-h-[440px] space-y-3 overflow-y-auto pr-2 lg:absolute lg:inset-0 lg:max-h-none">
              {videos.map((v, i) => {
                const on = i === active;
                return (
                  <li key={`${v.id}-${i}`}>
                    <button
                      onClick={() => pick(i)}
                      aria-current={on ? "true" : undefined}
                      className={`flex w-full items-center gap-4 border-2 bg-white p-3 text-left transition hover:shadow-md ${
                        on ? "border-[#e03a55] bg-[#fff6f7]" : "border-transparent"
                      }`}
                    >
                      <span className="relative h-[68px] w-[120px] shrink-0 overflow-hidden bg-slate-200 sm:h-[84px] sm:w-[150px]">
                        <img src={thumbOf(v)} alt="" loading="lazy" className="h-full w-full object-cover" />
                        {on && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white">
                            <Play size={20} fill="currentColor" />
                          </span>
                        )}
                      </span>
                      <span
                        className={`line-clamp-3 min-w-0 text-[15px] leading-snug ${
                          on ? "font-semibold text-[#c2203d]" : "text-[#2a0608]"
                        }`}
                      >
                        {v.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}