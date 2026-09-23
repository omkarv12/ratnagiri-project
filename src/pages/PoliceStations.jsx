import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Building2,
  MapPin,
  Wifi,
  Accessibility,
  ExternalLink,
  Phone,
  FileText,
} from "lucide-react";

/* Reusable scroll-reveal, same pattern as other pages */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function Reveal({ children, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {children}
    </div>
  );
}

/* ---- Data ---------------------------------------------------------- */
const localStations = [
  {
    name: "Ratnagiri City Police Station",
    mapUrl:
      "https://www.google.com/maps/place/ratnagiri+city+police+station,+x7ww%2B864,+police+head+quarters,+ratnagiri,+maharashtra+415612/data=!4m2!3m1!1s0x3bea0d6c0acfd18b:0x694ad7ccd1903f5",
    description:
      "The main point of contact for municipal policing, emergency calls and filing First Information Reports (FIRs).",
    points: [
      "Maintains regular neighborhood safety patrols",
      "Oversees direct citizen security grievances",
      "Dedicated wheelchair-accessible parking lot",
    ],
  },
  {
    name: "Superintendent Police Office of Ratnagiri",
    mapUrl:
      "https://www.google.com/maps/place/superintendent+police+office+of+ratnagiri,+x7rx%2Bfxc,+jail+rd,+police+head+quarters,+ratnagiri,+maharashtra+415612/data=!4m2!3m1!1s0x3bea0d6ab391debb:0xe2f3819ab0c320a",
    description:
      "Handles district-wide administrative duties, security clearances and command strategies for the region.",
    points: [
      "Contact for high-level regulatory processing and verification services",
      "Guidance on regional legal affairs",
      "Wheelchair-accessible entrance, restrooms and visitor parking",
    ],
  },
  {
    name: "Kokan Nagar Police Station",
    mapUrl:
      "https://www.google.com/maps/place/kokan+nagar+police+station,+x8xf%2Bx6q,+azad+nagar,+konkan+nagar,+nachane,+maharashtra+415639/data=!4m2!3m1!1s0x3bea0d1d8f889c67:0x73f6c512de46bfa8",
    description:
      "Local law enforcement support and dispute resolution tailored to the surrounding residential communities.",
    points: [
      "Maintains a physical presence in the neighborhoods",
      "Faster response times for localized resident queries",
    ],
  },
];

const specializedUnits = [
  {
    name: "Ratnagiri Police Cyber Police Station",
    mapUrl:
      "https://www.google.com/maps/place/ratnagiri+police+cyber+police+station,+x7rx%2Bfxc,+jail+rd,+police+head+quarters,+ratnagiri,+maharashtra+415612/data=!4m2!3m1!1s0x3bea0d94089543bf:0x383540df365fa8ba",
    description:
      "A technical division sharing space with the central headquarters to look into online crimes exclusively.",
    points: [
      "Takes reports on internet fraud and phishing scams",
      "Investigates data breaches and digital harassment cases",
    ],
  },
  {
    name: "Ratnagiri Police Headquarters Administration Building",
    mapUrl:
      "https://www.google.com/maps/place/ratnagiri+police+headquarters+administration+building,+x8r3%2Bw36,+police+head+quarters,+ratnagiri,+maharashtra+415612/data=!4m2!3m1!1s0x3bea0d80d566dccd:0x587925bea71bb2a",
    description:
      "Coordinates internal operations, staffing, records and departmental logistics.",
    points: [
      "Not a direct field precinct for everyday complaints",
      "Primary venue for managing official business or departmental records",
      "Wheelchair-accessible entrance, parking and restrooms",
    ],
  },
];

/* ---- Reusable facility card ----------------------------------------- */
function StationCard({ name, description, points, mapUrl }) {
  return (
    <div className="rt-card bg-white rounded-xl p-6 flex flex-col h-full">
      <h3 className="font-semibold text-slate-800 mb-2 font-body leading-snug">
        {name}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-body mb-4">
        {description}
      </p>
      <ul className="space-y-2 mb-5 flex-1">
        {points.map((point, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 font-body leading-relaxed"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#0b3149] mt-1.5 shrink-0" />
            {point}
          </li>
        ))}
      </ul>
      
        <a href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0b3149] hover:text-slate-700 mt-auto"
      >
        <MapPin size={13} />
        View on Map
        <ExternalLink size={11} />
      </a>
    </div>
  );
}

