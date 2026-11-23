import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Film,
  Home,
  Image as ImageIcon,
  Landmark,
  Map as MapIcon,
  MapPin,
  Search,
  Users,
  Waves,
} from "lucide-react";
// Section background photo (src/assets/Experience-Bg.jpg)
import ExperienceBg from "../assets/Experience-Bg.jpg";
// Tile photos (src/assets) — file names must match exactly, including .jpg/.png/.webp
import StayImg from "../assets/Stay.jpg";
import DestinationsImg from "../assets/Destinations.jpg";
import CultureImg from "../assets/Culture.jpg";
import GuidesImg from "../assets/Guides.jpg";
import AdventureImg from "../assets/Adventure.jpg";
import MediaImg from "../assets/Media.jpg";

/*
  Explore section — same layout as the reference screenshot:

      LEFT COLUMN                RIGHT COLUMN
      [ Homestays & Hotels ]     [ Plan Your Trip  (Plan | Map | Blogs) ]
      [ Destinations       ]     [ Culture                              ]
      [ Adventure          ]     [ Guides & Agents                      ]
                                 [ Media Room                           ]

  EDIT HERE
  1) IMAGES  – import your photos and put them in IMAGES (null = striped placeholder).
  2) ROUTES  – real page links. `map` and `blogs` are used by the Plan Your Trip panel.
  3) MAP_EMBED_URL – paste your real interactive-map URL (iframe). If empty, the Map tab
     shows an "Open interactive map" button that goes to ROUTES.map.
  4) DESTINATIONS / THEMES – the dropdown and chips inside Plan Your Trip.

  Effects
  - Scroll: the two columns slide up at different speeds (the right one a bit faster),
    so the collage "lifts" as you scroll down. Tiles also rise in one by one on first view.
  - Tiles (Culture-style): photo zooms, a light sweep passes over, the caption lifts and
    the hint line fades in on hover. Everything is off for "reduce motion".
  Keep id="experiences" so the header's #experiences link still scrolls here.
*/

const IMAGES = {
  stay: StayImg,
  culture: CultureImg,
  destinations: DestinationsImg,
  guides: GuidesImg,
  adventure: AdventureImg,
  media: MediaImg,
};

// "cover" fills the tile; "contain" shows the whole picture on white (good for a logo)
const FIT = {}; // use { stay: "contain" } only if Stay is a logo on white

const ROUTES = {
  stay: "/experiences/discover-your-stay",
  culture: "/about/culture",
  destinations: "/about/geography/places",
  guides: "/plan-your-trip", // TODO: real Guides & Agents page
  adventure: "/experiences/hidden-paths", // TODO: real Adventure page
  media: "/videos",
  plan: "/plan-your-trip",
  map: "/map", // TODO: your interactive map page
  blogs: "/blogs", // TODO: your blog listing page (search goes to ?q=...)
};

const MAP_EMBED_URL = ""; // e.g. "/map?embed=1" — shown inside the panel when set

const DESTINATIONS = ["All cities", "Ratnagiri", "Ganpatipule", "Guhagar", "Dapoli", "Chiplun"];
const THEMES = ["Heritage", "Nature", "Spiritual", "Wildlife"];
const BLOG_TAGS = ["Beaches", "Food", "Temples", "Forts"];

// col: L / R = top two columns, B = bottom row. o = order on phones.
// w = desktop width inside its column (default full). Right-column tiles with `end` hug the right edge.
const TILES = [
  { key: "stay", col: "L", o: 1, h: "h-[300px]", title: "Homestays & Hotels", hint: "Stay with local families or book a hotel", icon: Home, delay: 0 },
  { key: "plan", col: "R", o: 2, panel: true, h: "h-[376px]", delay: 120 },
  { key: "destinations", col: "L", o: 3, h: "h-[270px]", w: "lg:w-[52%]", title: "Destinations", hint: "Beaches, forts and temples", icon: MapPin, delay: 240 },
  { key: "culture", col: "L", o: 4, h: "h-[210px]", w: "lg:w-[52%]", title: "Culture", hint: "Festivals, food and traditions", icon: Landmark, delay: 320 },
  { key: "guides", col: "R", o: 5, h: "h-[184px]", w: "lg:w-[62%] lg:self-end", title: "Guides and Travel Agents", hint: "Find trusted local guides", icon: Users, delay: 400 },
  { key: "adventure", col: "R", o: 6, h: "h-[250px]", w: "lg:w-[62%] lg:self-end", title: "Adventure", hint: "Water sports, treks and trails", icon: Waves, delay: 480 },
  { key: "media", col: "R", o: 7, h: "h-[210px]", w: "lg:w-[62%] lg:self-end", title: "Media Room", hint: "Photos, videos and reels", icon: Film, delay: 580 },
];

