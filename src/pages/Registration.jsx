import { useState } from "react";
import RegistrationForm from "../components/forms/RegistrationForm";

const TYPES = [
  {
    id: "location",
    title: "Tourism Location",
    tag: "Fort · Beach · Temple",
    desc: "List a place travellers should visit in Ratnagiri.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-7 h-7">
        <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    id: "homestay",
    title: "Homestay",
    tag: "Rooms · Meals · Stay",
    desc: "Rent out your home or rooms to tourists.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-7 h-7">
        <path d="M3 10.5 12 3l9 7.5" strokeLinejoin="round" />
        <path d="M5 9.8V20h14V9.8" strokeLinejoin="round" />
        <path d="M10 20v-5h4v5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "driver",
    title: "Driver Service",
    tag: "Cab · Tempo · Sightseeing",
    desc: "Offer rides and local trips to visitors.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-7 h-7">
        <path d="M4 16v2.5M20 16v2.5" strokeLinecap="round" />
        <path d="M3 16v-3.2L4.8 8A2 2 0 0 1 6.7 6.6h10.6A2 2 0 0 1 19.2 8L21 12.8V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" strokeLinejoin="round" />
        <path d="M4.5 12.5h15" strokeLinecap="round" />
        <circle cx="7.5" cy="14.5" r="1" />
        <circle cx="16.5" cy="14.5" r="1" />
      </svg>
    ),
  },
];

export default function Registration() {
  const [type, setType] = useState("");
  const active = TYPES.find((t) => t.id === type);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">

      <style>{`
        @keyframes reg-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reg-fade-up { animation: reg-fade-up 0.5s ease-out both; }
        .reg-fade-up-delay-1 { animation-delay: 0.08s; }
        .reg-fade-up-delay-2 { animation-delay: 0.16s; }
        .reg-fade-up-delay-3 { animation-delay: 0.24s; }
        .reg-fade-up-delay-4 { animation-delay: 0.32s; }
        .reg-fade-up-delay-5 { animation-delay: 0.40s; }

        @keyframes reg-underline {
          from { width: 0; }
          to { width: 64px; }
        }
        .reg-underline { animation: reg-underline 0.6s ease-out 0.3s both; }
      `}</style>

      <div className="mb-10 text-center">

        <p className="reg-fade-up text-orange-700 text-base sm:text-lg font-medium tracking-wide">
          अतिथि देवो भवः
        </p>
        <p className="reg-fade-up reg-fade-up-delay-1 text-black text-xs mt-1">
          "The guest is akin to God" — welcome to Ratnagiri
        </p>

        <h1 className="reg-fade-up reg-fade-up-delay-2 text-4xl font-bold text-slate-800 mt-4">
          Registration
        </h1>

        <div className="reg-underline h-1 bg-orange-600 rounded-full mx-auto mt-3" />

        <p className="reg-fade-up reg-fade-up-delay-3 text-slate-600 mt-4 max-w-xl mx-auto">
          Register a Tourism Location, Homestay, or Driver Service with Ratnagiri Tourism.
        </p>

      </div>

      {/* ---------- step 1: pick a type ---------- */}
      {!active && (
        <div className="reg-fade-up reg-fade-up-delay-4">
          <p className="text-center text-sm font-medium text-slate-500 mb-5">
            Step 1 of 2 — what are you registering?
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {TYPES.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                style={{ animationDelay: `${0.4 + i * 0.08}s` }}
                className="reg-fade-up group rounded-2xl border-2 border-slate-200 bg-white p-5 text-left
                           transition-all duration-200 hover:-translate-y-1 hover:border-orange-400 hover:shadow-lg
                           focus:outline-none focus:ring-4 focus:ring-orange-100"
              >
                <span className="inline-flex rounded-xl bg-orange-100 p-3 text-orange-600 transition
                                 group-hover:bg-orange-600 group-hover:text-white">
                  {t.icon}
                </span>
                <h3 className="mt-4 font-semibold text-slate-800">{t.title}</h3>
                <p className="mt-0.5 text-xs font-medium text-orange-700">{t.tag}</p>
                <p className="mt-2 text-sm leading-snug text-slate-500">{t.desc}</p>
                <span className="mt-3 inline-block text-sm font-medium text-slate-400 transition group-hover:text-orange-600">
                  Select →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------- step 2: the form ---------- */}
      {active && (
        <div className="reg-fade-up">
          {/* sticky reminder of what they're filling */}
          <div className="sticky top-2 z-10 mb-5 flex items-center gap-3 rounded-xl border border-orange-200
                          bg-orange-50/95 px-4 py-3 shadow-sm backdrop-blur">
            <span className="text-orange-600">{active.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-orange-700/70">
                Step 2 of 2 — registering as
              </p>
              <p className="truncate text-sm font-semibold text-slate-800">{active.title}</p>
            </div>
            <button
              type="button"
              onClick={() => setType("")}
              className="shrink-0 rounded-lg border border-orange-300 bg-white px-3 py-1.5 text-xs
                         font-medium text-orange-700 transition hover:bg-orange-600 hover:text-white
                         hover:border-orange-600"
            >
              Change
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 transition-shadow duration-300 hover:shadow-xl">
            {/* key= remounts the form so fields reset when the type changes */}
            <RegistrationForm key={active.id} type={active.id} />
          </div>
        </div>
      )}

    </div>
  );
}