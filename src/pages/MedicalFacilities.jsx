import { useState, useEffect, useRef } from "react";
import {
  Stethoscope,
  FlaskConical,
  Pill,
  MapPin,
  Clock,
  Accessibility,
  Calendar,
  ExternalLink,
  HeartPulse,
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
const clinics = [
  {
    name: "Shree Bhagwan Mahadev Sambare Mofat Rugnalay",
    mapUrl:
      "https://www.google.com/maps/place/shree+bhagwan+mahadev+sambare+mofat+rugnalay,+nachane+rd,+near+iti+college,+abhyudhya+nagar,+ratnagiri,+nachane,+maharashtra+415612/data=!4m2!3m1!1s0x3bea0d00681f7e37:0x190c9cab133fd8f",
    description:
      "A charitable facility run by the Jijau Foundation that focuses on providing free healthcare services to the community.",
    points: [
      "Polite nursing staff and professional, empathetic doctors who explain conditions clearly",
      "Open 24 hours a day",
      "Wheelchair-accessible entrances, restrooms and seating",
    ],
  },
  {
    name: "Ibrahim Clinic Day Care Centre",
    mapUrl:
      "https://www.google.com/maps/place/ibrahim+clinic+day+care+centre,+ibrahim+clinic+x-75,+near+kharvi+samaj+hall,+midc+zadgaon+block,+midc,+zadgaon,+maharashtra+415639/data=!4m2!3m1!1s0x3bea0d0efdb5582b:0xa2ea5afcfc07b5c",
    description:
      "Provides daycare capabilities alongside general consultations, minor procedures and IV treatments.",
    points: [
      "Clean, well-organized environment with helpful, reassuring staff",
      "Assistive hearing loops and dedicated parking",
      "Specialized nursing rooms for families",
    ],
  },
  {
    name: "Ayushyaman Homoeopathic Healthcare — Dr. Ashfaq Kazi",
    mapUrl:
      "https://www.google.com/maps/place/ayushyaman+homoeopathic+healthcare,+dr+ashfaq+kazi,+khareghat+rd,+rajiwada,+ratnagiri,+maharashtra+415612/data=!4m2!3m1!1s0x3bea0d3e3b400a2d:0x576e8aba4305531a",
    description:
      "Combines homeopathic treatments with specialized clinical consulting for chronic illnesses, cardiac concerns and orthopedic recovery.",
    points: [
      "24-hour availability of doctors",
      "Well-maintained waiting lounge with basic entertainment amenities",
      "24-hour generator backup and comprehensive video surveillance",
    ],
  },
];

const specialty = [
  {
    name: "Nexlyfe Diagnostic Centre",
    mapUrl:
      "https://www.google.com/maps/place/nexlyfe+diagnostic+centre,+117,+kohinoor+city+centre,+maharashtra+415612/data=!4m2!3m1!1s0x3bea0df48d455f2d:0x656aa52c0fa05290",
    description:
      "Handles essential basic pathology tests, digital X-rays and specialized testing fields.",
    points: [
      "Accurate reporting timelines and a clean testing environment",
      "Professional staff demeanor",
      "Home visit options for blood and urine sample collection",
    ],
  },
  {
    name: "Mhaskar Urology Clinic",
    mapUrl:
      "https://www.google.com/maps/place/mhaskar+urology+clinic,+c-wing,+102,+ksp+alexa,+opp.+naik+motors,+maruti+mandir,+ratnagiri,+maharashtra+415612/data=!4m2!3m1!1s0x3bea0dc1bd9abf03:0xf95f3941fa2b47b2",
    description:
      "Focuses specifically on the diagnostic tracing and advanced tracking of urological and andrological conditions.",
    points: [
      "Exceptionally clean and well-equipped with modern surgical and laser tools",
      "Appointments are strictly required before visiting",
    ],
  },
];

const pharmacies = [
  {
    name: "Wellness Forever Pharmacy — Ratnagiri S.T. Stand",
    mapUrl:
      "https://www.google.com/maps/place/wellness+forever+pharmacy+-+ratnagiri+s.t+stand,+ground+floor,+shop+no+5,+ground+floor,+opposite+ratnagiri+-+solapur+highway,+stand,+zadgaon,+ratnagiri,+maharashtra+415612/data=!4m2!3m1!1s0x3bea0d6a43c984d9:0xe34dbcfa950ec50e",
    description:
      "Round-the-clock access to emergency medication alongside lifestyle wellness products, right near the highway stand.",
    points: [
      "Helpful store assistants and dependable home delivery",
      "Open 24 hours a day, 365 days a year",
    ],
  },
  {
    name: "Wellness Forever Pharmacy — Maruti Mandir Road",
    mapUrl:
      "https://www.google.com/maps/place/wellness+forever+pharmacy+-+ratnagiri,+maharashtra,+ground+floor,+shop+no+4,+ground+floor,+arihant+space+centre,+maruti+mandir+road,+ratnagiri,+maharashtra+415612/data=!4m2!3m1!1s0x3bea0d2288965cdf:0xb9898d52942bdefd",
    description: "Situated within the Arihant Space Centre.",
    points: [
      "Well-stocked with maximum medicine availability and qualified staff ready to answer script questions",
      "In-store pickup, in-store shopping and standard localized delivery",
    ],
  },
];

/* ---- Reusable facility card ----------------------------------------- */
function FacilityCard({ name, description, points, mapUrl }) {
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
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
            {point}
          </li>
        ))}
      </ul>
      
        <a href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 mt-auto"
      >
        <MapPin size={13} />
        View on Map
        <ExternalLink size={11} />
      </a>
    </div>
  );
}

