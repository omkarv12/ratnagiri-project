import { useEffect, useRef, useState } from "react";

/*
  Hero with category tabs (like the MP Tourism home page).
  - Plain full-screen video, no text or buttons on top of it.
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

export default function HeroVideoTabs() {
  const [active, setActive] = useState(0);
  const videoRefs = useRef([]);

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
        />
      ))}

      {/* only a soft shade at the top (so the header links stay readable)
          and at the bottom (so the tabs stay readable). No text, no buttons. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/45 to-transparent" />

      {/* tabs */}
      <div
        role="tablist"
        aria-label="Ratnagiri highlights"
        className="rt-feed absolute bottom-0 left-0 right-0 flex overflow-x-auto px-5 sm:px-10 lg:px-20"
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
