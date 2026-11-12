import React, { useEffect, useRef, useState } from "react";
import { MapPin, Home, Car, Mountain, Check, ShieldCheck, Bot, Map as MapIcon, ArrowRight } from "lucide-react";

import LocationForm from "./LocationForm";
import HomestayForm from "./HomestayForm";
import DriverForm from "./DriverForm";
import HiddenPathForm from "./HiddenPathForm";

/* ------------------------------------------------------------------ */
/*  The types people can register, with what is in it for them.        */
/*  Edit the wording here to match what you actually offer.            */
/* ------------------------------------------------------------------ */
const TYPES = [
  {
    id: "location",
    icon: MapPin,
    title: "Tourism Location",
    who: "A beach, fort, temple, waterfall, viewpoint or any place visitors should see.",
    perks: [
      "Shown on the Interactive Map with your photos",
      "Appears on its village page, where travellers plan their trip",
      "Visitors can find it by asking our AI guide",
    ],
    accent: {
      ring: "ring-orange-500 border-orange-500",
      icon: "bg-orange-100 text-orange-600",
      selectedIcon: "bg-orange-500 text-white",
      check: "text-orange-600",
    },
  },
  {
    id: "homestay",
    icon: Home,
    title: "Homestay",
    who: "Guest rooms, farm stays and family-run stays for visitors.",
    perks: [
      "Listed on the map and on your village page",
      "Guests see your rooms, price range, meals and facilities",
      "Travellers can call you directly",
    ],
    accent: {
      ring: "ring-teal-600 border-teal-600",
      icon: "bg-teal-100 text-teal-700",
      selectedIcon: "bg-teal-600 text-white",
      check: "text-teal-600",
    },
  },
  {
    id: "driver",
    icon: Car,
    title: "Autorickshaw / Taxi Driver",
    who: "Drivers who take visitors around the district.",
    perks: [
      "Your name, vehicle and phone shown to travellers",
      "Listed on the map and on the villages you serve",
      "Tourists find you by area and per-day rate",
    ],
    accent: {
      ring: "ring-sky-600 border-sky-600",
      icon: "bg-sky-100 text-sky-700",
      selectedIcon: "bg-sky-600 text-white",
      check: "text-sky-600",
    },
  },
  {
    id: "hidden_path",
    icon: Mountain,
    title: "Hidden Path",
    who: "A secret trail, quiet beach, viewpoint or village walk you love.",
    perks: [
      "Your route is drawn on the map for walkers",
      "Can earn a Locals' Pick or Verified badge",
      "Sensitive spots can keep their exact location hidden",
    ],
    accent: {
      ring: "ring-emerald-600 border-emerald-600",
      icon: "bg-emerald-100 text-emerald-700",
      selectedIcon: "bg-emerald-600 text-white",
      check: "text-emerald-600",
    },
  },
];

const TRUST = [
  { icon: MapIcon, text: "Shown on the Interactive Map" },
  { icon: Bot, text: "Found by the AI guide" },
  { icon: ShieldCheck, text: "Reviewed before it goes live" },
];

export default function RegistrationForm({ onSuccess }) {
  const [formType, setFormType] = useState("location");
  const formRef = useRef(null);
  const firstRender = useRef(true);

  // After the visitor picks a type, bring the form into view.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [formType]);

  const selected = TYPES.find((t) => t.id === formType);

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Put yourself on the Ratnagiri map
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-base text-slate-600 sm:text-lg">
          Tell us what you offer. Travellers will find you on the map, in village pages and through our AI guide.
        </p>

        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {TRUST.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm"
            >
              <Icon size={15} className="text-orange-500" />
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* Type picker */}
      <div>
        <p id="reg-type-label" className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          What would you like to add?
        </p>

        <div role="radiogroup" aria-labelledby="reg-type-label" className="grid gap-4 sm:grid-cols-2">
          {TYPES.map((t) => {
            const Icon = t.icon;
            const active = t.id === formType;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setFormType(t.id)}
                className={`group relative flex flex-col rounded-2xl border-2 bg-white p-5 text-left shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 sm:p-6 ${
                  active
                    ? `${t.accent.ring} ring-2 shadow-lg`
                    : "border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {/* selected tick */}
                <span
                  className={`absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors ${
                    active ? `${t.accent.selectedIcon} border-transparent` : "border-slate-300 bg-white text-transparent"
                  }`}
                  aria-hidden="true"
                >
                  <Check size={16} strokeWidth={3} />
                </span>

                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
                    active ? t.accent.selectedIcon : t.accent.icon
                  }`}
                >
                  <Icon size={28} />
                </span>

                <h3 className="mt-4 pr-10 text-xl font-extrabold text-slate-900">{t.title}</h3>
                <p className="mt-1 text-[15px] leading-snug text-slate-600">{t.who}</p>

                <ul className="mt-4 space-y-2">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-[15px] leading-snug text-slate-800">
                      <Check size={18} strokeWidth={3} className={`mt-0.5 shrink-0 ${t.accent.check}`} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>

                <span
                  className={`mt-5 inline-flex items-center gap-1.5 text-sm font-bold ${
                    active ? "text-slate-900" : "text-slate-500 group-hover:text-slate-800"
                  }`}
                >
                  {active ? "Selected. Fill the form below" : "Choose this"}
                  <ArrowRight size={16} className={active ? "" : "transition-transform group-hover:translate-x-1"} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* The form */}
      <div ref={formRef} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selected.accent.selectedIcon}`}>
            <selected.icon size={22} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Registering</p>
            <h3 className="truncate text-lg font-extrabold text-slate-900">{selected.title}</h3>
          </div>
        </div>

        {formType === "location" && <LocationForm onSuccess={onSuccess} />}
        {formType === "homestay" && <HomestayForm onSuccess={onSuccess} />}
        {formType === "driver" && <DriverForm onSuccess={onSuccess} />}
        {formType === "hidden_path" && <HiddenPathForm onSuccess={onSuccess} />}
      </div>
    </div>
  );
}