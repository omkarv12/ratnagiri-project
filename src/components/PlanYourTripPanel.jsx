import { useRef, useState } from "react";
import { Wand2, ChevronDown, ChevronUp, Route as RouteIcon } from "lucide-react";
import PlanMyTrip from "./PlanMyTrip";
import TripPlanner, { useTripPlanner } from "./TripPlanner";

/* ==================================================================
   PlanYourTripPanel
   "Plan for me" (the wizard) and "Plan Trip" (the planner) on ONE screen.

   layout="stacked"  narrow places such as the map sidebar: the wizard is a
                     collapsible card above the planner.
   layout="split"    full page: wizard on the left, planner on the right
                     (stacks on small screens).
================================================================== */
export default function PlanYourTripPanel({ places = [], userLocation, layout = "stacked" }) {
  const { stops } = useTripPlanner();
  const split = layout === "split";
  const [wizardOpen, setWizardOpen] = useState(stops.length === 0);
  const tripRef = useRef(null);

  const handlePlanCreated = () => {
    setWizardOpen(false);
    setTimeout(() => tripRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const wizardVisible = split || wizardOpen;

  const wizard = (
    <section className={split ? "bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm" : "mb-5"}>
      {split ? (
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800 mb-3">
          <Wand2 size={16} className="text-orange-600" /> Plan for me
        </h2>
      ) : (
        <button
          type="button"
          onClick={() => setWizardOpen((v) => !v)}
          aria-expanded={wizardOpen}
          className="w-full flex items-center justify-between gap-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors"
        >
          <span className="flex items-center gap-2">
            <Wand2 size={15} /> Plan for me
            <span className="text-[11px] font-medium text-orange-700/80">answer a few questions</span>
          </span>
          {wizardOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}
      {/* hidden (not unmounted) so answers are kept when the card is collapsed */}
      <div className={wizardVisible ? (split ? "" : "mt-4") : "hidden"}>
        <PlanMyTrip places={places} onPlanCreated={handlePlanCreated} />
      </div>
    </section>
  );

  const planner = (
    <section
      ref={tripRef}
      className={split ? "bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm" : ""}
    >
      <h2 className="flex items-center gap-2 text-base font-bold text-slate-800 mb-3">
        <RouteIcon size={16} className="text-orange-600" /> Your trip
        {stops.length > 0 && (
          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">
            {stops.length}
          </span>
        )}
      </h2>
      <TripPlanner userLocation={userLocation} />
    </section>
  );

  if (split) {
    return (
      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        {wizard}
        {planner}
      </div>
    );
  }
  return (
    <div>
      {wizard}
      {planner}
    </div>
  );
}