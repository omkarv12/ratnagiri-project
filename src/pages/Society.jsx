import { useState, useEffect, useRef } from "react";
import {
  Mountain,
  Waves,
  Users,
  Home,
  Wheat,
  Fish,
  Landmark,
  GraduationCap,
  TrendingUp,
  Sprout,
  BookOpen,
  Handshake,
  MapPin,
} from "lucide-react";
import SocietyHero from "../assets/Society.jpg"; // swap with your chosen hero image

/* Reusable scroll-reveal, same pattern as DashboardOverview */
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

/* Quick-fact strip: area, coastline, population, villages, gram panchayats */
const quickFacts = [
  { icon: Mountain, label: "Area", value: "8,208 sq. km" },
  { icon: Waves, label: "Coastline", value: "167 km" },
  { icon: Users, label: "Population (2011)", value: "16.15 lakh" },
  { icon: Home, label: "Rural Population", value: "13.51 lakh" },
  { icon: MapPin, label: "Villages", value: "1,543" },
  { icon: Handshake, label: "Gram Panchayats", value: "844" },
];

const notablePersonalities = [
  "Lokmanya Bal Gangadhar Tilak",
  "Maharshi Dhondo Keshav Karve",
  "Pandurang Vaman Kane",
  "Vinayak Damodar Savarkar",
  "Dr. B. R. Ambedkar",
];

