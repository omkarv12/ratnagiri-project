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

     {/* ================= New 2 Image Section ================= */}
      <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div
          className="h-64 bg-cover bg-center rounded-xl shadow-md"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80')" }}
          aria-label="Image 1"
        />
        <div
          className="h-64 bg-cover bg-center rounded-xl shadow-md"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=80')" }}
          aria-label="Image 2"
        />
      </div>

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

      {/* ================= Dashboard Sections ================= */}
      <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-8">
        <div className="text-center mb-8 sm:mb-10 px-4 sm:px-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
            Everything you need to plan, register and explore Ratnagiri.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-5 px-4 sm:px-auto">
          {dashboardSections.map((section) => {
            const Icon = section.icon;

            return (
              <button
                key={section.title}
                onClick={() =>
                  section.external
                    ? window.open(section.route, "_blank", "noopener,noreferrer")
                    : navigate(section.route)
                }
                className="group relative flex h-full max-w-xs w-full sm:w-auto flex-col items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6 text-center transition-all duration-300 hover:-translate-y-[2px] hover:border-emerald-300 hover:bg-white hover:shadow-lg cursor-pointer"
              >
                <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-emerald-500 transition-transform duration-[300ms] group-hover:scale-x-100" />

                <span className="mb-4 flex h-[56px] w-[56px] items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition-colors duration-[300ms] group-hover:bg-emerald-500 group-hover:text-white">
                  <Icon size={26} />
                </span>

                <h3 className="text-base font-semibold text-slate-800 mb-[6px]">
                  {section.title}
                </h3>

                <p className="text-sm text-slate-500 leading-relaxed">
                  {section.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= Experiential Activities ================= */}
      <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
        <div className="text-center mb-[30px] px-4 sm:px-auto">
          <h2 className="text-xl sm:text-[28px] md:text-[32px] font-bold text-slate-800">
            Experiential Activities
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-[8px]">
            Ways to experience Konkan life, not just see it.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px] px-[14px] sm:px-auto">
          {activities.map((activity) => {
            const Icon = activity.icon;

            return (
              <button
                key={activity.title}
                onClick={() => navigate(activity.route)}
                className={`group relative flex h-full flex-col items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-[14px] pb-[10px] text-center transition-all duration-[300ms] hover:-translate-y-[2px] hover:bg-white hover:shadow-lg cursor-pointer ${activity.border}`}
              >
                <span
                  className={`absolute inset-x-0 top-[0px] h-[3px] origin-left scale-x-[0] transition-transform duration-[300ms] group-hover:scale-x-[1] ${activity.bar}`}
                />

                <span
                  className={`mb-[14px] flex h-[56px] w-[56px] items-center justify-center rounded-full text-current transition-colors duration-[300ms] group-hover:text-white ${activity.badge} ${activity.badgeHover}`}
                >
                  <Icon size={26} />
                </span>

                <h3 className="text-base font-semibold text-slate-800 mb-[6px]">
                  {activity.title}
                </h3>

                <p className="text-sm text-slate-500 leading-relaxed mb-[14px]">
                  {activity.description}
                </p>

                <span
                  className={`mt-auto flex items-center gap-[6px] text-xs font-semibold opacity-[0] transition-opacity duration-[300ms] group-hover:opacity-[1] ${activity.cta}`}
                >
                  Explore
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= Discover Ratnagiri ================= */}
      <div className="bg-white rounded-xl shadow-md p-[26px] mt-[32px]">
        <div className="text-center mb-[48px] px-[16px]">
          <span className="inline-block px-[16px] py-[4px] bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wide rounded-full mb-[12px]">
            Explore the District
          </span>
          <h2 className="text-xl sm:text-[32px] font-bold text-slate-800 mb-[12px]">Discover Ratnagiri</h2>
          <div className="w-[64px] h-[4px] bg-gradient-to-r from-orange-500 to-amber-500 mx-auto rounded-full mb-[12px]" />
          <p className="text-sm sm:text-lg text-slate-500">
            A land of history, coastline, and Konkan heritage.
          </p>
        </div>

        <div className="max-w-xl md:max-w-[960px] mx-auto mb-[48px] bg-gradient-to-br from-slate-50 to-orange-50 rounded-xl p-[24px] border border-slate-200" style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "0", left: "0", width: "6px", height: "100%", background: "linear-gradient(to bottom, #FB923C, #F59E0B)" }}></div>
          <div className="flex items-start gap-[12px] mb-[16px]">
            <span className="text-xl">📜</span>
            <h3 className="text-lg font-bold text-slate-800 mt-[4px]">A Storied Past</h3>
          </div>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-[16px]">
            Ratnagiri is best known as the birthplace of freedom fighter Lokmanya Tilak,
            and carries strong ties to Swatantryaveer Savarkar and the sage Parshuram.
            Long before that, the Konkan coastline drew European traders and religious
            travelers throughout the Middle Ages, while a succession of ruling powers —
            from the Maurya and Satavahana to the Chalukya, Rashtrakuta, Shilahar, and
            Yadava dynasties — left their mark on the region. During Satavahana rule, the
            Panhalakaji caves became an important center for Buddhist learning, and
            historical accounts describe active maritime trade routes linking Ratnagiri
            to distant shores.
          </p>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            The district is proudly home to three Bharat Ratna recipients — Dr. Babasaheb
            Ambedkar, P.V. Kane, and Maharshi Dhondo Keshav Karve — and once held King
            Thibaw of Burma in exile under British rule, a history preserved today at
            Thiba Palace. After Maratha rule gave way to the British in 1818, the region
            became part of Bombay Presidency, later joining independent India's Bombay
            State, and finally becoming part of Maharashtra in 1960.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-[12px] mb-[40px] px-[16px]">
          {discoverCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`group flex items-center gap-[12px] pl-[12px] pr-[24px] py-[10px] rounded-full font-semibold text-sm transition-all duration-[300ms] border-[2px] ${
                activeCategory === cat.name
                  ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-lg scale-[1.05]`
                  : "bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:shadow-md"
              }`}
            >
              <span
                className={`flex items-center justify-center w-[32px] h-[32px] rounded-full text-base transition-colors ${
                  activeCategory === cat.name ? "bg-white/25" : "bg-slate-100 group-hover:bg-slate-200"
                }`}
              >
                {cat.icon}
              </span>
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px] mb-[48px] px-[16px]">
          <div className="bg-sky-50 rounded-xl p-5 text-center border border-sky-100">
            <p className="text-2xl mb-1">🌡️</p>
            <p className="text-sm text-slate-500 font-medium">Average Weather</p>
            <p className="text-lg font-bold text-slate-800">25°C – 32°C</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-5 text-center border border-emerald-100">
            <p className="text-2xl mb-1">🗓️</p>
            <p className="text-sm text-slate-500 font-medium">Ideal Trip Duration</p>
            <p className="text-lg font-bold text-slate-800">1 – 2 Days</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-5 text-center border border-amber-100">
            <p className="text-2xl mb-1">☀️</p>
            <p className="text-sm text-slate-500 font-medium">Best Time to Visit</p>
            <p className="text-lg font-bold text-slate-800">October – March</p>
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-[20px] border-l-4 border-orange-500 pl-[12px] px-[16px]">
          Best Time to Visit
        </h3>
        <div className="overflow-x-auto mb-[12px] px-[16px]">
          <table className="w-full text-sm text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-3 font-semibold">Season</th>
                <th className="p-3 font-semibold">Months</th>
                <th className="p-3 font-semibold">Weather</th>
                <th className="p-3 font-semibold">Why Visit</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-t border-slate-200">
                <td className="p-3 font-medium">Winter</td>
                <td className="p-3">October – February</td>
                <td className="p-3">Pleasant, 11°C – 25°C</td>
                <td className="p-3">Best for sightseeing and outdoor activities</td>
              </tr>
              <tr className="border-t border-slate-200 bg-slate-50">
                <td className="p-3 font-medium">Summer</td>
                <td className="p-3">March – June</td>
                <td className="p-3">Hot and humid</td>
                <td className="p-3">Carry sun protection if traveling</td>
              </tr>
              <tr className="border-t border-slate-200">
                <td className="p-3 font-medium">Monsoon</td>
                <td className="p-3">June – September</td>
                <td className="p-3">Heavy rain, strong winds</td>
                <td className="p-3">Lush green landscapes, waterfalls at their peak</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-[12px] border-l-4 border-orange-500 pl-[12px] px-[16px]">
          How to Reach
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 px-[16px]">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <p className="text-lg font-bold text-slate-800 mb-2">✈️ By Air</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ratnagiri Airport is roughly 12 km from the city but has limited flight
              connectivity. Most travelers fly into Mumbai's Chhatrapati Shivaji Maharaj
              International Airport, around 330 km away, then continue by road or rail.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <p className="text-lg font-bold text-slate-800 mb-2">🚆 By Train</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ratnagiri Railway Station sits on the Konkan Railway line, with regular
              services connecting it to Mumbai, Goa, and Mangalore.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <p className="text-lg font-bold text-slate-800 mb-2">🚌 By Road</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              National Highway 66 runs through Ratnagiri, linking it to Mumbai, Pune,
              and Goa. State buses and private taxis serve the district regularly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}