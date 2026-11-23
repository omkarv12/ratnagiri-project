import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, Compass, Search, Sparkles } from "lucide-react";
import KokaniFoodImg from "../assets/Kokani-Food.jpg";
import GuidedWalksImg from "../assets/Guided-Walks.jpg";
import CommunityInteractionImg from "../assets/Community-interaction.jpg";

/*
  Experiences mosaic — replaces the old "Local Experiences" cards + mini calendar.
  A dark, layered backdrop with a patchwork of tiles: an intro tile, three photo
  tiles (Guided Walks, Konkani Food, Community Interaction), a "Plan your trip"
  panel and an "Upcoming Events" tile that links to the full calendar page.

  Colours come from the same --rt-* tokens as the rest of the page.
  Keep id="experiences" so the nav header's #experiences link still scrolls here.
*/

// Matches "Upcoming Events" under the Experiences menu in config/navMenus.
const CALENDAR_ROUTE = "/experiences/upcoming-events";
const PLAN_ROUTE = "/plan-your-trip";

const THEMES = ["Beaches", "Forts", "Temples", "Nature"];

const PHOTO_TILES = [
  {
    key: "walks",
    title: "Guided Walks",
    sub: "Forts, markets and coastal trails with local guides",
    image: GuidedWalksImg,
    route: "/experiences/guided-walks",
    // explicit grid placement on large screens (12 columns)
    cls: "lg:col-start-5 lg:row-start-1 lg:col-span-4 lg:row-span-3",
    delay: 100,
  },
  {
    key: "food",
    title: "Konkani Food",
    sub: "Solkadhi, fish curry-rice and Malvani classics",
    image: KokaniFoodImg,
    route: "/experiences/konkani-food",
    cls: "lg:col-start-1 lg:row-start-3 lg:col-span-4 lg:row-span-2",
    delay: 250,
  },
  {
    key: "community",
    title: "Community Interaction",
    sub: "Meet fisherfolk, farmers and artisans in their villages",
    image: CommunityInteractionImg,
    route: "/experiences/community-interaction",
    cls: "lg:col-start-9 lg:row-start-3 lg:col-span-4 lg:row-span-2",
    delay: 400,
  },
];

function useInView(threshold = 0.12) {
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

// Decorative palm silhouette that sways gently in the corner (the "tiger" of this page)
function PalmDecor() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 300"
      className="rt-sway pointer-events-none absolute -bottom-6 -right-4 hidden h-[22rem] w-auto text-[color:var(--rt-teal)] opacity-40 lg:block"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
    >
      <path d="M120 300 C 112 220, 128 150, 110 70" strokeWidth="9" />
      <path d="M110 70 C 80 40, 40 40, 10 70" />
      <path d="M110 70 C 85 25, 55 10, 25 15" />
      <path d="M110 70 C 110 30, 120 10, 140 0" />
      <path d="M110 70 C 140 30, 175 25, 205 40" />
      <path d="M110 70 C 145 55, 180 70, 210 100" />
      <path d="M110 70 C 70 70, 40 95, 25 130" />
      <circle cx="104" cy="82" r="7" fill="currentColor" />
      <circle cx="118" cy="86" r="7" fill="currentColor" />
    </svg>
  );
}

