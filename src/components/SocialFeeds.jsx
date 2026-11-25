import { useEffect, useRef, useState } from "react";
import { ExternalLink, Play, X } from "lucide-react";

/*
  SOCIAL FEEDS — Instagram reels in a grid (3 per row) inside a white card.
  Click a tile -> the reel plays in a popup. Nothing heavy loads until then.

  EDIT HERE
  - REELS: paste the PUBLIC link of each reel (profile must not be private).
           Optional per reel:  thumb: "https://..."  (a picture for the tile)
                               caption: "short text shown on the tile"
  - PROFILE_URL: your Instagram profile link for the Follow button.

  Thumbnails: by default the picture is fetched from Instagram. Instagram
  sometimes blocks that; the tile then shows a colour block with a play icon.
  To always show a nice picture, set `thumb` (e.g. a screenshot of the reel
  uploaded to src/assets or Cloudinary).
*/

const PROFILE_URL = "https://www.instagram.com/"; // TODO: your Instagram profile
const REELS = [
  { url: "https://www.instagram.com/reel/DftR--Sit71/" },
  { url: "https://www.instagram.com/reel/Dey9wwYoXCl/" },
  { url: "https://www.instagram.com/reel/DeCRYtcttcp/" },
];

function parseReel(url) {
  const m = String(url).match(/instagram\.com\/(?:[^/]+\/)?(reels?|p|tv)\/([A-Za-z0-9_-]+)/);
  if (!m) return null;
  const type = m[1] === "reels" ? "reel" : m[1];
  return {
    id: m[2],
    embed: `https://www.instagram.com/${type}/${m[2]}/embed`,
    media: `https://www.instagram.com/${type}/${m[2]}/media/?size=l`,
  };
}

function ReelIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="3" y1="8" x2="21" y2="8" />
      <line x1="8" y1="3" x2="10.5" y2="8" />
      <line x1="14" y1="3" x2="16.5" y2="8" />
      <polygon points="10,12 10,18 15,15" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Tile({ reel, onOpen }) {
  const [failed, setFailed] = useState(false);
  const src = reel.thumb || reel.media;
  return (
    <button
      onClick={onOpen}
      aria-label={reel.caption ? `Play reel: ${reel.caption}` : "Play Instagram reel"}
      className="group relative aspect-square overflow-hidden bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-left"
    >
      {src && !failed && (
        <img
          src={src}
          alt=""
          loading="lazy"
          draggable={false}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      )}
      {(!src || failed) && (
        <span className="absolute inset-0 flex items-center justify-center text-white/80">
          <Play size={44} fill="currentColor" />
        </span>
      )}
      <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/25" />
      <ReelIcon className="absolute right-3 top-3 text-white drop-shadow" />
      {reel.caption && (
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10 text-sm font-semibold text-white">
          {reel.caption}
        </span>
      )}
    </button>
  );
}

function ReelPopup({ reel, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Instagram reel"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] bg-white shadow-2xl"
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center bg-white text-slate-800 shadow-lg hover:bg-slate-100"
        >
          <X size={18} />
        </button>
        <iframe
          src={reel.embed}
          title="Instagram reel"
          scrolling="no"
          allow="encrypted-media; picture-in-picture"
          allowFullScreen
          className="block h-[min(78vh,740px)] w-full border-0"
        />
      </div>
    </div>
  );
}

export default function SocialFeeds() {
  const reels = REELS.map((r) => ({ ...r, ...parseReel(r.url) })).filter((r) => r.embed);
  const [open, setOpen] = useState(null);

  return (
    <section id="social-feeds" className="scroll-mt-24 bg-[#f5f3f0] px-5 py-16 sm:px-10 sm:py-20 lg:px-16">
      <h2 className="text-center font-display text-3xl font-semibold uppercase tracking-[0.3em] text-[#4a0a12] sm:text-4xl">
        Social Feeds
      </h2>

      <div className="mx-auto mt-10 max-w-[1250px] sm:mt-14">
        {reels.length === 0 ? (
          <div className="bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
            Reels coming soon.
          </div>
        ) : (
          <div className="rounded-xl bg-white p-3 shadow-[0_14px_30px_-18px_rgba(0,0,0,0.35)] sm:p-8">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {reels.map((r) => (
                <Tile key={r.id} reel={r} onOpen={() => setOpen(r)} />
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

      {open && <ReelPopup reel={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
