import { useState, useEffect, useRef } from "react";
import {
  Landmark,
  Languages,
  Sparkles,
  Drama,
  Music,
  Home,
  UtensilsCrossed,
  BookOpen,
  Compass,
  Flag,
  Church,
  Waves,
  Mountain,
  Flame,
  Heart,
} from "lucide-react";
import CultureHero from "../assets/Society.jpg"; // swap with your chosen hero image

/* Reusable scroll-reveal, same pattern as Economy.jsx / Society.jsx */
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

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

const quickFacts = [
  { icon: Landmark, label: "Heritage", value: "Parshuram Kshetra" },
  { icon: Languages, label: "Languages", value: "Marathi · Konkani" },
  { icon: Sparkles, label: "Signature Festival", value: "Ganeshotsav" },
  { icon: Drama, label: "Folk Theatre", value: "Dashavatar" },
];

// Check this list against your Experiences page so the places match.
const sacredPlaces = [
  {
    icon: Waves,
    title: "Ganpatipule",
    text: "Coastal Ganesh temple on the beach",
  },
  {
    icon: Mountain,
    title: "Marleshwar",
    text: "Shiva shrine near a waterfall in the Sahyadri foothills",
  },
  {
    icon: Church,
    title: "Parshuram (Chiplun)",
    text: "Temple linked to the Parshuram tradition",
  },
  {
    icon: Landmark,
    title: "Velneshwar & village shrines",
    text: "Quiet pilgrimage stops along the coast",
  },
];

const festivals = [
  {
    title: "Ganeshotsav",
    text: "The most important festival of the Konkan, with homes welcoming Ganesha, aartis, bhajans and family gatherings.",
  },
  {
    title: "Shimga (Holi)",
    text: "A village festival marked by processions, folk songs and the carrying of palanquins (palkhi) of village deities.",
  },
  {
    title: "Gudi Padwa & Diwali",
    text: "Celebrated with traditional food, rangoli and family rituals.",
  },
  {
    title: "Temple Jatras & Utsavs",
    text: "Annual fairs at local shrines that bring communities together.",
  },
];

const performingArts = [
  {
    icon: Drama,
    title: "Dashavatar",
    text: "A traditional Konkan folk theatre form that tells stories of Vishnu's ten incarnations through masks, costume and dance. It is typically performed in temple festivals and village fairs.",
  },
  {
    icon: Music,
    title: "Kirtan & Bhajan",
    text: "Devotional storytelling and singing remain a part of temple events and festival evenings.",
  },
  {
    icon: Heart,
    title: "Village Folk Songs & Dances",
    text: "Songs of harvest, fishing and festivals, passed down through generations.",
  },
];

const foods = [
  "Fish Thali",
  "Solkadhi",
  "Ukadiche Modak",
  "Kombdi Vade",
  "Alphonso Aamras",
  "Kaju & Kokum Products",
];

const thinkers = [
  { name: "Lokmanya Bal Gangadhar Tilak", note: "Born in Ratnagiri" },
  {
    name: "Gopal Krishna Gokhale",
    note: "Social and political reformer, born at Kotluk near Guhagar",
  },
  {
    name: "Vinayak Damodar Savarkar",
    note: "Interned in Ratnagiri (1924–1937) and associated with the Patit Pavan Mandir",
  },
  {
    name: "Dhondo Keshav Karve",
    note: "Pioneer of women's education, from Murud",
  },
  { name: "Sane Guruji", note: "Writer and educator, from Palgad" },
  {
    name: "Bharat Ratna P. V. Kane",
    note: "Scholar of Dharmashastra, from Chiplun",
  },
];

