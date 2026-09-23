import { useState, useEffect, useRef } from "react";
import {
  Mountain,
  CloudRain,
  Waves,
  Wheat,
  Fish,
  Factory,
  Package,
  Ship,
  Compass,
  Home,
  TrendingUp,
  Sprout,
  Award,
} from "lucide-react";
import EconomyHero from "../assets/society.png"; // swap with your chosen hero image

/* Reusable scroll-reveal, same pattern as Society.jsx / DashboardOverview */
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

/* Quick-fact strip: geography numbers that shape the economy */
const quickFacts = [
  { icon: Mountain, label: "Terrain", value: "Sahyadris to Sea" },
  { icon: CloudRain, label: "Avg. Rainfall", value: "3,038 mm" },
  { icon: Waves, label: "Coastline", value: "173 km" },
  { icon: Award, label: "ODOP Product", value: "Mango (Hapus)" },
];

const cropZones = [
  {
    icon: Waves,
    title: "Coastal Belt",
    items: "Rice, Coconut, Arecanut",
  },
  {
    icon: Mountain,
    title: "Hilly Terrain",
    items: "Mango, Cashew, Millets",
  },
  {
    icon: Sprout,
    title: "Signature Crops",
    items: "Alphonso Mango, Cashew, Kokum",
  },
];

const fisheryChain = [
  "Fishers & Boat Operations",
  "Net & Equipment Supply",
  "Transport & Auctioning",
  "Processing & Marketing",
  "Retail",
];

const tourismLinkages = [
  "Homestays",
  "Local Food",
  "Guiding",
  "Transport",
  "Handicrafts",
  "Recreation",
];

