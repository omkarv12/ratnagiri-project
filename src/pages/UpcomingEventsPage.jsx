import { CalendarDays, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PictorialCalendarSection from "../components/PictorialCalendarSection";
import Slider1 from "../assets/Slider1.jpg";

// TODO: replace these sample events with your real ones (or load from the
// backend). Dates are "YYYY-MM-DD".
const EVENTS = [
  { date: "2026-10-11", title: "Navratri begins", description: "Garba and devi festivals in village temples.", route: "/cultural-events" },
  { date: "2026-10-15", title: "New Guided Trail: Fort to Bhagwati Bandar", description: "A 3 km coastal walk with a local guide.", route: "/guided-walks" },
  { date: "2026-10-20", title: "Dussehra", description: "Processions and fairs across the district.", route: "/cultural-events" },
  { date: "2026-11-08", title: "Diwali", description: "Fort illuminations and local markets.", route: "/cultural-events" },
];

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function UpcomingEventsPage() {
  const navigate = useNavigate();

  return (
    <div className="animate-in fade-in duration-500">
      <header className="px-5 sm:px-10 lg:px-16 pt-8 pb-2">
        <div className="max-w-[1680px] mx-auto">
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
            <CalendarDays size={16} />
            Experiences
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Upcoming Events
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-lg">
            Festivals, trails and happenings across Ratnagiri district.
          </p>
        </div>
      </header>

      {/* Click the card to open the pictorial calendar */}
      <div className="max-w-[1680px] mx-auto">
        <PictorialCalendarSection events={EVENTS} image={Slider1} />
      </div>

      {/* Full list — the calendar's "View" button scrolls here */}
      <section
        id="events-list"
        className="px-5 sm:px-10 lg:px-16 py-6 scroll-mt-24"
      >
        <div className="max-w-[1680px] mx-auto grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EVENTS.map((e) => (
            <button
              key={e.title}
              onClick={() => navigate(e.route)}
              className="text-left rounded-xl bg-white p-4 shadow-[0_10px_28px_-14px_rgba(15,23,42,0.22)] hover:-translate-y-1 hover:shadow-[0_26px_50px_-18px_rgba(180,83,42,0.4)] transition-all duration-300"
            >
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#B4532A] mb-1">
                <MapPin size={12} /> {formatDate(e.date)}
              </p>
              <p className="text-base font-semibold text-slate-800">{e.title}</p>
              <p className="text-sm text-slate-500 mt-1 leading-snug">
                {e.description}
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}