const cultureTourism = [
  "Homestays",
  "Festival Visits",
  "Temple Trails",
  "Heritage Walks",
  "Local Cuisine",
  "Folk Performances",
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Culture() {
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
          style={{ backgroundImage: `url(${CultureHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
        <div className="relative h-full flex flex-col justify-end px-5 sm:px-10 lg:px-16 pb-10 max-w-[1680px] mx-auto">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] text-white/80 mb-3 font-body">
            About the District &middot; Culture
          </p>
          <h1 className="font-display text-white text-4xl sm:text-5xl lg:text-6xl mb-3">
            Culture of Ratnagiri
          </h1>
          <p className="text-white/85 text-sm sm:text-base max-w-2xl font-body leading-relaxed">
            Faith, folk traditions and freedom thinkers &mdash; a living Konkan
            heritage that is still celebrated in homes, temples and village
            squares.
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

      {/* ================= Heritage & Identity ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16">
        <div className="max-w-[1680px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Landmark size={16} />
              Heritage &amp; Identity
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              An Identity Shaped by the Konkan
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body mb-4">
              Ratnagiri sits in the Konkan, a coastal strip that local
              tradition associates with the sage Parshuram. Life here has
              long followed the rhythm of the monsoon, the harvest and the
              sea, and culture is woven into daily routine rather than kept
              for special occasions.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body">
              Marathi is the main language, with Konkani-influenced speech
              and local dialects heard across the district. Village deities
              (gramdevata), family temples and community gatherings remain
              central to social life.
            </p>
          </Reveal>
          <Reveal>
            <div className="rounded-2xl overflow-hidden h-72 sm:h-96 rt-card">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${CultureHero})` }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= Faith & Sacred Places ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16 bg-amber-50/40">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Church size={16} />
              Faith &amp; Sacred Places
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Temples by the Sea and in the Hills
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl font-body mb-8">
              Faith in Ratnagiri is closely tied to the landscape. Some
              temples face the open sea, while others sit among hills,
              laterite plateaus and mango orchards.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {sacredPlaces.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rt-card bg-white rounded-xl p-6">
                <span className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                  <Icon size={18} />
                </span>
                <h3 className="font-semibold text-slate-800 mb-2 font-body">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-body">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <Reveal className="mt-6">
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-3xl">
              Pilgrimage here often blends with beach, nature and village
              stays, so a visit can be devotional and relaxed at once.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================= Festivals & Celebrations ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Flame size={16} />
              Festivals &amp; Celebrations
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              A Calendar Built Around Community
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl font-body mb-8">
              Festivals in Ratnagiri are celebrated in villages as much as in
              towns, and families often travel home for them.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {festivals.map(({ title, text }) => (
              <div
                key={title}
                className="rt-card bg-rose-50/60 rounded-xl p-6 border-l-4 border-rose-400"
              >
                <h3 className="font-display text-xl text-slate-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-body">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Performing Arts & Folk Traditions ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16 bg-teal-50/50">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Drama size={16} />
              Performing Arts &amp; Folk Traditions
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-8">
              Stories Told Through Song and Stage
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {performingArts.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rt-card bg-white rounded-xl p-6">
                <span className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                  <Icon size={18} />
                </span>
                <h3 className="font-semibold text-slate-800 mb-2 font-body">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-body">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Architecture & Living Heritage ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16">
        <div className="max-w-[1680px] mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <Reveal>
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Home size={16} />
              Architecture &amp; Living Heritage
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Built from the Land
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body mb-4">
              Traditional Konkan homes use locally quarried laterite stone
              and sloping tiled roofs designed for heavy monsoon rain, often
              with a courtyard, verandah and tulsi vrindavan.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body">
              The district's forts, such as Ratnadurg, Jaigad and Purnagad,
              and historic sites like Thibaw Palace add layers of coastal and
              royal history.
            </p>
          </Reveal>
          <Reveal>
            <div className="rt-card bg-amber-50 rounded-2xl p-8 flex flex-col items-center text-center">
              <span className="w-14 h-14 rounded-full bg-white text-amber-700 flex items-center justify-center mb-4 shadow-sm">
                <Landmark size={26} />
              </span>
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700 mb-1 font-body">
                Did You Know
              </p>
              <p className="text-sm text-slate-700 font-body leading-relaxed">
                Thibaw Palace was built for the exiled Burmese king Thibaw
                Min, who lived in Ratnagiri from 1885 until his death in
                1916.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= Food Culture ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16 bg-amber-50/40">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <UtensilsCrossed size={16} />
              Food Culture
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              A Cuisine of Coconut, Kokum and Catch of the Day
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-3xl mb-8">
              Konkan cooking uses coconut, kokum, rice and fresh seafood,
              with flavours that range from mild to fiery.
            </p>
          </Reveal>

          <div className="flex flex-wrap gap-3">
            {foods.map((item) => (
              <span
                key={item}
                className="rt-card bg-white text-amber-800 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full font-body"
              >
                {item}
              </span>
            ))}
          </div>

          <Reveal className="mt-8">
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-3xl">
              Food ties directly to the local economy: orchards, fishing and
              home kitchens supply what ends up on the plate, and homestays
              are one of the best ways to taste it.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================= Thinkers & Freedom Fighters ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16 bg-slate-900">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Flag size={16} />
              Thinkers &amp; Freedom Fighters
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              A Small District with Outsized Influence
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-body max-w-3xl mb-8">
              Ratnagiri has produced or hosted several figures who shaped
              modern India:
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {thinkers.map(({ name, note }, i) => (
              <div
                key={name}
                className="rt-card bg-slate-800 rounded-xl p-5"
              >
                <span className="text-xs font-bold text-teal-400 font-body">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm sm:text-base font-semibold text-white font-body mt-1.5 leading-snug">
                  {name}
                </p>
                <p className="text-xs sm:text-sm text-slate-300 font-body mt-1 leading-relaxed">
                  {note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Culture & Tourism ================= */}
      <section className="px-5 sm:px-10 lg:px-16 py-14 sm:py-16">
        <div className="max-w-[1680px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Compass size={16} />
              Culture &amp; Tourism
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Culture You Can Experience, Not Just See
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-3xl mb-8">
              Cultural tourism links directly to village livelihoods:
            </p>
          </Reveal>

          <div className="flex flex-wrap gap-3">
            {cultureTourism.map((item) => (
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
            <BookOpen className="mx-auto text-amber-700 mb-4" size={28} />
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Rooted in Tradition, Open to the World
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body max-w-2xl mx-auto">
              From temple bells at dawn to Dashavatar by lamplight,
              Ratnagiri's culture is a living heritage that visitors are
              warmly invited to share.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
