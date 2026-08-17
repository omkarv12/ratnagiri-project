import { useState, useEffect } from "react";
import {
  Trees,
  UtensilsCrossed,
  Drama,
  Users,
  BookOpen,
  BookText,
  ClipboardPen,
  ShieldCheck,
  MapPin,
  Download,
  Search,
  Star,
  Phone,
} from "lucide-react";
import { useLocations } from "../context/LocationsContext";
import { useNavigate } from "react-router-dom";
import Slider1 from "../assets/Slider1.png";
import Slider2 from "../assets/Slider2.png";
import Slider3 from "../assets/Slider3.png";
import Slider4 from "../assets/Slider4.png";
import Slider5 from "../assets/Slider5.png";
import Slider5 from "../assets/Slider6.jpg";
import DiscoverRatnagiri from "./DiscoverRatnagiri";   // 👈 add this line



const heroImages = [Slider1, Slider2, Slider3, Slider4, Slider5, Slide6];

// lucide-react no longer ships trademarked brand icons (Instagram, Facebook,
// Twitter, YouTube, etc). These small inline SVGs are drop-in replacements
// that accept the same `size` prop the lucide icons used.
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
  const [activeCategory, setActiveCategory] = useState("Beaches");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Cards data, each card navigates somewhere on click
  const cards = [
    {
      title: "Stories of Ratnagiri",
      subtitleTopLeft1: "CULTURE",
      subtitleTopLeft2: "DESIGN",
      locationTag: "DAPOLI",
      imageUrl:
        "https://site.outlookindia.com/traveller/wp-content/uploads/files/2015/08/300615161943-RATNAGIRI1.jpg",
      route: "/stories",
    },
    {
      title: "Video Topics",
      subtitleTopLeft1: "SCENIC",
      subtitleTopLeft2: "WELLNESS",
      locationTag: "GUHAGHAR",
      imageUrl:
        "https://cf-images.assettype.com/saamtv%2F2024-10-10%2F8l7t7442%2F2.png?rect=0%2C217%2C720%2C960",
      route: "/videos",
    },
    {
      title: "Resources",
      subtitleTopLeft1: "SCENIC",
      subtitleTopLeft2: "WELLNESS",
      locationTag: "RATNAGIRI",
      imageUrl:
        "https://cf-images.assettype.com/saamtv/2024-05/f30db5d8-a27b-4179-87f4-f4279c8cc512/Kokan__3_.jpg?w=1200&h=675&auto=format%2Ccompress&fit=max&enlarge=true",
      route: "/resources",
    },
    {
      title: "Rules for tourists",
      subtitleTopLeft1: "SCENIC",
      subtitleTopLeft2: "KHED",
      locationTag: "",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSww8dgS4UHOdGYHkt01HfDaDqAS_DoySws0NZSg-4JTZGMQkRAUIKjOdg&s=10",
      route: "/rules",
    },
  ];

  const experienceItems = [
    { title: "Guided Walks", cta: "Self guided tours", route: "/guided-walks" },
    { title: "Konkani Food", cta: "Recipes", route: "/konkani-food" },
    {
      title: "Festivals and cultural events",
      cta: "Festive products",
      route: "/cultural-events",
    },
    { title: "Village life", cta: "Local businesses", route: "/village-life" },
  ];

  // NOTE: the sections below (discoverCategories, activities, dashboardSections)
  // are defined but not currently rendered in this component. They were left
  // in place from the original file in case they power a later section —
  // wire them into the JSX below, or remove them if they're not needed.
  const discoverCategories = [
    {
      name: "Beaches",
      icon: "🏖️",
      color: "from-sky-500 to-sky-700",
      image:
        "https://www.adotrip.com/public/city-images/5e4117bd1fb0f-Ratnagiri_Package_Tour.jpg",
      spots: [
        "Ganpatipule Beach",
        "Bhatye Beach",
        "Aare-Ware Beach",
        "Guhagar Beach",
        "Ganeshgule Beach",
        "Mandvi Beach",
      ],
    },
    {
      name: "Forts",
      icon: "🏰",
      color: "from-amber-600 to-amber-800",
      image:
        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
      spots: ["Ratnadurg Fort", "Devgad Fort", "Jaigad Fort"],
    },
    {
      name: "Temples",
      icon: "🛕",
      color: "from-orange-600 to-orange-800",
      image:
        "https://images.unsplash.com/photo-1598935898639-81586f7d2129?auto=format&fit=crop&w=800&q=80",
      spots: ["Sri Kanakaditya Temple", "Parashuram Temple", "Marleshwar Temple"],
    },
    {
      name: "Landmarks",
      icon: "🏛️",
      color: "from-emerald-600 to-emerald-800",
      image:
        "https://images.unsplash.com/photo-1502786129293-79981df4e689?auto=format&fit=crop&w=800&q=80",
      spots: [
        "Thiba Palace",
        "Jaigad Lighthouse",
        "Tilak Ali Museum",
        "Malgund Memorial",
        "Dhareshwar Waterfall",
      ],
    },
  ];

  const activities = [
    {
      title: "Nature Walks",
      description: "Explore Ratnagiri's scenic nature trails.",
      icon: Trees,
      route: "/nature-walks",
      badge: "bg-emerald-100 text-emerald-700",
      badgeHover: "group-hover:bg-emerald-500",
      border: "hover:border-emerald-300",
      bar: "bg-emerald-500",
      cta: "text-emerald-700",
    },
    {
      title: "Traditional Food",
      description: "Experience authentic Konkani cuisine.",
      icon: UtensilsCrossed,
      route: "/traditional-food",
      badge: "bg-amber-100 text-amber-700",
      badgeHover: "group-hover:bg-amber-500",
      border: "hover:border-amber-300",
      bar: "bg-amber-500",
      cta: "text-amber-700",
    },
    {
      title: "Cultural Events",
      description: "Discover local festivals and traditions.",
      icon: Drama,
      route: "/cultural-events",
      badge: "bg-fuchsia-100 text-fuchsia-700",
      badgeHover: "group-hover:bg-fuchsia-500",
      border: "hover:border-fuchsia-300",
      bar: "bg-fuchsia-500",
      cta: "text-fuchsia-700",
    },
    {
      title: "Community Experience",
      description: "Connect with local communities.",
      icon: Users,
      route: "/community-experience",
      badge: "bg-sky-100 text-sky-700",
      badgeHover: "group-hover:bg-sky-500",
      border: "hover:border-sky-300",
      bar: "bg-sky-500",
      cta: "text-sky-700",
    },
  ];

  const dashboardSections = [
    {
      title: "Resources",
      description: "Access tourism resources and useful information.",
      icon: BookOpen,
      route:
        "https://drive.google.com/drive/folders/18Qf6EHo_gULFlkXvI7hDx4Q-XDCGjol2?usp=sharing",
      external: true,
    },
    {
      title: "Stories",
      description: "Read stories and experiences from Ratnagiri.",
      icon: BookText,
      route: "/stories",
    },
    {
      title: "Rules for Tourists",
      description: "Guidelines for responsible and safe tourism.",
      icon: ShieldCheck,
      route: "/rules",
    },
  ];

  // ================= Footer data =================
  // Each entry either has a `route` (internal, uses navigate) or an `href`
  // (external link, opens in a new tab). Swap these out for your real routes
  // as your router grows.
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
      {/* ================= Hero (image slider) ================= */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
        <div className="relative h-[420px] sm:h-[520px] overflow-hidden">
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
          <div className="absolute inset-0 bg-black/35" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 sm:px-8">
            <p className="text-base sm:text-lg font-bold mb-3 tracking-wide">
              येवा कोंकण आपलोच आसा!!
            </p>
            <h1 className="font-serif italic text-3xl sm:text-5xl md:text-6xl leading-tight mb-4">
              Travel sustainably, enjoy fully
            </h1>
            <p className="max-w-xl sm:max-w-2xl text-sm sm:text-base leading-relaxed text-slate-100">
              Inviting all travelers, backpackers, families, children, students
              and the curious minds!
            </p>
          </div>

          {/* Slide indicator dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
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
        </div>

        {/* White feature bar under the hero image */}
        <div className="flex flex-col sm:flex-row items-stretch">
          <button
            onClick={() => navigate("/map")}
            className="group relative flex-1 flex items-center gap-3 px-6 py-4 hover:bg-orange-50/60 transition-colors duration-200 text-left border-t sm:border-t-0 border-b sm:border-b-0 sm:border-r border-slate-100"
          >
            <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-orange-500 transition-transform duration-300 group-hover:scale-x-100" />
            <MapPin className="text-slate-500 shrink-0 transition-colors duration-200 group-hover:text-orange-600" size={20} />
            <div>
              <p className="text-[11px] font-semibold text-orange-600 uppercase tracking-wide">
                Explore
              </p>
              <p className="text-sm font-medium text-slate-800 transition-colors duration-200 group-hover:text-orange-700">
                Interactive Map
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate("/registration")}
            className="group relative flex-1 flex items-center gap-3 px-6 py-4 hover:bg-orange-50/60 transition-colors duration-200 text-left border-b sm:border-b-0 sm:border-r border-slate-100"
          >
            <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-orange-500 transition-transform duration-300 group-hover:scale-x-100" />
            <ClipboardPen className="text-slate-500 shrink-0 transition-colors duration-200 group-hover:text-orange-600" size={20} />
            <div>
              <p className="text-[11px] font-semibold text-orange-600 uppercase tracking-wide">
                Share
              </p>
              <p className="text-sm font-medium text-slate-800 transition-colors duration-200 group-hover:text-orange-700">
                Register a location or a homestay
              </p>
            </div>
          </button>

          <a
            href="/ratnagiri-tourism-map.pdf"
            download
            className="group relative flex-1 flex items-center gap-3 px-6 py-4 hover:bg-orange-50/60 transition-colors duration-200 text-left border-b sm:border-b-0 sm:border-r border-slate-100"
          >
            <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-orange-500 transition-transform duration-300 group-hover:scale-x-100" />
            <Download className="text-slate-500 shrink-0 transition-colors duration-200 group-hover:text-orange-600" size={20} />
            <div>
              <p className="text-[11px] font-semibold text-orange-600 uppercase tracking-wide">
                Download
              </p>
              <p className="text-sm font-medium text-slate-800 transition-colors duration-200 group-hover:text-orange-700">
                Ratnagiri's tourist map
              </p>
            </div>
          </a>

          <div className="flex items-center justify-center px-6 py-4">
            <button
              onClick={() => navigate("/map")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.03] w-full sm:w-auto"
            >
              <Search size={18} />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ================= Learn about Ratnagiri ================= */}
      <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-1">
              Learn about Ratnagiri
            </h2>
            <p className="text-sm text-slate-600">
              Everything you need to plan your trip to Ratnagiri.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/tourism-fund")}
              className="border border-slate-400 text-slate-800 text-xs font-semibold uppercase px-3 py-1 rounded hover:bg-slate-100 transition"
            >
              Tourism Fund
            </button>
            <button
              onClick={() => navigate("/map")}
              className="border border-slate-400 text-slate-800 text-xs font-semibold uppercase px-3 py-1 rounded hover:bg-slate-100 transition"
            >
              Interactive Map
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <button
              key={i}
              onClick={() => navigate(card.route)}
              className="relative group rounded-lg overflow-hidden shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {/* Background Image */}
              <div
                className="w-full h-[240px] sm:h-[280px] lg:h-[320px] bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.05]"
                style={{ backgroundImage: `url(${card.imageUrl})` }}
                aria-label={card.title}
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent pointer-events-none" />

              {/* Text content */}
              <div className="absolute bottom-5 left-5 right-5 text-white pointer-events-none">
                <div className="flex gap-2 uppercase text-[10px] font-semibold opacity-80 mb-1">
                  <span>{card.subtitleTopLeft1}</span>
                  <span>{card.subtitleTopLeft2}</span>
                </div>
                <h3 className="font-serif text-lg leading-tight text-left">{card.title}</h3>
                <p className="mt-1 text-xs uppercase opacity-70 text-left">{card.locationTag}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ================= Experience Ratnagiri ================= */}
      <div className="bg-orange-50/60 rounded-2xl shadow-md p-6 sm:p-10 mb-8">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wide text-orange-600 mb-2">
            Experience Ratnagiri's Warmth and Sweetness
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-slate-800 mb-2">
            Experience Ratnagiri
          </h2>
          <p className="text-sm sm:text-base text-slate-500">
            We stand apart by honoring travel as a delicate fine art.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
          {experienceItems.map((item) => (
            <div key={item.title} className="flex flex-col items-start sm:items-center text-left sm:text-center">
              <h3 className="font-serif text-lg text-slate-800 mb-4">
                {item.title}
              </h3>
              <button
                onClick={() => navigate(item.route)}
                className="border border-orange-300 bg-orange-100/70 text-slate-700 text-xs italic font-medium px-4 py-2 rounded-full hover:bg-orange-200 hover:border-orange-400 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {item.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ================= Discover Ratnagiri ================= */}
      <DiscoverRatnagiri />

      {/* ================= Traveler Story ================= */}
      <div className="bg-sky-50/70 rounded-2xl py-10 sm:py-14 px-4 sm:px-8 mt-8">
        <div className="flex justify-center gap-1 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={16} className="fill-orange-500 text-orange-500" />
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
      <footer className="bg-slate-900 rounded-2xl mt-8">
        <div className="px-6 sm:px-10 py-12 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_1fr_1fr] gap-10 lg:gap-8">
            {/* Brand column */}
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
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-orange-600 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {footerColumns.map((col) => (
              <div key={col.heading}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-500 mb-4">
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