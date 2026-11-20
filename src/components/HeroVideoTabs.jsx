import { useEffect, useRef, useState } from "react";

/*
  Hero with category tabs (like the MP Tourism home page).
  - First visit in a session: a plain white "Welcome to Ratnagiri" screen shows
    while the video loads, then it fades away and the video plays.
  - After that: plain full-screen video, no text or buttons on top of it.
  - Tabs sit at the bottom-left. Click a tab and that video plays.

  VIDEOS: put the files in the project's public/ folder and edit the
  list below. Names are only examples.
*/
const HERO_TABS = [
  { key: "beaches", label: "Beaches", src: "/hero-beaches.mp4", poster: "" },
  { key: "forts", label: "Forts", src: "/hero-forts.mp4", poster: "" },
  { key: "temples", label: "Temples", src: "/hero-temples.mp4", poster: "" },
  { key: "nature", label: "Nature", src: "/hero-nature.mp4", poster: "" },
];

// The welcome screen stays at least this long (ms), even if the video is ready sooner.
const WELCOME_MIN_MS = 2200;
// If the video never loads, the welcome screen still goes away after this long (ms).
const WELCOME_MAX_MS = 8000;
const SEEN_KEY = "rt-welcome-seen";

function alreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export default function HeroVideoTabs() {
  const [active, setActive] = useState(0);
  const videoRefs = useRef([]);

  // ---- Welcome screen ----
  const [showWelcome, setShowWelcome] = useState(() => !alreadySeen()); // mounted?
  const [welcomeOut, setWelcomeOut] = useState(false); // fading out?
  const [videoReady, setVideoReady] = useState(false);
  const [minDone, setMinDone] = useState(alreadySeen());
  const [maxDone, setMaxDone] = useState(false);

  useEffect(() => {
    if (!showWelcome) return undefined;
    const a = setTimeout(() => setMinDone(true), WELCOME_MIN_MS);
    const b = setTimeout(() => setMaxDone(true), WELCOME_MAX_MS);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [showWelcome]);

  // The first video may already be loaded by the time React attaches the listener.
  useEffect(() => {
    const v = videoRefs.current[0];
    if (v && v.readyState >= 2) setVideoReady(true);
  }, []);

  useEffect(() => {
    if (!showWelcome) return undefined;
    if (minDone && (videoReady || maxDone)) {
      setWelcomeOut(true);
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
      const t = setTimeout(() => setShowWelcome(false), 800);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [showWelcome, minDone, videoReady, maxDone]);

  // Play only the selected video, pause and rewind the rest.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) {
        v.currentTime = 0;
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [active]);

  // Restart the first video from 0 the moment the welcome screen starts to fade,
  // so people see it from the beginning.
  useEffect(() => {
    if (!welcomeOut) return;
    const v = videoRefs.current[active];
    if (v) {
      v.currentTime = 0;
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [welcomeOut]);

  return (
    // -mt-20 slides the hero under the transparent header (header is h-20 at the top)
    <section className="relative -mt-20 h-svh max-h-[1000px] min-h-[600px] w-full overflow-hidden bg-[color:var(--rt-ink-deep)]">
      {HERO_TABS.map((tab, i) => (
        <video
          key={tab.key}
          ref={(el) => (videoRefs.current[i] = el)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
          src={tab.src}
          poster={tab.poster || undefined}
          autoPlay={i === 0}
          muted
          loop
          playsInline
          preload={i === 0 ? "auto" : "metadata"}
          aria-hidden="true"
          onLoadedData={i === 0 ? () => setVideoReady(true) : undefined}
          onError={i === 0 ? () => setVideoReady(true) : undefined}
        />
      ))}

      {/* only a soft shade at the top (so the header links stay readable)
          and at the bottom (so the tabs stay readable). No text, no buttons. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/45 to-transparent" />

      {/* Welcome screen: plain white, shown until the video is ready */}
      {showWelcome && (
        <div
          aria-hidden={welcomeOut}
          className={`absolute inset-0 z-20 flex flex-col items-center justify-center bg-white px-6 text-center transition-opacity duration-700 ease-out ${
            welcomeOut ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <p className="rt-welcome-line font-display text-2xl font-semibold uppercase tracking-[0.18em] text-[color:var(--rt-ink)] sm:text-4xl">
            Welcome to
          </p>
          <h1 className="rt-welcome-line rt-welcome-line-2 mt-1 font-display text-5xl font-semibold uppercase tracking-[0.14em] text-[color:var(--rt-ink)] sm:text-7xl lg:text-8xl">
            Ratnagiri
          </h1>
          <style>{`
            @keyframes rt-welcome-in {
              from { opacity: 0; transform: translateY(14px); letter-spacing: .3em; }
              to   { opacity: 1; transform: translateY(0); }
            }
            .rt-welcome-line { animation: rt-welcome-in 1s cubic-bezier(.22,1,.36,1) both; }
            .rt-welcome-line-2 { animation-delay: .25s; }
            @media (prefers-reduced-motion: reduce) { .rt-welcome-line { animation: none; } }
          `}</style>
        </div>
      )}

      {/* tabs */}
      <div
        role="tablist"
        aria-label="Ratnagiri highlights"
        className="rt-feed absolute bottom-0 left-0 right-0 z-30 flex overflow-x-auto px-5 sm:px-10 lg:px-20"
      >
        {HERO_TABS.map((tab, i) => {
          const isActive = i === active;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(i)}
              className={`shrink-0 px-6 py-4 font-display text-[13px] font-bold uppercase tracking-[0.22em] transition-colors sm:px-8 sm:text-sm ${
                isActive
                  ? "bg-[color:var(--rt-mist)] text-[color:var(--rt-ink)]"
                  : "text-white/90 hover:text-[color:var(--rt-gold)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}