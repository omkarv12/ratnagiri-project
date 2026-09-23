import { useState, useEffect, useRef } from "react";
import {
  Building2,
  FileText,
  Laptop,
  ShieldCheck,
  BarChart3,
  Users,
  AlertTriangle,
  Network,
  Landmark,
  Scale,
  Database,
  Sprout,
} from "lucide-react";
import GovernanceHero from "../assets/good_governance.jpg"; // swap with your chosen hero image

/* Reusable scroll-reveal, same pattern as Society.jsx / Economy.jsx */
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

/* Quick-fact strip: administrative structure numbers */
const quickFacts = [
  { icon: Building2, label: "Revenue Subdivisions", value: "5" },
  { icon: Landmark, label: "Revenue Blocks", value: "9" },
  { icon: Users, label: "Municipalities", value: "9" },
  { icon: Network, label: "Gram Panchayats", value: "844" },
];

const digitalServices = [
  "National Government Services Portal",
  "e-Courts Services",
  "Maharashtra RTS System",
  "NIC Services",
  "Grievance Redressal",
  "Disaster-Management Dashboard",
  "Land Databases",
  "Public Datasets",
];

const transparencyTools = [
  {
    icon: Scale,
    title: "Right to Information",
    description:
      "RTI information for the Collectorate, Sub-Divisional Offices, Tahsildar offices and other government institutions.",
  },
  {
    icon: FileText,
    title: "Citizen Charters",
    description:
      "Documents that define services and responsibilities, making administrative processes accessible to the public.",
  },
  {
    icon: Database,
    title: "Public Notices & Tenders",
    description:
      "Online publication of government orders, tenders, recruitment information and departmental disclosures.",
  },
];

const disasterFocus = [
  "Heavy Monsoon Rainfall",
  "Coastal Hazards",
  "Landslides",
  "Flooding",
  "Water Management",
  "Mangrove & Coastal-Zone Protection",
];

