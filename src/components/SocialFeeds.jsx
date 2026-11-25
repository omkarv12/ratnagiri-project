import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";

/*
  SOCIAL FEEDS — the real Instagram reels, shown clearly and playable right
  on the page (no blurry thumbnails).

  Each tile is the actual Instagram reel, cropped so only the video shows
  (no profile header, no comment bar). It loads when it scrolls into view.

  EDIT HERE
  - REELS: paste the PUBLIC link of each reel (profile must not be private).
           Add as many as you like; they wrap into rows of 3.
  - PROFILE_URL: your Instagram profile link for the Follow button.
*/

const PROFILE_URL = "https://www.instagram.com/"; // TODO: your Instagram profile
const REELS = [
  { url: "https://www.instagram.com/reel/DftR--Sit71/" },
  { url: "https://www.instagram.com/reel/DRLwt8kExHp/" },
  { url: "https://www.instagram.com/reel/DeCRYtcttcp/" },
];

// Instagram's embed draws a profile header above the video and a bar below it.
// These measurements crop it down to just the 9:16 video. If Instagram changes
// its embed layout, adjust IG_HEADER_H / IG_EMBED_W.
const IG_EMBED_W = 336;                    // embed width (Instagram minimum is 326)
const IG_HEADER_H = 56;                    // profile header above the video
const IG_MEDIA_H = IG_EMBED_W * 1.25;      // the video sits in a 4:5 frame
const IG_VIDEO_W = (IG_MEDIA_H * 9) / 16;  // a 9:16 reel inside that frame

// lucide-react no longer ships brand icons, so this small inline SVG is used instead.
function Instagram({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function parseReel(url) {
  const m = String(url).match(/instagram\.com\/(?:[^/]+\/)?(reels?|p|tv)\/([A-Za-z0-9_-]+)/);
  if (!m) return null;
  const type = m[1] === "reels" ? "reel" : m[1];
  return { id: m[2], link: `https://www.instagram.com/${type}/${m[2]}/`, embed: `https://www.instagram.com/${type}/${m[2]}/embed` };
}

function ReelFrame({ reel }) {
  const box = useRef(null);
  const [width, setWidth] = useState(0);
  const [near, setNear] = useState(false);

  // measure the tile so the video always fills it exactly
  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // load the (heavy) embed only when the tile is close to the screen
  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const scale = width ? width / IG_VIDEO_W : 1;
  const offsetX = ((IG_EMBED_W - IG_VIDEO_W) / 2) * scale;
  const offsetY = IG_HEADER_H * scale;

  return (
    <div ref={box} className="relative aspect-[9/16] overflow-hidden bg-[#1a0507]">
      {/* placeholder while the reel loads */}
      <span className="absolute inset-0 flex items-center justify-center text-white/30">
        <Instagram size={42} aria-hidden="true" />
      </span>

      {near && width > 0 && (
        <iframe
          src={reel.embed}
          title="Instagram reel"
          scrolling="no"
          allow="encrypted-media; picture-in-picture"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: IG_EMBED_W,
            height: 760,
            border: 0,
            transformOrigin: "0 0",
            transform: `translate(-${offsetX}px, -${offsetY}px) scale(${scale})`,
          }}
        />
      )}

      <a
        href={reel.link}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1.5 bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm transition hover:bg-black/80"
      >
        <Instagram size={12} aria-hidden="true" /> Watch on Instagram
      </a>
    </div>
  );
}

export default function SocialFeeds() {
  const reels = REELS.map((r) => ({ ...r, ...parseReel(r.url) })).filter((r) => r.embed);

  return (
    <section id="social-feeds" className="scroll-mt-24 bg-[#f5f3f0] px-5 py-16 sm:px-10 sm:py-20 lg:px-16">
      <h2 className="text-center font-display text-3xl font-semibold uppercase tracking-[0.3em] text-[#4a0a12] sm:text-4xl">
        Social Feeds
      </h2>

      <div className="mx-auto mt-10 max-w-[1100px] sm:mt-14">
        {reels.length === 0 ? (
          <div className="bg-white p-12 text-center text-sm text-slate-500 shadow-sm">Reels coming soon.</div>
        ) : (
          <div className="rounded-xl bg-white p-3 shadow-[0_14px_30px_-18px_rgba(0,0,0,0.35)] sm:p-7">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {reels.map((r) => (
                <ReelFrame key={r.id} reel={r} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#e03a55] px-8 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:brightness-110"
          >
            Follow on Instagram <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}