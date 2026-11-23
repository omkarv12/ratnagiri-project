import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Film,
  Home,
  Landmark,
  MapPin,
  Search,
  Sparkles,
  Users,
  Waves,
} from "lucide-react";
import GuidedWalksImg from "../assets/Guided-Walks.jpg";
import CommunityInteractionImg from "../assets/Community-interaction.jpg";
import SocietyImg from "../assets/Society.jpg";
import EconomyImg from "../assets/Economy.jpg";
// Section background photo (add src/assets/Experience-Bg.jpg)
import ExperienceBg from "../assets/Experience-Bg.jpg";

/*
  Explore collage — tiles spread out over a photo background (like the reference):
  Homestays & Hotels, Plan Your Trip, Culture, Destinations,
  Tourist Guides and Travel Agents, Adventure, Media Room.

  Every corner is square on purpose. Each tile has an icon, a title and a one-line
  hint so a visitor understands it at a glance. Tiles drift up and down very slowly.

  EDIT HERE
  - ROUTES: change each tile's link to the real page in config/navMenus.
  - IMAGES: placeholder photos from your existing assets. Drop real photos in
    src/assets and import them here.
  - Positions: the lg:left / lg:top / lg:w / lg:h classes in TILES (desktop only).
  Keep id="experiences" so the nav header's #experiences link still scrolls here.
*/

const ROUTES = {
  stay: "/stay/homestays-and-hotels", // TODO: set to the real route
  culture: "/about/culture",
  destinations: "/about/geography/places",
  guides: "/plan-your-trip/guides-and-agents", // TODO: set to the real route
  adventure: "/experiences/adventure", // TODO: set to the real route
  media: "/stories/reels",
  plan: "/plan-your-trip",
};

const IMAGES = {
  culture: CommunityInteractionImg,
  destinations: GuidedWalksImg,
  guides: SocietyImg,
  adventure: EconomyImg,
};

const THEMES = ["Heritage", "Nature", "Beaches", "Spiritual"];

// Desktop = free-placed collage on a 1280 x 820 canvas (left/width in %, top/height in px).
// Phones/tablets = one tile per row, alternating left and right.
const POS = {
  stay: "self-start w-[92%] h-64 lg:left-[3.1%] lg:top-[20px] lg:w-[25.8%] lg:h-[300px]",
  plan: "self-end w-[92%] h-56 lg:left-[62.5%] lg:top-0 lg:w-[28.1%] lg:h-[220px]",
  culture: "self-start w-[92%] h-56 lg:left-[40.6%] lg:top-[280px] lg:w-[29.7%] lg:h-[200px]",
  destinations: "self-end w-[92%] h-64 lg:left-[3.1%] lg:top-[380px] lg:w-[29.7%] lg:h-[300px]",
  guides: "self-start w-[92%] h-56 lg:left-[75%] lg:top-[360px] lg:w-[21.9%] lg:h-[200px]",
  adventure: "self-end w-[92%] h-56 lg:left-[37.5%] lg:top-[550px] lg:w-[23.4%] lg:h-[200px]",
  media: "self-start w-[92%] h-48 lg:left-[65.6%] lg:top-[630px] lg:w-[21.9%] lg:h-[170px]",
};

const PHOTO_TILES = [
  { key: "culture", title: "Culture", hint: "Festivals, food and traditions", icon: Landmark, image: IMAGES.culture, route: ROUTES.culture, delay: 150, float: "0s" },
  { key: "destinations", title: "Destinations", hint: "Beaches, forts and temples", icon: MapPin, image: IMAGES.destinations, route: ROUTES.destinations, delay: 250, float: "-2s" },
  { key: "guides", title: "Tourist Guides and Travel Agents", hint: "Find trusted local guides", icon: Users, image: IMAGES.guides, route: ROUTES.guides, delay: 350, float: "-4s" },
  { key: "adventure", title: "Adventure", hint: "Water sports, treks and trails", icon: Waves, image: IMAGES.adventure, route: ROUTES.adventure, delay: 450, float: "-1s" },
];

