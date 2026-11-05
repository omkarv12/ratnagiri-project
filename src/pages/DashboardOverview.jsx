import { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Landmark,
  Compass,
  BookOpen,
  PlayCircle,
  ShieldCheck,
  TrendingUp,
  Handshake,
  ExternalLink,
  Calendar,
  CalendarDays,
  PlusCircle,
  User,
} from "lucide-react";
import { useLocations } from "../context/LocationsContext";
import { useNavigate, useLocation } from "react-router-dom";
import { blogApi } from "../api/blogApi";
import API_BASE_URL from "../config";
import Slider1 from "../assets/Slider1.jpg";
import Slider2 from "../assets/Slider2.jpg";
import Slider3 from "../assets/Slider3.jpg";
import Slider4 from "../assets/Slider4.jpg";
import Slider5 from "../assets/Slider5.jpg";
import Slider6 from "../assets/Slider6.jpg";
import KokaniFoodImg from "../assets/Kokani-Food.jpg";
import GuidedWalksImg from "../assets/Guided-Walks.jpg";
import CommunityInteractionImg from "../assets/Community-interaction.jpg";
import SocietyImg from "../assets/Society.jpg";
import EconomyImg from "../assets/Economy.jpg";
import GoodGovernanceImg from "../assets/good_governance.jpg";
// Cinematic loading screen (needs RatnagiriLoader.jsx in the same folder)
import RatnagiriCinematic from "../components/RatnagiriCinematic";
import { Mail, Send, Phone } from "lucide-react";
import VisitorCounter from "../components/VisitorCounter";
// NOTE: HowDidYouHearModal is no longer imported here. It is mounted once in
// App.jsx so it opens as soon as the website starts, even during loading.

const heroImages = [Slider1, Slider2, Slider3, Slider4, Slider5, Slider6];

// The loading scene always plays at least this long (ms), even when the
// data arrives faster, so the intro isn't just a flash. Set to 0 to show the
// loader only while data is actually loading.
const MIN_LOADER_MS = 0;

// Route of the Upcoming Events page (UpcomingEventsPage — full calendar +
// contribute form + "Coming up" list). Matches "Upcoming Events" under the
// Experiences menu in config/navMenus. Both buttons under the mini calendar
// in the Experiences section send people here.
const CALENDAR_ROUTE = "/experiences/upcoming-events";

// ---- Mini calendar helpers (Experiences section) ----
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const CAL_WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

// Same category colours as the full EventsCalendar page
const CAL_CATEGORY_COLORS = {
  beaches: "#f7a072",
  forts: "#64b5f6",
  temples: "#ba68c8",
  waterfalls: "#4dd0e1",
  mangoes: "#ffd54f",
};

