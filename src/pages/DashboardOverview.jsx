import { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Landmark,
  BookOpen,
  PlayCircle,
  Film,
  ShieldCheck,
  TrendingUp,
  Handshake,
  ExternalLink,
  Calendar,
  User,
  ArrowRight,
} from "lucide-react";
import { useLocations } from "../context/LocationsContext";
import { useNavigate, useLocation } from "react-router-dom";
import { blogApi } from "../api/blogApi";
import SocietyImg from "../assets/Society.jpg";
import EconomyImg from "../assets/Economy.jpg";
import GoodGovernanceImg from "../assets/good_governance.jpg";
// Cinematic loading screen (needs RatnagiriLoader.jsx in the same folder)
import RatnagiriCinematic from "../components/RatnagiriCinematic";
import { Mail, Send, Phone } from "lucide-react";
import VisitorCounter from "../components/VisitorCounter";
// Hero: plain video with Beaches / Forts / Temples / Nature tabs
import HeroVideoTabs from "../components/HeroVideoTabs";
// Experiences: photo-tile mosaic (replaces the old cards + mini calendar)
import ExperiencesMosaic from "../components/ExperiencesMosaic";
import FestivalsEvents from "../components/FestivalsEvents";
// NOTE: HowDidYouHearModal is no longer imported here. It is mounted once in
// App.jsx so it opens as soon as the website starts, even during loading.

/*
  COLOURS
  All colours come from the palette tokens defined in DashboardLayout's
  THEME_CSS (--rt-ink, --rt-teal, --rt-laterite, --rt-gold, --rt-kokum,
  --rt-mist, --rt-sand and their -tint / -dark variants).
  To change the look of this page, change the tokens there.

  Tailwind needs a type hint on CSS variables, so write
    text-[color:var(--rt-teal)]   bg-[color:var(--rt-teal-tint)]
    border-[color:var(--rt-teal-line)]   ring-[color:var(--rt-kokum-line)]
*/

// The hero videos and tabs now live in components/HeroVideoTabs.jsx
// (edit HERO_TABS there). The Experiences section lives in
// components/ExperiencesMosaic.jsx.

// The loading scene always plays at least this long (ms), even when the
// data arrives faster, so the intro isn't just a flash. Set to 0 to show the
// loader only while data is actually loading.
const MIN_LOADER_MS = 0;

// Full playlist link kept for "Open full playlist" — individual videos below
// are rendered from videosData so two can be shown per page.
const VIDEOS_PLAYLIST_ID = "PLJW4HbrLXqlA";

// The two videos from the "Agriculture and Water" playlist.
// TODO: rename these titles to whatever each video is actually called.
const videosData = [
  { id: "BZWqwLF5mxI", title: "Agriculture and Water — Part 1" },
  { id: "tfi_WmqM6to", title: "Agriculture and Water — Part 2" },
];

// Instagram Reels shown in the "Reels" carousel (3rd column of Stories & Videos).
// Paste the public link of each reel below, newest first — e.g.
//   { url: "https://www.instagram.com/reel/AbCdEfGhIjK/" },
// Links must be PUBLIC reels (profile not private). Both /reel/ and /p/ links work.
const REELS_PROFILE_URL = "https://www.instagram.com/";
const reelsData = [
  { url: "https://www.instagram.com/reel/DftR--Sit71/" },
  { url: "https://www.instagram.com/reel/Dey9wwYoXCl/" },
  { url: "https://www.instagram.com/reel/DeCRYtcttcp/" },
];

// Stories, Videos and Reels cards all share this height (px) so the row lines up.
// (The same number appears as h-[456px] in the markup below.)
const MEDIA_CARD_H = 456;
// Instagram's embed draws a profile header above the video and a like/comment bar
// below it. We crop the embed down to just the video area using these measurements.
// If Instagram ever changes its embed layout, tweak IG_HEADER_H / IG_EMBED_W.
const IG_EMBED_W = 336; // embed width in px (Instagram's minimum is 326)
const IG_HEADER_H = 56; // height of the profile header above the video
const IG_MEDIA_H = IG_EMBED_W * 1.25; // the video sits in a 4:5 frame
const IG_VIDEO_W = (IG_MEDIA_H * 9) / 16; // a 9:16 reel inside that frame
const IG_SCALE = MEDIA_CARD_H / IG_MEDIA_H; // zoom so the reel fills the card
const IG_OFFSET_X = Math.round(((IG_EMBED_W - IG_VIDEO_W) / 2) * IG_SCALE);
const IG_OFFSET_Y = Math.round(IG_HEADER_H * IG_SCALE);

