import { useRef, useState } from "react";
import { Wand2, ChevronDown, ChevronUp, Route as RouteIcon, Download } from "lucide-react";
import PlanMyTrip from "./PlanMyTrip";
import TripPlanner, { useTripPlanner } from "./TripPlanner";

/* ==================================================================
   PlanYourTripPanel
   "Plan for me" (the wizard) and "Plan Trip" (the planner) on ONE screen,
   plus a "Download PDF itinerary" card (with maps) for the current trip.

   layout="stacked"  narrow places such as the map sidebar: the wizard is a
                     collapsible card above the planner.
   layout="split"    full page: wizard on the left, planner on the right
                     (stacks on small screens).
================================================================== */
export default function PlanYourTripPanel({ places = [], userLocation, layout = "stacked" }) {
  const { stops } = useTripPlanner();
  const split = layout === "split";
  const [wizardOpen, setWizardOpen] = useState(stops.length === 0);
  const [lastPlan, setLastPlan] = useState(null); // plan from the wizard (has cost, notes, etc.)
  const [startDate, setStartDate] = useState("");
  const [people, setPeople] = useState(2);
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const tripRef = useRef(null);

  const handlePlanCreated = (plan, meta = {}) => {
    setLastPlan(plan);
    if (meta.startDate) setStartDate(meta.startDate);
    if (meta.people) setPeople(meta.people);
    setWizardOpen(false);
    setTimeout(() => tripRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const handleDownload = async () => {
    setDownloading(true);
    setPdfError("");
    try {
      const { downloadTripPdf } = await import("../utils/tripPdf");
      // Wizard cost is only valid while the stop list is unchanged.
      const planStillValid = lastPlan && lastPlan.stops.length === stops.length;
      await downloadTripPdf({
        name: planStillValid ? lastPlan.name : "My Ratnagiri Trip",
        stops,
        places,
        people,
        days: planStillValid ? lastPlan.numDays : 1,
        startDate,
        cost: planStillValid ? lastPlan.cost : null,
        budget: planStillValid ? lastPlan.budget : 0,
        notes: planStillValid ? lastPlan.notes : [],
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
      setPdfError("Could not create the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
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

      {stops.length > 0 && (
        <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl p-3">
          <p className="text-xs font-bold text-orange-800 mb-2">Take your trip with you</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <label className="text-[11px] font-semibold text-slate-600">
              Start date
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              />
            </label>
            <label className="text-[11px] font-semibold text-slate-600">
              Travellers
              <input
                type="number"
                min="1"
                max="20"
                value={people}
                onChange={(e) => setPeople(Math.max(1, Number(e.target.value) || 1))}
                className="mt-1 w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-xs font-bold py-2.5 rounded-lg transition-colors"
          >
            <Download size={14} /> {downloading ? "Preparing PDF..." : "Download PDF itinerary (with maps)"}
          </button>
          {pdfError && <p className="text-xs text-red-600 mt-2">{pdfError}</p>}
        </div>
      )}

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