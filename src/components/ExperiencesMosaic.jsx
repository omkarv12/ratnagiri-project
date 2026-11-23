import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Film,
  Home,
  Image as ImageIcon,
  Landmark,
  MapPin,
  Search,
  Sparkles,
  Users,
  Waves,
} from "lucide-react";
// Section background photo with the animal (add src/assets/Experience-Bg.jpg)
import ExperienceBg from "../assets/Experience-Bg.jpg";

/*
  Explore collage — big square-cornered tiles scattered over a photo background,
  leaving a clear area so the animal in the background stays visible.

  EDIT HERE
  1) PHOTOS — every tile has an empty "Add photo here" slot. Put your photos in
     src/assets, import them, and fill IMAGES below, for example:
         import CultureImg from "../assets/Culture.jpg";
         const IMAGES = { ..., culture: CultureImg, ... };
     Until a photo is set, the tile shows a striped placeholder.
  2) ANIMAL_SIDE — "right" keeps the bottom-right of the background free (animal
     on the right, like the reference). Use "left" if the animal is on the left.
  3) ROUTES — change each tile's link to the real page.
  4) Tile sizes/positions — the `box` of each tile in TILES (a 1280 x 1060 canvas).

  Effects: tiles fly in one by one, rest at a slight tilt, float slowly, move a
  little with the mouse (parallax), and on hover straighten up, lift, zoom the
  photo and show a light sweep. All motion switches off for visitors who use the
  "reduce motion" setting.
  Keep id="experiences" so the nav header's #experiences link still scrolls here.
*/

const ANIMAL_SIDE = "right"; // "right" | "left"

const IMAGES = {
  stay: null,
  culture: null,
  destinations: null,
  guides: null,
  adventure: null,
  media: null,
};

const ROUTES = {
  stay: "/experiences/discover-your-stay",
  culture: "/about/culture",
  destinations: "/about/geography/places",
  guides: "/plan-your-trip", // TODO: set to the real Guides & Agents page
  adventure: "/experiences/hidden-paths", // TODO: set to the real Adventure page
  media: "/videos",
  plan: "/plan-your-trip",
};

const THEMES = ["Heritage", "Nature", "Beaches", "Spiritual"];

const CANVAS_W = 1280;

// box = x, y, w, h on the desktop canvas (right-side animal layout).
// mh = height on phones. tilt = resting angle. depth = mouse-parallax strength.
// from = where the tile flies in from. bob/bobDelay = float speed.
const TILES = [
  {
    key: "stay", kind: "postcard", title: "Homestays & Hotels", hint: "Stay with local families or book a hotel",
    icon: Home, route: ROUTES.stay,
    box: { x: 40, y: 20, w: 400, h: 340 }, mh: 340, tilt: -1.5, depth: 14, from: [-90, -30], delay: 0, bob: "8s", bobDelay: "-3s",
  },
  {
    key: "plan", kind: "plan", title: "Plan Your Trip", hint: "What do you like?",
    icon: Sparkles, route: ROUTES.plan,
    box: { x: 720, y: 0, w: 440, h: 250 }, mh: 270, tilt: 0.8, depth: 8, from: [90, -40], delay: 120, bob: "9s", bobDelay: "-5s",
  },
  {
    key: "culture", kind: "photo", title: "Culture", hint: "Festivals, food and traditions",
    icon: Landmark, route: ROUTES.culture,
    box: { x: 540, y: 290, w: 380, h: 270 }, mh: 280, tilt: 1.2, depth: 22, from: [90, -10], delay: 240, bob: "7s", bobDelay: "-1s",
  },
  {
    key: "destinations", kind: "photo", title: "Destinations", hint: "Beaches, forts and temples",
    icon: MapPin, route: ROUTES.destinations,
    box: { x: 40, y: 410, w: 440, h: 330 }, mh: 320, tilt: 1, depth: 12, from: [-90, 40], delay: 360, bob: "10s", bobDelay: "-4s",
  },
  {
    key: "guides", kind: "photo", title: "Tourist Guides and Travel Agents", hint: "Find trusted local guides",
    icon: Users, route: ROUTES.guides,
    box: { x: 540, y: 610, w: 380, h: 250 }, mh: 270, tilt: -1.2, depth: 26, from: [70, 70], delay: 480, bob: "8.5s", bobDelay: "-2s",
  },
  {
    key: "adventure", kind: "photo", title: "Adventure", hint: "Water sports, treks and trails",
    icon: Waves, route: ROUTES.adventure,
    box: { x: 40, y: 790, w: 380, h: 230 }, mh: 270, tilt: -1, depth: 18, from: [-70, 80], delay: 600, bob: "7.5s", bobDelay: "-6s",
  },
  {
    key: "media", kind: "photo", title: "Media Room", hint: "Photos, videos and reels",
    icon: Film, route: ROUTES.media,
    box: { x: 460, y: 900, w: 340, h: 160 }, mh: 250, tilt: 1.4, depth: 20, from: [0, 90], delay: 720, bob: "9.5s", bobDelay: "-7s",
  },
];