// Turns an Instagram post/reel link into its embeddable URL (null if invalid).
function getInstagramEmbedUrl(url) {
  const m = String(url).match(/instagram\.com\/(?:[^/]+\/)?(reels?|p|tv)\/([A-Za-z0-9_-]+)/);
  if (!m) return null;
  const type = m[1] === "reels" ? "reel" : m[1];
  return `https://www.instagram.com/${type}/${m[2]}/embed`;
}

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
      <p className="mb-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[color:var(--rt-laterite)]">
        <span className="h-px w-8 bg-[color:var(--rt-laterite)]" />
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

  // Keeps the cinematic loader on screen for a minimum time.
  const [minTimeDone, setMinTimeDone] = useState(MIN_LOADER_MS === 0);
  useEffect(() => {
    if (MIN_LOADER_MS === 0) return;
    const t = setTimeout(() => setMinTimeDone(true), MIN_LOADER_MS);
    return () => clearTimeout(t);
  }, []);

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

  // ---- Videos: one player on top, the playlist underneath ----------------
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const activeVideo = videosData[activeVideoIdx];

  // ---- Reels: one reel at a time, arrows + dots to move through the rest ----
  // Only the visible reel's embed is loaded, so six reels don't mean six
  // heavy Instagram iframes on page load. No auto-advance: a reel that is
  // playing shouldn't be swapped out from under the viewer.
  const reels = reelsData
    .map((r) => ({ ...r, embed: getInstagramEmbedUrl(r.url) }))
    .filter((r) => r.embed);
  const [reelIdx, setReelIdx] = useState(0);
  const goToPrevReel = () => setReelIdx((i) => (i - 1 + reels.length) % reels.length);
  const goToNextReel = () => setReelIdx((i) => (i + 1) % reels.length);

  // ---- About ---------------------------------------------------------------------
  // Society = teal, Economy = laterite, Governance = ink. `tint` picks the
  // hover glow (see .rt-card.tint-* in the style block below).
  const aboutPillars = [
    {
      title: "Society",
      icon: Handshake,
      color: "text-[color:var(--rt-teal)]",
      bg: "bg-[color:var(--rt-teal-tint)]",
      tint: "tint-teal",
      image: SocietyImg,
      route: "/society",
      description:
        "Close-knit fishing and farming communities, festivals that pull whole villages together, and a homestay culture built on hospitality.",
    },
    {
      title: "Economy",
      icon: TrendingUp,
      color: "text-[color:var(--rt-laterite)]",
      bg: "bg-[color:var(--rt-laterite-tint)]",
      tint: "tint-laterite",
      image: EconomyImg,
      route: "/economy",
      description:
        "Alphonso mango and cashew exports, a working fishing harbour, and tourism that increasingly supports small, local businesses.",
    },
    {
      title: "Good Governance",
      icon: ShieldCheck,
      color: "text-[color:var(--rt-ink)]",
      bg: "bg-[color:var(--rt-ink-tint)]",
      tint: "tint-ink",
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
        /* Slim scrollbar */
        .rt-feed { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
        .rt-feed::-webkit-scrollbar { height: 6px; width: 6px; }
        .rt-feed::-webkit-scrollbar-track { background: transparent; }
        .rt-feed::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        .rt-feed::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        /* Card treatment: a soft resting shadow that deepens and tints toward
           the card's colour on hover, with a gentle lift.
           tint-laterite / tint-teal / tint-kokum / tint-ink */
        .rt-card {
          box-shadow: 0 12px 32px -16px rgba(15, 23, 42, 0.28);
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease;
        }
        .rt-card:hover { transform: translateY(-6px); }
        .rt-card.tint-laterite:hover { box-shadow: 0 32px 56px -20px rgba(180, 83, 42, 0.45); }
        .rt-card.tint-teal:hover     { box-shadow: 0 32px 56px -20px rgba(15, 107, 104, 0.42); }
        .rt-card.tint-kokum:hover    { box-shadow: 0 32px 56px -20px rgba(142, 47, 74, 0.4); }
        .rt-card.tint-ink:hover      { box-shadow: 0 32px 56px -20px rgba(10, 42, 60, 0.45); }

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

        @media (prefers-reduced-motion: reduce) {
          .rt-card, .rt-card:hover { transition: none; transform: none; }
        }
      `}</style>

      {/* ================= Hero — plain video + category tabs ================= */}
      <HeroVideoTabs />

      {/* ================= Experiences — photo-tile mosaic ================= */}
      <ExperiencesMosaic />
      <FestivalsEvents />

      {/* ================= Stories & Videos ================= */}
      <section
        id="stories"
        className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-[color:var(--rt-mist)] to-white px-5 py-16 sm:px-10 sm:py-24 lg:px-16"
      >
        <span aria-hidden="true" className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[color:var(--rt-teal-tint)] blur-3xl" />

        <div className="relative mx-auto grid max-w-[1680px] grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_256px] xl:gap-x-8">
          {/* Stories — 2 published stories per page, sliding as a page */}
          <div>
            <SectionHead
              compact
              eyebrow="Read"
              title="Stories from Ratnagiri"
              icon={BookOpen}
              iconClass="bg-[color:var(--rt-teal-tint)] text-[color:var(--rt-teal)]"
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
                  <div className="-mx-2 overflow-hidden px-2 pb-6 pt-2 [mask-image:linear-gradient(to_right,transparent,#000_8px,#000_calc(100%-8px),transparent)]">
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
                              className="rt-card tint-teal group flex h-[456px] min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white text-left ring-1 ring-slate-200/60"
                            >
                              <div className="relative min-h-0 flex-1 overflow-hidden bg-slate-100">
                                {story.cover_image && (
                                  <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${story.cover_image})` }}
                                  />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                {story.category?.name && (
                                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[color:var(--rt-teal)] shadow-sm">
                                    {story.category.name}
                                  </span>
                                )}
                              </div>

                              <div className="shrink-0 p-5">
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

                                <span className="t-small inline-flex items-center gap-1 font-semibold text-[color:var(--rt-teal)]">
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
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:scale-105 hover:text-[color:var(--rt-teal)] hover:shadow-[0_10px_25px_-8px_rgba(15,107,104,0.45)]"
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
                              i === storyPage ? "w-6 bg-[color:var(--rt-teal)]" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={goToNextStoryPage}
                        aria-label="Next stories"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:scale-105 hover:text-[color:var(--rt-teal)] hover:shadow-[0_10px_25px_-8px_rgba(15,107,104,0.45)]"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Videos — kokum. One player on top, the playlist underneath */}
          <div className="min-w-0">
            <SectionHead
              compact
              eyebrow="Watch"
              title="Videos"
              icon={PlayCircle}
              iconClass="bg-[color:var(--rt-kokum-tint)] text-[color:var(--rt-kokum)]"
            />

            <div className="pb-6 pt-2">
              <div className="rt-card tint-kokum flex h-[456px] flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/60">
                <div className="relative aspect-video shrink-0 bg-black">
                  {playingVideoId === activeVideo.id ? (
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                      title={activeVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      onClick={() => setPlayingVideoId(activeVideo.id)}
                      aria-label={`Play ${activeVideo.title}`}
                      className="group/video absolute inset-0 h-full w-full"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/video:scale-105"
                        style={{
                          backgroundImage: `url(https://img.youtube.com/vi/${activeVideo.id}/hqdefault.jpg)`,
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 transition group-hover/video:bg-black/10" />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-[color:var(--rt-kokum)] shadow-lg ring-8 ring-white/25 transition-transform group-hover/video:scale-110">
                          <PlayCircle size={28} />
                        </span>
                      </span>
                    </button>
                  )}
                </div>

                <div className="flex min-h-0 flex-1 flex-col">
                  <p className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Playlist · {videosData.length} video{videosData.length === 1 ? "" : "s"}
                  </p>
                  <ul className="rt-feed min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2">
                    {videosData.map((v, i) => {
                      const isActive = i === activeVideoIdx;
                      return (
                        <li key={v.id}>
                          <button
                            onClick={() => {
                              setActiveVideoIdx(i);
                              setPlayingVideoId(v.id);
                            }}
                            aria-current={isActive ? "true" : undefined}
                            className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${
                              isActive
                                ? "bg-[color:var(--rt-kokum-tint)] ring-1 ring-[color:var(--rt-kokum-line)]"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <span className="relative h-12 w-[5.25rem] shrink-0 overflow-hidden rounded-lg bg-slate-200">
                              <img
                                src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                                alt=""
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                              {isActive && (
                                <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white">
                                  <PlayCircle size={18} />
                                </span>
                              )}
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[11px] font-bold text-[color:var(--rt-kokum)]">
                                {isActive ? (playingVideoId === v.id ? "Now playing" : "Selected") : `Video ${i + 1}`}
                              </span>
                              <span className="line-clamp-2 block text-sm font-semibold leading-snug text-slate-900">
                                {v.title}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>

            <a
              href={`https://www.youtube.com/playlist?list=${VIDEOS_PLAYLIST_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rt-cta t-small inline-flex items-center gap-1 font-semibold text-[color:var(--rt-kokum)] hover:text-[color:var(--rt-kokum-dark)]"
            >
              Open full playlist <ExternalLink size={12} className="rt-cta-arrow" />
            </a>
          </div>

          {/* Reels — kokum. Instagram reels cropped to just the video, one at a time */}
          <div className="mx-auto w-full min-w-0 max-w-[256px] xl:mx-0">
            <SectionHead
              compact
              eyebrow="Follow"
              title="Reels"
              icon={Film}
              iconClass="bg-[color:var(--rt-kokum-tint)] text-[color:var(--rt-kokum)]"
            />

            {reels.length === 0 ? (
              <div className="mb-6 mt-2 flex h-[456px] flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl bg-[color:var(--rt-kokum-tint)] p-6 text-center ring-1 ring-[color:var(--rt-kokum-line)]">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[color:var(--rt-kokum)] shadow-md">
                  <InstagramIcon size={26} />
                </span>
                <p className="t-h3 text-slate-900">Reels coming soon</p>
                <p className="t-small text-slate-600">
                  Short clips from beaches, forts and villages across Ratnagiri.
                </p>
                <a
                  href={REELS_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[color:var(--rt-laterite)] px-5 py-2 text-xs font-semibold text-white shadow-md shadow-[#B4532A]/30 transition hover:bg-[color:var(--rt-laterite-dark)]"
                >
                  Follow on Instagram
                </a>
              </div>
            ) : (
              <>
                <div className="pb-6 pt-2">
                  <div className="relative h-[456px] w-full overflow-hidden rounded-2xl bg-black shadow-[0_12px_32px_-16px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/60">
                    <div
                      className="absolute inset-0 flex transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${reelIdx * 100}%)` }}
                    >
                      {reels.map((reel, i) => (
                        <div
                          key={reel.url}
                          className="relative h-full w-full shrink-0 overflow-hidden bg-[color:var(--rt-kokum-tint)]"
                        >
                          {i === reelIdx ? (
                            <>
                              {/* The embed is drawn oversized and shifted so only the video shows */}
                              <iframe
                                src={reel.embed}
                                title={`Instagram reel ${i + 1} of ${reels.length}`}
                                loading="lazy"
                                scrolling="no"
                                allow="encrypted-media; picture-in-picture"
                                allowFullScreen
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: IG_EMBED_W,
                                  height: 760,
                                  border: 0,
                                  transformOrigin: "0 0",
                                  transform: `translate(-${IG_OFFSET_X}px, -${IG_OFFSET_Y}px) scale(${IG_SCALE})`,
                                }}
                              />
                              <a
                                href={reel.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm transition hover:bg-black/75"
                              >
                                <InstagramIcon size={11} /> Watch on Instagram
                              </a>
                            </>
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center text-[color:var(--rt-kokum)] opacity-40">
                              <InstagramIcon size={40} />
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {reels.length > 1 && (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={goToPrevReel}
                      aria-label="Previous reel"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:scale-105 hover:text-[color:var(--rt-kokum)] hover:shadow-[0_10px_25px_-8px_rgba(142,47,74,0.4)]"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex gap-1.5">
                      {reels.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setReelIdx(i)}
                          aria-label={`Go to reel ${i + 1}`}
                          className={`h-1.5 rounded-full transition-all ${
                            i === reelIdx ? "w-6 bg-[color:var(--rt-kokum)]" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={goToNextReel}
                      aria-label="Next reel"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:scale-105 hover:text-[color:var(--rt-kokum)] hover:shadow-[0_10px_25px_-8px_rgba(142,47,74,0.4)]"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}

                <a
                  href={REELS_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rt-cta t-small mt-5 inline-flex items-center gap-1 font-semibold text-[color:var(--rt-kokum)] hover:text-[color:var(--rt-kokum-dark)]"
                >
                  Follow on Instagram <ExternalLink size={12} className="rt-cta-arrow" />
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ================= About (Society / Economy / Governance) ================= */}
      <section id="about" className="relative scroll-mt-24 overflow-hidden bg-white px-5 py-16 sm:px-10 sm:py-24 lg:px-16">
        <span aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full bg-[color:var(--rt-ink-tint)] blur-3xl" />

        <div className="relative mx-auto max-w-[1680px]">
          <SectionHead
            eyebrow="Know the district"
            title="Society, Economy and Governance"
            icon={Landmark}
            iconClass="bg-[color:var(--rt-ink-tint)] text-[color:var(--rt-ink)]"
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
                <div className="rt-scrim-card absolute inset-0" />
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
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[color:var(--rt-gold)]">
                      Learn more <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}