export default function GoodGovernance() {
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
      <section className="relative h-[380px] sm:h-[460px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${GovernanceHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
        <div className="relative h-full flex flex-col justify-end px-5 sm:px-10 lg:px-16 pb-10 max-w-[1680px] mx-auto">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] text-white/80 mb-3 font-body">
            About the District &middot; Good Governance
          </p>
          <h1 className="font-display text-white text-4xl sm:text-5xl lg:text-6xl mb-3">
            Good Governance in Ratnagiri
          </h1>
          <p className="text-white/85 text-sm sm:text-base max-w-2xl font-body leading-relaxed">
            Decentralised administration, digital services and community
            institutions working together across the district.
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
                  <span className="w-9 h-9 mx-auto rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
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

      {/* ================= Administrative Structure ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16">
        <div className="max-w-[1680px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Building2 size={16} />
              Administrative Structure
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Governance at Multiple Levels
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body mb-4">
              Good governance in Ratnagiri is built around decentralised
              administration, citizen services, digital governance,
              transparency, planning and coordination across several
              departments. The district has five revenue subdivisions, nine
              revenue blocks, nine municipalities and 844 Gram Panchayats
              covering 1,543 villages.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body">
              This administrative structure places governance at multiple
              levels — from the District Collectorate and sub-divisional
              offices to local governments and village institutions.
            </p>
          </Reveal>
          <Reveal>
            <div className="rounded-2xl overflow-hidden h-72 sm:h-96 rt-card">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${GovernanceHero})` }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= Citizen Services ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16 bg-emerald-50/40">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <ShieldCheck size={16} />
              Citizen Services
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Accessible Public Services
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl font-body mb-8">
              Ratnagiri implements the Maharashtra Right to Public Services
              Act, 2015, providing notified government services in a
              transparent, speedy and time-bound manner through the Aaple
              Sarkar system.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="rt-card bg-white rounded-xl p-6">
              <span className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <FileText size={18} />
              </span>
              <h3 className="font-semibold text-slate-800 mb-2 font-body">
                Right to Public Services Act
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-body">
                A legal framework ensuring notified services are delivered on
                time, with accountability built into the process.
              </p>
            </div>
            <div className="rt-card bg-white rounded-xl p-6">
              <span className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                <Laptop size={18} />
              </span>
              <h3 className="font-semibold text-slate-800 mb-2 font-body">
                Aaple Sarkar
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-body">
                The district website provides access to information about the
                Act and related public-service mechanisms.
              </p>
            </div>
            <div className="rt-card bg-white rounded-xl p-6">
              <span className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <ShieldCheck size={18} />
              </span>
              <h3 className="font-semibold text-slate-800 mb-2 font-body">
                Speedy &amp; Time-Bound
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-body">
                Services are designed to reach citizens transparently,
                without unnecessary delay at any level.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Digital Governance ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16 bg-slate-900">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Laptop size={16} />
              Digital Governance
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Services Without a Physical Visit
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-body max-w-3xl mb-8">
              Digital governance has become an increasingly important part of
              the district's administrative infrastructure. Ratnagiri's
              official website provides access to e-governance services and
              public data systems:
            </p>
          </Reveal>

          <div className="flex flex-wrap gap-3">
            {digitalServices.map((service) => (
              <span
                key={service}
                className="rt-card bg-slate-800 text-teal-300 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full font-body"
              >
                {service}
              </span>
            ))}
          </div>

          <Reveal className="mt-8">
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-body max-w-3xl">
              These systems allow citizens to access information and services
              without depending entirely on physical visits to government
              offices.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================= Transparency & Accountability ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-slate-800 text-xs font-extrabold uppercase tracking-[0.15em] mb-3">
              <Scale size={16} />
              Transparency &amp; Accountability
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Open Access to Government Processes
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl font-body mb-8">
              Transparency and accountability are supported through the Right
              to Information Act, citizen charters, public notices, tenders
              and departmental disclosures.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {transparencyTools.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rt-card bg-white rounded-xl p-6">
                <span className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
                  <Icon size={18} />
                </span>
                <h3 className="font-semibold text-slate-800 mb-2 font-body">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-body">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Evidence-Based Planning ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16 bg-amber-50/40">
        <div className="max-w-[1680px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <BarChart3 size={16} />
              Evidence-Based Planning
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Using Data to Understand Local Conditions
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body mb-4">
              The District Statistical Office collects and compiles
              socio-economic information, undertakes surveys and censuses,
              evaluates government schemes and publishes the District Social
              and Economic Review and taluka-level indicators.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body">
              The district also maintains a District Strategic Plan,
              providing a framework for prioritising development activities.
            </p>
          </Reveal>
          <Reveal>
            <div className="rt-card bg-white rounded-2xl p-8 flex flex-col items-center text-center">
              <span className="w-14 h-14 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                <BarChart3 size={26} />
              </span>
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700 mb-1 font-body">
                Published Annually
              </p>
              <p className="font-display text-xl text-slate-900">
                District Social &amp; Economic Review
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= Local Governance ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Users size={16} />
              Local Governance
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Institutions Close to the Village
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-3xl mb-4">
              Local governance is particularly important in a predominantly
              rural district. Gram Panchayats and Panchayat Samitis provide
              an institutional link between communities and government
              programmes.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-3xl flex items-start gap-2">
              <Sprout size={18} className="shrink-0 mt-1 text-teal-600" />
              Schemes such as the Mahatma Gandhi National Rural Employment
              Guarantee programme support locally relevant works including
              orchards, tree plantation, irrigation wells, farm ponds,
              composting facilities and livestock infrastructure —
              demonstrating how public investment can support livelihoods,
              natural-resource management and village infrastructure
              together.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================= Governance Challenges ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16 bg-slate-900">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <AlertTriangle size={16} />
              Governance Challenges
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Coordinating Around Geography &amp; Environment
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-body max-w-3xl mb-8">
              Ratnagiri also faces governance challenges associated with its
              geography and environmental conditions, requiring coordination
              between departments and communities:
            </p>
          </Reveal>

          <div className="flex flex-wrap gap-3 mb-8">
            {disasterFocus.map((item) => (
              <span
                key={item}
                className="rt-card bg-slate-800 text-rose-300 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full font-body"
              >
                {item}
              </span>
            ))}
          </div>

          <Reveal>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-body max-w-3xl">
              Disaster-management control rooms and dedicated digital systems
              form part of the district's preparedness and response
              infrastructure. Urban and regional planning mechanisms also
              address planned development, land-use regulation and
              environmental concerns, including mangrove conservation and
              coastal-zone management.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================= Looking Ahead ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-16 sm:py-20 bg-emerald-50/50">
        <div className="max-w-[1680px] mx-auto text-center">
          <Reveal>
            <Network className="mx-auto text-emerald-700 mb-4" size={28} />
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Responsive, Transparent &amp; Resilient
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-2xl mx-auto">
              Ratnagiri is working on strengthening governance by integrating
              administrative data, GIS, environmental monitoring and citizen
              participation. Combining digital systems with strong local
              institutions and community knowledge can make governance more
              responsive, transparent and resilient — while ensuring
              development remains suited to Ratnagiri's distinctive social,
              economic and ecological context.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}