export default function MedicalFacilities() {
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
        .rt-card:hover { transform: translateY(-4px); box-shadow: 0 26px 50px -18px rgba(15,118,110,0.3); }
        @media (prefers-reduced-motion: reduce) { .rt-card, .rt-card:hover { transition: none; transform: none; } }
      `}</style>

      {/* ================= Hero ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 to-teal-900 px-5 sm:px-10 lg:px-16 py-16 sm:py-20">
        <div className="relative max-w-[1680px] mx-auto">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] text-white/80 mb-3 font-body">
            Resources &middot; Medical Facilities
          </p>
          <h1 className="font-display text-white text-4xl sm:text-5xl lg:text-6xl mb-3">
            Medical Facilities in Ratnagiri
          </h1>
          <p className="text-white/85 text-sm sm:text-base max-w-2xl font-body leading-relaxed">
            A comprehensive overview of clinics, diagnostic centres and
            pharmacies — helping you find the right healthcare services
            wherever you're staying.
          </p>
        </div>
      </section>

      {/* ================= Clinics & General Healthcare ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Stethoscope size={16} />
              Clinics &amp; General Healthcare
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
              General Consultations &amp; Care
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {clinics.map((item) => (
              <FacilityCard key={item.name} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= Specialty Services & Diagnostics ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16 bg-slate-50">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <FlaskConical size={16} />
              Specialty Services &amp; Diagnostics
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
              Testing, Imaging &amp; Specialist Care
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {specialty.map((item) => (
              <FacilityCard key={item.name} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= Pharmacies & Urgent Medical Supplies ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Pill size={16} />
              Pharmacies &amp; Urgent Medical Supplies
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
              Round-the-Clock Medicine Access
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pharmacies.map((item) => (
              <FacilityCard key={item.name} {...item} />
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
                <span className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                  <Clock size={16} />
                </span>
                <div>
                  <p className="text-white font-semibold text-sm font-body">
                    24-Hour Options
                  </p>
                  <p className="text-slate-400 text-xs font-body mt-1 leading-relaxed">
                    Several clinics and both pharmacies listed operate round
                    the clock for urgent needs.
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
                    Wheelchair-accessible entrances, restrooms and hearing
                    loops are available at select locations.
                  </p>
                </div>
              </div>
              <div className="rt-card bg-slate-800 rounded-xl p-5 flex items-start gap-3">
                <span className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                  <Calendar size={16} />
                </span>
                <div>
                  <p className="text-white font-semibold text-sm font-body">
                    Plan Ahead
                  </p>
                  <p className="text-slate-400 text-xs font-body mt-1 leading-relaxed">
                    Specialist clinics like Mhaskar Urology require
                    appointments booked in advance.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= Closing note ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-16 sm:py-20 bg-teal-50/50">
        <div className="max-w-[1680px] mx-auto text-center">
          <Reveal>
            <HeartPulse className="mx-auto text-teal-700 mb-4" size={28} />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Healthcare Support Wherever You're Staying
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