import { useState } from "react";
import { Minus, Plus, Wand2, AlertTriangle } from "lucide-react";
import { useTripPlanner } from "./TripPlanner"; // same folder as TripPlanner.jsx - adjust if different
import { INTERESTS, PACES, TRANSPORT, buildPlan } from "../utils/planTrip";

/* ==================================================================
   PlanMyTrip
   Props
     places        array of every place the planner can use:
                   { type, id, name, lat, lng, tags?, fee?, mins?, openTime?,
                     closeTime?, popularity?, pricePerNight? (homestays) }
     onPlanCreated optional - called after the plan is loaded, e.g. to switch
                   to the Trip Planner tab
================================================================== */

const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const BUDGET_PRESETS = [3000, 6000, 10000, 20000];
const ICON = { village: "📍", homestay: "🏡", eco: "🌿" };

function Stepper({ label, value, min, max, onChange, suffix }) {
  return (
    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2.5">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center"
          aria-label={`Fewer ${label}`}
        >
          <Minus size={14} />
        </button>
        <span className="w-14 text-center text-sm font-bold text-slate-800">
          {value} {suffix}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 disabled:opacity-40 flex items-center justify-center"
          aria-label={`More ${label}`}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function ChoiceRow({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map(([id, o]) => (
        <button
          type="button"
          key={id}
          onClick={() => onChange(id)}
          className={`rounded-xl border px-2 py-2.5 text-center transition-colors ${
            value === id ? "bg-orange-600 border-orange-600 text-white" : "bg-white border-slate-200 text-slate-700 hover:border-orange-300"
          }`}
        >
          <span className="block text-xs font-bold">{o.label}</span>
          <span className={`block text-[10px] mt-0.5 ${value === id ? "text-white/80" : "text-slate-400"}`}>{o.hint}</span>
        </button>
      ))}
    </div>
  );
}

export default function PlanMyTrip({ places = [], onPlanCreated }) {
  const { loadPlan } = useTripPlanner();

  const [days, setDays] = useState(2);
  const [people, setPeople] = useState(2);
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState([]);
  const [pace, setPace] = useState("normal");
  const [transport, setTransport] = useState("own");
  const [includeStay, setIncludeStay] = useState(true);

  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");

  const toggleInterest = (id) =>
    setInterests((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const handleCreate = () => {
    setError("");
    const result = buildPlan(places, {
      days,
      people,
      budget: Number(budget) || 0,
      interests,
      pace,
      transport,
      includeStay,
    });
    if (result.empty) {
      setError("There are no places to plan with yet. Please try again once places have loaded.");
      return;
    }
    setPlan(result);
  };

  const handleUse = () => {
    loadPlan(plan);
    if (onPlanCreated) onPlanCreated();
  };

  /* ---------------- result view ---------------- */
  if (plan) {
    const c = plan.cost;
    const rows = [
      ["Entry fees", c.entry],
      ["Stay", c.stay],
      ["Food (estimate)", c.food],
      [`Travel (about ${Math.round(c.km)} km)`, c.transport],
    ];
    const pct = plan.budget ? Math.min(100, (c.total / plan.budget) * 100) : 0;

    return (
      <div className="animate-in slide-in-from-right-4 duration-300">
        <div className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl px-4 py-3 text-white mb-3 shadow-sm">
          <p className="text-xs opacity-90">Your suggested plan</p>
          <p className="text-lg font-bold">{plan.name}</p>
          <p className="text-sm font-semibold mt-1">
            About {inr(c.total)} for {people} {people === 1 ? "person" : "people"}
            {people > 1 && ` (${inr(c.total / people)} each)`}
          </p>
        </div>

        {plan.budget > 0 && (
          <div className="mb-3">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className={`h-full ${plan.overBudget ? "bg-red-500" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
            </div>
            <p className={`text-xs mt-1 font-medium ${plan.overBudget ? "text-red-600" : "text-slate-500"}`}>
              {plan.overBudget
                ? `${inr(c.total - plan.budget)} over your ${inr(plan.budget)} budget. Try fewer days, a cheaper transport option, or a higher budget.`
                : `${inr(plan.budget - c.total)} left of your ${inr(plan.budget)} budget`}
            </p>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 mb-3">
          {rows.map(([label, v]) => (
            <div key={label} className="flex justify-between px-3 py-2 text-sm">
              <span className="text-slate-600">{label}</span>
              <span className="font-semibold text-slate-800">{inr(v)}</span>
            </div>
          ))}
        </div>

        {plan.notes.length > 0 && (
          <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              {plan.notes.map((n, i) => (
                <p key={i}>{n}</p>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 mb-4">
          {Array.from({ length: plan.numDays }, (_, i) => i + 1).map((d) => (
            <div key={d}>
              <p className="text-sm font-bold text-slate-800 mb-1">{plan.numDays > 1 ? `Day ${d}` : "Your stops"}</p>
              <ul className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                {plan.stops
                  .filter((s) => s.day === d)
                  .map((s) => (
                    <li key={`${s.type}:${s.id}`} className="px-3 py-2 text-sm text-slate-700">
                      <span className="mr-1.5">{ICON[s.type] || "📍"}</span>
                      {s.name}
                      {s.note && <span className="text-xs text-slate-400"> · {s.note}</span>}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            type="button"
            onClick={() => setPlan(null)}
            className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-lg"
          >
            Change answers
          </button>
          <button
            type="button"
            onClick={handleUse}
            className="text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 py-2.5 rounded-lg"
          >
            Use this plan
          </button>
        </div>
        <p className="text-[11px] text-slate-400 text-center">
          Costs are estimates. In the trip planner you can still reorder, remove or add stops.
        </p>
      </div>
    );
  }

  /* ---------------- questions ---------------- */
  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800">Plan my trip</h2>
        <p className="text-sm text-slate-500">Answer a few questions and we'll suggest a plan you can edit.</p>
      </div>

      <Section title="How long?">
        <div className="space-y-2">
          <Stepper label="Days" value={days} min={1} max={7} onChange={setDays} suffix={days === 1 ? "day" : "days"} />
          <Stepper label="Travellers" value={people} min={1} max={20} onChange={setPeople} suffix={people === 1 ? "person" : "people"} />
        </div>
      </Section>

      <Section title="Total budget for the group (optional)">
        <div className="relative mb-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="No limit"
            className="w-full pl-7 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {BUDGET_PRESETS.map((b) => (
            <button
              type="button"
              key={b}
              onClick={() => setBudget(String(b))}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                Number(budget) === b ? "bg-orange-600 text-white border-orange-600" : "bg-white text-slate-600 border-slate-300"
              }`}
            >
              {inr(b)}
            </button>
          ))}
        </div>
      </Section>

      <Section title="What do you like?">
        <div className="flex gap-2 flex-wrap">
          {INTERESTS.map((i) => {
            const on = interests.includes(i.id);
            return (
              <button
                type="button"
                key={i.id}
                onClick={() => toggleInterest(i.id)}
                className={`text-xs font-semibold px-3 py-2 rounded-full border transition-colors ${
                  on ? "bg-orange-600 text-white border-orange-600" : "bg-white text-slate-600 border-slate-300 hover:border-orange-300"
                }`}
              >
                {i.emoji} {i.label}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5">Pick as many as you like, or none for a mix of popular places.</p>
      </Section>

      <Section title="Pace">
        <ChoiceRow options={Object.entries(PACES)} value={pace} onChange={setPace} />
      </Section>

      <Section title="How will you travel?">
        <ChoiceRow options={Object.entries(TRANSPORT)} value={transport} onChange={setTransport} />
      </Section>

      {days > 1 && (
        <label className="flex items-center gap-2 text-sm text-slate-600 mb-5 cursor-pointer">
          <input type="checkbox" checked={includeStay} onChange={(e) => setIncludeStay(e.target.checked)} className="accent-orange-600" />
          Suggest a homestay for each night
        </label>
      )}

      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

      <button
        type="button"
        onClick={handleCreate}
        className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm py-3 rounded-xl shadow-sm transition-colors"
      >
        <Wand2 size={16} /> Create my trip
      </button>
    </div>
  );
}