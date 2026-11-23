import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Film, Home, Search, Sparkles } from "lucide-react";
import GuidedWalksImg from "../assets/Guided-Walks.jpg";
import CommunityInteractionImg from "../assets/Community-interaction.jpg";
import SocietyImg from "../assets/Society.jpg";
import EconomyImg from "../assets/Economy.jpg";
// Section background photo (add src/assets/Experience-Bg.jpg)
import ExperienceBg from "../assets/Experience-Bg.jpg";

/*
  Explore mosaic — a patchwork of tiles on a plain background, laid out like the
  reference: Homestays & Hotels, Plan Your Trip, Culture, Destinations,
  Tourist Guides and Travel Agents, Adventure, Media Room.

  EDIT HERE
  - ROUTES: change each tile's link to the real page in config/navMenus.
  - IMAGES: these are placeholder photos from your existing assets. Drop real
    photos in src/assets and import them here (Culture = festival photo,
    Adventure = water sports / trekking, etc.).
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

  // Fade-up with stagger; applied on each tile's outer wrapper
  const wrap = (cls, delay) => ({
    style: { transitionDelay: `${delay}ms` },
    className: `${cls} transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100 ${
      inView ? "translate-y-0 scale-100 opacity-100" : "translate-y-10 scale-95 opacity-0"
    }`,
  });

  const goPlan = () =>
    navigate(theme ? `${ROUTES.plan}?theme=${theme.toLowerCase()}` : ROUTES.plan);

  const tileBtn =
    "group relative block h-full w-full overflow-hidden text-left shadow-[0_18px_40px_-20px_rgba(15,23,42,0.45)] ring-1 ring-slate-900/5 transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_56px_-20px_rgba(15,23,42,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--rt-gold)]";

  // 12-column grid, 6 rows of 110px on desktop — three columns of tiles, no gaps:
  //   left   : Homestays & Hotels (3 rows) + Destinations (3 rows)
  //   middle : Plan Your Trip (2 rows) + Culture (4 rows)
  //   right  : Tourist Guides & Agents + Adventure + Media Room (2 rows each)
  const photoTiles = [
    {
      key: "culture",
      title: "Culture",
      image: IMAGES.culture,
      route: ROUTES.culture,
      cls: "col-span-2 h-44 lg:h-auto lg:col-span-4 lg:col-start-5 lg:row-span-4 lg:row-start-3",
      delay: 150,
    },
    {
      key: "destinations",
      title: "Destinations",
      image: IMAGES.destinations,
      route: ROUTES.destinations,
      cls: "col-span-2 h-52 lg:h-auto lg:col-span-4 lg:col-start-1 lg:row-span-3 lg:row-start-4",
      delay: 250,
    },
    {
      key: "guides",
      title: "Tourist Guides and Travel Agents",
      image: IMAGES.guides,
      route: ROUTES.guides,
      cls: "col-span-2 h-40 lg:h-auto lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1",
      delay: 350,
    },
    {
      key: "adventure",
      title: "Adventure",
      image: IMAGES.adventure,
      route: ROUTES.adventure,
      cls: "col-span-1 h-40 lg:h-auto lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-3",
      delay: 450,
    },
  ];

  return (
    <section
      id="experiences"
      ref={ref}
      className="relative scroll-mt-24 overflow-hidden bg-[color:var(--rt-ink)] px-5 py-16 sm:px-10 sm:py-24 lg:px-16"
      style={{
        // soft dark overlay on the photo so the tiles and their text stay readable
        backgroundImage: `linear-gradient(rgba(10,42,60,0.55), rgba(10,42,60,0.55)), url(${ExperienceBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h2 className="sr-only">Explore Ratnagiri</h2>

      <div className="relative mx-auto max-w-[1280px]">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12 lg:auto-rows-[110px] lg:gap-4">
          {/* ---------- Homestays & Hotels (the white "logo" tile) ---------- */}
          <div {...wrap("col-span-2 lg:col-span-4 lg:col-start-1 lg:row-span-3 lg:row-start-1", 0)}>
            <button onClick={() => navigate(ROUTES.stay)} className={`${tileBtn} flex flex-col items-center justify-center gap-4 rounded-2xl bg-white p-6 text-center`}>
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:var(--rt-laterite-tint)] text-[color:var(--rt-laterite)] transition group-hover:rotate-6">
                <Home size={30} aria-hidden="true" />
              </span>
              <span className="font-display text-2xl font-bold leading-tight text-[color:var(--rt-ink)]">
                Homestays <span className="text-[color:var(--rt-laterite)]">&amp;</span> Hotels
              </span>
              <span className="h-px w-24 bg-[color:var(--rt-ink)]/40" />
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--rt-ink)]/70">
                <Building2 size={14} aria-hidden="true" /> Stay local
              </span>
            </button>
          </div>

          {/* ---------- Plan Your Trip panel ---------- */}
          <div {...wrap("col-span-2 lg:col-span-4 lg:col-start-5 lg:row-span-2 lg:row-start-1", 100)}>
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[color:var(--rt-kokum)] to-[color:var(--rt-kokum-dark)] p-5 text-white shadow-[0_18px_40px_-20px_rgba(15,23,42,0.45)]">
              <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full border border-white/20" />
              <div className="relative">
                <p className="flex items-center gap-2 font-display text-lg font-semibold">
                  <Sparkles size={16} className="text-[color:var(--rt-gold)]" aria-hidden="true" />
                  Plan Your Trip
                </p>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-white/70">Travel theme</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {THEMES.map((t) => {
                    const active = theme === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setTheme(active ? null : t)}
                        aria-pressed={active}
                        className={`rounded-full px-3.5 py-1 text-xs font-semibold ring-1 transition ${
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
                className="relative mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-[color:var(--rt-laterite)] py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[color:var(--rt-laterite-dark)]"
              >
                <Search size={13} aria-hidden="true" /> Search
              </button>
            </div>
          </div>

          {/* ---------- Photo tiles: Culture, Destinations, Guides & Agents, Adventure ---------- */}
          {photoTiles.map(({ key, title, image, route, cls, delay }) => (
            <div key={key} {...wrap(cls, delay)}>
              <button onClick={() => navigate(route)} className={`${tileBtn} rounded-2xl`}>
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${image})` }}
                />
                <div className="rt-scrim-card absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                  <p className="font-display text-lg font-semibold leading-tight text-white drop-shadow">{title}</p>
                  <ArrowRight
                    size={18}
                    aria-hidden="true"
                    className="shrink-0 text-[color:var(--rt-gold)] opacity-0 transition duration-300 group-hover:translate-x-1 group-hover:opacity-100 max-lg:opacity-100"
                  />
                </div>
              </button>
            </div>
          ))}

          {/* ---------- Media Room ---------- */}
          <div {...wrap("col-span-1 h-40 lg:h-auto lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-5", 550)}>
            <button
              onClick={() => navigate(ROUTES.media)}
              className={`${tileBtn} rounded-2xl bg-gradient-to-br from-[color:var(--rt-teal)] to-[color:var(--rt-ink)]`}
            >
              <span className="absolute inset-0 flex items-center justify-center text-white/20 transition duration-500 group-hover:scale-110 group-hover:text-white/30">
                <Film size={72} aria-hidden="true" />
              </span>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                <p className="font-display text-lg font-semibold leading-tight text-white">Media Room</p>
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  className="shrink-0 text-[color:var(--rt-gold)] opacity-0 transition duration-300 group-hover:translate-x-1 group-hover:opacity-100 max-lg:opacity-100"
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}