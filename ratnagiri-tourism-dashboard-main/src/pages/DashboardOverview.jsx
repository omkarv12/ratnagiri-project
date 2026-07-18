import { useState } from "react";
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
} from "lucide-react";
import { useLocations } from "../context/LocationsContext";
import { useNavigate } from "react-router-dom";

export default function DashboardOverview() {
  const { locations, loading } = useLocations();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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
      title: "Interactive Map",
      description: "Explore all locations, homestays and attractions on the map.",
      icon: MapPin,
      route: "/map",
    },
    {
      title: "Resources",
      description: "Access tourism resources and useful information.",
      icon: BookOpen,
      route: "/resources",
    },
    {
      title: "Stories",
      description: "Read stories and experiences from Ratnagiri.",
      icon: BookText,
      route: "/stories",
    },
    {
      title: "Registration",
      description: "Register a tourism location or homestay.",
      icon: ClipboardPen,
      route: "/registration",
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
        <div className="bg-sky-100 py-5">
          <h1 className="text-4xl font-bold text-center text-slate-800">
            Ratnagiri Tourism Dashboard
          </h1>
        </div>

        <div
          className="relative h-[420px] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://www.dioregaaloresort.com/images/Aare-Waare%20Beach.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-8">
            <h2 className="text-3xl font-bold mb-5">About Ratnagiri Tourism</h2>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
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
    </div>
  );
}