export default function Economy() {
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
        .rt-card:hover { transform: translateY(-4px); box-shadow: 0 26px 50px -18px rgba(180,83,42,0.35); }
        @media (prefers-reduced-motion: reduce) { .rt-card, .rt-card:hover { transition: none; transform: none; } }
      `}</style>

      {/* ================= Hero ================= */}
      <section className="relative h-[380px] sm:h-[460px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${EconomyHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
        <div className="relative h-full flex flex-col justify-end px-5 sm:px-10 lg:px-16 pb-10 max-w-[1680px] mx-auto">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] text-white/80 mb-3 font-body">
            About the District &middot; Economy
          </p>
          <h1 className="font-display text-white text-4xl sm:text-5xl lg:text-6xl mb-3">
            Economy of Ratnagiri
          </h1>
          <p className="text-white/85 text-sm sm:text-base max-w-2xl font-body leading-relaxed">
            From orchard to harbour — an economy shaped by the Sahyadris, the
            monsoon and the Arabian Sea.
          </p>
        </div>
      </section>

      {/* ================= Quick Facts ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-10 sm:py-12 bg-slate-50">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickFacts.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rt-card bg-white rounded-xl p-4 text-center"
                >
                  <span className="w-9 h-9 mx-auto rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
                    <Icon size={16} />
                  </span>
                  <p className="font-display text-lg sm:text-xl text-slate-900">
                    {value}
                  </p>
                  <p className="text-[11px] text-slate-500 font-body mt-0.5">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= Geography & Foundations ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16">
        <div className="max-w-[1680px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Mountain size={16} />
              Geography &amp; Foundations
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              An Economy Rooted in Geography
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body mb-4">
              The district extends from the Sahyadri ranges to the Arabian
              Sea and receives an average annual rainfall of about 3,038 mm.
              Much of the terrain is hilly, while the coastal belt is
              characterised by beaches, creeks, estuaries and fertile
              valleys.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body">
              These conditions have shaped an economy based on agriculture
              and horticulture, fisheries, food processing, small
              enterprises, tourism and trade.
            </p>
          </Reveal>
          <Reveal>
            <div className="rounded-2xl overflow-hidden h-72 sm:h-96 rt-card">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${EconomyHero})` }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= Agriculture & Horticulture ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16 bg-amber-50/40">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Wheat size={16} />
              Agriculture &amp; Horticulture
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              A Landscape of Different Cropping Systems
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl font-body mb-8">
              Different parts of the district support different crops, with
              Alphonso mango standing out as Ratnagiri's most distinctive
              agricultural product.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {cropZones.map(({ icon: Icon, title, items }) => (
              <div key={title} className="rt-card bg-white rounded-xl p-6">
                <span className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                  <Icon size={18} />
                </span>
                <h3 className="font-semibold text-slate-800 mb-2 font-body">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-body">
                  {items}
                </p>
              </div>
            ))}
          </div>

          <Reveal className="mt-6">
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-3xl">
              Cashew and kokum are also significant products, while coconut
              and other horticultural crops contribute to household incomes
              across the district.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================= Food Processing & ODOP ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16">
        <div className="max-w-[1680px] mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <Reveal>
            <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Factory size={16} />
              Processing &amp; Value Addition
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Beyond Raw Produce
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body mb-4">
              The agricultural economy is increasingly connected to
              processing and value addition. Ratnagiri has been identified
              under the Pradhan Mantri Formalisation of Micro Food Processing
              Enterprises scheme, with mango as its district-level product
              under the "One District One Product" approach.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body">
              Such initiatives provide opportunities to move beyond the sale
              of raw agricultural produce towards processing, packaging,
              branding and new markets.
            </p>
          </Reveal>
          <Reveal>
            <div className="rt-card bg-teal-50 rounded-2xl p-8 flex flex-col items-center text-center">
              <span className="w-14 h-14 rounded-full bg-white text-teal-700 flex items-center justify-center mb-4 shadow-sm">
                <Package size={26} />
              </span>
              <p className="text-xs font-bold uppercase tracking-wide text-teal-700 mb-1 font-body">
                One District One Product
              </p>
              <p className="font-display text-2xl text-slate-900">
                Alphonso Mango
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= The Sea Economy ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16 bg-slate-900">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Fish size={16} />
              The Sea Economy
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              The Coastline as an Economic Resource
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-body max-w-3xl mb-4">
              The sea is the second major economic resource. Ratnagiri's
              173-km coastline supports fishing communities, fish landing
              centres, trade and a range of related activities.
            </p>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-body max-w-3xl mb-8">
              Fishing generates employment not only for fishers but also for
              workers across the full value chain:
            </p>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {fisheryChain.map((step, i) => (
              <div
                key={step}
                className="rt-card bg-slate-800 rounded-xl p-4 text-center"
              >
                <span className="text-xs font-bold text-teal-400 font-body">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-white font-body mt-1.5 leading-snug">
                  {step}
                </p>
              </div>
            ))}
          </div>

          <Reveal className="mt-8">
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-body max-w-3xl flex items-start gap-2">
              <Ship size={18} className="shrink-0 mt-1 text-teal-400" />
              The district's marine landscapes and harbours have historically
              connected coastal communities to markets. Modern ports and
              improved road and railway connectivity further strengthen the
              movement of goods and people.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================= Tourism Economy ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Compass size={16} />
              Tourism Economy
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              A Growing Component of the District Economy
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-3xl mb-4">
              Ratnagiri combines beaches and coastal landscapes with forts,
              temples, caves, hot springs, waterfalls, forests and Sahyadri
              hillscapes. The district's traditional architecture and cuisine
              provide opportunities for experiences based on local culture
              rather than only conventional sightseeing.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-3xl mb-8">
              These linkages connect tourism directly with village economies:
            </p>
          </Reveal>

          <div className="flex flex-wrap gap-3">
            {tourismLinkages.map((item) => (
              <span
                key={item}
                className="rt-card bg-rose-50 text-rose-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full font-body"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Closing statement ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-16 sm:py-20 bg-amber-50/50">
        <div className="max-w-[1680px] mx-auto text-center">
          <Reveal>
            <TrendingUp className="mx-auto text-amber-700 mb-4" size={28} />
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Rooted in the Land, Growing With New Markets
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-2xl mx-auto">
              From orchard and coastline to processing units and homestays,
              Ratnagiri's economy continues to grow while staying connected
              to its agricultural and marine roots.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}