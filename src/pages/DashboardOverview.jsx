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
  MapPin,
  ArrowRight,
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

// How long each hero photo stays on screen (ms). Also drives the progress bar.
const HERO_SLIDE_MS = 6000;

// The loading scene always plays at least this long (ms), even when the
// data arrives faster, so the intro isn't just a flash. Set to 0 to show the
// loader only while data is actually loading.
const MIN_LOADER_MS = 0;

// Route of the Upcoming Events page (UpcomingEventsPage). Matches "Upcoming
// Events" under the Experiences menu in config/navMenus.
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
   enters the viewport, then leaves it alone.
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

// Consistent section heading: small eyebrow with a rule, big serif title,
// optional lead line. Used by every major section so the page reads as one.
function SectionHead({ eyebrow, title, lead, icon: Icon, iconClass = "", compact = false }) {
  return (
    <Reveal className={compact ? "mb-6" : "mb-10 max-w-3xl"}>
      <p className="mb-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#B4532A]">
        <span className="h-px w-8 bg-[#B4532A]" />
        {eyebrow}
      </p>
      <h2 className="t-h2 flex items-center gap-3">
        {Icon && (
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}>
            <Icon size={22} aria-hidden="true" />
          </span>
        )}
        {title}
      </h2>
      {lead && <p className="t-lead mt-3">{lead}</p>}
    </Reveal>
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

  // Restarts whenever the slide changes, so the progress bar and the slide
  // always stay in step (also after a manual click).
  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, HERO_SLIDE_MS);
    return () => clearTimeout(t);
  }, [currentSlide]);

  // Manual carousel controls for the hero.
  const goToPrevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  const goToNextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);

  // ---- Experiences -----------------------------------------------------------
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

  // ---- Stories & Videos -------------------------------------------------------
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

  // Stories carousel: shows 2 stories per page, sliding as a whole page.
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

  // ---- About ---------------------------------------------------------------------
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
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .animate-fade-up-2 { animation: fadeUp 0.8s 0.15s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .animate-fade-up-3 { animation: fadeUp 0.8s 0.3s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .animate-fade-up-4 { animation: fadeUp 0.8s 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }

        /* Hero progress segment fills over exactly one slide's duration */
        @keyframes rt-fill { from { width: 0; } to { width: 100%; } }
        .rt-seg-fill { animation: rt-fill ${HERO_SLIDE_MS}ms linear both; }

        /* "Scroll" cue: a line that keeps travelling down */
        @keyframes rt-scrolldown {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .rt-scroll-line { animation: rt-scrolldown 1.8s ease-in-out infinite; }

        /* Slim scrollbar */
        .rt-feed { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
        .rt-feed::-webkit-scrollbar { height: 6px; width: 6px; }
        .rt-feed::-webkit-scrollbar-track { background: transparent; }
        .rt-feed::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        .rt-feed::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        /* Card treatment: a soft resting shadow that deepens and tints toward
           the section accent on hover, with a gentle lift. */
        .rt-card {
          box-shadow: 0 12px 32px -16px rgba(15, 23, 42, 0.28);
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease;
        }
        .rt-card:hover { transform: translateY(-6px); }
        .rt-card.tint-amber:hover { box-shadow: 0 32px 56px -20px rgba(180, 83, 42, 0.45); }
        .rt-card.tint-teal:hover  { box-shadow: 0 32px 56px -20px rgba(15, 118, 110, 0.4); }
        .rt-card.tint-rose:hover  { box-shadow: 0 32px 56px -20px rgba(225, 29, 72, 0.35); }
        .rt-card.tint-navy:hover  { box-shadow: 0 32px 56px -20px rgba(11, 49, 73, 0.45); }

        /* Photo cards: description + "explore" row slide up on hover */
        .rt-reveal-row {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: max-height 0.45s ease, opacity 0.35s ease, margin 0.45s ease;
        }
        .group:hover .rt-reveal-row,
        .group:focus-visible .rt-reveal-row { max-height: 4rem; opacity: 1; margin-top: 0.75rem; }
        @media (hover: none) {
          .rt-reveal-row { max-height: 4rem; opacity: 1; margin-top: 0.75rem; }
        }

        /* CTA arrow nudges right on hover */
        .rt-cta-arrow { transition: transform 0.25s ease; }
        .rt-cta:hover .rt-cta-arrow { transform: translateX(3px); }

        .rt-hero-text { text-shadow: 0 2px 24px rgba(0, 0, 0, 0.45); }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up, .animate-fade-up-2, .animate-fade-up-3, .animate-fade-up-4 { animation: none; }
          .rt-seg-fill { animation: none; width: 100%; }
          .rt-scroll-line { animation: none; }
          .rt-card, .rt-card:hover { transition: none; transform: none; }
        }
      `}</style>

      {/* ================= Hero — full-bleed, edge to edge ================= */}
      <section className="relative h-[calc(100svh-5rem)] max-h-[940px] min-h-[580px] w-full overflow-hidden bg-[#06141f]">
        {/* slides: crossfade + slow zoom on the active photo */}
        {heroImages.map((img, index) => (
          <div
            key={index}
            aria-hidden={index !== currentSlide}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${img}')`,
              opacity: index === currentSlide ? 1 : 0,
              transform: index === currentSlide ? "scale(1.1)" : "scale(1)",
              transition: "opacity 1.4s ease-in-out, transform 8s ease-out",
              willChange: "opacity, transform",
            }}
          />
        ))}

        {/* scrims: darker at the left (text) and bottom (controls) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#04121c]/80 via-[#04121c]/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04121c]/85 via-transparent to-[#04121c]/40" />

        {/* content */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-[1680px] px-6 sm:px-10 lg:px-16">
            <div className="max-w-3xl pb-16 sm:pb-12">
              <p className="rt-hero-text animate-fade-up mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#FBBF24] sm:text-xs">
                <span className="h-px w-10 bg-[#FBBF24]" />
                Explore &middot; Experience &middot; Support Local
              </p>

              <h1 className="rt-hero-text animate-fade-up-2 font-display text-5xl font-bold leading-[0.98] tracking-tight text-white sm:text-7xl lg:text-[5.75rem]">
                Discover
                <br />
                <span className="text-[#FBBF24]">Ratnagiri</span>
              </h1>

              <p className="rt-hero-text animate-fade-up-3 mt-6 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
                Where the Sahyadri hills meet the Arabian Sea. Beaches, forts,
                homestays and Konkan flavours, all in one place.
              </p>

              <div className="animate-fade-up-4 mt-9 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate("/plan-your-trip")}
                  className="rt-cta group inline-flex items-center gap-2 rounded-full bg-[#FBBF24] px-7 py-3.5 text-sm font-bold text-[#0b3149] shadow-[0_18px_40px_-12px_rgba(251,191,36,0.7)] transition hover:-translate-y-0.5 hover:bg-[#fcc934]"
                >
                  Plan your trip
                  <ArrowRight size={16} className="rt-cta-arrow" />
                </button>
                <button
                  onClick={() => navigate("/map")}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-7 py-3.5 text-sm font-semibold text-white ring-1 ring-white/40 backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/20"
                >
                  <MapPin size={16} />
                  Explore the map
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* bottom row: progress segments · counter · arrows */}
        <div className="absolute inset-x-0 bottom-0 pb-8 sm:pb-10">
          <div className="mx-auto flex w-full max-w-[1680px] items-center gap-5 px-6 sm:px-10 lg:px-16">
            <div className="flex flex-1 items-center gap-2 sm:max-w-xl">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className="group relative h-6 flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/30 transition-all group-hover:h-[5px]">
                    {index < currentSlide && <span className="block h-full w-full bg-white" />}
                    {index === currentSlide && (
                      <span key={currentSlide} className="rt-seg-fill block h-full bg-white" />
                    )}
                  </span>
                </button>
              ))}
            </div>

            <p className="hidden text-sm font-semibold tabular-nums text-white/80 sm:block">
              {String(currentSlide + 1).padStart(2, "0")}
              <span className="mx-1.5 text-white/40">/</span>
              {String(heroImages.length).padStart(2, "0")}
            </p>

            <div className="ml-auto flex gap-2">
              <button
                onClick={goToPrevSlide}
                aria-label="Previous photo"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/30 backdrop-blur-md transition hover:bg-white hover:text-[#0b3149] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToNextSlide}
                aria-label="Next photo"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/30 backdrop-blur-md transition hover:bg-white hover:text-[#0b3149] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* scroll cue */}
        <div className="pointer-events-none absolute bottom-20 right-6 hidden flex-col items-center gap-2 lg:flex xl:right-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 [writing-mode:vertical-rl]">
            Scroll
          </span>
          <span className="relative h-12 w-px overflow-hidden bg-white/25">
            <span className="rt-scroll-line absolute inset-0 bg-white" />
          </span>
        </div>
      </section>

      {/* ================= Experiences ================= */}
      <section id="experiences" className="relative scroll-mt-24 overflow-hidden px-5 py-16 sm:px-10 sm:py-24 lg:px-16">
        <span aria-hidden="true" className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-teal-200/25 blur-3xl" />

        <div className="relative mx-auto max-w-[1680px]">
          <SectionHead
            eyebrow="Experience"
            title="Local Experiences"
            icon={Compass}
            iconClass="bg-amber-100 text-[#B4532A]"
            lead="Walks, meals and encounters that go beyond the sightseeing list."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.3fr]">
            {experiencesData.map(({ title, description, image, route }, i) => (
              <button
                key={title}
                onClick={() => navigate(route)}
                className="rt-card tint-amber group relative h-[26rem] overflow-hidden rounded-3xl text-left"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04121c]/90 via-[#04121c]/20 to-transparent" />
                <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]" />

                <span className="absolute left-5 top-5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-widest text-white ring-1 ring-white/30 backdrop-blur">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="t-h3 text-white">{title}</p>
                  <p className="t-small mt-1 text-white/80">{description}</p>
                  <div className="rt-reveal-row">
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#FBBF24]">
                      Explore <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </button>
            ))}

            {/* Mini calendar. Dots mark days with events; the buttons below
                open the full calendar page (CALENDAR_ROUTE) or its form. */}
            <div className="rt-card tint-amber flex h-[26rem] flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70">
              {/* month header + prev/next */}
              <div className="relative flex shrink-0 items-center justify-between overflow-hidden bg-gradient-to-br from-[#B4532A] to-[#8f3f1f] px-3 py-3.5 text-white">
                <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full border border-white/15" />
                <button
                  onClick={() => shiftCalMonth(-1)}
                  aria-label="Previous month"
                  className="relative flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/20"
                >
                  <ChevronLeft size={16} />
                </button>
                <p className="relative font-display text-base font-semibold">
                  {MONTH_NAMES[calMonth]} <span className="font-normal text-white/70">{calYear}</span>
                </p>
                <button
                  onClick={() => shiftCalMonth(1)}
                  aria-label="Next month"
                  className="relative flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/20"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* weekday initials */}
              <div className="grid shrink-0 grid-cols-7 px-3 pt-3 text-center text-[11px] font-bold tracking-wider text-slate-400">
                {CAL_WEEKDAYS.map((d, i) => (
                  <div key={i}>{d}</div>
                ))}
              </div>

              {/* day grid */}
              <div className="grid shrink-0 grid-cols-7 gap-y-0.5 px-3 pt-1">
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
                      className="flex h-8 flex-col items-center justify-start rounded-md transition hover:bg-amber-50"
                    >
                      {inner}
                    </button>
                  ) : (
                    <div key={key} className="flex h-8 flex-col items-center justify-start">
                      {inner}
                    </div>
                  );
                })}
              </div>

              {/* next event / empty state */}
              <div className="min-h-0 flex-1 overflow-hidden px-3 pt-2">
                <div className="border-t border-slate-100 pt-2">
                  {calFeatured ? (
                    <button onClick={() => navigate(CALENDAR_ROUTE)} className="w-full text-left">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">
                        {calEvents.length} event{calEvents.length === 1 ? "" : "s"} in{" "}
                        {MONTH_NAMES[calMonth]}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
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
              <div className="flex shrink-0 gap-2 px-3 pb-3 pt-2">
                <button
                  onClick={() => navigate(`${CALENDAR_ROUTE}#contribute`)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-full border border-[#B4532A] py-2 text-xs font-semibold text-[#B4532A] transition hover:bg-amber-50"
                >
                  <PlusCircle size={13} /> Contribute
                </button>
                <button
                  onClick={() => navigate(CALENDAR_ROUTE)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-full bg-[#B4532A] py-2 text-xs font-semibold text-white shadow-md shadow-[#B4532A]/30 transition hover:bg-[#9c4522]"
                >
                  <CalendarDays size={13} /> View Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Stories & Videos ================= */}
      <section
        id="stories"
        className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-[#eaf4f7] via-[#f1f8fa] to-white px-5 py-16 sm:px-10 sm:py-24 lg:px-16"
      >
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1680px] grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Stories — 2 published stories per page, sliding as a page */}
          <div>
            <SectionHead
              compact
              eyebrow="Read"
              title="Stories from Ratnagiri"
              icon={BookOpen}
              iconClass="bg-teal-100 text-teal-700"
            />

            <div
              className="w-full"
              onMouseEnter={() => setStoryAutoPaused(true)}
              onMouseLeave={() => setStoryAutoPaused(false)}
            >
              {storiesLoading && (
                <div className="flex animate-pulse items-center justify-center rounded-2xl bg-white p-12 text-sm text-slate-400 shadow-sm">
                  Loading stories...
                </div>
              )}

              {!storiesLoading && storiesError && (
                <div className="flex items-center justify-center rounded-2xl bg-white p-12 text-center text-sm text-red-500 shadow-sm">
                  Couldn't load stories: {storiesError}
                </div>
              )}

              {!storiesLoading && !storiesError && stories.length === 0 && (
                <div className="flex items-center justify-center rounded-2xl bg-white p-12 text-center text-sm text-slate-400 shadow-sm">
                  No stories published yet.
                </div>
              )}

              {!storiesLoading && !storiesError && stories.length > 0 && (
                <>
                  <div className="-mx-2 overflow-hidden px-2 pb-6 pt-2">
                    <div
                      className="flex transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${storyPage * 100}%)` }}
                    >
                      {storyPages.map((page, pageIdx) => (
                        <div key={pageIdx} className="flex w-full shrink-0 gap-5 pr-0.5">
                          {page.map((story) => (
                            <button
                              key={story.slug}
                              onClick={() => navigate(`/stories/${story.slug}`)}
                              className="rt-card tint-teal group min-w-0 flex-1 overflow-hidden rounded-2xl bg-white text-left ring-1 ring-slate-200/60"
                            >
                              <div className="relative h-44 overflow-hidden bg-slate-100">
                                {story.cover_image && (
                                  <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${story.cover_image})` }}
                                  />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                {story.category?.name && (
                                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-teal-700 shadow-sm">
                                    {story.category.name}
                                  </span>
                                )}
                              </div>

                              <div className="p-5">
                                <p className="t-h3 mb-1 line-clamp-2 text-slate-900">
                                  {story.title}
                                </p>

                                {(story.author_name || story.published_at) && (
                                  <div className="t-meta mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-500">
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

                                <p className="t-small mb-3 line-clamp-2 text-slate-600">
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
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={goToPrevStoryPage}
                        aria-label="Previous stories"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:scale-105 hover:text-teal-700 hover:shadow-[0_10px_25px_-8px_rgba(15,118,110,0.45)]"
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
                              i === storyPage ? "w-6 bg-teal-600" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={goToNextStoryPage}
                        aria-label="Next stories"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:scale-105 hover:text-teal-700 hover:shadow-[0_10px_25px_-8px_rgba(15,118,110,0.45)]"
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
            <SectionHead
              compact
              eyebrow="Watch"
              title="Videos"
              icon={PlayCircle}
              iconClass="bg-rose-100 text-rose-600"
            />

            <div
              className="w-full"
              onMouseEnter={() => setVideoAutoPaused(true)}
              onMouseLeave={() => setVideoAutoPaused(false)}
            >
              <div className="-mx-2 overflow-hidden px-2 pb-6 pt-2">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${videoPage * 100}%)` }}
                >
                  {videoPages.map((page, pageIdx) => (
                    <div key={pageIdx} className="flex w-full shrink-0 gap-5 pr-0.5">
                      {page.map((video) => (
                        <div
                          key={video.id}
                          className="rt-card tint-rose min-w-0 flex-1 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/60"
                        >
                          <div className="relative aspect-video bg-black">
                            {playingVideoId === video.id ? (
                              <iframe
                                className="absolute inset-0 h-full w-full"
                                src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
                                title={video.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <button
                                onClick={() => setPlayingVideoId(video.id)}
                                aria-label={`Play ${video.title}`}
                                className="group/video absolute inset-0 h-full w-full"
                              >
                                <div
                                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/video:scale-105"
                                  style={{
                                    backgroundImage: `url(https://img.youtube.com/vi/${video.id}/hqdefault.jpg)`,
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/30 transition group-hover/video:bg-black/10" />
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-rose-600 shadow-lg ring-8 ring-white/25 transition-transform group-hover/video:scale-110">
                                    <PlayCircle size={24} />
                                  </span>
                                </span>
                              </button>
                            )}
                          </div>
                          <div className="p-4">
                            <p className="t-small line-clamp-2 font-semibold text-slate-900">
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
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={goToPrevVideoPage}
                    aria-label="Previous videos"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:scale-105 hover:text-rose-600 hover:shadow-[0_10px_25px_-8px_rgba(225,29,72,0.4)]"
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
                          i === videoPage ? "w-6 bg-rose-600" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={goToNextVideoPage}
                    aria-label="Next videos"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:scale-105 hover:text-rose-600 hover:shadow-[0_10px_25px_-8px_rgba(225,29,72,0.4)]"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              <a
                href={`https://www.youtube.com/playlist?list=${VIDEOS_PLAYLIST_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rt-cta t-small mt-5 inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700"
              >
                Open full playlist <ExternalLink size={12} className="rt-cta-arrow" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= About (Society / Economy / Governance) ================= */}
      <section id="about" className="relative scroll-mt-24 overflow-hidden bg-white px-5 py-16 sm:px-10 sm:py-24 lg:px-16">
        <span aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full bg-slate-200/50 blur-3xl" />

        <div className="relative mx-auto max-w-[1680px]">
          <SectionHead
            eyebrow="Know the district"
            title="Society, Economy & Governance"
            icon={Landmark}
            iconClass="bg-slate-200 text-[#0b3149]"
            lead="A quick look at what keeps Ratnagiri running, beyond the tourist trail."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {aboutPillars.map(({ title, icon: Icon, color, bg, tint, image, route, description }, i) => (
              <button
                key={title}
                onClick={() => navigate(route)}
                className={`rt-card ${tint} group relative h-[26rem] overflow-hidden rounded-3xl text-left`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04121c]/90 via-[#04121c]/25 to-transparent" />
                <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]" />

                <span
                  className={`absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-full ${bg} ${color} shadow-md transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110`}
                >
                  <Icon size={20} />
                </span>
                <span className="absolute right-5 top-5 font-display text-4xl font-bold text-white/25">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="t-h3 text-white">{title}</p>
                  <p className="t-small mt-1 text-white/80">{description}</p>
                  <div className="rt-reveal-row">
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#FBBF24]">
                      Learn more <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Closing call-to-action ================= */}
      <section className="relative bg-white px-5 pb-16 sm:px-10 sm:pb-24 lg:px-16">
        <div className="relative mx-auto max-w-[1680px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0b3149] via-[#0d4150] to-[#0f766e] px-6 py-14 text-center shadow-[0_40px_80px_-30px_rgba(11,49,73,0.6)] sm:px-12 sm:py-20">
          <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-4 -top-8 h-48 w-48 rounded-full border border-white/10" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-[#FBBF24]/15 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-[#FBBF24]">
              Ready when you are
            </p>
            <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
              Plan your Ratnagiri journey
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
              Pick your places, find local stays and meet the people who make the
              Konkan special.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate("/plan-your-trip")}
                className="rt-cta inline-flex items-center gap-2 rounded-full bg-[#FBBF24] px-7 py-3.5 text-sm font-bold text-[#0b3149] shadow-[0_18px_40px_-12px_rgba(251,191,36,0.6)] transition hover:-translate-y-0.5 hover:bg-[#fcc934]"
              >
                Plan your trip <ArrowRight size={16} className="rt-cta-arrow" />
              </button>
              <button
                onClick={() => navigate("/registration")}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-7 py-3.5 text-sm font-semibold text-white ring-1 ring-white/40 backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                <PlusCircle size={16} /> Contribute a place or service
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="relative mt-0 overflow-hidden bg-[#0b3149]">
        {/* top accent bar — same gradient family as the header's CTA buttons */}
        <div className="h-1 w-full bg-gradient-to-r from-[#B4532A] via-[#FBBF24] to-[#0f766e]" />

        {/* ---- Stats strip: visitor counter + quick site stats + newsletter ---- */}
        <div className="relative border-b border-white/10">
          <div className="mx-auto flex max-w-[1680px] flex-wrap items-center gap-x-10 gap-y-4 px-6 py-6 sm:px-10 lg:px-16">
            <VisitorCounter />

            <div className="hidden h-8 w-px bg-white/10 sm:block" />

            <div className="leading-tight">
              <p className="font-display text-lg font-bold text-white">
                {stories.length > 0 ? stories.length : "—"}
              </p>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Stories published
              </p>
            </div>

            <div className="hidden h-8 w-px bg-white/10 sm:block" />

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
              className="ml-auto flex w-full items-center gap-2 sm:w-auto"
            >
              <div className="flex flex-1 items-center gap-2 rounded-full bg-white/10 py-1.5 pl-4 pr-1.5 ring-1 ring-white/10 transition focus-within:ring-teal-400/50 sm:flex-none">
                <Mail size={14} className="shrink-0 text-slate-400" />
                <input
                  type="email"
                  required
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  placeholder="Get travel updates"
                  className="w-40 min-w-0 bg-transparent font-body text-xs text-white outline-none placeholder:text-slate-400 sm:w-48"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white transition hover:bg-teal-500"
                >
                  <Send size={12} />
                </button>
              </div>
            </form>
          </div>
          {subscribed && (
            <p className="relative mx-auto max-w-[1680px] px-6 pb-4 text-xs text-teal-300 sm:px-10 lg:px-16">
              Thanks — you're on the list for Ratnagiri travel updates.
            </p>
          )}
        </div>

        {/* ---- Emergency helpline quick-dial ---- */}
        <div className="relative border-b border-white/10">
          <div className="mx-auto flex max-w-[1680px] flex-wrap items-center gap-x-8 gap-y-2 px-6 py-4 sm:px-10 lg:px-16">
            <p className="t-eyebrow text-amber-400">Emergency Helpline</p>
            <a href="tel:100" className="flex items-center gap-1.5 text-sm text-slate-300 transition hover:text-white">
              <Phone size={12} /> Police — 100
            </a>
            <a href="tel:108" className="flex items-center gap-1.5 text-sm text-slate-300 transition hover:text-white">
              <Phone size={12} /> Ambulance — 108
            </a>
            <button
              onClick={() => navigate("/police-stations")}
              className="text-sm text-teal-400 underline decoration-dotted underline-offset-2 transition hover:text-teal-300"
            >
              Nearby police stations
            </button>
            <button
              onClick={() => navigate("/medical-facilities")}
              className="text-sm text-teal-400 underline decoration-dotted underline-offset-2 transition hover:text-teal-300"
            >
              Nearby hospitals
            </button>
          </div>
        </div>

        <div className="relative px-6 py-12 sm:px-10 sm:py-14 lg:px-16">
          <div className="mx-auto max-w-[1680px]">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-8">
              <div>
                <h2 className="mb-3 font-display text-2xl italic text-white">
                  Ratnagiri Tourism
                </h2>
                <p className="t-small mb-6 max-w-xs text-slate-300">
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
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:bg-teal-600 hover:text-white hover:shadow-[0_10px_22px_-6px_rgba(45,212,191,0.55)] focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <p className="t-eyebrow mb-4 text-teal-400">{col.heading}</p>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <button
                          onClick={() => navigate(link.route)}
                          className="group flex cursor-pointer items-center gap-2 text-left text-sm text-slate-300 transition-colors duration-200 hover:text-white focus:underline focus:outline-none"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600 transition-all duration-200 group-hover:scale-125 group-hover:bg-[#B4532A]" />
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
              <p className="t-meta text-slate-400">
                © {new Date().getFullYear()} Ratnagiri Tourism. All rights reserved.
              </p>
              <div className="flex gap-5">
                <button
                  onClick={() => navigate("/privacy")}
                  className="t-meta text-slate-400 transition-colors duration-200 hover:text-white"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => navigate("/terms")}
                  className="t-meta text-slate-400 transition-colors duration-200 hover:text-white"
                >
                  Terms of Use
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}