export default function Society() {
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
      <section className="relative h-[380px] sm:h-[460px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${SocietyHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
        <div className="relative h-full flex flex-col justify-end px-5 sm:px-10 lg:px-16 pb-10 max-w-[1680px] mx-auto">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] text-white/80 mb-3 font-body">
            About the District &middot; Society
          </p>
          <h1 className="font-display text-white text-4xl sm:text-5xl lg:text-6xl mb-3">
            Society of Ratnagiri
          </h1>
          <p className="text-white/85 text-sm sm:text-base max-w-2xl font-body leading-relaxed">
            A district shaped by the Sahyadris and the Arabian Sea — where
            village life, livelihoods and culture remain deeply rooted in
            geography.
          </p>
        </div>
      </section>

      {/* ================= Quick Facts ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-10 sm:py-12 bg-slate-50">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickFacts.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rt-card bg-white rounded-xl p-4 text-center"
                >
                  <span className="w-9 h-9 mx-auto rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mb-2">
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

      {/* ================= Geography & Rural Character ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16">
        <div className="max-w-[1680px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Mountain size={16} />
              Geography &amp; Rural Life
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              A District Shaped by Its Land
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body mb-4">
              Located between the Sahyadri hills and the Arabian Sea,
              Ratnagiri is characterised by coastal settlements, forested
              hills, river valleys, orchards and numerous villages. With an
              area of 8,208 sq. km and a 167-km coastline, the district is
              predominantly rural — around 13.51 lakh of its 16.15 lakh
              residents live in rural areas.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body">
              The district has nine administrative blocks, 1,543 villages and
              844 Gram Panchayats, giving local communities an important role
              in everyday social and economic life.
            </p>
          </Reveal>
          <Reveal>
            <div className="rounded-2xl overflow-hidden h-72 sm:h-96 rt-card">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${SocietyHero})` }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= Livelihoods & Cultural Rhythm ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16 bg-amber-50/40">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Wheat size={16} />
              Livelihoods &amp; Culture
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Life Tied to the Konkan Rhythm
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl font-body mb-8">
              Agriculture, fishing, crafts and local commerce have
              traditionally been embedded in village life, following the
              seasonal rhythm of the monsoon.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="rt-card bg-white rounded-xl p-6">
              <span className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <Sprout size={18} />
              </span>
              <h3 className="font-semibold text-slate-800 mb-2 font-body">
                Land &amp; Orchards
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-body">
                Rice, coconut, arecanut, mango, cashew, kokum and a variety of
                locally grown crops form part of both the agricultural
                landscape and the region's food culture.
              </p>
            </div>
            <div className="rt-card bg-white rounded-xl p-6">
              <span className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                <Fish size={18} />
              </span>
              <h3 className="font-semibold text-slate-800 mb-2 font-body">
                Fishing Communities
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-body">
                Along the coast, fishing communities have developed
                distinctive knowledge and practices associated with the sea,
                creeks, boats, fish species and seasonal conditions.
              </p>
            </div>
            <div className="rt-card bg-white rounded-xl p-6">
              <span className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <Users size={18} />
              </span>
              <h3 className="font-semibold text-slate-800 mb-2 font-body">
                Seasonal Rhythm
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-body">
                The monsoon, cultivation, fishing and harvests continue to
                shape food, festivals and social practices across the year.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Architecture, Cuisine & Heritage ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-slate-800 text-xs font-extrabold uppercase tracking-[0.15em] mb-3">
              <Landmark size={16} />
              Heritage &amp; Identity
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Architecture, Cuisine &amp; Cultural Landscape
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-3xl mb-4">
              Ratnagiri's social identity is expressed through its
              architecture, cuisine, religious traditions and cultural
              heritage. Traditional houses with tiled roofs, courtyards and
              gardens reflect adaptation to the Konkan climate. Temples,
              forts, caves and historic settlements form an important part of
              the cultural landscape.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-3xl">
              Konkani cuisine — rice-based foods, coconut preparations and
              seafood — remains an important expression of local identity.
              Beaches, estuaries, rivers, forests and plateaus continue to
              provide spaces for recreation, pilgrimage and community
              activities.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================= Notable Personalities ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16 bg-slate-900">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <BookOpen size={16} />
              Intellectual Heritage
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              A Legacy of Reform &amp; Public Life
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-body max-w-3xl mb-8">
              Ratnagiri has contributed significantly to Maharashtra's
              intellectual, social and political history — a heritage of
              education, social reform, public life and national movements.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {notablePersonalities.map((name) => (
              <div
                key={name}
                className="rt-card bg-slate-800 rounded-xl p-4 text-center"
              >
                <p className="text-sm font-semibold text-white font-body leading-snug">
                  {name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Modern Transformation ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16">
        <div className="max-w-[1680px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <TrendingUp size={16} />
              A Changing Society
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Tradition Meets Connectivity
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body mb-4">
              Education and migration have influenced contemporary society.
              Ratnagiri increasingly merges traditional livelihoods with
              employment, education and entrepreneurship.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body">
              Over the past 20 years, the Konkan Railway and better road
              infrastructure have connected Ratnagiri with Mumbai, Pune and
              other urban centres — allowing people, ideas and resources to
              flow while maintaining strong connections with their roots in
              villages.
            </p>
          </Reveal>
          <Reveal>
            <div className="grid grid-cols-2 gap-4">
              <div className="rt-card bg-teal-50 rounded-xl p-6">
                <GraduationCap className="text-teal-700 mb-2" size={20} />
                <p className="text-xs sm:text-sm text-slate-700 font-body leading-relaxed">
                  Growing access to education and new career paths
                </p>
              </div>
              <div className="rt-card bg-amber-50 rounded-xl p-6">
                <Handshake className="text-amber-700 mb-2" size={20} />
                <p className="text-xs sm:text-sm text-slate-700 font-body leading-relaxed">
                  Konkan Railway linking villages to major cities
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= Women & Cooperatives ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16 bg-teal-50/50">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Users size={16} />
              Community Participation
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Women &amp; Cooperatives Driving Change
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-3xl">
              Experiencing Ratnagiri means learning about diverse knowledge
              traditions, local institutions, and witnessing changing
              occupations and new aspirations. Women's participation has been
              an especially important part of this changing landscape.
              Cooperatives too provide mechanisms through which people
              participate collectively in economic activity and
              decision-making.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================= Future Outlook ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-16 sm:py-20 bg-slate-900">
        <div className="max-w-[1680px] mx-auto text-center">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Building on Community Assets
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-body max-w-2xl mx-auto">
              Ratnagiri's future social development lies in strengthening
              these community assets while improving access to education,
              healthcare, employment, digital services and livelihood
              opportunities. Preserving local culture and ecology alongside
              new skills and opportunities can help safeguard sustainable
              development rooted in the district's rich social-ecological
              history.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}