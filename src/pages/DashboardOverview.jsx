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
} from "lucide-react";
import { useLocations } from "../context/LocationsContext";
import { useNavigate } from "react-router-dom";
import Slider1 from "../assets/Slider1.png";
import Slider2 from "../assets/Slider2.png";
import Slider3 from "../assets/Slider3.png";
import Slider4 from "../assets/Slider4.png";
import Slider5 from "../assets/Slider5.png";

const heroImages = [
  Slider1,
  Slider2,
  Slider3,
  Slider4,
  Slider5,
];

export default function DashboardOverview() {
  const { locations, loading } = useLocations();
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);
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
      locationTag: "MOROCCO",
      imageUrl:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
      route: "/stories",
    },
    {
      title: "Video Topics",
      subtitleTopLeft1: "SCENIC",
      subtitleTopLeft2: "WELLNESS",
      locationTag: "JAPAN",
      imageUrl:
        "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=600&q=80",
      route: "/videos",
    },
    {
      title: "Resources",
      subtitleTopLeft1: "SCENIC",
      subtitleTopLeft2: "WELLNESS",
      locationTag: "JAPAN",
      imageUrl:
        "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=600&q=80",
      route: "/resources",
    },
    {
      title: "Rules for tourists",
      subtitleTopLeft1: "SCENIC",
      subtitleTopLeft2: "WELLNESS",
      locationTag: "JAPAN",
      imageUrl:
        "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=600&q=80",
      route: "/rules",
    },
  ];

  const experienceItems = [
    {
      title: "Guided Walks",
      cta: "Self guided tours",
      route: "/guided-walks",
    },
    {
      title: "Konkani Food",
      cta: "Recipes",
      route: "/konkani-food",
    },
    {
      title: "Festivals and cultural events",
      cta: "Festive products",
      route: "/cultural-events",
    },
    {
      title: "Village life",
      cta: "Local businesses",
      route: "/village-life",
    },
  ];

  const discoverCategories = [
    {
      name: "Beaches",
      icon: "🏖️",
      color: "from-sky-500 to-sky-700",
      image:
        "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80",
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
        "https://images.unsplash.com/photo-4984243-ec57ea16fe25?auto=format&fit=crop&w=800&q=80",
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
        "https://drive.google.com/drive/folders/18Qf6EHo_gULFlkXvI7hDx4Q-XDCGjol2?usp=sharinp",
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

  if (loading) {
    return (
      <div className="p-8 text-center animate-pulse font-medium text-slate-500">
        Loading live database...
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
              येवा आमच्या कोकणात!
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
      const cards = [
  {
    href: "#beaches-forts",
    imgSrc: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    alt: "Beaches and Forts",
    title: "Beaches and Forts",
    subtitle: "FULLY INCLUSIVE",
  },
  {
    href: "#sadas-petroglyphs",
    imgSrc: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
    alt: "Sadas and Petroglyphs",
    title: "Sadas and Petroglyphs",
    subtitle: "FULLY INCLUSIVE",
  },
  {
    href: "#mountains-orchards",
    imgSrc: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0",
    alt: "Mountains, Orchards and Devrais",
    title: (
      <>
        Mountains, Orchards and <em>Devrais</em>
      </>
    ),
    subtitle: "FULLY INCLUSIVE",
  },
  {
    href: "#temples-heritage",
    imgSrc: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    alt: "Temples and Heritage Places",
    title: "Temples and Heritage Places",
    subtitle: "FULLY INCLUSIVE",
  },
  {
    href: "#season",
    imgSrc: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
    alt: "Something for every Season",
    title: "Something for every Season",
    subtitle: "FULLY INCLUSIVE",
  },
  {
    href: "#cities-villages",
    imgSrc: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0",
    alt: "Prominent Cities and Villages",
    title: "Prominent Cities and Villages",
    subtitle: "FULLY INCLUSIVE",
  },
];

const arrowIcon = (
  
);

const DiscoverRatnagiri = () => {
  return (
    <div
      style={{
        fontFamily: "Georgia, serif",
        margin: 20,
        backgroundColor: "#fff",
        color: "#222",
        maxWidth: 1200,
        marginLeft: "auto",
        marginRight: "auto"
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#c0a060",
          letterSpacing: "1.5px",
          textAlign: "center",
          marginBottom: 8,
          textTransform: "uppercase"
        }}
      >
        RATNAGIRI HAS SOMETHING FOR EVERYONE
      </div>
      <h1
        style={{
          fontWeight: "normal",
          fontSize: "2rem",
          textAlign: "center",
          marginBottom: 6,
        }}
      >
        Discover Ratnagiri, Discover Konkan
      </h1>
      <div
        style={{
          fontSize: 13,
          textAlign: "center",
          marginBottom: 20,
          color: "#555",
        }}
      >
        Rare paths catalogued and highly recommended by veteran travelers.
      </div>
      <button
        style={{
          backgroundColor: "#e5dcae",
          color: "#000",
          padding: "6px 12px",
          fontWeight: "bold",
          fontSize: 12,
          borderRadius: 4,
          border: "none",
          cursor: "pointer",
          marginBottom: 30,
          display: "block",
          marginLeft: "auto",
          marginRight: "auto"
        }}
        onClick={() => alert("Map View clicked")} // Replace with your handler
      >
        MAP VIEW
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))",
          gap: 20,
        }}
      >
      {cards.map(({ href, imgSrc, alt, title, subtitle }) => (
  
    key={href}
    href={href}
    style={{
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#fff",
      borderRadius: 4,
      color: "inherit",
      textDecoration: "none",
      boxShadow: "0 0 8px rgba(0,0,0,0.1)",
      transition: "box-shadow 0.3s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = "0 0 8px rgba(0,0,0,0.1)";
    }}
  >
    <img
      src={imgSrc}
      alt={alt}
      style={{
        width: "100%",
        height: "auto",
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        objectFit: "cover",
      }}
    />
    <div
      style={{
        padding: 16,
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          fontSize: "1.1rem",
          marginBottom: 10,
          fontWeight: "normal",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          color: "#999",
          letterSpacing: "0.05em",
          marginBottom: 6,
        }}
      >
        {subtitle}
      </div>
      <div
        style={{
          fontWeight: "bold",
          fontSize: 13,
          color: "#396aab",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginTop: "auto", // push to bottom
        }}
      >
        Itineraries {arrowIcon}
      </div>
    </div>
  </a>
))}
            <img
              src={imgSrc}
              alt={alt}
              style={{
                width: "100%",
                height: "auto",
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                objectFit: "cover",
              }}
            />
            <div
              style={{
                padding: 16,
      flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  fontSize: "1.1rem",
                  marginBottom: 10,
                  fontWeight: "normal",
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  color: "#999",
                  letterSpacing: "0.05em",
                  marginBottom: 6,
                }}
              >
                {subtitle}
              </div>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: 13,
                  color: "#396aab",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: "auto", // push to bottom
                }}
              >
                Itineraries {arrowIcon}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default DiscoverRatnagiri;
       
   