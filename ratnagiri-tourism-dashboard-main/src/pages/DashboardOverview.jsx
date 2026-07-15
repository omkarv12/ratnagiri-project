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
    },
    {
      title: "Traditional Food",
      description: "Experience authentic Konkani cuisine.",
      icon: UtensilsCrossed,
      route: "/traditional-food",
    },
    {
      title: "Cultural Events",
      description: "Discover local festivals and traditions.",
      icon: Drama,
      route: "/cultural-events",
    },
    {
      title: "Community Experience",
      description: "Connect with local communities.",
      icon: Users,
      route: "/community-experience",
    },
  ];

  const dashboardSections = [
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
              "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e')",
          }}
        >

          <div className="absolute inset-0 bg-black/40"></div>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-8">

            <h2 className="text-3xl font-bold mb-5">
              About Ratnagiri Tourism
            </h2>

            <p className="max-w-2xl text-lg leading-8">
              Ratnagiri district is one of Maharashtra's most beautiful
              coastal regions, known for pristine beaches, forts,
              temples, waterfalls, mangrove ecosystems, Alphonso
              mangoes and rich Konkan culture. This tourism portal
              helps visitors discover destinations, homestays,
              eco-tourism initiatives and local experiences.
            </p>

          </div>

        </div>

      </div>

      {/* ================= Dashboard Sections ================= */}

<div className="bg-white rounded-2xl shadow-md p-8 mb-8">

  <h2 className="text-3xl font-bold text-center text-slate-800 mb-10">
    Dashboard
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

    {dashboardSections.map((section) => {

      const Icon = section.icon;

      return (

        <button
          key={section.title}
          onClick={() => navigate(section.route)}
          className="bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-400 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg text-center cursor-pointer"
        >

          <Icon
            size={46}
            className="mx-auto mb-5 text-emerald-600"
          />

          <h3 className="text-xl font-semibold text-slate-800 mb-3">
            {section.title}
          </h3>

          <p className="text-sm text-slate-600 leading-6">
            {section.description}
          </p>

        </button>

      );

    })}

  </div>

</div>

      {/* ================= Experiential Activities ================= */}

      <div className="bg-white rounded-2xl shadow-md p-8">

        <h2 className="text-3xl font-bold text-center text-slate-800 mb-10">
          Experiential Activities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {activities.map((activity) => {

            const Icon = activity.icon;

            return (

              <button
                key={activity.title}
                onClick={() => navigate(activity.route)}
                className="bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-400 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg text-center cursor-pointer"
              >

                <Icon
                  size={46}
                  className="mx-auto mb-5 text-sky-600"
                />

                <h3 className="text-xl font-semibold text-slate-800 mb-3">
                  {activity.title}
                </h3>

                <p className="text-sm text-slate-600 leading-6">
                  {activity.description}
                </p>

              </button>

            );

          })}

        </div>

      </div>

    </div>
  );
}