function useInView(threshold = 0.1) {
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

export default function ExperiencesMosaic() {
  const navigate = useNavigate();
  const [ref, inView] = useInView();
  const [theme, setTheme] = useState(null);

  // Outer wrapper: position + fade-up reveal with a stagger
  const wrap = (pos, delay) => ({
    style: { transitionDelay: `${delay}ms` },
    className: `relative lg:absolute ${pos} transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
      inView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
    }`,
  });

  const goPlan = () =>
    navigate(theme ? `${ROUTES.plan}?theme=${theme.toLowerCase()}` : ROUTES.plan);

  const tileBtn =
    "group relative block h-full w-full overflow-hidden text-left shadow-[0_22px_44px_-18px_rgba(0,0,0,0.8)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_32px_60px_-18px_rgba(0,0,0,0.9)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--rt-gold)]";
  const printFrame = "border-[6px] border-white"; // thin white "photo print" frame

  const label = (Icon, title, hint) => (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-4 pt-10">
      <p className="flex items-center gap-2 font-display text-lg font-semibold leading-tight text-white">
        <Icon size={17} aria-hidden="true" className="shrink-0 text-[color:var(--rt-gold)]" />
        {title}
      </p>
      <p className="mt-1 flex items-center justify-between gap-2 text-xs text-white/85">
        {hint}
        <ArrowRight
          size={15}
          aria-hidden="true"
          className="shrink-0 text-[color:var(--rt-gold)] transition-transform duration-300 group-hover:translate-x-1"
        />
      </p>
    </div>
  );

  return (
    <section
      id="experiences"
      ref={ref}
      className="relative scroll-mt-24 overflow-hidden bg-[color:var(--rt-ink)] px-5 py-16 sm:px-10 sm:py-24 lg:px-16"
      style={{
        // light overlay so the photo stays visible but the tiles still pop
        backgroundImage: `linear-gradient(rgba(8,24,32,0.35), rgba(8,24,32,0.35)), url(${ExperienceBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <style>{`
        @keyframes rt-bob-kf {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-7px); }
        }
        .rt-bob { animation: rt-bob-kf 7s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .rt-bob { animation: none; } }
      `}</style>

      <h2 className="sr-only">Explore Ratnagiri</h2>

      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-8 lg:block lg:h-[820px] lg:gap-0">
        {/* ---------- Homestays & Hotels (white tile) ---------- */}
        <div {...wrap(POS.stay, 0)}>
          <div className="rt-bob h-full w-full" style={{ animationDelay: "-3s" }}>
            <button onClick={() => navigate(ROUTES.stay)} className={`${tileBtn} flex flex-col items-center justify-center gap-3 bg-white p-6 text-center`}>
              <span className="flex h-16 w-16 items-center justify-center bg-[color:var(--rt-laterite-tint)] text-[color:var(--rt-laterite)] transition duration-500 group-hover:scale-110">
                <Home size={30} aria-hidden="true" />
              </span>
              <span className="font-display text-2xl font-bold leading-tight text-[color:var(--rt-ink)]">
                Homestays <span className="text-[color:var(--rt-laterite)]">&amp;</span> Hotels
              </span>
              <span className="h-px w-24 bg-[color:var(--rt-ink)]/40" />
              <span className="text-xs font-semibold text-[color:var(--rt-ink)]/70">
                Stay with local families or book a hotel
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--rt-laterite)]">
                Explore <ArrowRight size={14} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </button>
          </div>
        </div>

        {/* ---------- Plan Your Trip panel ---------- */}
        <div {...wrap(POS.plan, 100)}>
          <div className="rt-bob h-full w-full" style={{ animationDelay: "-5s" }}>
            <div className="flex h-full flex-col justify-between bg-gradient-to-br from-[color:var(--rt-kokum)] to-[color:var(--rt-kokum-dark)] p-5 text-white shadow-[0_22px_44px_-18px_rgba(0,0,0,0.8)]">
              <div>
                <p className="flex items-center gap-2 font-display text-lg font-semibold">
                  <Sparkles size={16} className="text-[color:var(--rt-gold)]" aria-hidden="true" />
                  Plan Your Trip
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/70">
                  What do you like?
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {THEMES.map((t) => {
                    const active = theme === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setTheme(active ? null : t)}
                        aria-pressed={active}
                        className={`px-3 py-1 text-xs font-semibold ring-1 transition ${
                          active
                            ? "bg-white text-[color:var(--rt-kokum)] ring-white"
                            : "bg-white/10 text-white ring-white/40 hover:bg-white/20"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={goPlan}
                className="mt-3 flex w-full items-center justify-center gap-2 bg-[color:var(--rt-laterite)] py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[color:var(--rt-laterite-dark)]"
              >
                <Search size={13} aria-hidden="true" /> Search
              </button>
            </div>
          </div>
        </div>

        {/* ---------- Photo tiles ---------- */}
        {PHOTO_TILES.map(({ key, title, hint, icon, image, route, delay, float }) => (
          <div key={key} {...wrap(POS[key], delay)}>
            <div className="rt-bob h-full w-full" style={{ animationDelay: float }}>
              <button onClick={() => navigate(route)} className={`${tileBtn} ${printFrame}`}>
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${image})` }}
                />
                {label(icon, title, hint)}
              </button>
            </div>
          </div>
        ))}

        {/* ---------- Media Room ---------- */}
        <div {...wrap(POS.media, 550)}>
          <div className="rt-bob h-full w-full" style={{ animationDelay: "-6s" }}>
            <button
              onClick={() => navigate(ROUTES.media)}
              className={`${tileBtn} ${printFrame} bg-gradient-to-br from-[color:var(--rt-teal)] to-[color:var(--rt-ink)]`}
            >
              <span className="absolute inset-0 flex items-start justify-center pt-5 text-white/25 transition duration-500 group-hover:scale-110 group-hover:text-white/40">
                <Film size={64} aria-hidden="true" />
              </span>
              {label(Film, "Media Room", "Photos, videos and reels")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}