const toDateKey = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const formatShortDate = (iso) =>
  new Date(`${String(iso).slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

// Full playlist link kept for "Open full playlist" — individual videos below
// are rendered from videosData so two can be shown per page.
const VIDEOS_PLAYLIST_ID = "PLJW4HbrLXqlA";

// The two videos from the "Agriculture and Water" playlist.
// TODO: rename these titles to whatever each video is actually called.
const videosData = [
  { id: "BZWqwLF5mxI", title: "Agriculture and Water — Part 1" },
  { id: "tfi_WmqM6to", title: "Agriculture and Water — Part 2" },
];

// Splits an array into fixed-size chunks — used to build "pages" of 2 for
// the Stories and Videos carousels.
function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// lucide-react no longer ships trademarked brand icons (Instagram, Facebook,
// Twitter, YouTube, etc). These small inline SVGs are drop-in replacements.
function InstagramIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function FacebookIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function TwitterIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M18.9 2H22l-7.6 8.7L23.5 22H16.9l-5.2-6.8L5.7 22H2.6l8.1-9.3L1.5 2h6.8l4.7 6.2zm-1.2 18h1.7L7.4 4H5.6z" />
    </svg>
  );
}
function YoutubeIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24 24 0 0 1 0-10 4 4 0 0 1 2.9-2.8C7.7 3.8 12 3.8 12 3.8s4.3 0 6.6.4A4 4 0 0 1 21.5 7a24 24 0 0 1 0 10 4 4 0 0 1-2.9 2.8c-2.3.4-6.6.4-6.6.4s-4.3 0-6.6-.4A4 4 0 0 1 2.5 17z" />
      <polygon points="10 15 15 12 10 9" />
    </svg>
  );
}

// Formats a story's published_at into a short, readable date for the
// Stories carousel meta row.
function formatStoryDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ------------------------------------------------------------------
   Scroll reveal — fades a section up into place the first time it
   enters the viewport, then leaves it alone. One deliberate reveal
   per section rather than an animation firing on every card.
------------------------------------------------------------------ */
function useInView(threshold = 0.15) {
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

function Reveal({ children, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {children}
    </div>
  );
}

export default function DashboardOverview() {
  const { loading } = useLocations();
  const navigate = useNavigate();
  const location = useLocation();

  // If we arrived here with a #section-id in the URL (e.g. from the nav
  // header's "Experiences" or "About" links), smooth-scroll to that
  // section once the page has rendered.
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.replace("#", ""));
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    }
  }, [location]);

  const [currentSlide, setCurrentSlide] = useState(0);

  // Keeps the cinematic loader on screen for a minimum time.
  const [minTimeDone, setMinTimeDone] = useState(MIN_LOADER_MS === 0);
  useEffect(() => {
    if (MIN_LOADER_MS === 0) return;
    const t = setTimeout(() => setMinTimeDone(true), MIN_LOADER_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Manual carousel controls for the hero photo strip.
  const goToPrevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  const goToNextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);

  // ---- Panel 2: Experiences -------------------------------------------------
  // Each card opens its own page (ExperiencePage), whose content is managed in
  // Admin → Local Experiences.
  const experiencesData = [
    {
      title: "Guided Walks",
      description: "Local guides lead you through forts, markets and coastal trails.",
      image: GuidedWalksImg,
      route: "/experiences/guided-walks",
    },
    {
      title: "Konkani Food",
      description: "Taste solkadhi, fish curry-rice and other Malvani classics.",
      image: KokaniFoodImg,
      route: "/experiences/konkani-food",
    },
    {
      title: "Community Interaction",
      description: "Meet fisherfolk, farmers and artisans in their own villages.",
      image: CommunityInteractionImg,
      route: "/experiences/community-interaction",
    },
  ];

  // ---- Mini calendar (right-hand panel of the Experiences section) ---------
  // Reads the same /api/events endpoint as the full EventsCalendar page.
  const calNow = new Date();
  const calTodayKey = toDateKey(calNow.getFullYear(), calNow.getMonth(), calNow.getDate());
  const [calYear, setCalYear] = useState(calNow.getFullYear());
  const [calMonth, setCalMonth] = useState(calNow.getMonth());
  const [calEvents, setCalEvents] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/events?year=${calYear}&month=${calMonth + 1}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => !cancelled && setCalEvents(Array.isArray(data) ? data : []))
      .catch(() => !cancelled && setCalEvents([]));
    return () => {
      cancelled = true;
    };
  }, [calYear, calMonth]);

  const shiftCalMonth = (delta) => {
    const d = new Date(calYear, calMonth + delta, 1);
    setCalYear(d.getFullYear());
    setCalMonth(d.getMonth());
  };

  // events grouped by YYYY-MM-DD
  const calEventsByDate = {};
  calEvents.forEach((e) => {
    const key = String(e.event_date).slice(0, 10);
    (calEventsByDate[key] = calEventsByDate[key] || []).push(e);
  });

  // blank cells before the 1st, then each day of the month
  const calFirstDay = new Date(calYear, calMonth, 1).getDay();
  const calDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calCells = [
    ...Array.from({ length: calFirstDay }, () => null),
    ...Array.from({ length: calDaysInMonth }, (_, i) => i + 1),
  ];

  // next event to highlight under the grid: first on/after today, else the
  // first event of the visible month
  const calSorted = [...calEvents].sort((a, b) =>
    String(a.event_date).localeCompare(String(b.event_date))
  );
  const calFeatured =
    calSorted.find((e) => String(e.event_date).slice(0, 10) >= calTodayKey) ||
    calSorted[0] ||
    null;

  // ---- Panel 3: Stories & Videos --------------------------------------------
  // Stories are the real, published posts from the Stories section (same
  // blogApi the /stories page uses) — no mock data here.
  const [stories, setStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [storiesError, setStoriesError] = useState(null);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    blogApi
      .listLatest(6)
      .then((data) => setStories(data || []))
      .catch((err) => setStoriesError(err.message))
      .finally(() => setStoriesLoading(false));
  }, []);

  // Stories carousel: shows 2 stories per page, sliding as a whole page in
  // and out (instead of one card centred with empty space either side).
  const STORY_PAGE_SIZE = 2;
  const storyPages = chunkArray(stories, STORY_PAGE_SIZE);
  const [storyPage, setStoryPage] = useState(0);
  const [storyAutoPaused, setStoryAutoPaused] = useState(false);

  const goToPrevStoryPage = () =>
    setStoryPage((p) => (p - 1 + storyPages.length) % storyPages.length);
  const goToNextStoryPage = () =>
    setStoryPage((p) => (p + 1) % storyPages.length);

  useEffect(() => {
    if (storyAutoPaused || storyPages.length < 2) return;
    const interval = setInterval(() => {
      setStoryPage((p) => (p + 1) % storyPages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [storyAutoPaused, storyPages.length]);

  // Clamp the page if the list shrinks (e.g. after a refetch).
  useEffect(() => {
    if (storyPage >= storyPages.length) setStoryPage(0);
  }, [storyPages.length, storyPage]);

  // ---- Videos: 2-per-page carousel, click a thumbnail to play that video --
  // Each card starts as a thumbnail (no network call, no autoplay) and only
  // turns into a live embed once the person clicks it.
  const VIDEO_PAGE_SIZE = 2;
  const videoPages = chunkArray(videosData, VIDEO_PAGE_SIZE);
  const [videoPage, setVideoPage] = useState(0);
  const [videoAutoPaused, setVideoAutoPaused] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState(null);

  const goToPrevVideoPage = () => {
    setPlayingVideoId(null);
    setVideoPage((p) => (p - 1 + videoPages.length) % videoPages.length);
  };
  const goToNextVideoPage = () => {
    setPlayingVideoId(null);
    setVideoPage((p) => (p + 1) % videoPages.length);
  };

  useEffect(() => {
    if (videoAutoPaused || videoPages.length < 2 || playingVideoId) return;
    const interval = setInterval(() => {
      setVideoPage((p) => (p + 1) % videoPages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [videoAutoPaused, videoPages.length, playingVideoId]);

  // ---- Panel 4: About ---------------------------------------------------------
  const aboutPillars = [
    {
      title: "Society",
      icon: Handshake,
      color: "text-teal-700",
      bg: "bg-teal-50",
      tint: "tint-teal",
      image: SocietyImg,
      route: "/society",
      description:
        "Close-knit fishing and farming communities, festivals that pull whole villages together, and a homestay culture built on hospitality.",
    },
    {
      title: "Economy",
      icon: TrendingUp,
      color: "text-amber-700",
      bg: "bg-amber-50",
      tint: "tint-amber",
      image: EconomyImg,
      route: "/economy",
      description:
        "Alphonso mango and cashew exports, a working fishing harbour, and tourism that increasingly supports small, local businesses.",
    },
    {
      title: "Good Governance",
      icon: ShieldCheck,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      tint: "tint-navy",
      image: GoodGovernanceImg,
      route: "/good-governance",
      description:
        "The district administration and tourism office work with village panchayats to register homestays and maintain public beaches and forts.",
    },
  ];

  // Footer links — every route here matches an entry in config/navMenus.js
  // (or the Experiences cards above).
  const footerColumns = [
    {
      heading: "Plan & Explore",
      links: [
        { label: "Plan Your Trip", route: "/plan-your-trip" },
        { label: "Interactive Map", route: "/map" },
        { label: "Itineraries", route: "/experiences/itineraries" },
        { label: "Circuits", route: "/experiences/circuits" },
        { label: "Places", route: "/about/geography/places" },
      ],
    },
    {
      heading: "Experiences & Stories",
      links: [
        { label: "Upcoming Events", route: "/experiences/upcoming-events" },
        { label: "Guided Walks", route: "/experiences/guided-walks" },
        { label: "Konkani Food", route: "/experiences/konkani-food" },
        { label: "Stories & Videos", route: "/dashboard#stories" },
        { label: "Reels", route: "/stories/reels" },
      ],
    },
    {
      heading: "About & Resources",
      links: [
        { label: "Society", route: "/society" },
        { label: "Economy", route: "/economy" },
        { label: "Culture", route: "/about/culture" },
        { label: "Governance", route: "/good-governance" },
        { label: "Do's / Don'ts", route: "/resources/dos-and-donts" },
        { label: "FAQ", route: "/faq" },
      ],
    },
  ];

  const socialLinks = [
    { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com" },
    { icon: YoutubeIcon, label: "YouTube", href: "https://youtube.com" },
    { icon: FacebookIcon, label: "Facebook", href: "https://facebook.com" },
    { icon: TwitterIcon, label: "Twitter", href: "https://twitter.com" },
  ];

  // Cinematic loading screen replaces the old 🚂 loader.
  if (loading || !minTimeDone) return <RatnagiriCinematic />;

  return (
    <div className="font-body animate-in fade-in duration-500">
      {/* Fonts + shared animation. TODO: once fonts are added to the Tailwind
          config, move this @import into index.html <head> as <link> tags. */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.6s ease-out both; }

        /* Slim scrollbar, reused for horizontal strips and the calendar's
           event list */
        .rt-feed { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
        .rt-feed::-webkit-scrollbar { height: 6px; width: 6px; }
        .rt-feed::-webkit-scrollbar-track { background: transparent; }
        .rt-feed::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        .rt-feed::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up { animation: none; }
        }

        /* World-class card treatment: a soft resting shadow that deepens
           and tints toward the section's accent color on hover, paired
           with a gentle lift. Applied via .rt-card + a tint modifier. */
        .rt-card {
          box-shadow: 0 10px 28px -14px rgba(15, 23, 42, 0.22);
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
        }
        .rt-card:hover {
          transform: translateY(-4px);
        }
        .rt-card.tint-amber:hover { box-shadow: 0 26px 50px -18px rgba(180, 83, 42, 0.4); }
        .rt-card.tint-teal:hover { box-shadow: 0 26px 50px -18px rgba(15, 118, 110, 0.35); }
        .rt-card.tint-rose:hover { box-shadow: 0 26px 50px -18px rgba(225, 29, 72, 0.32); }
        .rt-card.tint-navy:hover { box-shadow: 0 26px 50px -18px rgba(11, 49, 73, 0.4); }
        @media (prefers-reduced-motion: reduce) {
          .rt-card, .rt-card:hover { transition: none; transform: none; }
        }

        /* CTA arrow nudges right on hover instead of the whole row moving */
        .rt-cta-arrow { transition: transform 0.25s ease; }
        .rt-cta:hover .rt-cta-arrow { transform: translateX(3px); }

        /* Hero text panel: keeps the headline readable on every slide,
           bright sky or dark sea. */
        .rt-hero-panel {
          background: linear-gradient(135deg, rgba(11, 49, 73, 0.88), rgba(11, 49, 73, 0.72));
          -webkit-backdrop-filter: blur(10px) saturate(1.1);
          backdrop-filter: blur(10px) saturate(1.1);
        }
        .rt-hero-text { text-shadow: 0 2px 14px rgba(0, 0, 0, 0.35); }

      `}</style>

      {/* ================= Panel 1 — Hero carousel (photo only, full width) ================= */}
      <section className="relative px-2 sm:px-3 lg:px-4 py-2 sm:py-3 overflow-hidden">

        <div className="relative max-w-[1680px] mx-auto">
          {/* Full-width rotating photo carousel with caption */}
          <div className="relative rounded-2xl overflow-hidden h-[520px] sm:h-[580px] lg:h-[660px] shadow-[0_35px_70px_-20px_rgba(11,49,73,0.5)] ring-1 ring-black/5">
            {heroImages.map((img, index) => (
              <div
                key={index}
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
                style={{
                  backgroundImage: `url('${img}')`,
                  opacity: index === currentSlide ? 1 : 0,
                }}
              />
            ))}
            {/* slightly stronger scrim than before, so bright skies never wash out the frame */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/45" />

            {/* black shade on the inner border — a soft vignette that frames
                every slide the same way, so the carousel reads as one
                consistent frame rather than six different photos */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-[inset_0_0_0_1px_rgba(0,0,0,0.45),inset_0_0_90px_30px_rgba(0,0,0,0.5)]" />

            {/* carousel arrows */}
            <button
              onClick={goToPrevSlide}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/35 hover:bg-black/55 text-white flex items-center justify-center transition backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goToNextSlide}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/35 hover:bg-black/55 text-white flex items-center justify-center transition backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <ChevronRight size={18} />
            </button>

            {/* content block — vertically centred, sitting on a deep-navy
                frosted panel (site navy #0b3149) with a mango → laterite →
                teal accent bar, so the text is readable on any photo.
                Side padding keeps it clear of the carousel arrows. */}
            <div className="absolute inset-0 flex flex-col justify-center px-12 sm:px-16 lg:px-20 pb-10 animate-fade-up">
              <div className="rt-hero-panel relative max-w-xl rounded-2xl ring-1 ring-white/15 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.65)] p-5 pl-6 sm:p-7 sm:pl-9">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-5 bottom-5 w-1 rounded-r-full bg-gradient-to-b from-[#FBBF24] via-[#B4532A] to-teal-500"
                />

                <p className="rt-hero-text t-eyebrow text-[#FBBF24] mb-3">
                  Explore &middot; Experience &middot; Support Local
                </p>
                <h1 className="rt-hero-text t-h1 text-white mb-4">
                  Discover <span className="text-[#FBBF24]">Ratnagiri</span>
                </h1>
                <p className="t-body text-white/90 max-w-md mb-0">
                  Where the Sahyadri hills meet the Arabian Sea — beaches, forts,
                  homestays and Konkan flavours, all in one place.
                </p>
              </div>
            </div>

            <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between gap-4">
              <p className="rt-hero-text font-display italic text-white text-sm sm:text-base border-b border-dashed border-white/50 pb-1">
                Beaches, forts, culture &amp; Konkan flavours
              </p>
              <div className="flex gap-1.5 shrink-0">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentSlide ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Panel 2 — Experiences ================= */}
      <section id="experiences" className="relative overflow-hidden px-5 sm:px-10 lg:px-16 py-12 sm:py-16 scroll-mt-24">
        <div className="relative max-w-[1680px] mx-auto">
          <Reveal>
            <h2 className="t-h2 mb-2 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-[#B4532A]"><Compass size={22} aria-hidden="true" /></span>
              Local Experiences
            </h2>
            <p className="t-lead mb-8">
              Walks, meals and encounters that go beyond the sightseeing list.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.3fr] gap-5">
            {experiencesData.map(({ title, description, image, route }) => (
              <button
                key={title}
                onClick={() => navigate(route)}
                className="rt-card tint-amber group text-left rounded-xl overflow-hidden relative h-96"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                {/* black shade on the inner border — soft vignette framing the card */}
                <div className="absolute inset-0 rounded-xl pointer-events-none shadow-[inset_0_0_0_1px_rgba(0,0,0,0.45),inset_0_0_50px_18px_rgba(0,0,0,0.5)]" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="t-h3 text-white">{title}</p>
                  <p className="t-small text-white/85 mt-1">{description}</p>
                </div>
              </button>
            ))}

            {/* Mini calendar — replaces the old Upcoming Events list. Dots
                mark days with events; the buttons below open the full
                calendar page (CALENDAR_ROUTE) or its contribute form. */}
            <div className="rt-card tint-amber rounded-xl overflow-hidden h-96 flex flex-col bg-white">
              {/* month header + prev/next */}
              <div className="flex items-center justify-between px-3 py-3 bg-[#B4532A] text-white shrink-0">
                <button
                  onClick={() => shiftCalMonth(-1)}
                  aria-label="Previous month"
                  className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <p className="text-sm font-semibold">
                  {MONTH_NAMES[calMonth]} {calYear}
                </p>
                <button
                  onClick={() => shiftCalMonth(1)}
                  aria-label="Next month"
                  className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* weekday initials */}
              <div className="grid grid-cols-7 px-3 pt-2 text-center text-[11px] font-bold tracking-wider text-slate-500 shrink-0">
                {CAL_WEEKDAYS.map((d, i) => (
                  <div key={i}>{d}</div>
                ))}
              </div>

              {/* day grid */}
              <div className="grid grid-cols-7 gap-y-0.5 px-3 pt-1 shrink-0">
                {calCells.map((day, i) => {
                  if (day === null) return <div key={`blank-${i}`} className="h-8" />;

                  const key = toDateKey(calYear, calMonth, day);
                  const dayEvents = calEventsByDate[key] || [];
                  const isToday = key === calTodayKey;
                  const hasEvents = dayEvents.length > 0;

                  const inner = (
                    <>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                          isToday ? "bg-[#173b45] text-white" : "text-slate-600"
                        }`}
                      >
                        {day}
                      </span>
                      <span className="mt-0.5 flex h-1.5 gap-0.5">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <span
                            key={ev.id}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              background:
                                CAL_CATEGORY_COLORS[ev.category] || CAL_CATEGORY_COLORS.beaches,
                            }}
                          />
                        ))}
                      </span>
                    </>
                  );

                  return hasEvents ? (
                    <button
                      key={key}
                      onClick={() => navigate(CALENDAR_ROUTE)}
                      title={dayEvents.map((e) => e.title).join(", ")}
                      className="h-8 flex flex-col items-center justify-start rounded-md hover:bg-amber-50 transition"
                    >
                      {inner}
                    </button>
                  ) : (
                    <div key={key} className="h-8 flex flex-col items-center justify-start">
                      {inner}
                    </div>
                  );
                })}
              </div>

              {/* next event / empty state */}
              <div className="flex-1 min-h-0 px-3 pt-2 overflow-hidden">
                <div className="border-t border-slate-100 pt-2">
                  {calFeatured ? (
                    <button onClick={() => navigate(CALENDAR_ROUTE)} className="w-full text-left">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">
                        {calEvents.length} event{calEvents.length === 1 ? "" : "s"} in{" "}
                        {MONTH_NAMES[calMonth]}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-900 truncate">
                        {calFeatured.title}
                      </p>
                      <p className="t-meta text-slate-500">
                        {formatShortDate(calFeatured.event_date)}
                      </p>
                    </button>
                  ) : (
                    <p className="t-meta text-slate-500">
                      No events listed for {MONTH_NAMES[calMonth]}.
                    </p>
                  )}
                </div>
              </div>

              {/* buttons */}
              <div className="flex gap-2 px-3 pb-3 pt-2 shrink-0">
                <button
                  onClick={() => navigate(`${CALENDAR_ROUTE}#contribute`)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-full border border-[#B4532A] text-[#B4532A] hover:bg-amber-50 text-xs font-semibold py-1.5 transition"
                >
                  <PlusCircle size={13} /> Contribute
                </button>
                <button
                  onClick={() => navigate(CALENDAR_ROUTE)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-full bg-[#B4532A] hover:bg-[#9c4522] text-white text-xs font-semibold py-1.5 transition"
                >
                  <CalendarDays size={13} /> View Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Panel 3 — Stories & Videos ================= */}
      <section id="stories" className="relative overflow-hidden bg-sky-50 px-5 sm:px-10 lg:px-16 py-12 sm:py-16 scroll-mt-24">

        <div className="relative max-w-[1680px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Stories — 2 published stories per page, sliding as a page */}
          <div>
            <Reveal>
              <h2 className="t-h2 mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700"><BookOpen size={22} aria-hidden="true" /></span>
              Stories from Ratnagiri
            </h2>
            </Reveal>

            <div
              className="w-full"
              onMouseEnter={() => setStoryAutoPaused(true)}
              onMouseLeave={() => setStoryAutoPaused(false)}
            >
              {storiesLoading && (
                <div className="bg-white rounded-xl shadow-sm flex items-center justify-center p-12 text-sm text-slate-400 animate-pulse">
                  Loading stories...
                </div>
              )}

              {!storiesLoading && storiesError && (
                <div className="bg-white rounded-xl shadow-sm flex items-center justify-center p-12 text-sm text-red-500 text-center">
                  Couldn't load stories: {storiesError}
                </div>
              )}

              {!storiesLoading && !storiesError && stories.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm flex items-center justify-center p-12 text-sm text-slate-400 text-center">
                  No stories published yet.
                </div>
              )}

              {!storiesLoading && !storiesError && stories.length > 0 && (
                <>
                  <div className="overflow-hidden">
                    <div
                      className="flex transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${storyPage * 100}%)` }}
                    >
                      {storyPages.map((page, pageIdx) => (
                        <div key={pageIdx} className="flex gap-4 w-full shrink-0">
                          {page.map((story) => (
                            <button
                              key={story.slug}
                              onClick={() => navigate(`/stories/${story.slug}`)}
                              className="rt-card tint-teal group text-left flex-1 min-w-0 bg-white rounded-xl overflow-hidden"
                            >
                              <div className="relative h-40 bg-slate-100">
                                {story.cover_image && (
                                  <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${story.cover_image})` }}
                                  />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                                {story.category?.name && (
                                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 text-teal-700 text-[11px] font-bold rounded uppercase tracking-wide">
                                    {story.category.name}
                                  </span>
                                )}
                              </div>

                              <div className="p-4">
                                <p className="t-h3 text-slate-900 mb-1 line-clamp-2">
                                  {story.title}
                                </p>

                                {(story.author_name || story.published_at) && (
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 t-meta text-slate-500 mb-2">
                                    {story.author_name && (
                                      <span className="flex items-center gap-1">
                                        <User size={10} /> {story.author_name}
                                      </span>
                                    )}
                                    {story.published_at && (
                                      <span className="flex items-center gap-1">
                                        <Calendar size={10} /> {formatStoryDate(story.published_at)}
                                      </span>
                                    )}
                                  </div>
                                )}

                                <p className="t-small text-slate-600 line-clamp-2 mb-3">
                                  {story.excerpt || "Read the full story to find out more."}
                                </p>

                                <span className="t-small inline-flex items-center gap-1 font-semibold text-teal-700">
                                  Read story
                                  <ChevronRight size={11} className="transition-transform duration-300 group-hover:translate-x-1" />
                                </span>
                              </div>
                            </button>
                          ))}

                          {/* pad the last page so a lone card doesn't stretch full width */}
                          {page.length < STORY_PAGE_SIZE &&
                            Array.from({ length: STORY_PAGE_SIZE - page.length }).map((_, i) => (
                              <div key={`story-pad-${i}`} className="flex-1" />
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {storyPages.length > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <button
                        onClick={goToPrevStoryPage}
                        aria-label="Previous stories"
                        className="w-8 h-8 rounded-full bg-white shadow-sm hover:shadow-[0_10px_25px_-8px_rgba(15,118,110,0.45)] hover:scale-105 text-slate-500 hover:text-teal-700 flex items-center justify-center transition"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <div className="flex gap-1.5">
                        {storyPages.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setStoryPage(i)}
                            aria-label={`Go to stories page ${i + 1}`}
                            className={`h-1.5 rounded-full transition-all ${
                              i === storyPage ? "w-5 bg-teal-600" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={goToNextStoryPage}
                        aria-label="Next stories"
                        className="w-8 h-8 rounded-full bg-white shadow-sm hover:shadow-[0_10px_25px_-8px_rgba(15,118,110,0.45)] hover:scale-105 text-slate-500 hover:text-teal-700 flex items-center justify-center transition"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Videos — 2 per page, sliding as a page; click a thumbnail to play it */}
          <div>
            <Reveal>
              <h2 className="t-h2 mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600"><PlayCircle size={22} aria-hidden="true" /></span>
              Videos
            </h2>
            </Reveal>

            <div
              className="w-full"
              onMouseEnter={() => setVideoAutoPaused(true)}
              onMouseLeave={() => setVideoAutoPaused(false)}
            >
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${videoPage * 100}%)` }}
                >
                  {videoPages.map((page, pageIdx) => (
                    <div key={pageIdx} className="flex gap-4 w-full shrink-0">
                      {page.map((video) => (
                        <div
                          key={video.id}
                          className="rt-card tint-rose flex-1 min-w-0 bg-white rounded-xl overflow-hidden"
                        >
                          <div className="relative aspect-video bg-black">
                            {playingVideoId === video.id ? (
                              <iframe
                                className="absolute inset-0 w-full h-full"
                                src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
                                title={video.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <button
                                onClick={() => setPlayingVideoId(video.id)}
                                aria-label={`Play ${video.title}`}
                                className="group/video absolute inset-0 w-full h-full"
                              >
                                <div
                                  className="absolute inset-0 bg-cover bg-center"
                                  style={{
                                    backgroundImage: `url(https://img.youtube.com/vi/${video.id}/hqdefault.jpg)`,
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/25 group-hover/video:bg-black/10 transition" />
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <span className="w-10 h-10 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-md group-hover/video:scale-110 transition-transform">
                                    <PlayCircle size={22} />
                                  </span>
                                </span>
                              </button>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="t-small font-semibold text-slate-900 line-clamp-2">
                              {video.title}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* pad the last page so a lone card doesn't stretch full width */}
                      {page.length < VIDEO_PAGE_SIZE &&
                        Array.from({ length: VIDEO_PAGE_SIZE - page.length }).map((_, i) => (
                          <div key={`video-pad-${i}`} className="flex-1" />
                        ))}
                    </div>
                  ))}
                </div>
              </div>

              {videoPages.length > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={goToPrevVideoPage}
                    aria-label="Previous videos"
                    className="w-8 h-8 rounded-full bg-white shadow-sm hover:shadow-[0_10px_25px_-8px_rgba(225,29,72,0.4)] hover:scale-105 text-slate-500 hover:text-rose-600 flex items-center justify-center transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex gap-1.5">
                    {videoPages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setPlayingVideoId(null);
                          setVideoPage(i);
                        }}
                        aria-label={`Go to videos page ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all ${
                          i === videoPage ? "w-5 bg-rose-600" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={goToNextVideoPage}
                    aria-label="Next videos"
                    className="w-8 h-8 rounded-full bg-white shadow-sm hover:shadow-[0_10px_25px_-8px_rgba(225,29,72,0.4)] hover:scale-105 text-slate-500 hover:text-rose-600 flex items-center justify-center transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              <a
                href={`https://www.youtube.com/playlist?list=${VIDEOS_PLAYLIST_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rt-cta mt-4 t-small inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700"
              >
                Open full playlist <ExternalLink size={12} className="rt-cta-arrow" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Panel 4 — About (Society / Economy / Governance) ================= */}
      <section id="about" className="relative overflow-hidden px-5 sm:px-10 lg:px-16 py-12 sm:py-16 scroll-mt-24">
        <div className="relative max-w-[1680px] mx-auto">
          <Reveal>
            <h2 className="t-h2 mb-2 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-[#0b3149]"><Landmark size={22} aria-hidden="true" /></span>
              Society, Economy &amp; Governance
            </h2>
            <p className="t-lead mb-8">
              A quick look at what keeps Ratnagiri running, beyond the tourist
              trail.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {aboutPillars.map(({ title, icon: Icon, color, bg, tint, image, route, description }) => (
              <button
                key={title}
                onClick={() => navigate(route)}
                className={`rt-card ${tint} group text-left rounded-xl overflow-hidden relative h-96`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {/* black shade on the inner border — soft vignette framing the card */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_0_1px_rgba(0,0,0,0.45),inset_0_0_50px_18px_rgba(0,0,0,0.5)]" />

                <span
                  className={`absolute top-4 left-4 w-10 h-10 rounded-full ${bg} ${color} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}
                >
                  <Icon size={18} />
                </span>

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="t-h3 text-white">{title}</p>
                  <p className="t-small text-white/85 mt-1">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="relative overflow-hidden bg-[#0b3149] mt-0">
        {/* top accent bar — same gradient family as the header's CTA buttons */}
        <div className="h-1 w-full bg-gradient-to-r from-[#B4532A] via-[#FBBF24] to-[#0f766e]" />


        {/* ---- Stats strip: visitor counter + quick site stats + newsletter ---- */}
        <div className="relative border-b border-white/10">
          <div className="mx-auto max-w-[1680px] px-6 sm:px-10 py-6 flex flex-wrap items-center gap-x-10 gap-y-4">
            <VisitorCounter />

            <div className="h-8 w-px bg-white/10 hidden sm:block" />

            <div className="leading-tight">
              <p className="font-display text-lg font-bold text-white">
                {stories.length > 0 ? stories.length : "—"}
              </p>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Stories published
              </p>
            </div>

            <div className="h-8 w-px bg-white/10 hidden sm:block" />

            <div className="leading-tight">
              <p className="font-display text-lg font-bold text-white">9</p>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Talukas covered
              </p>
            </div>

            {/* Newsletter — currently wired to local state only.
                TODO: point onSubmit at a real backend endpoint
                (e.g. POST /api/newsletter) once one exists. */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubscribed(true);
                setSubscribeEmail("");
              }}
              className="ml-auto flex items-center gap-2 w-full sm:w-auto"
            >
              <div className="flex-1 sm:flex-none flex items-center gap-2 bg-white/10 rounded-full pl-4 pr-1.5 py-1.5 ring-1 ring-white/10 focus-within:ring-teal-400/50 transition">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <input
                  type="email"
                  required
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  placeholder="Get travel updates"
                  className="min-w-0 w-40 sm:w-48 text-xs text-white placeholder:text-slate-400 bg-transparent outline-none font-body"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 hover:bg-teal-500 text-white transition"
                >
                  <Send size={12} />
                </button>
              </div>
            </form>
          </div>
          {subscribed && (
            <p className="relative px-6 sm:px-10 pb-4 text-xs text-teal-300">
              Thanks — you're on the list for Ratnagiri travel updates.
            </p>
          )}
        </div>

        {/* ---- Emergency helpline quick-dial ---- */}
        <div className="relative border-b border-white/10">
          <div className="mx-auto max-w-[1680px] px-6 sm:px-10 py-4 flex flex-wrap items-center gap-x-8 gap-y-2">
            <p className="t-eyebrow text-amber-400">
              Emergency Helpline
            </p>
            <a href="tel:100" className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition">
              <Phone size={12} /> Police — 100
            </a>
            <a href="tel:108" className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition">
              <Phone size={12} /> Ambulance — 108
            </a>
            <button
              onClick={() => navigate("/police-stations")}
              className="text-sm text-teal-400 hover:text-teal-300 transition underline decoration-dotted underline-offset-2"
            >
              Nearby police stations
            </button>
            <button
              onClick={() => navigate("/medical-facilities")}
              className="text-sm text-teal-400 hover:text-teal-300 transition underline decoration-dotted underline-offset-2"
            >
              Nearby hospitals
            </button>
          </div>
        </div>

        <div className="relative px-6 sm:px-10 py-12 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_1fr_1fr] gap-10 lg:gap-8">
            <div>
              <h2 className="font-display italic text-2xl text-white mb-3">
                Ratnagiri Tourism
              </h2>
              <p className="t-small text-slate-300 mb-6 max-w-xs">
                Travel sustainably, enjoy fully — guiding visitors through the
                Konkan coast's beaches, forts, food and culture.
              </p>
              <div className="flex gap-3">
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-teal-600 hover:text-white hover:-translate-y-1 hover:shadow-[0_10px_22px_-6px_rgba(45,212,191,0.55)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {footerColumns.map((col) => (
              <div key={col.heading}>
                <p className="t-eyebrow text-teal-400 mb-4">
                  {col.heading}
                </p>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <button
                        onClick={() => navigate(link.route)}
                        className="group flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors duration-200 text-left cursor-pointer focus:outline-none focus:underline"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-[#B4532A] group-hover:scale-125 transition-all duration-200 shrink-0" />
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="t-meta text-slate-400">
              © {new Date().getFullYear()} Ratnagiri Tourism. All rights reserved.
            </p>
            <div className="flex gap-5">
              <button
                onClick={() => navigate("/privacy")}
                className="t-meta text-slate-400 hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => navigate("/terms")}
                className="t-meta text-slate-400 hover:text-white transition-colors duration-200"
              >
                Terms of Use
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}