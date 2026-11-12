import { useState } from "react";
import {
  ShieldCheck,
  ExternalLink,
  Landmark,
  Shirt,
  HeartHandshake,
  Trash2,
  Mountain,
  PawPrint,
  Building2,
  IdCard,
  Car,
  Sprout,
} from "lucide-react";

/* ---------- Images (swap any URL for your own photos) ---------- */
const IMAGES = {
  hero: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=1800&q=80", // Gateway of India, Mumbai
  culture: "https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=1200&q=80", // temple / culture
  nature: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80", // Sahyadri greenery & waterfall
  safety: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80", // trekking / mountains
};

/* ---------- Content ---------- */
const groups = [
  {
    id: "culture",
    title: "Respect people and places",
    intro:
      "Maharashtra's temples, villages and festivals are living traditions. Visit them the way a good guest would.",
    image: IMAGES.culture,
    alt: "A temple in Maharashtra",
    tone: "from-amber-600 to-orange-700",
    rules: [
      { icon: Landmark, text: "Respect the local culture, traditions, and religious places." },
      { icon: Shirt, text: "Wear appropriate clothing when visiting temples and other religious sites." },
      { icon: HeartHandshake, text: "Support local communities by purchasing local products and services." },
    ],
  },
  {
    id: "nature",
    title: "Protect heritage and nature",
    intro:
      "Forts, caves and forests have lasted centuries. A little care keeps them here for the next visitor.",
    image: IMAGES.nature,
    alt: "Green Sahyadri hills with a waterfall",
    tone: "from-emerald-700 to-teal-800",
    rules: [
      { icon: Building2, text: "Avoid damaging monuments, heritage sites, or natural attractions." },
      { icon: PawPrint, text: "Do not disturb wildlife or feed wild animals." },
      { icon: Trash2, text: "Do not litter; always use designated dustbins." },
      { icon: Sprout, text: "Help preserve natural and cultural heritage by practicing responsible tourism." },
    ],
  },
  {
    id: "safety",
    title: "Stay safe on the move",
    intro:
      "Slippery rocks, strong tides and busy roads cause most holiday accidents. Plan for them.",
    image: IMAGES.safety,
    alt: "Trekkers on a mountain trail",
    tone: "from-sky-700 to-slate-800",
    rules: [
      { icon: Mountain, text: "Follow all safety guidelines at beaches, forts, waterfalls, and trekking routes." },
      { icon: IdCard, text: "Carry a valid ID proof while traveling." },
      { icon: Car, text: "Follow traffic rules and drive responsibly." },
    ],
  },
];

const references = [
  { label: "Maharashtra Tourism Development Corporation (MTDC)", href: "https://www.maharashtratourism.gov.in" },
  { label: "Ministry of Tourism, Government of India", href: "https://tourism.gov.in" },
  { label: "Incredible India – Responsible Tourism", href: "https://www.incredibleindia.gov.in" },
];

/* ---------- Image with graceful fallback ---------- */
function Photo({ src, alt, tone, Icon, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`bg-gradient-to-br ${tone} flex items-center justify-center ${className}`}
      >
        <Icon className="text-white/60" size={56} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

/* ---------- Page ---------- */
export default function RulesForTourists() {
  return (
    <div className="font-body bg-slate-50 text-slate-800">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Bricolage Grotesque', system-ui, sans-serif; letter-spacing: -0.02em; }
        .font-body { font-family: 'Hanken Grotesk', system-ui, sans-serif; }
      `}</style>

      {/* Hero */}
      <header className="relative isolate overflow-hidden bg-emerald-950">
        <Photo
          src={IMAGES.hero}
          alt="Gateway of India, Mumbai"
          tone="from-emerald-800 to-emerald-950"
          Icon={Landmark}
          className="absolute inset-0 w-full h-full opacity-60 -z-10"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-emerald-950 via-emerald-950/60 to-emerald-950/20" />
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-28 pb-14 sm:pt-44 sm:pb-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-400 text-emerald-950 text-sm font-semibold px-3.5 py-1.5 mb-6">
            <ShieldCheck size={16} />
            Travel responsibly in Maharashtra
          </span>
          <h1 className="font-display font-extrabold text-white text-4xl sm:text-6xl leading-[1.05] max-w-3xl">
            Rules for Tourists
          </h1>
          <p className="mt-5 max-w-2xl text-base sm:text-lg text-emerald-50/90 leading-relaxed">
            Tourist rules keep visitors safe, protect natural and cultural heritage, and keep
            destinations clean. They show respect for local communities, support sustainable
            tourism, and preserve these places for future generations.
          </p>
        </div>
      </header>

      {/* Rule groups */}
      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20 space-y-16 sm:space-y-24">
        {groups.map((g, idx) => {
          const flip = idx % 2 === 1;
          return (
            <section
              key={g.id}
              aria-labelledby={`${g.id}-title`}
              className="grid md:grid-cols-2 gap-8 md:gap-14 items-center"
            >
              <div className={flip ? "md:order-2" : ""}>
                <div className="relative">
                  <Photo
                    src={g.image}
                    alt={g.alt}
                    tone={g.tone}
                    Icon={g.rules[0].icon}
                    className="w-full aspect-[4/3] rounded-3xl shadow-xl"
                  />
                  <div
                    className={`hidden sm:block absolute -z-10 ${
                      flip ? "-left-4" : "-right-4"
                    } -bottom-4 w-3/4 h-3/4 rounded-3xl bg-gradient-to-br ${g.tone} opacity-20`}
                  />
                </div>
              </div>

              <div className={flip ? "md:order-1" : ""}>
                <h2
                  id={`${g.id}-title`}
                  className="font-display font-bold text-2xl sm:text-3xl text-emerald-950"
                >
                  {g.title}
                </h2>
                <p className="mt-2 text-slate-600 leading-relaxed">{g.intro}</p>

                <ul className="mt-6 space-y-3">
                  {g.rules.map(({ icon: Icon, text }) => (
                    <li
                      key={text}
                      className="flex items-start gap-4 rounded-2xl bg-white border border-slate-200 p-4"
                    >
                      <span
                        className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${g.tone} text-white flex items-center justify-center`}
                      >
                        <Icon size={20} />
                      </span>
                      <p className="text-[15px] leading-relaxed pt-1.5">{text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </main>

      {/* References */}
      <footer className="bg-emerald-950 text-emerald-50">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <h2 className="font-display font-bold text-xl sm:text-2xl">Official references</h2>
          <p className="mt-1 text-emerald-100/70 text-sm">
            Check these sites for current guidelines before you travel.
          </p>
          <ul className="mt-6 grid sm:grid-cols-3 gap-3">
            {references.map((ref) => (
              <li key={ref.href}>
                <a
                  href={ref.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group h-full flex items-start justify-between gap-3 rounded-2xl border border-emerald-800 bg-emerald-900/50 p-4 text-sm font-medium hover:bg-emerald-900 hover:border-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-colors"
                >
                  <span>{ref.label}</span>
                  <ExternalLink size={16} className="shrink-0 mt-0.5 text-amber-400" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  );
}