import { useState, useEffect } from "react";
import {
  Compass,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight,
  Tag,
  Target,
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
  Phone,
  BookOpen,
  BookText,
  ShieldCheck,
} from "lucide-react";
import { useLocations } from "../context/LocationsContext";
import { useNavigate } from "react-router-dom";
import Slider1 from "../assets/Slider1.png";
import Slider2 from "../assets/Slider2.png";
import Slider3 from "../assets/Slider3.png";
import Slider4 from "../assets/Slider4.png";
import Slider5 from "../assets/Slider5.png";
import Slider6 from "../assets/Slide6.jpg";

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

export default function DashboardOverview() {
  const { locations, loading } = useLocations();
  const navigate = useNavigate();

  // TODO: replace with the real Ratnagiri Tourism office number (E.164 format,
  // no spaces/dashes) — this is what the floating call button dials.
  const RATNAGIRI_TOURISM_PHONE = "+912352222233";

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

  const planTripItems = [
    { label: "Location", icon: MapPin },
    { label: "Interest", icon: Target },
    { label: "Themes", icon: Tag },
    { label: "Experiences", icon: Star },
    { label: "Estimated Budget", icon: null, glyph: "₹" },
  ];

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
      {/* ================= Hero ================= */}
      <div className="relative w-full h-[520px] sm:h-[600px] overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/45" />

        {/* Hero copy + search */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-16">
          <div className="max-w-xl">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-4">
              Explore &middot; Experience &middot; Support Local
            </p>
            <h1 className="font-serif font-bold text-white leading-[1.05] text-4xl sm:text-5xl lg:text-6xl">
              Discover
              <br />
              <span className="text-teal-300">Ratnagiri</span>
            </h1>
            <p className="mt-5 text-sm sm:text-base text-slate-100 leading-relaxed max-w-md">
              Beaches, forts, culture, food and more — your complete guide to
              Ratnagiri tourism.
            </p>

            <div className="mt-7 flex items-center bg-white rounded-full shadow-lg max-w-md overflow-hidden">
              <span className="pl-5 text-slate-400">
                <MapPin size={18} />
              </span>
              <input
                type="text"
                placeholder="Search beaches, forts, homestays, places..."
                className="flex-1 px-3 py-3.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
              />
              <button
                onClick={() => navigate("/map")}
                aria-label="Search"
                className="m-1.5 w-11 h-11 shrink-0 rounded-full bg-[#0b3149] hover:bg-[#0a2b3f] text-white flex items-center justify-center transition"
              >
                <Search size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Plan Your Trip floating card */}
        <div className="hidden lg:block absolute top-10 right-10 w-72 rounded-2xl bg-[#0e5f73]/90 backdrop-blur-sm text-white p-5 shadow-xl">
          <div className="flex items-center gap-2 font-serif text-lg font-semibold mb-3">
            <Compass size={20} />
            Plan Your Trip
          </div>
          <ul>
            {planTripItems.map(({ label, icon: Icon, glyph }, i) => (
              <li key={label}>
                <button
                  onClick={() => navigate("/plan-your-trip")}
                  className={`w-full flex items-center justify-between gap-3 py-3 text-sm text-white/90 hover:text-white transition ${
                    i !== planTripItems.length - 1 ? "border-b border-white/15" : ""
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {Icon ? (
                      <Icon size={15} className="text-teal-300" />
                    ) : (
                      <span className="text-teal-300 font-semibold text-sm w-[15px] text-center">
                        {glyph}
                      </span>
                    )}
                    {label}
                  </span>
                  <ChevronRight size={15} className="text-white/60" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Slide controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)
            }
            aria-label="Previous slide"
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center backdrop-blur-sm transition"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroImages.length)}
            aria-label="Next slide"
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center backdrop-blur-sm transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ================= Explore Ratnagiri ================= */}
      <section className="bg-sky-50 px-5 sm:px-10 lg:px-16 py-12 sm:py-16">
        <div className="max-w-[1680px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
          {/* Left: category grid */}
          <div>
            <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Compass size={16} />
              Things to Do
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
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
              <h3 className="font-serif text-xl font-bold text-slate-900 mb-1.5">
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
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
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
            <p className="absolute top-6 left-6 font-serif italic text-white text-2xl leading-tight">
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

      {/* ================= Traveler Story ================= */}
      <div className="bg-sky-50/70 py-10 sm:py-14 px-4 sm:px-8">
        <div className="flex justify-center gap-1 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={16} className="fill-teal-600 text-teal-600" />
          ))}
        </div>

        <div className="max-w-3xl mx-auto border border-dashed border-sky-300 rounded-lg px-6 sm:px-10 py-8 sm:py-10 bg-sky-50/40">
          <p className="font-serif text-base sm:text-lg leading-relaxed text-slate-800 text-center">
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

          <div className="text-center mt-6">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-700">
              Victoria &amp; Arthur Thorne
            </p>
            <p className="text-[11px] text-slate-500">
              Travelers from London, UK · Amalfi &amp; Kyoto alumni
            </p>
          </div>
        </div>
      </div>

      {/* ================= Footer ================= */}
      <footer className="bg-slate-900 mt-0">
        <div className="px-6 sm:px-10 py-12 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_1fr_1fr] gap-10 lg:gap-8">
            <div>
              <h2 className="font-serif italic text-2xl text-white mb-3">
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

      {/* ================= Floating Call Button ================= */}
      <a
        href={`tel:${RATNAGIRI_TOURISM_PHONE}`}
        aria-label="Call Ratnagiri Tourism — Emergency Help"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 pl-4 pr-5 h-14 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-300"
      >
        <span className="absolute left-0 top-0 w-14 h-14 rounded-full bg-emerald-500 animate-ping opacity-40" />
        <Phone size={22} className="relative fill-white shrink-0" />
        <span className="relative text-sm font-semibold whitespace-nowrap">
          Emergency Help
        </span>
      </a>
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