import { useState } from "react";
import RegistrationForm from "../components/forms/RegistrationForm";

/* What people get from each registration. Edit the wording to match what you offer. */
const TYPES = [
  {
    id: "location",
    title: "Tourism Location",
    tag: "Fort · Beach · Temple",
    desc: "List a place travellers should visit in Ratnagiri.",
    perks: [
      "Shown on the Interactive Map with your photos",
      "Appears on its village page, where travellers plan their trip",
      "Visitors can find it by asking our AI guide",
    ],
    icon: (cls) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={cls}>
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
    perks: [
      "Listed on the map and on your village page",
      "Guests see your rooms, price range, meals and facilities",
      "Travellers can call you directly",
    ],
    icon: (cls) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={cls}>
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
    perks: [
      "Your name, vehicle and phone shown to travellers",
      "Listed on the map and on the villages you serve",
      "Tourists find you by area and per-day rate",
    ],
    icon: (cls) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={cls}>
        <path d="M4 16v2.5M20 16v2.5" strokeLinecap="round" />
        <path d="M3 16v-3.2L4.8 8A2 2 0 0 1 6.7 6.6h10.6A2 2 0 0 1 19.2 8L21 12.8V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" strokeLinejoin="round" />
        <path d="M4.5 12.5h15" strokeLinecap="round" />
        <circle cx="7.5" cy="14.5" r="1" />
        <circle cx="16.5" cy="14.5" r="1" />
      </svg>
    ),
  },
];

const TRUST = [
  "Shown on the Interactive Map",
  "Found by our AI guide",
  "Reviewed before it goes live",
];

function Tick() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mt-0.5 h-5 w-5 shrink-0 text-orange-600">
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Registration() {
  const [type, setType] = useState("");
  const active = TYPES.find((t) => t.id === type);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">

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

        @keyframes reg-underline {
          from { width: 0; }
          to { width: 64px; }
        }
        .reg-underline { animation: reg-underline 0.6s ease-out 0.3s both; }
      `}</style>

      <div className="mb-10 text-center">

        <h1 className="reg-fade-up text-4xl sm:text-5xl font-bold text-slate-800">
          Get found by travellers
        </h1>

        <div className="reg-underline h-1 bg-orange-600 rounded-full mx-auto mt-4" />

        <p className="reg-fade-up reg-fade-up-delay-2 text-slate-600 text-lg mt-5 max-w-2xl mx-auto">
          Register your place, stay or vehicle with Ratnagiri Tourism, and show it to everyone planning a trip here.
        </p>

        <ul className="reg-fade-up reg-fade-up-delay-3 mt-5 flex flex-wrap justify-center gap-2">
          {TRUST.map((t) => (
            <li
              key={t}
              className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-sm font-medium text-orange-800"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-4 w-4">
                <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t}
            </li>
          ))}
        </ul>

      </div>

      {/* ---------- step 1: pick a type ---------- */}
      {!active && (
        <div className="reg-fade-up reg-fade-up-delay-4">
          <p className="text-center text-base font-semibold text-slate-600 mb-6">
            Step 1 of 2 — what are you registering?
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {TYPES.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                style={{ animationDelay: `${0.4 + i * 0.08}s` }}
                className="reg-fade-up group flex flex-col rounded-3xl border-2 border-slate-200 bg-white p-7 text-left
                           shadow-sm transition-all duration-200 hover:-translate-y-1.5 hover:border-orange-400 hover:shadow-xl
                           focus:outline-none focus:ring-4 focus:ring-orange-200"
              >
                <span className="inline-flex w-fit rounded-2xl bg-orange-100 p-4 text-orange-600 transition
                                 group-hover:bg-orange-600 group-hover:text-white">
                  {t.icon("h-10 w-10")}
                </span>

                <h3 className="mt-5 text-2xl font-bold text-slate-800">{t.title}</h3>
                <p className="mt-1 text-sm font-semibold text-orange-700">{t.tag}</p>
                <p className="mt-3 text-base leading-snug text-slate-600">{t.desc}</p>

                <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-400">What you get</p>
                <ul className="mt-2 space-y-2.5">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-[15px] leading-snug text-slate-800">
                      <Tick />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>

                <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-base font-bold
                                 text-slate-700 transition group-hover:bg-orange-600 group-hover:text-white">
                  Register now
                  <span aria-hidden="true">→</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------- step 2: the form ---------- */}
      {active && (
        <div className="max-w-5xl mx-auto reg-fade-up">
          {/* sticky reminder of what they're filling */}
          <div className="sticky top-2 z-10 mb-5 flex items-center gap-3 rounded-xl border border-orange-200
                          bg-orange-50/95 px-4 py-3 shadow-sm backdrop-blur">
            <span className="text-orange-600">{active.icon("h-7 w-7")}</span>
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