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
  ArrowRight,
  Download,
} from "lucide-react";
import { useLocations } from "../context/LocationsContext";
import { useNavigate } from "react-router-dom";

export default function DashboardOverview() {
  const { locations, loading } = useLocations();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const heroImages = [
    "https://www.dioregaaloresort.com/images/Aare-Waare%20Beach.jpg",
    "https://www.trawell.in/images/tours/Ratnagiri.jpg", // replace with a Ratnagiri beach photo
    "https://rickshawchallenge.gamblingzion.com/uploads/2019/08/62256058_2360594510646637_5546022944985055232_o-1500x1000.jpg", // replace with a Konkan temple photo
    "https://eqiaboov9ot.exactdn.com/wp-content/uploads/2023/11/7-2.png?strip=all", // replace with a waterfall photo
    "https://aarewarebeachresort.com/wp-content/uploads/2024/06/5.jpg",
    "https://live.staticflickr.com/2670/33108029155_c89e7de6b8_b.jpg" // replace with a forest/eco-tourism photo
  ];
  const discoverCategories = [
    {
      name: "Beaches",
      icon: "🏖️",
      color: "from-sky-500 to-sky-700",
      image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80",
      spots: ["Ganpatipule Beach", "Bhatye Beach", "Aare-Ware Beach", "Guhagar Beach", "Ganeshgule Beach", "Mandvi Beach"],
    },
    {
      name: "Forts",
      icon: "🏰",
      color: "from-amber-600 to-amber-800",
      image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
      spots: ["Ratnadurg Fort", "Devgad Fort", "Jaigad Fort"],
    },
    {
      name: "Temples",
      icon: "🛕",
      color: "from-orange-600 to-orange-800",
      image: "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=800&q=80",
      spots: ["Sri Kanakaditya Temple", "Parashuram Temple", "Marleshwar Temple"],
    },
    {
      name: "Landmarks",
      icon: "🏛️",
      color: "from-emerald-600 to-emerald-800",
      image: "https://images.unsplash.com/photo-1502786129293-79981df4e689?auto=format&fit=crop&w=800&q=80",
      spots: ["Thiba Palace", "Jaigad Lighthouse", "Tilak Ali Museum", "Malgund Memorial", "Dhareshwar Waterfall"],
    },
  ];

  const galleryImages = [
    "https://www.dioregaaloresort.com/images/Aare-Waare%20Beach.jpg",
    "https://www.trawell.in/images/tours/Ratnagiri.jpg", // replace with a Ratnagiri beach photo
    "https://maharashtratourism.gov.in/wp-content/uploads/2024/11/areware-beach.jpg", // replace with a Konkan temple photo
    "https://eqiaboov9ot.exactdn.com/wp-content/uploads/2023/11/7-2.png?strip=all", // replace with a waterfall photo
    "https://aarewarebeachresort.com/wp-content/uploads/2024/06/5.jpg", 
    "https://media1.thrillophilia.com/filestore/3cnk6270rc64ia75g37cn0tobv3w_Downpic.cc-26918286.jpg"
  ];

  const [activeCategory, setActiveCategory] = useState("Beaches");
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

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
      route: "https://drive.google.com/drive/folders/18Qf6EHo_gULFlkXvI7hDx4Q-XDCGjol2?usp=sharing",
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
      {/* ================= Dashboard Header ================= */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
        <div className="bg-orange-100 py-5">
          <h1 className="text-4xl font-bold text-center text-slate-800">
            Ratnagiri Sustainable Tourism Dashboard
          </h1>
        </div>

        <div className="relative h-[420px] overflow-hidden">
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
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Slide indicator dots */}

          {/* Slide indicator dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div> 
        
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-8">
            <h2 className="text-3xl font-bold mb-5">About Ratnagiri</h2>

            <p className="max-w-2xl text-lg leading-8">
              Ratnagiri district is one of Maharashtra's most beautiful
              coastal regions, known for pristine beaches, forts, temples,
              waterfalls, mangrove ecosystems, Alphonso mangoes and rich
              Konkan culture. This tourism portal helps visitors discover
              destinations, homestays, eco-tourism initiatives and local
              experiences.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate("/map")}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg transition-colors"
              >
                <MapPin size={18} />
                Explore Interactive Map
              </button>

              <button
                onClick={() => navigate("/registration")}
                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl shadow-lg transition-colors"
              >
                <ClipboardPen size={18} />
                Register Your Location/ Homestay
              </button>

              
                <a href="/ratnagiri-tourism-map.pdf"
                download
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-colors"
              >
                <Download size={18} />
                Download Ratnagiri Tourism Map
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Dashboard Sections ================= */}
      <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-500 mt-2">
            Everything you need to plan, register and explore Ratnagiri.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-5">
  {dashboardSections.map((section) => {
          
            const Icon = section.icon;

            return (
              <button
                key={section.title}
                onClick={() => navigate(section.route)}
                className="group relative flex h-full flex-col items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:bg-white hover:shadow-lg cursor-pointer"
              >
                {/* accent bar */}
                <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-emerald-500 transition-transform duration-300 group-hover:scale-x-100" />

                <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition-colors duration-300 group-hover:bg-emerald-500 group-hover:text-white">
                  <Icon size={26} />
                </span>

                <h3 className="text-base font-semibold text-slate-800 mb-2">
                  {section.title}
                </h3>

                <p className="text-sm text-slate-500 leading-6">
                  {section.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= Experiential Activities ================= */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800">
            Experiential Activities
          </h2>
          <p className="text-slate-500 mt-2">
            Ways to experience Konkan life, not just see it.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {activities.map((activity) => {
            const Icon = activity.icon;

            return (
              <button
                key={activity.title}
                onClick={() => navigate(activity.route)}
                className={`group relative flex h-full flex-col items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-6 pb-5 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg cursor-pointer ${activity.border}`}
              >
                <span
                  className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${activity.bar}`}
                />

                <span
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full text-current transition-colors duration-300 group-hover:text-white ${activity.badge} ${activity.badgeHover}`}
                >
                  <Icon size={26} />
                </span>

                <h3 className="text-base font-semibold text-slate-800 mb-2">
                  {activity.title}
                </h3>

                <p className="text-sm text-slate-500 leading-6 mb-4">
                  {activity.description}
                </p>

                <span
                  className={`mt-auto flex items-center gap-1 text-xs font-semibold opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${activity.cta}`}
                >
                  Explore <ArrowRight size={14} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= Discover Ratnagiri ================= */}
      <div className="bg-white rounded-2xl shadow-md p-8 mt-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
            Explore the District
          </span>
          <h2 className="text-4xl font-bold text-slate-800 mb-2">Discover Ratnagiri</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto rounded-full mb-3"></div>
          <p className="text-slate-500 text-lg">
            A land of history, coastline, and Konkan heritage.
          </p>
        </div>

        {/* History blurb */}
        <div className="max-w-4xl mx-auto mb-12 bg-gradient-to-br from-slate-50 to-orange-50/50 rounded-2xl p-8 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-500 to-amber-500"></div>
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">📜</span>
            <h3 className="text-lg font-bold text-slate-800 mt-1">A Storied Past</h3>
          </div>
          <p className="text-slate-600 leading-7 mb-4">
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
          <p className="text-slate-600 leading-7">
            The district is proudly home to three Bharat Ratna recipients — Dr. Babasaheb
            Ambedkar, P.V. Kane, and Maharshi Dhondo Keshav Karve — and once held King
            Thibaw of Burma in exile under British rule, a history preserved today at
            Thiba Palace. After Maratha rule gave way to the British in 1818, the region
            became part of Bombay Presidency, later joining independent India's Bombay
            State, and finally becoming part of Maharashtra in 1960.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {discoverCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`group flex items-center gap-3 pl-3 pr-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 border-2 ${
                activeCategory === cat.name
                  ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-lg scale-105`
                  : "bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:shadow-md"
              }`}
            >
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full text-base transition-colors ${
                  activeCategory === cat.name ? "bg-white/25" : "bg-slate-100 group-hover:bg-orange-100"
                }`}
              >
                {cat.icon}
              </span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Active Category Card */}
        {discoverCategories
          .filter((cat) => cat.name === activeCategory)
          .map((cat) => (
            <div
              key={cat.name}
              className="relative rounded-2xl overflow-hidden shadow-lg mb-12 h-72"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${cat.image}')` }}
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-80`} />
              <div className="relative z-10 h-full flex flex-col justify-end p-8 text-white">
                <h3 className="text-2xl font-bold mb-3">{cat.icon} {cat.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {cat.spots.map((spot) => (
                    <span
                      key={spot}
                      className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-medium"
                    >
                      {spot}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

        {/* Photo Gallery */}
        <h3 className="text-xl font-bold text-slate-800 mb-5 border-l-4 border-orange-500 pl-3">
          Photo Gallery
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
          {galleryImages.map((img, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl overflow-hidden bg-cover bg-center hover:scale-105 transition-transform duration-300 cursor-pointer"
              style={{ backgroundImage: `url('${img}')` }}
            />
          ))}
        </div>

        {/* Travel Essentials Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
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

        {/* Best Time to Visit Table */}
        <h3 className="text-xl font-bold text-slate-800 mb-5 border-l-4 border-orange-500 pl-3">
          Best Time to Visit
        </h3>
        <div className="overflow-x-auto mb-12">
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

        {/* How to Reach */}
        <h3 className="text-xl font-bold text-slate-800 mb-5 border-l-4 border-orange-500 pl-3">
          How to Reach
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <p className="text-lg font-bold text-slate-800 mb-2">✈️ By Air</p>
            <p className="text-sm text-slate-600 leading-6">
              Ratnagiri Airport is roughly 12 km from the city but has limited flight
              connectivity. Most travelers fly into Mumbai's Chhatrapati Shivaji Maharaj
              International Airport, around 330 km away, then continue by road or rail.
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <p className="text-lg font-bold text-slate-800 mb-2">🚆 By Train</p>
            <p className="text-sm text-slate-600 leading-6">
              Ratnagiri Railway Station sits on the Konkan Railway line, with regular
              services connecting it to Mumbai, Goa, and Mangalore.
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <p className="text-lg font-bold text-slate-800 mb-2">🚌 By Road</p>
            <p className="text-sm text-slate-600 leading-6">
              National Highway 66 runs through Ratnagiri, linking it to Mumbai, Pune,
              and Goa. State buses and private taxis serve the district regularly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}