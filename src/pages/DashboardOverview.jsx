import { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Landmark,
  Drama,
  Users,
  PlayCircle,
  ShieldCheck,
  Search,
  TrendingUp,
  Handshake,
  ExternalLink,
  Calendar,
  User,
} from "lucide-react";
import { useLocations } from "../context/LocationsContext";
import { useNavigate } from "react-router-dom";
import { blogApi } from "../api/blogApi";
import Slider1 from "../assets/Sliders1.jpg";
import Slider2 from "../assets/Sliders2.jpg";
import Slider3 from "../assets/Sliders3.jpg";
import Slider4 from "../assets/Sliders4.jpg";
import Slider5 from "../assets/Sliders5.jpg";
import Slider6 from "../assets/Sliders6.jpg";
import KokaniFoodImg from "../assets/Kokani-Food.jpeg";
import GuidedWalksImg from "../assets/Guided-Walks.jpg";
import CommunityInteractionImg from "../assets/Community-interaction.jpg";

const heroImages = [Slider1, Slider2, Slider3, Slider4, Slider5, Slider6];

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
   Konkan coastline backdrop for the snapshot section.
   Replaces the flat navy block: hazy Sahyadri ridge, a lighthouse on
   the headland, coconut palms, a fishing boat and layered surf.
   Purely decorative -> aria-hidden + pointer-events-none.
------------------------------------------------------------------ */
function KonkanBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* sky -> haze -> sand */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#EAF5F3_0%,#E4F0EE_38%,#F7EEE0_100%)]" />

      {/* low afternoon sun */}
      <div className="absolute top-[-90px] right-[10%] w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(232,163,61,0.22)_0%,rgba(232,163,61,0)_68%)]" />

      {/* laterite grain */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(#0b3149 0.6px, transparent 0.6px)",
          backgroundSize: "20px 20px",
          opacity: 0.05,
        }}
      />

      <svg
        className="absolute inset-x-0 bottom-0 w-full h-full"
        viewBox="0 0 1440 620"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >
        {/* far Sahyadri ridge */}
        <path
          d="M0 322 L96 286 L178 312 L262 262 L352 306 L438 272 L536 318 L628 288 L720 326 L812 292 L904 330 L1002 296 L1096 334 L1190 300 L1286 336 L1378 306 L1440 330 L1440 620 L0 620 Z"
          fill="#0b3149"
          opacity="0.07"
        />
        {/* near headland */}
        <path
          d="M0 386 L120 362 L248 392 L376 356 L512 398 L648 370 L788 404 L928 374 L1070 406 L1212 378 L1348 408 L1440 388 L1440 620 L0 620 Z"
          fill="#0f766e"
          opacity="0.10"
        />

        {/* lighthouse on the headland */}
        <g opacity="0.16" fill="#0b3149">
          <path d="M1246 380 L1252 300 L1268 300 L1274 380 Z" />
          <rect x="1248" y="288" width="24" height="9" rx="2" />
          <path d="M1254 288 L1260 276 L1266 288 Z" />
        </g>

        {/* coconut palms, left cluster */}
        <g opacity="0.15" fill="#0f766e">
          <path d="M92 402 C96 360 100 336 106 306 L114 307 C110 338 108 362 106 402 Z" />
          <path d="M110 306 C86 288 62 288 44 302 C68 296 92 300 110 312 Z" />
          <path d="M110 306 C132 284 160 282 180 294 C154 292 130 298 112 312 Z" />
          <path d="M110 304 C104 280 86 262 62 256 C86 268 100 284 108 308 Z" />
          <path d="M110 304 C120 280 142 264 166 260 C142 272 124 288 114 310 Z" />
        </g>
        {/* palm, right */}
        <g opacity="0.13" fill="#0f766e">
          <path d="M1366 414 C1370 372 1374 348 1380 318 L1388 319 C1384 350 1382 374 1380 414 Z" />
          <path d="M1384 318 C1360 300 1336 300 1318 314 C1342 308 1366 312 1384 324 Z" />
          <path d="M1384 318 C1406 296 1434 294 1454 306 C1428 304 1404 310 1386 324 Z" />
          <path d="M1384 316 C1378 292 1360 274 1336 268 C1360 280 1374 296 1382 320 Z" />
        </g>

        {/* fishing boat — gently bobbing */}
        <g className="rt-boat" opacity="0.14" fill="#B4532A">
          <path d="M604 442 L700 442 L688 460 L616 460 Z" />
          <rect x="648" y="404" width="4" height="38" />
          <path d="M652 408 L684 438 L652 438 Z" />
        </g>

        {/* layered surf */}
        <path
          d="M0 470 C160 448 320 492 480 470 C640 448 800 492 960 470 C1120 448 1280 492 1440 470 L1440 620 L0 620 Z"
          fill="#0f766e"
          opacity="0.12"
        />
        <path
          d="M0 512 C180 492 300 534 480 514 C660 494 790 536 970 516 C1150 496 1280 534 1440 514 L1440 620 L0 620 Z"
          fill="#0b3149"
          opacity="0.08"
        />
        <path
          d="M0 556 C200 538 340 578 540 560 C740 542 880 580 1080 562 C1230 549 1330 566 1440 556 L1440 620 L0 620 Z"
          fill="#F7EEE0"
          opacity="0.95"
        />
      </svg>
    </div>
  );
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

