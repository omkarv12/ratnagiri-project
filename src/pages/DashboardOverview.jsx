import { useState, useEffect } from "react";
import {
  Compass,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Star,
  Waves,
  Landmark,
  TreePine,
  UtensilsCrossed,
  Drama,
  Users,
  Navigation,
  Ruler,
  Route as RouteIcon,
  SlidersHorizontal,
  Home,
  Bus,
  Sun,
  Download,
  Play,
  PlayCircle,
  BookOpen,
  ShieldCheck,
  Search,
  CalendarDays,
  TrendingUp,
  Handshake,
} from "lucide-react";
import { useLocations } from "../context/LocationsContext";
import { useNavigate } from "react-router-dom";
import Slider1 from "../assets/Sliders1.jpg";
import Slider2 from "../assets/Sliders2.jpg";
import Slider3 from "../assets/Sliders3.jpg";
import Slider4 from "../assets/Sliders4.jpg";
import Slider5 from "../assets/Sliders5.jpg";
import Slider6 from "../assets/Sliders6.jpg";

const heroImages = [Slider1, Slider2, Slider3, Slider4, Slider5, Slider6];

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

        {/* fishing boat */}
        <g opacity="0.14" fill="#B4532A">
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
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const exploreCategories = [
    {
      title: "Beaches",
      subtitle: "Clean shores & golden sands",
      icon: Waves,
      iconColor: "text-sky-600",
      image:
        "https://images.unsplash.com/photo-1520942702018-0862200e6873?auto=format&fit=crop&w=600&q=80",
      route: "/category/beaches",
    },
    {
      title: "Forts",
      subtitle: "History & breathtaking views",
      icon: Landmark,
      iconColor: "text-amber-700",
      image:
        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80",
      route: "/category/forts",
    },
    {
      title: "Nature & Wildlife",
      subtitle: "Hills, forests & more",
      icon: TreePine,
      iconColor: "text-emerald-600",
      image:
        "https://images.unsplash.com/photo-1502786129293-79981df4e689?auto=format&fit=crop&w=600&q=80",
      route: "/category/nature-wildlife",
    },
    {
      title: "Food & Local Cuisine",
      subtitle: "Authentic Konkan flavours",
      icon: UtensilsCrossed,
      iconColor: "text-orange-600",
      image:
        "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
      route: "/traditional-food",
    },
    {
      title: "Culture & Festivals",
      subtitle: "Traditions that live on",
      icon: Drama,
      iconColor: "text-fuchsia-600",
      image:
        "https://images.unsplash.com/photo-1598935898639-81586f7d2129?auto=format&fit=crop&w=600&q=80",
      route: "/cultural-events",
    },
    {
      title: "Packages & Itineraries",
      subtitle: "Plan your perfect trip",
      icon: Users,
      iconColor: "text-teal-600",
      image:
        "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80",
      route: "/itineraries",
    },
  ];

  const mapShortcuts = [
    { label: "Map View", icon: MapPin },
    { label: "Distance", icon: Ruler },
    { label: "Route", icon: RouteIcon },
    { label: "Filters", icon: SlidersHorizontal },
  ];

  const planCards = [
    {
      title: "Homestays",
      description: "Stay with locals, experience the real Ratnagiri.",
      icon: Home,
      bg: "bg-emerald-100",
      color: "text-emerald-700",
      route: "/homestays",
    },
    {
      title: "Transport & Timetable",
      description: "Buses, rickshaws, taxis & travel options.",
      icon: Bus,
      bg: "bg-sky-100",
      color: "text-sky-700",
      route: "/transport",
    },
    {
      title: "Weather",
      description: "Check live weather & plan your day.",
      icon: Sun,
      bg: "bg-amber-100",
      color: "text-amber-700",
      route: "/weather",
    },
    {
      title: "Download Maps",
      description: "Get offline maps & travel guides.",
      icon: Download,
      bg: "bg-indigo-100",
      color: "text-indigo-700",
      route: "/download-maps",
    },
  ];

  // ---- Panel 2: Experiences -------------------------------------------------
  const experiencesData = [
    {
      title: "Guided Walks",
      description: "Local guides lead you through forts, markets and coastal trails.",
      image: Slider2,
      route: "/guided-walks",
    },
    {
      title: "Konkani Food",
      description: "Taste solkadhi, fish curry-rice and other Malvani classics.",
      image: Slider4,
      route: "/traditional-food",
    },
    {
      title: "Community Interaction",
      description: "Meet fisherfolk, farmers and artisans in their own villages.",
      image: Slider3,
      route: "/village-life",
    },
  ];

  const upcomingEvent = {
    title: "Ganeshotsav Homestay Drive",
    description: "Book a homestay for Konkan's biggest festival before rates fill up.",
    image: Slider1,
    route: "/homestays",
  };

  // ---- Panel 3: Stories & Videos --------------------------------------------
  const storiesData = [
    {
      name: "Meera Kadam",
      role: "Homestay host, Ganpatipule",
      photo: Slider5,
      quote: "Guests come for the beach, they stay for the fish curry.",
    },
    {
      name: "Suresh Rane",
      role: "Fisherman, Karla",
      photo: Slider6,
      quote: "Best catch is at dawn — I sometimes take visitors along.",
    },
    {
      name: "Anita Sawant",
      role: "Mango farmer, Devgad",
      photo: Slider2,
      quote: "March to May, the whole orchard smells of ripening Alphonso.",
    },
    {
      name: "Ganesh Pednekar",
      role: "Fort guide, Ratnagiri",
      photo: Slider3,
      quote: "Every wall here has a story from the Shivaji era.",
    },
  ];

  const videosData = [
    { title: "A Day at Bhagwati Bandar", duration: "4:12", thumbnail: Slider1 },
    { title: "Cooking Solkadhi at Home", duration: "6:45", thumbnail: Slider4 },
    { title: "Inside Ratnagiri Fort", duration: "3:58", thumbnail: Slider3 },
    { title: "Alphonso Orchard Tour", duration: "5:20", thumbnail: Slider2 },
  ];

  // ---- Panel 4: About ---------------------------------------------------------
  const aboutPillars = [
    {
      title: "Society",
      icon: Handshake,
      color: "text-teal-700",
      bg: "bg-teal-50",
      description:
        "Close-knit fishing and farming communities, festivals that pull whole villages together, and a homestay culture built on hospitality.",
    },
    {
      title: "Economy",
      icon: TrendingUp,
      color: "text-amber-700",
      bg: "bg-amber-50",
      description:
        "Alphonso mango and cashew exports, a working fishing harbour, and tourism that increasingly supports small, local businesses.",
    },
    {
      title: "Good Governance",
      icon: ShieldCheck,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
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

        /* Slim scrollbar, reused for the horizontal Stories / Videos strips */
        .rt-feed { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
        .rt-feed::-webkit-scrollbar { height: 6px; width: 6px; }
        .rt-feed::-webkit-scrollbar-track { background: transparent; }
        .rt-feed::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        .rt-feed::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up { animation: none; }
        }
      `}</style>

      {/* ================= Panel 1 — Hero carousel (photo only, full width) ================= */}
      <section className="relative px-5 sm:px-10 lg:px-16 py-10 sm:py-14 overflow-hidden">
        <KonkanBackdrop />

        <div className="relative max-w-[1680px] mx-auto">
          {/* Full-width rotating photo carousel with search bar + caption */}
          <div className="relative rounded-2xl overflow-hidden h-[420px] sm:h-[560px] lg:h-[640px] shadow-xl ring-1 ring-black/5">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/30" />

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

            <div className="absolute top-6 left-6 right-6 animate-fade-up">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-white/80 mb-2 font-body">
                Explore &middot; Experience &middot; Support Local
              </p>
              <h1 className="font-display text-white leading-[1.05] text-3xl sm:text-4xl lg:text-5xl mb-3">
                Discover <span className="text-teal-300">Ratnagiri</span>
              </h1>
              <p className="text-white/85 text-sm sm:text-base max-w-sm font-body mb-5 leading-relaxed">
                Where the Sahyadri hills meet the Arabian Sea — beaches, forts,
                homestays and Konkan flavours, all in one place.
              </p>

              {/* search bar */}
              <form
                onSubmit={handleHeroSearch}
                className="flex items-center gap-2 bg-white/95 backdrop-blur rounded-full pl-4 pr-1.5 py-1.5 max-w-sm shadow-lg"
              >
                <Search size={16} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search beaches, forts, stays..."
                  className="flex-1 min-w-0 text-sm text-slate-700 placeholder:text-slate-400 bg-transparent outline-none font-body"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-[#0b3149] hover:bg-[#0a2b3f] text-white text-xs font-semibold px-4 py-2 rounded-full transition"
                >
                  Search
                </button>
              </form>
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

      {/* ================= Explore Ratnagiri ================= */}
      <section className="bg-sky-50 px-5 sm:px-10 lg:px-16 py-12 sm:py-16">
        <div className="max-w-[1680px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
          {/* Left: category grid */}
          <div>
            <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Compass size={16} />
              Things to Do
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Explore <span className="text-emerald-600">Ratnagiri</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-lg mb-8">
              From pristine beaches to historic forts, discover experiences
              that make Ratnagiri special.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {exploreCategories.map(({ title, subtitle, icon: Icon, iconColor, image, route }) => (
                <button
                  key={title}
                  onClick={() => navigate(route)}
                  className="group text-left bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden transition-shadow"
                >
                  <div
                    className="h-32 sm:h-36 bg-cover bg-center"
                    style={{ backgroundImage: `url(${image})` }}
                  />
                  <div className="px-4 pt-0 pb-4 -mt-5 relative">
                    <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center mb-2">
                      <Icon size={18} className={iconColor} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition"
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: interactive map card */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden h-fit">
            <div className="relative h-56 bg-[linear-gradient(135deg,#dbeafe_0%,#bbf7d0_45%,#e0f2fe_100%)]">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_30%,#93c5fd_0,transparent_35%),radial-gradient(circle_at_70%_60%,#86efac_0,transparent_40%)]" />
              <div className="absolute top-5 left-5 bg-white rounded-full shadow-md pl-3 pr-4 py-2 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                  <MapPin size={14} />
                </span>
                <span className="text-xs">
                  <span className="block font-semibold text-slate-800">Ratnagiri Fort</span>
                  <span className="block text-slate-400">2.4 km</span>
                </span>
              </div>
              <div className="absolute bottom-6 right-10 text-red-500">
                <MapPin size={30} fill="currentColor" className="text-red-500 drop-shadow" />
              </div>
              <button
                aria-label="My location"
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-slate-500"
              >
                <Navigation size={14} />
              </button>
            </div>

            <div className="p-5">
              <h3 className="font-display text-xl font-bold text-slate-900 mb-1.5">
                Interactive Map
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Explore places, get directions, check distances and more.
              </p>
              <button
                onClick={() => navigate("/map")}
                className="flex items-center justify-center gap-2 bg-[#0b3149] hover:bg-[#0a2b3f] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition"
              >
                Open Map
                <ChevronRight size={15} />
              </button>

              <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-slate-100">
                {mapShortcuts.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => navigate("/map")}
                    className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-teal-700 transition"
                  >
                    <Icon size={17} />
                    <span className="text-[11px]">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Everything You Need ================= */}
      <section className="bg-emerald-50/60 px-5 sm:px-10 lg:px-16 py-12 sm:py-16">
        <div className="max-w-[1680px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Route2Icon />
              Plan Your Trip
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Everything You Need
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-lg mb-8">
              Find homestays, transport, weather, and more — all in one
              place.
            </p>

            <div className="grid grid-cols-2 gap-5">
              {planCards.map(({ title, description, icon: Icon, bg, color, route }) => (
                <button
                  key={title}
                  onClick={() => navigate(route)}
                  className="group text-left bg-white rounded-xl shadow-sm hover:shadow-md p-5 transition-shadow"
                >
                  <span
                    className={`w-11 h-11 rounded-full ${bg} ${color} flex items-center justify-center mb-3`}
                  >
                    <Icon size={19} />
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{title}</p>
                      <p className="text-xs text-slate-400 mt-1 leading-snug">{description}</p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-slate-300 group-hover:text-emerald-600 shrink-0 mt-1 group-hover:translate-x-0.5 transition"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Poster image */}
          <div className="relative rounded-2xl overflow-hidden shadow-md h-72 lg:h-full min-h-[280px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImages[2]})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <p className="absolute top-6 left-6 font-display italic text-white text-2xl leading-tight">
              Plan
              <br />
              Explore
              <br />
              Support Local
            </p>
            <button
              aria-label="Play video"
              className="absolute bottom-6 right-6 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-[#0b3149] flex items-center justify-center transition"
            >
              <Play size={16} fill="currentColor" className="ml-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ================= Panel 2 — Experiences ================= */}
      <section className="bg-white px-5 sm:px-10 lg:px-16 py-12 sm:py-16">
        <div className="max-w-[1680px] mx-auto">
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
            <Drama size={16} />
            Experiences
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Live Like a Local
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-lg mb-8">
            Walks, meals and encounters that go beyond the sightseeing list.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.3fr] gap-5">
            {experiencesData.map(({ title, description, image, route }) => (
              <button
                key={title}
                onClick={() => navigate(route)}
                className="group text-left rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative h-56"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-white/75 text-xs mt-1 leading-snug">{description}</p>
                </div>
              </button>
            ))}

            {/* Upcoming Event */}
            <button
              onClick={() => navigate(upcomingEvent.route)}
              className="group text-left rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative h-56"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${upcomingEvent.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-[#B4532A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                <CalendarDays size={11} />
                Upcoming Event
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-white font-semibold text-sm">{upcomingEvent.title}</p>
                <p className="text-white/75 text-xs mt-1 leading-snug">{upcomingEvent.description}</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ================= Panel 3 — Stories & Videos ================= */}
      <section className="bg-sky-50 px-5 sm:px-10 lg:px-16 py-12 sm:py-16">
        <div className="max-w-[1680px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Stories */}
          <div>
            <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Users size={16} />
              Stories
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-5">
              Voices of Ratnagiri
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory rt-feed">
              {storiesData.map(({ name, role, photo, quote }) => (
                <div
                  key={name}
                  className="snap-start shrink-0 w-56 bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="h-36 bg-cover bg-center" style={{ backgroundImage: `url(${photo})` }} />
                  <div className="p-4">
                    <p className="text-sm font-semibold text-slate-800">{name}</p>
                    <p className="text-xs text-slate-400 mb-2">{role}</p>
                    <p className="text-xs text-slate-600 leading-snug italic">&ldquo;{quote}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Videos */}
          <div>
            <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <PlayCircle size={16} />
              Videos
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-5">
              Watch Before You Go
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory rt-feed">
              {videosData.map(({ title, duration, thumbnail }) => (
                <button
                  key={title}
                  className="snap-start shrink-0 w-56 text-left bg-white rounded-xl shadow-sm overflow-hidden group"
                >
                  <div
                    className="relative h-36 bg-cover bg-center"
                    style={{ backgroundImage: `url(${thumbnail})` }}
                  >
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition flex items-center justify-center">
                      <span className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-[#0b3149]">
                        <Play size={15} fill="currentColor" className="ml-0.5" />
                      </span>
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                      {duration}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-slate-800 leading-snug">{title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= Traveler Story ================= */}
      <div className="bg-sky-50/70 py-10 sm:py-14 px-4 sm:px-8">
        <div className="flex justify-center gap-1 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={16} className="fill-teal-600 text-teal-600" />
          ))}
        </div>

        <div className="max-w-3xl mx-auto border border-dashed border-sky-300 rounded-lg px-6 sm:px-10 py-8 sm:py-10 bg-sky-50/40">
          <p className="font-body text-base sm:text-lg leading-relaxed text-slate-800 text-center">
            Ratnagiri is best known as the birthplace of freedom fighter
            Lokmanya Tilak, and carries strong ties to Swatantryaveer Savarkar
            and the sage Parshuram. Long before that, the Konkan coastline
            drew European traders and religious travelers throughout the
            Middle Ages, while a succession of ruling powers — from the
            Maurya and Satavahana to the Chalukya, Rashtrakuta, Shilahar, and
            Yadava dynasties — left their mark on the region. During
            Satavahana rule, the Panhalakaji caves became an important center
            for Buddhist learning, and historical accounts describe active
            maritime trade routes linking Ratnagiri to distant shores.
            <br />
            <br />
            The district is proudly home to three Bharat Ratna recipients —
            Dr. Babasaheb Ambedkar, P.V. Kane, and Maharshi Dhondo Keshav
            Karve — and once held King Thibaw of Burma in exile under British
            rule, a history preserved today at Thiba Palace. After Maratha
            rule gave way to the British in 1818, the region became part of
            Bombay Presidency, later joining independent India's Bombay
            State, and finally becoming part of Maharashtra in 1960.
          </p>
        </div>
      </div>

      {/* ================= Panel 4 — About (Society / Economy / Governance) ================= */}
      <section className="bg-white px-5 sm:px-10 lg:px-16 py-12 sm:py-16">
        <div className="max-w-[1680px] mx-auto">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-bold uppercase tracking-[0.15em] mb-3">
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {aboutPillars.map(({ title, icon: Icon, color, bg, description }) => (
              <div
                key={title}
                className="rounded-xl border border-slate-100 p-6 hover:shadow-md transition-shadow"
              >
                <span className={`w-11 h-11 rounded-full ${bg} ${color} flex items-center justify-center mb-4`}>
                  <Icon size={19} />
                </span>
                <p className="text-sm font-semibold text-slate-800 mb-2">{title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="bg-slate-900 mt-0">
        <div className="px-6 sm:px-10 py-12 sm:py-14">
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
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-teal-600 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
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

// Small helper icon for the "PLAN YOUR TRIP" eyebrow in the Everything You
// Need section (kept separate since lucide's route-style icon name can vary
// across versions — swap for `Route` from lucide-react if you prefer).
function Route2Icon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h8a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h8" />
    </svg>
  );
}