export default function ExperiencesMosaic() {
  const navigate = useNavigate();
  const [ref, inView] = useInView();
  const [theme, setTheme] = useState(null);

  // Wrapper that fades each tile up with a stagger
  const reveal = (delay) => ({
    style: { transitionDelay: `${delay}ms` },
    className: `transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100 ${
      inView ? "translate-y-0 scale-100 opacity-100" : "translate-y-10 scale-95 opacity-0"
    }`,
  });

  const goPlan = () =>
    navigate(theme ? `${PLAN_ROUTE}?theme=${theme.toLowerCase()}` : PLAN_ROUTE);

  return (
    <section
      id="experiences"
      ref={ref}
      className="relative scroll-mt-24 overflow-hidden bg-[color:var(--rt-ink)] px-5 py-16 sm:px-10 sm:py-24 lg:px-16"
    >
      <style>{`
        @keyframes rt-sway-kf {
          0%, 100% { transform: rotate(-2.5deg); transform-origin: 55% 100%; }
          50%      { transform: rotate(2.5deg);  transform-origin: 55% 100%; }
        }
        .rt-sway { animation: rt-sway-kf 7s ease-in-out infinite; }
        @keyframes rt-float-kf {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        .rt-float { animation: rt-float-kf 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .rt-sway, .rt-float { animation: none; }
        }
      `}</style>

      {/* layered backdrop: glows + faint vertical "tree trunk" stripes */}
      <span aria-hidden="true" className="pointer-events-none absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-[color:var(--rt-teal)] opacity-25 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[color:var(--rt-laterite)] opacity-25 blur-3xl" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #fff 0 2px, transparent 2px 64px)",
        }}
      />
      <PalmDecor />

      <div className="relative mx-auto max-w-[1680px]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[150px] lg:gap-5">
          {/* ---------- Intro tile ---------- */}
          <div
            {...reveal(0)}
            className={`${reveal(0).className} sm:col-span-2 lg:col-span-4 lg:col-start-1 lg:row-span-2 lg:row-start-1`}
          >
            <div className="flex h-full min-h-[14rem] flex-col justify-between rounded-3xl bg-[color:var(--rt-sand)] p-7 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.6)]">
              <div>
                <p className="mb-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[color:var(--rt-laterite)]">
                  <span className="h-px w-8 bg-[color:var(--rt-laterite)]" />
                  Experience
                </p>
                <h2 className="t-h2 flex items-center gap-3">
                  <span className="rt-float flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--rt-laterite-tint)] text-[color:var(--rt-laterite)]">
                    <Compass size={22} aria-hidden="true" />
                  </span>
                  Local Experiences
                </h2>
              </div>
              <p className="t-lead">
                Walks, meals and encounters that go beyond the sightseeing list.
              </p>
            </div>
          </div>

          {/* ---------- Plan your trip panel ---------- */}
          <div
            {...reveal(200)}
            className={`${reveal(200).className} sm:col-span-2 lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1`}
          >
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[color:var(--rt-kokum)] to-[color:var(--rt-kokum-dark)] p-6 text-white shadow-[0_24px_48px_-20px_rgba(0,0,0,0.6)]">
              <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full border border-white/20" />
              <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-4 h-20 w-20 rounded-full border border-white/15" />
              <div className="relative">
                <p className="flex items-center gap-2 font-display text-xl font-semibold">
                  <Sparkles size={18} className="text-[color:var(--rt-gold)]" aria-hidden="true" />
                  Plan Your Trip
                </p>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-white/70">
                  Pick a travel theme
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {THEMES.map((t) => {
                    const active = theme === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setTheme(active ? null : t)}
                        aria-pressed={active}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold ring-1 transition ${
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
                className="relative mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[color:var(--rt-laterite)] py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-md transition hover:bg-[color:var(--rt-laterite-dark)]"
              >
                <Search size={14} aria-hidden="true" /> Search
              </button>
            </div>
          </div>

          {/* ---------- Photo tiles ---------- */}
          {PHOTO_TILES.map(({ key, title, sub, image, route, cls, delay }, i) => (
            <div
              key={key}
              {...reveal(delay)}
              className={`${reveal(delay).className} h-64 sm:h-auto ${cls}`}
            >
              <button
                onClick={() => navigate(route)}
                className="group relative block h-full w-full overflow-hidden rounded-3xl text-left shadow-[0_24px_48px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/10 transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_32px_60px_-20px_rgba(0,0,0,0.85)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--rt-gold)]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${image})` }}
                />
                <div className="rt-scrim-card absolute inset-0" />
                <span className="absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-widest text-white ring-1 ring-white/30 backdrop-blur">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="t-h3 text-white">{title}</p>
                  <p className="t-small mt-1 max-w-xs text-white/80">{sub}</p>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-[color:var(--rt-gold)] opacity-0 transition duration-300 group-hover:opacity-100 max-lg:opacity-100">
                    Explore <ArrowRight size={14} />
                  </span>
                </div>
              </button>
            </div>
          ))}

          {/* ---------- Upcoming events tile (replaces the mini calendar) ---------- */}
          <div
            {...reveal(325)}
            className={`${reveal(325).className} sm:col-span-2 lg:col-span-4 lg:col-start-5 lg:row-start-4`}
          >
            <button
              onClick={() => navigate(CALENDAR_ROUTE)}
              className="group relative flex h-full min-h-[8rem] w-full items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-r from-[color:var(--rt-teal)] to-[color:var(--rt-ink)] px-6 py-5 text-left text-white shadow-[0_24px_48px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/10 transition duration-500 hover:-translate-y-1.5"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 transition group-hover:rotate-6">
                <CalendarDays size={26} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="t-h3 block text-white">Upcoming Events</span>
                <span className="t-small mt-0.5 block text-white/80">
                  Festivals, fairs and seasons across the district
                </span>
              </span>
              <ArrowRight
                size={20}
                aria-hidden="true"
                className="ml-auto shrink-0 text-[color:var(--rt-gold)] transition-transform duration-300 group-hover:translate-x-1.5"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