export default function PoliceStations() {
  return (
    <div className="animate-in fade-in duration-500 bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Fraunces', Georgia, serif; }
        .font-body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .rt-card {
          box-shadow: 0 10px 28px -14px rgba(15, 23, 42, 0.18);
          transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease;
        }
        .rt-card:hover { transform: translateY(-4px); box-shadow: 0 26px 50px -18px rgba(11,49,73,0.35); }
        @media (prefers-reduced-motion: reduce) { .rt-card, .rt-card:hover { transition: none; transform: none; } }
      `}</style>

      {/* ================= Hero ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0b3149] to-slate-900 px-5 sm:px-10 lg:px-16 py-16 sm:py-20">
        <div className="relative max-w-[1680px] mx-auto">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] text-white/80 mb-3 font-body">
            Resources &middot; Police Stations
          </p>
          <h1 className="font-display text-white text-4xl sm:text-5xl lg:text-6xl mb-3">
            Police Stations in Ratnagiri
          </h1>
          <p className="text-white/85 text-sm sm:text-base max-w-2xl font-body leading-relaxed">
            Law enforcement contacts, administrative offices and specialized
            units — for emergencies, filing reports or official matters.
          </p>
        </div>
      </section>

      {/* ================= Law Enforcement & Local Stations ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-[#0b3149] text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <ShieldCheck size={16} />
              Law Enforcement &amp; Local Stations
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
              Municipal Policing &amp; Emergency Contact
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {localStations.map((item) => (
              <StationCard key={item.name} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= Specialized & Administrative Units ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16 bg-slate-50">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Building2 size={16} />
              Specialized &amp; Administrative Units
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
              Cyber Crime &amp; Departmental Operations
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {specializedUnits.map((item) => (
              <StationCard key={item.name} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= Quick reference strip ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-12 sm:py-14 bg-slate-900">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="rt-card bg-slate-800 rounded-xl p-5 flex items-start gap-3">
                <span className="w-9 h-9 rounded-full bg-slate-500/20 text-slate-300 flex items-center justify-center shrink-0">
                  <Phone size={16} />
                </span>
                <div>
                  <p className="text-white font-semibold text-sm font-body">
                    Emergencies &amp; FIRs
                  </p>
                  <p className="text-slate-400 text-xs font-body mt-1 leading-relaxed">
                    Ratnagiri City Police Station is the main point of contact
                    for emergency calls and filing FIRs.
                  </p>
                </div>
              </div>
              <div className="rt-card bg-slate-800 rounded-xl p-5 flex items-start gap-3">
                <span className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                  <Wifi size={16} />
                </span>
                <div>
                  <p className="text-white font-semibold text-sm font-body">
                    Cyber Crime
                  </p>
                  <p className="text-slate-400 text-xs font-body mt-1 leading-relaxed">
                    Report online fraud, phishing or digital harassment at the
                    dedicated Cyber Police Station.
                  </p>
                </div>
              </div>
              <div className="rt-card bg-slate-800 rounded-xl p-5 flex items-start gap-3">
                <span className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                  <Accessibility size={16} />
                </span>
                <div>
                  <p className="text-white font-semibold text-sm font-body">
                    Accessible Facilities
                  </p>
                  <p className="text-slate-400 text-xs font-body mt-1 leading-relaxed">
                    Wheelchair-accessible entrances, parking and restrooms are
                    available across most stations listed.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= Closing note ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-16 sm:py-20 bg-slate-50">
        <div className="max-w-[1680px] mx-auto text-center">
          <Reveal>
            <FileText className="mx-auto text-[#0b3149] mb-4" size={28} />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Know Where to Go
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-2xl mx-auto">
              Tap "View on Map" on any listing above for directions, exact
              location and further details from Google Maps.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}