// left/width as % of the canvas, top/height in px. Mirrors when the animal is on the left.
const place = ({ x, y, w, h }) => {
  const left = ANIMAL_SIDE === "right" ? x : CANVAS_W - x - w;
  return {
    l: `${((left / CANVAS_W) * 100).toFixed(2)}%`,
    t: `${y}px`,
    w: `${((w / CANVAS_W) * 100).toFixed(2)}%`,
    h: `${h}px`,
  };
};

function useInView(threshold = 0.08) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// The photo area: your photo when set, otherwise a clear "add photo" placeholder
function PhotoSlot({ image, label }) {
  if (image) {
    return (
      <div
        className="rt-zoom absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
    );
  }
  return (
    <div
      className="rt-zoom absolute inset-0 flex flex-col items-center justify-center gap-2 pb-10 text-center text-slate-500"
      style={{ background: "repeating-linear-gradient(45deg,#e6dfd1 0 14px,#f3efe5 14px 28px)" }}
    >
      <ImageIcon size={36} aria-hidden="true" />
      <span className="text-xs font-bold uppercase tracking-widest">Add photo here</span>
      <span className="text-[11px]">{label}</span>
    </div>
  );
}

export default function ExperiencesMosaic() {
  const navigate = useNavigate();
  const [ref, inView] = useInView();
  const stageRef = useRef(null);
  const [theme, setTheme] = useState(null);

  const goPlan = () =>
    navigate(theme ? `${ROUTES.plan}?theme=${theme.toLowerCase()}` : ROUTES.plan);

  // Mouse parallax: tiles drift a little with the pointer
  const onMove = (e) => {
    const stage = stageRef.current;
    if (!stage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    stage.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    stage.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };
  const onLeave = () => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty("--mx", "0");
    stage.style.setProperty("--my", "0");
  };

  const title = (t) =>
    t.key === "stay" ? (
      <>
        Homestays <span className="text-[color:var(--rt-laterite)]">&amp;</span> Hotels
      </>
    ) : (
      t.title
    );

  const bgDir = ANIMAL_SIDE === "right" ? "to right" : "to left";

  return (
    <section
      id="experiences"
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative scroll-mt-24 overflow-hidden bg-[color:var(--rt-ink)] px-5 py-16 sm:px-10 sm:py-24 lg:px-16"
      style={{
        // darker where the tiles are, lighter on the animal's side so it stays clear
        backgroundImage: `linear-gradient(${bgDir}, rgba(8,24,32,0.5), rgba(8,24,32,0.08)), url(${ExperienceBg})`,
        backgroundSize: "cover",
        backgroundPosition: `${ANIMAL_SIDE} bottom`,
      }}
    >
      <style>{`
        .rt-slot { position: relative; width: 94%; height: var(--mh); }
        @media (min-width: 1024px) {
          .rt-slot { position: absolute; left: var(--l); top: var(--t); width: var(--w); height: var(--h); }
          .rt-par { transform: translate(calc(var(--mx, 0) * var(--depth, 0) * 1px), calc(var(--my, 0) * var(--depth, 0) * 1px)); }
        }
        .rt-enter { transition: opacity 1s ease-out, transform 1.1s cubic-bezier(.22,1,.36,1); }
        .rt-par { transition: transform .35s ease-out; }

        @keyframes rt-bob-kf { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
        .rt-bob { animation: rt-bob-kf 8s ease-in-out infinite; }

        .rt-tile {
          position: relative; display: block; width: 100%; height: 100%;
          overflow: hidden; border: 6px solid #fff; text-align: left;
          rotate: var(--tilt, 0deg);
          box-shadow: 0 24px 48px -18px rgba(0,0,0,.8);
          transition: rotate .5s ease, transform .5s cubic-bezier(.22,1,.36,1), box-shadow .5s ease;
        }
        .rt-tile:hover, .rt-tile:focus-visible {
          rotate: 0deg; transform: translateY(-12px) scale(1.03);
          box-shadow: 0 38px 70px -20px rgba(0,0,0,.9);
        }
        .rt-tile:focus-visible { outline: 2px solid var(--rt-gold); outline-offset: 3px; }
        .rt-tile::after {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(115deg, transparent 35%, rgba(255,255,255,.38) 50%, transparent 65%);
          transform: translateX(-130%);
        }
        .rt-tile:hover::after { transform: translateX(130%); transition: transform .9s ease; }

        .rt-zoom { transition: transform .8s cubic-bezier(.22,1,.36,1); }
        .rt-tile:hover .rt-zoom { transform: scale(1.12); }
        .rt-label { transition: transform .45s ease; }
        .rt-tile:hover .rt-label { transform: translateY(-6px); }
        .rt-arrow { transition: transform .3s ease; }
        .rt-tile:hover .rt-arrow { transform: translateX(6px); }

        @keyframes rt-spin-kf { to { transform: rotate(360deg); } }
        .rt-spin { animation: rt-spin-kf 10s linear infinite; }

        .rt-shimmer { position: relative; overflow: hidden; }
        .rt-shimmer::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(100deg, transparent 30%, rgba(255,255,255,.45) 50%, transparent 70%);
          transform: translateX(-120%); animation: rt-shimmer-kf 3.2s ease-in-out infinite;
        }
        @keyframes rt-shimmer-kf { 0% { transform: translateX(-120%); } 60%, 100% { transform: translateX(120%); } }

        .rt-chip { transition: transform .25s ease, background-color .25s ease; }
        .rt-chip:hover { transform: translateY(-3px); }

        @media (prefers-reduced-motion: reduce) {
          .rt-bob, .rt-spin, .rt-shimmer::after { animation: none; }
          .rt-enter { transition: none; opacity: 1 !important; transform: none !important; }
          .rt-par { transform: none !important; }
          .rt-tile, .rt-tile:hover, .rt-tile:focus-visible { transition: none; transform: none; }
        }
      `}</style>

      <h2 className="sr-only">Explore Ratnagiri</h2>

      <div
        ref={stageRef}
        className="relative mx-auto flex max-w-[1280px] flex-col gap-10 lg:block lg:h-[1060px] lg:gap-0"
      >
        {TILES.map((t, i) => {
          const p = place(t.box);
          const Icon = t.icon;
          return (
            <div
              key={t.key}
              className="rt-slot rt-enter"
              style={{
                "--l": p.l,
                "--t": p.t,
                "--w": p.w,
                "--h": p.h,
                "--mh": `${t.mh}px`,
                alignSelf: i % 2 === 0 ? "flex-start" : "flex-end",
                transitionDelay: `${t.delay}ms`,
                opacity: inView ? 1 : 0,
                transform: inView ? "translate(0,0)" : `translate(${t.from[0]}px, ${t.from[1]}px)`,
              }}
            >
              <div className="rt-par h-full w-full" style={{ "--depth": t.depth }}>
                <div
                  className="rt-bob h-full w-full"
                  style={{ animationDuration: t.bob, animationDelay: t.bobDelay }}
                >
                  {/* ---- Plan Your Trip panel ---- */}
                  {t.kind === "plan" && (
                    <div
                      className="rt-tile bg-gradient-to-br from-[color:var(--rt-kokum)] to-[color:var(--rt-kokum-dark)] p-5 text-white"
                      style={{ "--tilt": `${t.tilt}deg` }}
                    >
                      <div className="flex h-full flex-col justify-between">
                        <div>
                          <p className="flex items-center gap-2 font-display text-xl font-semibold">
                            <Sparkles size={18} className="rt-spin text-[color:var(--rt-gold)]" aria-hidden="true" />
                            Plan Your Trip
                          </p>
                          <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-white/70">
                            What do you like?
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {THEMES.map((th) => {
                              const active = theme === th;
                              return (
                                <button
                                  key={th}
                                  onClick={() => setTheme(active ? null : th)}
                                  aria-pressed={active}
                                  className={`rt-chip px-3.5 py-1.5 text-sm font-semibold ring-1 ${
                                    active
                                      ? "bg-white text-[color:var(--rt-kokum)] ring-white"
                                      : "bg-white/10 text-white ring-white/40 hover:bg-white/25"
                                  }`}
                                >
                                  {th}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <button
                          onClick={goPlan}
                          className="rt-shimmer mt-3 flex w-full items-center justify-center gap-2 bg-[color:var(--rt-laterite)] py-2.5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[color:var(--rt-laterite-dark)]"
                        >
                          <Search size={15} aria-hidden="true" /> Search
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ---- Postcard (photo on top, white caption below) ---- */}
                  {t.kind === "postcard" && (
                    <button
                      onClick={() => navigate(t.route)}
                      className="rt-tile group flex flex-col bg-white"
                      style={{ "--tilt": `${t.tilt}deg` }}
                    >
                      <div className="relative min-h-0 flex-1 overflow-hidden">
                        <PhotoSlot image={IMAGES[t.key]} label={t.title} />
                      </div>
                      <div className="rt-label shrink-0 bg-white px-5 py-4">
                        <p className="flex items-center gap-2 font-display text-2xl font-bold leading-tight text-[color:var(--rt-ink)]">
                          <Icon size={22} aria-hidden="true" className="shrink-0 text-[color:var(--rt-laterite)]" />
                          {title(t)}
                        </p>
                        <p className="mt-1 flex items-center justify-between gap-2 text-sm text-[color:var(--rt-ink)]/70">
                          {t.hint}
                          <ArrowRight size={18} aria-hidden="true" className="rt-arrow shrink-0 text-[color:var(--rt-laterite)]" />
                        </p>
                      </div>
                    </button>
                  )}

                  {/* ---- Photo tile (photo fills it, caption on top of it) ---- */}
                  {t.kind === "photo" && (
                    <button
                      onClick={() => navigate(t.route)}
                      className="rt-tile group"
                      style={{ "--tilt": `${t.tilt}deg` }}
                    >
                      <PhotoSlot image={IMAGES[t.key]} label={t.title} />
                      <div className="rt-label absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-5 pb-4 pt-14">
                        <p className="flex items-center gap-2 font-display text-xl font-semibold leading-tight text-white">
                          <Icon size={20} aria-hidden="true" className="shrink-0 text-[color:var(--rt-gold)]" />
                          {t.title}
                        </p>
                        <p className="mt-1 flex items-center justify-between gap-2 text-sm text-white/85">
                          {t.hint}
                          <ArrowRight size={18} aria-hidden="true" className="rt-arrow shrink-0 text-[color:var(--rt-gold)]" />
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* phones: leave room at the bottom so the background animal shows */}
        <div aria-hidden="true" className="h-56 lg:hidden" />
      </div>
    </section>
  );
}