/* ------------------------------------------------------------------
   Mango-grove backdrop for the Experiences panel — warm orchard
   light and a sprig of mango leaves in the corner, echoing the
   Alphonso season rather than a generic white card background.
------------------------------------------------------------------ */
function MangoGroveBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#FFFDF9_0%,#FDF6EC_60%,#FDF3E4_100%)]" />
      <div className="absolute top-[-70px] left-[-60px] w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.09)_0%,rgba(217,119,6,0)_70%)]" />
      <div className="absolute bottom-[-90px] right-[-50px] w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(180,83,42,0.10)_0%,rgba(180,83,42,0)_70%)]" />
      <svg
        className="absolute right-6 top-6 w-40 h-40 opacity-[0.07]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path d="M20 190 C50 140 80 110 130 80" stroke="#7C4A24" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="136" cy="76" rx="20" ry="10" transform="rotate(-32 136 76)" fill="#B4532A" />
        <ellipse cx="108" cy="98" rx="17" ry="8" transform="rotate(-22 108 98)" fill="#D97706" />
        <ellipse cx="80" cy="122" rx="15" ry="7" transform="rotate(-15 80 122)" fill="#B4532A" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------
   Fort-skyline backdrop for the About panel — a faint laterite-fort
   silhouette along the base, standing in for Ratnagiri's forts and
   the "Good Governance" pillar without competing with the cards.
------------------------------------------------------------------ */
function FortSkylineBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#FAFBFC_0%,#F2F6F5_100%)]" />
      <svg
        className="absolute inset-x-0 bottom-0 w-full h-44"
        viewBox="0 0 1440 200"
        preserveAspectRatio="xMidYMax slice"
        fill="#0b3149"
        opacity="0.05"
      >
        <path d="M0 200 L0 140 L40 140 L40 110 L70 110 L70 140 L110 140 L110 90 L130 90 L130 70 L150 70 L150 90 L170 90 L170 140 L230 140 L230 120 L260 120 L260 140 L360 140 L360 100 L390 100 L390 80 L410 80 L410 100 L440 100 L440 140 L560 140 L560 200 Z" />
        <path d="M760 200 L760 130 L800 130 L800 95 L830 95 L830 60 L860 60 L860 95 L890 95 L890 130 L930 130 L930 200 Z" />
        <path d="M1080 200 L1080 150 L1120 150 L1120 115 L1150 115 L1150 150 L1200 150 L1200 200 Z" />
        <path d="M1280 200 L1280 140 L1310 140 L1310 115 L1340 115 L1340 90 L1370 90 L1370 115 L1400 115 L1400 140 L1440 140 L1440 200 Z" />
      </svg>
    </div>
  );
}

