import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import FestivalsEvents from "../components/FestivalsEvents";
import EventsCalendar from "../components/EventsCalendar";

/*
  Events page
    1) Festivals & Events showcase (featured panel + poster slider)
    2) Event calendar (pictorial) and the contribute form
  The calendar section keeps id="calendar" and the form keeps id="contribute"
  so the buttons in the showcase can scroll to them.
*/
export default function UpcomingEventsPage() {
  // opened with #contribute / #calendar (e.g. from the home page button) -> scroll there
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return undefined;
    const t = setTimeout(
      () => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }),
      400
    );
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <div className="animate-in fade-in duration-500">
      <FestivalsEvents variant="page" />

      <section id="calendar" className="scroll-mt-24 bg-white px-3 pb-10 pt-16 sm:px-10 lg:px-16">
        <div className="mx-auto mb-6 max-w-[1680px] px-2 sm:px-0">
          <div className="flex items-center gap-3">
            <span className="h-10 w-1.5 rounded-full bg-gradient-to-b from-[#FBBF24] via-[#B4532A] to-teal-600" />
            <div>
              <h2 className="text-2xl font-bold text-[#0b3149] sm:text-3xl">Event calendar</h2>
              <p className="text-sm text-slate-500">
                Browse month by month, or add your own event at the bottom.
              </p>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[1680px]">
          <EventsCalendar />
        </div>
      </section>
    </div>
  );
}import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import FestivalsEvents from "../components/FestivalsEvents";
import EventsCalendar from "../components/EventsCalendar";

/*
  Events page
    1) Festivals & Events showcase (featured panel + poster slider)
    2) Event calendar (pictorial) and the contribute form
  The calendar section keeps id="calendar" and the form keeps id="contribute"
  so the buttons in the showcase can scroll to them.
*/
export default function UpcomingEventsPage() {
  // opened with #contribute / #calendar (e.g. from the home page button) -> scroll there
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return undefined;
    const t = setTimeout(
      () => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }),
      400
    );
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <div className="animate-in fade-in duration-500">
      <FestivalsEvents variant="page" />

      <section id="calendar" className="scroll-mt-24 bg-white px-3 pb-10 pt-16 sm:px-10 lg:px-16">
        <div className="mx-auto mb-6 max-w-[1680px] px-2 sm:px-0">
          <div className="flex items-center gap-3">
            <span className="h-10 w-1.5 rounded-full bg-gradient-to-b from-[#FBBF24] via-[#B4532A] to-teal-600" />
            <div>
              <h2 className="text-2xl font-bold text-[#0b3149] sm:text-3xl">Event calendar</h2>
              <p className="text-sm text-slate-500">
                Browse month by month, or add your own event at the bottom.
              </p>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[1680px]">
          <EventsCalendar />
        </div>
      </section>
    </div>
  );
}