function useInView(threshold = 0.05) {
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

// Writes --p (0 … 1) on the section while it passes through the screen.
// CSS turns it into the upward slide of each column.
function useScrollProgress(ref) {
  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = node.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (vh * 0.9 - r.top) / (vh * 0.9);
      node.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
}

function PhotoSlot({ image, label, fit }) {
  if (image) {
    return (
      <div
        className="rt-zoom absolute inset-0 bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: fit === "contain" ? "contain" : "cover",
          backgroundColor: fit === "contain" ? "#fff" : undefined,
        }}
      />
    );
  }
  return (
    <div
      className="rt-zoom absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-slate-500"
      style={{ background: "repeating-linear-gradient(45deg,#e6dfd1 0 14px,#f3efe5 14px 28px)" }}
    >
      <ImageIcon size={36} aria-hidden="true" />
      <span className="text-xs font-bold uppercase tracking-widest">Add photo here</span>
      <span className="text-[11px]">{label}</span>
    </div>
  );
}

/* ---------- Plan Your Trip panel: Plan | Map | Blogs ---------- */
function PlanPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("plan");
  const [dest, setDest] = useState(DESTINATIONS[0]);
  const [theme, setTheme] = useState(null);
  const [query, setQuery] = useState("");

  const goPlan = () => {
    const qs = new URLSearchParams();
    if (dest !== DESTINATIONS[0]) qs.set("city", dest);
    if (theme) qs.set("theme", theme.toLowerCase());
    const s = qs.toString();
    navigate(s ? `${ROUTES.plan}?${s}` : ROUTES.plan);
  };
  const goBlogs = (q) => {
    const text = (q ?? query).trim();
    navigate(text ? `${ROUTES.blogs}?q=${encodeURIComponent(text)}` : ROUTES.blogs);
  };

  const tabs = [
    { id: "plan", label: "Plan", icon: Search },
    { id: "map", label: "Map", icon: MapIcon },
    { id: "blogs", label: "Blogs", icon: BookOpen },
  ];

  return (
    <div className="rt-panel flex h-full flex-col p-6 text-white">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-3 font-display text-2xl font-medium">
          <MapIcon size={24} aria-hidden="true" className="text-white/80" />
          Plan Your Trip
        </h3>
      </div>

      <div role="tablist" aria-label="Plan your trip" className="mt-3 flex gap-1 border-b border-white/25">
        {tabs.map(({ id, label, icon: TabIcon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition ${
              tab === id ? "border-b-2 border-white text-white" : "border-b-2 border-transparent text-white/60 hover:text-white"
            }`}
          >
            <TabIcon size={15} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {tab === "plan" && (
        <div className="mt-3 flex flex-1 flex-col">
          <label htmlFor="rt-dest" className="text-sm font-semibold">Destinations</label>
          <select
            id="rt-dest"
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            className="mt-2 h-11 w-full rounded-sm bg-white px-4 text-base text-slate-900"
          >
            {DESTINATIONS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <p className="mt-4 text-sm font-semibold">Travel theme</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {THEMES.map((th) => {
              const active = theme === th;
              return (
                <button
                  key={th}
                  onClick={() => setTheme(active ? null : th)}
                  aria-pressed={active}
                  className={`rt-chip rounded-full px-5 py-1.5 text-sm ring-1 ${
                    active ? "bg-white font-semibold text-[color:var(--rt-kokum,#8b0a3a)] ring-white" : "text-white ring-white/60 hover:bg-white/15"
                  }`}
                >
                  {th}
                </button>
              );
            })}
          </div>

          <button
            onClick={goPlan}
            className="rt-shimmer mt-auto w-full max-w-[240px] self-start bg-[color:var(--rt-laterite,#e0403a)] py-3 text-sm font-bold uppercase tracking-[0.25em] text-white transition hover:brightness-110"
          >
            Search
          </button>
        </div>
      )}

      {tab === "map" && (
        <div className="mt-3 flex flex-1 flex-col">
          {MAP_EMBED_URL ? (
            <iframe
              title="Interactive map"
              src={MAP_EMBED_URL}
              loading="lazy"
              className="min-h-[150px] w-full flex-1 border-0 bg-white"
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 border border-white/30 bg-white/10 p-6 text-center">
              <MapPin size={40} aria-hidden="true" className="text-[color:var(--rt-gold,#f2b84b)]" />
              <p className="text-base text-white/90">See every beach, fort, temple and homestay on one map.</p>
            </div>
          )}
          <button
            onClick={() => navigate(ROUTES.map)}
            className="rt-shimmer mt-4 w-full max-w-[240px] self-start bg-[color:var(--rt-laterite,#e0403a)] py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:brightness-110"
          >
            Open map
          </button>
        </div>
      )}

      {tab === "blogs" && (
        <form
          className="mt-3 flex flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            goBlogs();
          }}
        >
          <label htmlFor="rt-blog" className="text-sm font-semibold">Search travel blogs</label>
          <input
            id="rt-blog"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Ganpatipule sunset"
            className="mt-2 h-11 w-full rounded-sm bg-white px-4 text-base text-slate-900 placeholder:text-slate-400"
          />
          <p className="mt-4 text-sm font-semibold">Popular topics</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {BLOG_TAGS.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => goBlogs(tag)}
                className="rt-chip rounded-full px-5 py-1.5 text-sm text-white ring-1 ring-white/60 hover:bg-white/15"
              >
                {tag}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="rt-shimmer mt-auto w-full max-w-[240px] self-start bg-[color:var(--rt-laterite,#e0403a)] py-3 text-sm font-bold uppercase tracking-[0.25em] text-white transition hover:brightness-110"
          >
            Search
          </button>
        </form>
      )}
    </div>
  );
}

/* ---------- Photo tile (Culture style: photo fills it, bold caption bottom-left) ---------- */
function PhotoTile({ t }) {
  const navigate = useNavigate();
  const Icon = t.icon;
  return (
    <button
      onClick={() => navigate(ROUTES[t.key])}
      className="rt-tile group"
      aria-label={`${t.title}: ${t.hint}`}
    >
      <PhotoSlot image={IMAGES[t.key]} label={t.title} fit={FIT[t.key]} />
      <div className="rt-label absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-5 pb-4 pt-14">
        <p className="flex items-center gap-2 font-display text-2xl font-semibold leading-tight text-white">
          <Icon size={20} aria-hidden="true" className="shrink-0 text-[color:var(--rt-gold,#f2b84b)]" />
          {t.title}
        </p>
        <p className="rt-hint mt-1 flex items-center justify-between gap-2 text-sm text-white/90">
          {t.hint}
          <ArrowRight size={20} aria-hidden="true" className="rt-arrow shrink-0 text-[color:var(--rt-gold,#f2b84b)]" />
        </p>
      </div>
    </button>
  );
}

export default function ExperiencesMosaic() {
  const [ref, inView] = useInView();
  useScrollProgress(ref);

  const renderTile = (t) => (
    <div
      key={t.key}
      className={`rt-enter order-[var(--o)] lg:order-none ${t.h} ${t.w || ""} relative`}
      style={{
        "--o": t.o,
        transitionDelay: `${t.delay}ms`,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(70px)",
      }}
    >
      {t.panel ? (
        <div className="rt-panel-wrap">
          <PlanPanel />
        </div>
      ) : (
        <PhotoTile t={t} />
      )}
    </div>
  );

  return (
    <section
      id="experiences"
      ref={ref}
      className="relative z-10 scroll-mt-24 overflow-x-clip bg-[color:var(--rt-ink,#0b1d26)] px-5 pb-14 pt-6 sm:px-10 lg:px-16"
      style={{
        backgroundImage: `linear-gradient(rgba(8,24,32,0.35), rgba(8,24,32,0.35)), url(${ExperienceBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <style>{`
        /* columns: on phones they dissolve so the tiles stack in the "o" order */
        .rt-col { display: contents; }
        @media (min-width: 1024px) {
          .rt-col { display: flex; flex: 1 1 0; flex-direction: column; gap: 16px; min-width: 0; will-change: transform; }
          .rt-col-l { transform: translateY(calc(var(--p, 0) * -24px)); }
          .rt-col-r { transform: translateY(calc(var(--p, 0) * -64px)); }
        }

        @media (min-width: 1024px) { .rt-row { transform: translateY(calc(var(--p, 0) * -24px)); } }
        .rt-enter { transition: opacity .9s ease-out, transform 1s cubic-bezier(.22,1,.36,1); }

        .rt-panel-wrap {
          height: 100%;
          background: linear-gradient(160deg, var(--rt-kokum, #8b0a3a), var(--rt-kokum-dark, #b5103f));
          box-shadow: 0 24px 48px -18px rgba(0,0,0,.7);
        }

        .rt-tile {
          position: relative; display: block; width: 100%; height: 100%;
          overflow: hidden; text-align: left;
          box-shadow: 0 24px 48px -20px rgba(0,0,0,.75);
          transition: transform .5s cubic-bezier(.22,1,.36,1), box-shadow .5s ease;
        }
        .rt-tile:hover, .rt-tile:focus-visible {
          transform: translateY(-8px);
          box-shadow: 0 38px 70px -22px rgba(0,0,0,.9);
        }
        .rt-tile:focus-visible { outline: 2px solid var(--rt-gold, #f2b84b); outline-offset: 3px; }

        /* light sweep */
        .rt-tile::after {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(115deg, transparent 35%, rgba(255,255,255,.35) 50%, transparent 65%);
          transform: translateX(-130%);
        }
        .rt-tile:hover::after { transform: translateX(130%); transition: transform .9s ease; }

        .rt-zoom { transition: transform .8s cubic-bezier(.22,1,.36,1); }
        .rt-tile:hover .rt-zoom { transform: scale(1.1); }

        .rt-label { transition: transform .45s ease; }
        .rt-hint { opacity: 0; transform: translateY(8px); transition: opacity .35s ease, transform .35s ease; }
        .rt-tile:hover .rt-label, .rt-tile:focus-visible .rt-label { transform: translateY(-4px); }
        .rt-tile:hover .rt-hint, .rt-tile:focus-visible .rt-hint { opacity: 1; transform: none; }
        @media (hover: none) { .rt-hint { opacity: 1; transform: none; } }

        .rt-arrow { transition: transform .3s ease; }
        .rt-tile:hover .rt-arrow { transform: translateX(6px); }

        .rt-shimmer { position: relative; overflow: hidden; }
        .rt-shimmer::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(100deg, transparent 30%, rgba(255,255,255,.4) 50%, transparent 70%);
          transform: translateX(-120%); animation: rt-shimmer-kf 3.4s ease-in-out infinite;
        }
        @keyframes rt-shimmer-kf { 0% { transform: translateX(-120%); } 60%, 100% { transform: translateX(120%); } }

        .rt-chip { transition: transform .25s ease, background-color .25s ease; }
        .rt-chip:hover { transform: translateY(-3px); }

        @media (prefers-reduced-motion: reduce) {
          .rt-col, .rt-row { transform: none !important; }
          .rt-shimmer::after { animation: none; }
          .rt-enter { transition: none; opacity: 1 !important; transform: none !important; }
          .rt-tile, .rt-tile:hover, .rt-tile:focus-visible, .rt-zoom, .rt-label, .rt-hint { transition: none; transform: none; }
          .rt-hint { opacity: 1; }
        }
      `}</style>

      <h2 className="sr-only">Explore</h2>

      <div className="mx-auto flex max-w-[1080px] flex-col gap-4 lg:flex-row lg:items-start">
        <div className="rt-col rt-col-l">{TILES.filter((t) => t.col === "L").map(renderTile)}</div>
        <div className="rt-col rt-col-r">{TILES.filter((t) => t.col === "R").map(renderTile)}</div>
      </div>
    </section>
  );
}