export default function DashboardOverview() {
  const { locations, loading } = useLocations();
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);
  const loadingMessages = [
    "Boarding the Konkan Railway...",
    "Chugging past the Sahyadris...",
    "Crossing the ghats to Ratnagiri...",
    "Passing through mango orchards...",
    "Ratnagiri approaching...",
  ];
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

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

  // Hero search bar. TODO: point this at the real search/results route once
  // it exists — for now it lands on /search?q=...
  const [searchQuery, setSearchQuery] = useState("");
  const handleHeroSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    // If we have a live match in the site index, go straight there;
    // otherwise fall back to the dedicated search results page.
    const bestMatch = searchIndex.find((item) =>
      item.label?.toLowerCase().includes(q.toLowerCase())
    );
    navigate(bestMatch ? bestMatch.route : `/search?q=${encodeURIComponent(q)}`);
    setShowSuggestions(false);
  };

  // ---- Panel 2: Experiences -------------------------------------------------
    const experiencesData = [
    {
      title: "Guided Walks",
      description: "Local guides lead you through forts, markets and coastal trails.",
      image: GuidedWalksImg,
      route: "/guided-walks",
    },
    {
      title: "Konkani Food",
      description: "Taste solkadhi, fish curry-rice and other Malvani classics.",
      image: KokaniFoodImg,
      route: "/traditional-food",
    },
    {
      title: "Community Interaction",
      description: "Meet fisherfolk, farmers and artisans in their own villages.",
      image: CommunityInteractionImg,
      route: "/village-life",
    },
  ];

  // "Upcoming Events" scrolling list — replaces the single Upcoming Event tile
  const whatsNewData = [
    {
      title: "Ganeshotsav",
      description: "Konkan's biggest festival is coming — reserve early for the best rates.",
      image: Slider1,
      badge: "NEW",
      route: "/homestays",
    },
    {
      title: "New Guided Trail: Fort to Bhagwati Bandar",
      description: "A 3 km coastal walk with a local guide, launching this season.",
      image: Slider3,
      badge: "NEW",
      route: "/guided-walks",
    },
    {
      title: "Monsoon Travel Advisory",
      description: "Some beach and fort routes have seasonal restrictions.",
      image: Slider6,
      route: "/transport",
    },
    {
      title: "Alphonso Season Calendar",
      description: "Orchard visits and tasting trails run from March to May.",
      image: Slider2,
      route: "/traditional-food",
    },
  ];

  // ---- Panel 3: Stories & Videos --------------------------------------------
  // Stories are the real, published posts from the Stories section (same
  // blogApi the /stories page uses) — no mock data here.
  const [stories, setStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [storiesError, setStoriesError] = useState(null);

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
      image: Slider3,
      description:
        "Close-knit fishing and farming communities, festivals that pull whole villages together, and a homestay culture built on hospitality.",
    },
    {
      title: "Economy",
      icon: TrendingUp,
      color: "text-amber-700",
      bg: "bg-amber-50",
      tint: "tint-amber",
      image: Slider2,
      description:
        "Alphonso mango and cashew exports, a working fishing harbour, and tourism that increasingly supports small, local businesses.",
    },
    {
      title: "Good Governance",
      icon: ShieldCheck,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      tint: "tint-navy",
      image:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
      description:
        "The district administration and tourism office work with village panchayats to register homestays and maintain public beaches and forts.",
    },
  ];

  const footerColumns = [
    {
      heading: "Destinations",
      links: [
        { label: "Interactive Map", route: "/map" },
        { label: "Itineraries", route: "/itineraries" },
        { label: "How to Reach", route: "/how-to-reach" },
        { label: "Village Life", route: "/village-life" },
        { label: "Cultural Events", route: "/cultural-events" },
      ],
    },
    {
      heading: "Explore and Learn",
      links: [
        { label: "Stories", route: "/stories" },
        { label: "Videos", route: "/videos" },
        { label: "Resources", route: "/resources" },
        { label: "Rules for Tourists", route: "/rules" },
        { label: "Guided Walks", route: "/guided-walks" },
      ],
    },
    {
      heading: "About",
      links: [
        { label: "Our Story", route: "/about" },
        { label: "Konkani Food", route: "/konkani-food" },
        { label: "Tourism Fund", route: "/tourism-fund" },
        { label: "Register a Homestay", route: "/registration" },
        { label: "Enquiries & FAQ", route: "/faq" },
      ],
    },
  ];

  const socialLinks = [
    { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com" },
    { icon: YoutubeIcon, label: "YouTube", href: "https://youtube.com" },
    { icon: FacebookIcon, label: "Facebook", href: "https://facebook.com" },
    { icon: TwitterIcon, label: "Twitter", href: "https://twitter.com" },
  ];

  // ---- Site-wide search index -------------------------------------------
  // Flattens every section of this page (experiences, what's new, stories,
  // footer links) plus the live `locations` data from context into one
  // searchable list, so the hero search bar can actually find things across
  // the whole site instead of only deep-linking to a /search route that may
  // not exist yet.
  const searchIndex = [
    ...experiencesData.map((c) => ({ label: c.title, sub: c.description, route: c.route })),
    ...whatsNewData.map((w) => ({ label: w.title, sub: w.description, route: w.route })),
    ...stories.map((s) => ({
      label: s.title,
      sub: s.excerpt,
      route: `/stories/${s.slug}`,
    })),
    ...footerColumns.flatMap((col) =>
      col.links.map((l) => ({ label: l.label, sub: col.heading, route: l.route }))
    ),
    ...(locations || []).map((l) => ({
      label: l.name || l.title || "Untitled place",
      sub: l.category || l.type || "Place",
      route: l.route || (l.slug ? `/place/${l.slug}` : l.id ? `/place/${l.id}` : "/map"),
    })),
  ];

  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchResults = searchQuery.trim()
    ? searchIndex
        .filter((item) =>
          item.label?.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
        .slice(0, 6)
    : [];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="relative w-full max-w-md h-20 overflow-hidden mb-6">
          <div className="absolute top-1/2 -translate-y-1/2 w-full border-b-2 border-dashed border-slate-300" />
          <div className="absolute top-1/2 -translate-y-1/2 text-5xl animate-[train_6s_linear_infinite]">
            🚂
          </div>
        </div>
        <p className="font-medium text-slate-500 transition-opacity duration-300">
          {loadingMessages[msgIndex]}
        </p>
        <style>{`
          @keyframes train {
            0% { left: -10%; }
            100% { left: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Fonts + shared animation. TODO: once fonts are added to the Tailwind
          config, move this @import into index.html <head> as <link> tags. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600&display=swap');

        .font-display { font-family: 'Fraunces', Georgia, serif; }
        .font-body { font-family: 'Plus Jakarta Sans', 'Noto Sans Devanagari', system-ui, sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.6s ease-out both; }

        /* Slim scrollbar, reused for horizontal strips and the Upcoming
           Events list */
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

        /* Gentle bob for the fishing boat in the hero backdrop — the one
           bit of ambient, non-user-triggered motion on the page. */
        @keyframes boatBob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(-0.6deg); }
        }
        .rt-boat { animation: boatBob 6s ease-in-out infinite; transform-origin: 652px 460px; }
        @media (prefers-reduced-motion: reduce) {
          .rt-boat { animation: none; }
        }

        /* CTA arrow nudges right on hover instead of the whole row moving */
        .rt-cta-arrow { transition: transform 0.25s ease; }
        .rt-cta:hover .rt-cta-arrow { transform: translateX(3px); }
      `}</style>

      {/* ================= Panel 1 — Hero carousel (photo only, full width) ================= */}
      <section className="relative px-2 sm:px-3 lg:px-4 py-2 sm:py-3 overflow-hidden">
        <KonkanBackdrop />

        <div className="relative max-w-[1680px] mx-auto">
          {/* Full-width rotating photo carousel with search bar + caption */}
          <div className="relative rounded-2xl overflow-hidden h-[460px] sm:h-[580px] lg:h-[660px] shadow-[0_35px_70px_-20px_rgba(11,49,73,0.5)] ring-1 ring-black/5">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40" />

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

            {/* content block — vertically centered in the frame, sized to
                sit comfortably instead of being cramped in the top corner */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 lg:px-14 animate-fade-up">
              <div className="max-w-xl">
                <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] text-white/80 mb-3 font-body">
                  Explore &middot; Experience &middot; Support Local
                </p>
                <h1 className="font-display text-white leading-[1.05] text-4xl sm:text-5xl lg:text-6xl mb-4">
                  Discover <span className="text-teal-300">Ratnagiri</span>
                </h1>
                <p className="text-white/85 text-sm sm:text-base max-w-md font-body mb-6 leading-relaxed">
                  Where the Sahyadri hills meet the Arabian Sea — beaches, forts,
                  homestays and Konkan flavours, all in one place.
                </p>

                {/* search bar — searches across the whole site (experiences,
                    what's new, stories, footer links and any live locations
                    from context), with a live dropdown */}
                <form onSubmit={handleHeroSearch} className="relative max-w-md">
                  <div className="flex items-center gap-2 bg-white/95 backdrop-blur rounded-full pl-4 pr-1.5 py-2 shadow-[0_18px_40px_-15px_rgba(11,49,73,0.55)] ring-1 ring-transparent focus-within:ring-2 focus-within:ring-teal-400/60 transition-shadow duration-300">
                    <Search size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      placeholder="Search the whole site — beaches, forts, stays..."
                      className="flex-1 min-w-0 text-sm text-slate-700 placeholder:text-slate-400 bg-transparent outline-none font-body"
                    />
                    <button
                      type="submit"
                      className="shrink-0 bg-[#0b3149] hover:bg-[#0a2b3f] text-white text-xs font-semibold px-4 py-2 rounded-full transition"
                    >
                      Search
                    </button>
                  </div>

                  {showSuggestions && searchResults.length > 0 && (
                    <ul className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white rounded-xl shadow-xl ring-1 ring-black/10 overflow-hidden z-20">
                      {searchResults.map((result, i) => (
                        <li key={`${result.label}-${i}`} className={i > 0 ? "border-t border-slate-100" : ""}>
                          <button
                            type="button"
                            onMouseDown={() => {
                              navigate(result.route);
                              setSearchQuery("");
                              setShowSuggestions(false);
                            }}
                            className="w-full flex items-center justify-between gap-3 text-left px-4 py-2.5 hover:bg-slate-50 transition"
                          >
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-slate-800 truncate">
                                {result.label}
                              </span>
                              {result.sub && (
                                <span className="block text-xs text-slate-400 truncate">
                                  {result.sub}
                                </span>
                              )}
                            </span>
                            <ChevronRight size={14} className="text-slate-300 shrink-0" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </form>
              </div>
            </div>

            <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between gap-4">
              <p className="font-display italic text-white/90 text-sm sm:text-base border-b border-dashed border-white/40 pb-1">
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
      <section className="relative overflow-hidden px-5 sm:px-10 lg:px-16 py-12 sm:py-16">
        <MangoGroveBackdrop />
        <div className="relative max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Drama size={16} />
              Experiences
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Local Experiences
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-lg mb-8">
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
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-white/75 text-xs mt-1 leading-snug">{description}</p>
                </div>
              </button>
            ))}

            {/* Upcoming Events — static list panel, scrollable, no auto-scroll */}
            <div className="rt-card tint-amber rounded-xl overflow-hidden h-96 flex flex-col bg-white">
              <div className="flex items-center justify-between px-4 py-3 bg-[#B4532A] text-white shrink-0">
                <p className="text-sm font-semibold">Upcoming Events</p>
                <button
                  onClick={() => navigate("/whats-new")}
                  className="text-xs font-medium text-white/85 hover:text-white transition"
                >
                  More
                </button>
              </div>
              <div className="rt-feed flex-1 overflow-y-auto relative">
                <div className="divide-y divide-slate-100">
                  {whatsNewData.map(({ title, description, image, badge, route }, idx) => (
                    <button
                      key={`${title}-${idx}`}
                      onClick={() => navigate(route)}
                      className="w-full flex items-start gap-3 text-left px-4 py-3 hover:bg-slate-50 transition bg-white"
                    >
                      <div
                        className="w-10 h-10 rounded-md bg-cover bg-center shrink-0"
                        style={{ backgroundImage: `url(${image})` }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-slate-800 truncate">{title}</p>
                          {badge && (
                            <span className="shrink-0 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                              {badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                          {description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Panel 3 — Stories & Videos ================= */}
      <section className="relative overflow-hidden bg-sky-50 px-5 sm:px-10 lg:px-16 py-12 sm:py-16">
        <svg
          className="absolute inset-x-0 bottom-0 w-full h-32 opacity-[0.06] pointer-events-none"
          viewBox="0 0 1440 160"
          preserveAspectRatio="xMidYMax slice"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0 90 C160 60 320 120 480 90 C640 60 800 120 960 90 C1120 60 1280 120 1440 90 L1440 160 L0 160 Z"
            fill="#0f766e"
          />
        </svg>

        <div className="relative max-w-[1680px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Stories — 2 published stories per page, sliding as a page */}
          <div>
            <Reveal>
              <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
                <Users size={16} />
                Stories
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-5">
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
                                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 text-teal-700 text-[9px] font-bold rounded uppercase tracking-wide">
                                    {story.category.name}
                                  </span>
                                )}
                              </div>

                              <div className="p-4">
                                <p className="text-sm font-semibold text-slate-800 leading-snug mb-1 line-clamp-2">
                                  {story.title}
                                </p>

                                {(story.author_name || story.published_at) && (
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400 mb-1.5">
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

                                <p className="text-xs text-slate-600 leading-snug line-clamp-2 mb-2">
                                  {story.excerpt || "Read the full story to find out more."}
                                </p>

                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
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
              <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-[0.15em] mb-3">
                <PlayCircle size={16} />
                Videos
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-5">
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
                            <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">
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
                className="rt-cta mt-4 inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                Open full playlist <ExternalLink size={12} className="rt-cta-arrow" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Panel 4 — About (Society / Economy / Governance) ================= */}
      <section className="relative overflow-hidden px-5 sm:px-10 lg:px-16 py-12 sm:py-16">
        <FortSkylineBackdrop />
        <div className="relative max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-slate-800 text-xs font-extrabold uppercase tracking-[0.15em] mb-3">
              <Landmark size={16} />
              About the District
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Society, Economy &amp; Governance
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-lg mb-8">
              A quick look at what keeps Ratnagiri running, beyond the tourist
              trail.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {aboutPillars.map(({ title, icon: Icon, color, bg, tint, image, description }) => (
              <div
                key={title}
                className={`rt-card ${tint} group rounded-xl overflow-hidden relative h-96`}
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
                  <p className="text-white font-semibold text-base">{title}</p>
                  <p className="text-white/80 text-xs mt-1.5 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="relative overflow-hidden bg-slate-900 mt-0">
        <svg
          className="absolute inset-x-0 top-0 w-full h-20 opacity-[0.05] pointer-events-none"
          viewBox="0 0 1440 100"
          preserveAspectRatio="xMidYMin slice"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0 40 C160 10 320 60 480 40 C640 20 800 60 960 40 C1120 20 1280 60 1440 40 L1440 0 L0 0 Z"
            fill="#5EEAD4"
          />
        </svg>
        <svg
          className="absolute right-0 bottom-0 w-56 h-56 opacity-[0.05] pointer-events-none"
          viewBox="0 0 200 200"
          fill="#5EEAD4"
          aria-hidden="true"
        >
          <path d="M90 200 C94 150 98 120 106 84 L114 85 C110 122 108 152 106 200 Z" />
          <path d="M110 84 C80 60 50 60 26 78 C56 70 86 76 110 90 Z" />
          <path d="M110 84 C140 56 174 54 198 70 C166 68 136 76 112 92 Z" />
        </svg>

        <div className="relative px-6 sm:px-10 py-12 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_1fr_1fr] gap-10 lg:gap-8">
            <div>
              <h2 className="font-display italic text-2xl text-white mb-3">
                Ratnagiri Tourism
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs">
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
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-teal-600 hover:text-white hover:-translate-y-1 hover:shadow-[0_10px_22px_-6px_rgba(45,212,191,0.55)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {footerColumns.map((col) => (
              <div key={col.heading}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-500 mb-4">
                  {col.heading}
                </p>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <button
                        onClick={() => navigate(link.route)}
                        className="text-sm text-slate-300 hover:text-white transition-colors duration-200 text-left cursor-pointer focus:outline-none focus:underline"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Ratnagiri Tourism. All rights reserved.
            </p>
            <div className="flex gap-5">
              <button
                onClick={() => navigate("/privacy")}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors duration-200"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => navigate("/terms")}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors duration-200"
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