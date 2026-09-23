import { useEffect, useState } from "react";

/* ==================================================================
   RatnagiriLoader — "Dawn on the Konkan Railway"

   A full-scene loading screen: the sun rises behind the Sahyadris while
   a Konkan Railway train crosses a stone viaduct above the Arabian Sea.
   Every layer scrolls at its own speed (parallax), palms sway, waves
   roll, and a five-station progress line matches the loading messages.

   - Pure SVG + CSS transforms/opacity (GPU friendly, no images needed)
   - Respects prefers-reduced-motion (shows the finished still scene)
   - Drop-in: <RatnagiriLoader />
================================================================== */

const STATIONS = [
  { label: "Boarding", msg: "Boarding the Konkan Railway..." },
  { label: "Sahyadris", msg: "Chugging past the Sahyadris..." },
  { label: "Ghats", msg: "Crossing the ghats to Ratnagiri..." },
  { label: "Orchards", msg: "Passing through mango orchards..." },
  { label: "Ratnagiri", msg: "Ratnagiri approaching..." },
];
const STEP_MS = 2400;

/* ---------- deterministic helpers (no jumping on re-render) ---------- */
const rng = (seed) => {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

// Seamless, periodic ridge line. Integer wave numbers => end meets start,
// so two copies placed side by side loop without a visible seam.
// `flat` clips the peaks to give the flat-topped laterite look of the Sahyadris.
function makeRidge({ base, amp, comps, flat = 1, bottom, W = 1440 }) {
  const wsum = comps.reduce((a, c) => a + c[1], 0);
  const yAt = (x) => {
    const t = (2 * Math.PI * x) / W;
    let v = comps.reduce((a, [k, w, p]) => a + w * Math.sin(k * t + p), 0) / wsum;
    v = 0.5 + 0.5 * v;
    v = Math.min(v, flat) / flat;
    return base - amp * v;
  };
  let d = "";
  for (let x = 0; x <= W; x += 16) d += `${x === 0 ? "M" : " L"}${x} ${yAt(x).toFixed(1)}`;
  return { d: `${d} L${W} ${bottom} L0 ${bottom} Z`, yAt };
}

const FAR = makeRidge({ base: 548, amp: 130, flat: 0.72, bottom: 600, comps: [[2, 1, 0.4], [3, 0.7, 1.9], [5, 0.45, 3.1], [8, 0.2, 0.7]] });
const MID = makeRidge({ base: 552, amp: 62, bottom: 600, comps: [[3, 1, 2.2], [4, 0.6, 0.3], [7, 0.3, 4]] });
const LH_X = 1050;
const LH_Y = FAR.yAt(LH_X);

const STARS = (() => {
  const r = rng(17);
  return Array.from({ length: 26 }, () => ({ x: r() * 1440, y: 12 + r() * 300, s: 0.8 + r() * 1.4, dur: 2 + r() * 3, delay: r() * 4 }));
})();

const WAVE = "q30 -8 60 0" + " t60 0".repeat(47); // 2880 units, period 240 (divides the 1440 scroll)

/* ---------- scene pieces ---------- */
// Renders children twice, side by side, and scrolls the pair by one tile width.
function Scroller({ cls, children }) {
  return (
    <g className={cls}>
      {children}
      <g transform="translate(1440 0)">{children}</g>
    </g>
  );
}

function WaveLine({ y, cls, op, w = 1.5 }) {
  return (
    <g className={cls}>
      <path d={`M0 ${y} ${WAVE}`} fill="none" stroke="#FFE9B8" strokeOpacity={op} strokeWidth={w} />
    </g>
  );
}

const FROND = "M0 0 C26 -30 66 -34 104 -2 C68 -14 30 -12 0 6 Z";
const ANGLES = [-172, -140, -108, -72, -40, -8, 20, 160];

function PalmTree({ x, y, s, d = 0, fill }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <g className="rl-sway" style={{ animationDelay: `${-d}s` }}>
        <path d="M-8 0 C-2 -100 4 -190 8 -276 L16 -275 C14 -188 10 -98 8 0 Z" />
        <g transform="translate(12 -277)">
          {ANGLES.map((a, i) => (
            <g key={a} className="rl-frond" style={{ "--r": 2 + (i % 3) * 1.4, animationDelay: `${-i * 0.55 - d}s` }}>
              <path d={FROND} transform={`rotate(${a})`} />
            </g>
          ))}
          <circle cx="-3" cy="9" r="5" />
          <circle cx="6" cy="10" r="5" />
        </g>
      </g>
    </g>
  );
}

// Alphonso nod: a round mango canopy with a few golden fruit
function MangoTree({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="-22" width="6" height="22" fill="#0a3d3c" />
      <ellipse cx="0" cy="-36" rx="28" ry="20" fill="#0c5245" />
      <ellipse cx="-14" cy="-28" rx="15" ry="11" fill="#0c5245" />
      <ellipse cx="15" cy="-30" rx="14" ry="10" fill="#0c5245" />
      <circle cx="-9" cy="-30" r="2.6" fill="#F2B233" />
      <circle cx="10" cy="-40" r="2.6" fill="#F2B233" />
      <circle cx="3" cy="-25" r="2.6" fill="#E4632D" />
    </g>
  );
}

function Wheel({ cx }) {
  return (
    <g transform={`translate(${cx} 587)`}>
      <circle r="6" fill="#20242a" stroke="#7b838a" strokeWidth="1.3" />
      <g className="rl-wheel">
        <line x1="-4.5" y1="0" x2="4.5" y2="0" stroke="#9aa2a8" strokeWidth="1" />
        <line x1="0" y1="-4.5" x2="0" y2="4.5" stroke="#9aa2a8" strokeWidth="1" />
      </g>
    </g>
  );
}

function Coach({ x }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x="0" y="546" width="96" height="6" rx="3" fill="#cdbb99" />
      <rect x="0" y="550" width="96" height="35" rx="4" fill="#F4E7CF" />
      <rect x="0" y="568" width="96" height="6" fill="#0f766e" />
      <rect x="0" y="574" width="96" height="2" fill="#F2B233" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={8 + i * 17} y="555" width="12" height="9" rx="2" fill="url(#rlWin)" />
      ))}
      <rect x="4" y="583" width="88" height="4" fill="#20242a" />
      {[14, 26, 70, 82].map((cx) => (
        <Wheel key={cx} cx={cx} />
      ))}
    </g>
  );
}

function Loco({ x }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <polygon className="rl-beam" points="116,572 430,546 430,598" fill="url(#rlBeam)" />
      <rect x="6" y="542" width="62" height="6" rx="2" fill="#7d3519" />
      <path d="M46 542 L54 528 L62 542" fill="none" stroke="#20242a" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="45" y="526.5" width="18" height="2" fill="#20242a" />
      <path d="M0 548 H92 L118 566 V585 H0 Z" fill="#B4532A" />
      <rect x="0" y="570" width="118" height="6" fill="#F2B233" />
      <path d="M68 553 H90 L104 565 H68 Z" fill="url(#rlWin)" />
      <rect x="10" y="554" width="8" height="10" rx="1" fill="#8f3f1f" />
      <rect x="22" y="554" width="8" height="10" rx="1" fill="#8f3f1f" />
      <rect x="34" y="554" width="8" height="10" rx="1" fill="#8f3f1f" />
      <circle cx="115" cy="572" r="3" fill="#FFF3C4" />
      {[16, 28, 74, 86].map((cx) => (
        <Wheel key={cx} cx={cx} />
      ))}
    </g>
  );
}

function Bird({ y, dur, delay }) {
  return (
    <g className="rl-bird" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
      <g transform={`translate(0 ${y})`}>
        <g className="rl-flap">
          <path d="M-11 2 Q-5.5 -6 0 1 Q5.5 -6 11 2" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

/* ---------- the full SVG scene ---------- */
function Scene() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="rlSky" gradientUnits="userSpaceOnUse" x1="0" y1="-80" x2="0" y2="548">
          <stop offset="0" stopColor="#06182a" />
          <stop offset="0.3" stopColor="#0b3149" />
          <stop offset="0.6" stopColor="#1d6a7b" />
          <stop offset="0.82" stopColor="#e39a5a" />
          <stop offset="1" stopColor="#f9d79c" />
        </linearGradient>
        <radialGradient id="rlSunGlow">
          <stop offset="0" stopColor="#FFD68C" stopOpacity="0.75" />
          <stop offset="0.45" stopColor="#FFB45A" stopOpacity="0.25" />
          <stop offset="1" stopColor="#FFB45A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rlRay" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-460">
          <stop offset="0" stopColor="#FFE2A0" stopOpacity="0.28" />
          <stop offset="1" stopColor="#FFE2A0" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="rlSunDisc">
          <stop offset="0" stopColor="#FFF4CF" />
          <stop offset="1" stopColor="#FFC46B" />
        </radialGradient>
        <linearGradient id="rlSea" gradientUnits="userSpaceOnUse" x1="0" y1="548" x2="0" y2="800">
          <stop offset="0" stopColor="#f0b06a" />
          <stop offset="0.1" stopColor="#4d9aa0" />
          <stop offset="0.35" stopColor="#17607a" />
          <stop offset="1" stopColor="#071f30" />
        </linearGradient>
        <linearGradient id="rlWin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE9A8" />
          <stop offset="1" stopColor="#F2B233" />
        </linearGradient>
        <linearGradient id="rlBeam" gradientUnits="userSpaceOnUse" x1="116" y1="0" x2="430" y2="0">
          <stop offset="0" stopColor="#FFF1BF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFF1BF" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="rlLh">
          <stop offset="0" stopColor="#FFE196" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFE196" stopOpacity="0" />
        </radialGradient>
        <pattern id="rlSleep" width="12" height="3" patternUnits="userSpaceOnUse">
          <rect width="6" height="3" fill="#1b3a48" />
        </pattern>
      </defs>

      {/* sky */}
      <rect x="0" y="-100" width="1440" height="648" fill="url(#rlSky)" />

      {/* fading stars — dawn is coming */}
      <g className="rl-stars">
        {STARS.map((st, i) => (
          <circle key={i} className="rl-twinkle" cx={st.x} cy={st.y} r={st.s} fill="#fff" style={{ animationDuration: `${st.dur}s`, animationDelay: `-${st.delay}s` }} />
        ))}
      </g>

      {/* birds crossing the dawn sky */}
      <Bird y={330} dur={46} delay={-6} />
      <Bird y={300} dur={58} delay={-30} />
      <Bird y={362} dur={52} delay={-18} />

      {/* the sun rises once, slowly, from behind the Sahyadris */}
      <g className="rl-sun">
        <g transform="translate(880 405)">
          <circle className="rl-glow" r="300" fill="url(#rlSunGlow)" />
          <g className="rl-spin">
            {Array.from({ length: 14 }, (_, i) => (
              <path key={i} d="M0 0 L-14 -460 L14 -460 Z" transform={`rotate(${i * (360 / 14)})`} fill="url(#rlRay)" />
            ))}
          </g>
          <circle r="58" fill="url(#rlSunDisc)" />
        </g>
      </g>

      {/* far Sahyadri ridge + lighthouse (slowest layer) */}
      <Scroller cls="rl-s-far">
        <path d={FAR.d} fill="#6ea3b0" opacity="0.55" />
        <g transform={`translate(${LH_X} ${LH_Y}) scale(1.3)`} opacity="0.92">
          <g transform="translate(0 -42)">
            <circle className="rl-glow" r="26" fill="url(#rlLh)" />
          </g>
          <path d="M-5 0 L-3.4 -36 L3.4 -36 L5 0 Z" fill="#efe2cd" />
          <rect x="-4.2" y="-24" width="8.4" height="6" fill="#B4532A" />
          <rect x="-5" y="-38" width="10" height="2" fill="#efe2cd" />
          <rect x="-3" y="-46" width="6" height="8" fill="#FFE6A5" />
          <path d="M-4.5 -46 L0 -52 L4.5 -46 Z" fill="#B4532A" />
        </g>
      </Scroller>

      {/* mid hills */}
      <Scroller cls="rl-s-mid">
        <path d={MID.d} fill="#2f7f86" opacity="0.92" />
      </Scroller>

      {/* sea */}
      <rect x="0" y="548" width="1440" height="252" fill="url(#rlSea)" />
      <rect x="0" y="546" width="1440" height="3" fill="#FFE2A8" opacity="0.5" />
      <WaveLine y={562} cls="rl-s-w1" op={0.25} />
      <WaveLine y={574} cls="rl-s-w2" op={0.3} />
      <WaveLine y={587} cls="rl-s-w3" op={0.4} />
      <WaveLine y={664} cls="rl-s-w4" op={0.22} />
      <WaveLine y={716} cls="rl-s-w4" op={0.18} w={2} />
      <WaveLine y={766} cls="rl-s-w3" op={0.14} w={2} />

      {/* sun glitter on the water */}
      {[[556, 110, 0], [565, 80, 0.8], [575, 60, 1.6], [586, 44, 2.4]].map(([y, w, d], i) => (
        <g key={i} transform={`translate(880 ${y})`}>
          <rect className="rl-glint" x={-w / 2} y="0" width={w} height="1.8" rx="0.9" fill="#FFE9B0" style={{ animationDelay: `-${d}s` }} />
        </g>
      ))}

      {/* far shore: mango groves, coconut palms, a fishing boat */}
      <Scroller cls="rl-s-shore">
        <path d="M0 548 Q240 538 480 548 T960 548 T1440 548 V558 H0 Z" fill="#0b4a48" />
        <MangoTree x={150} y={551} s={0.8} />
        <MangoTree x={560} y={551} s={0.7} />
        <MangoTree x={985} y={551} s={0.85} />
        {[[70, 0.42, 0], [250, 0.5, 1.2], [430, 0.36, 0.5], [640, 0.55, 2], [830, 0.4, 0.9], [1030, 0.5, 1.7], [1230, 0.38, 0.3], [1370, 0.46, 2.4]].map(([x, s, d], i) => (
          <PalmTree key={i} x={x} y={551} s={s} d={d} fill="#0a3d3c" />
        ))}
        <g transform="translate(1150 556)">
          <g className="rl-bob" fill="#B4532A">
            <path d="M-48 0 L48 0 L36 18 L-36 18 Z" />
            <rect x="-2" y="-38" width="4" height="38" />
            <path d="M2 -34 L34 -4 L2 -4 Z" fill="#F2B233" />
          </g>
        </g>
      </Scroller>

      {/* Konkan Railway viaduct — fastest layer */}
      <g className="rl-s-bridge">
        <rect x="0" y="526" width="2880" height="1.4" fill="#0c2230" opacity="0.85" />
        <rect x="0" y="596" width="2880" height="12" fill="#0c2230" />
        <rect x="0" y="593" width="2880" height="3" fill="url(#rlSleep)" />
        <rect x="0" y="594" width="2880" height="1.6" fill="#d5dbdd" opacity="0.75" />
        <rect x="0" y="596" width="2880" height="1" fill="#F2B233" opacity="0.3" />
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i} transform={`translate(${i * 240} 0)`}>
            <path fillRule="evenodd" d="M0 606 H240 V800 H0 Z M30 800 V740 A90 90 0 0 1 210 740 V800 Z" fill="#0c2230" />
            <line x1="120" y1="596" x2="120" y2="518" stroke="#0c2230" strokeWidth="2.4" />
            <rect x="106" y="516" width="28" height="2.4" fill="#0c2230" />
          </g>
        ))}
      </g>

      {/* the train */}
      <g transform="translate(700 0)">
        <g className="rl-chug">
          <Coach x={-210} />
          <Coach x={-110} />
          <Loco x={-10} />
        </g>
        <g transform="translate(10 541)">
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} className="rl-puff" r="6" fill="#efe6d6" style={{ animationDelay: `${-i * 0.72}s` }} />
          ))}
        </g>
      </g>
    </svg>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&family=Noto+Sans+Devanagari:wght@500;600&display=swap');

.rl-root { animation: rlIn .6s ease-out both; }
.rl-display { font-family: 'Fraunces', Georgia, serif; text-shadow: 0 4px 34px rgba(6,24,42,.55); }
.rl-body { font-family: 'Plus Jakarta Sans', 'Noto Sans Devanagari', system-ui, sans-serif; }
.rl-deva { font-family: 'Noto Sans Devanagari', 'Plus Jakarta Sans', sans-serif; text-shadow: 0 2px 18px rgba(6,24,42,.55); }

/* parallax scrolling: each layer moves one tile (1440 units) per loop */
.rl-s-far, .rl-s-mid, .rl-s-shore, .rl-s-bridge,
.rl-s-w1, .rl-s-w2, .rl-s-w3, .rl-s-w4 { will-change: transform; animation: rlScroll linear infinite; }
.rl-s-far { animation-duration: 140s; }
.rl-s-mid { animation-duration: 80s; }
.rl-s-shore { animation-duration: 36s; }
.rl-s-w1 { animation-duration: 26s; }
.rl-s-w2 { animation-duration: 18s; }
.rl-s-w3 { animation-duration: 12s; }
.rl-s-w4 { animation-duration: 8s; }
.rl-s-bridge { animation-duration: 9s; }
@keyframes rlScroll { from { transform: translateX(0); } to { transform: translateX(-1440px); } }

.rl-sun { animation: rlRise 14s cubic-bezier(.22,.8,.3,1) both; }
@keyframes rlRise { from { transform: translateY(170px); } to { transform: translateY(0); } }
.rl-spin { animation: rlSpin 90s linear infinite; }
.rl-wheel { animation: rlSpin .5s linear infinite; }
@keyframes rlSpin { to { transform: rotate(360deg); } }
.rl-glow { animation: rlGlow 6s ease-in-out infinite; }
@keyframes rlGlow { 0%,100% { opacity: .85; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }

.rl-stars { animation: rlFade 16s ease-out forwards; }
@keyframes rlFade { to { opacity: .12; } }
.rl-twinkle { animation: rlTwinkle 3s ease-in-out infinite; }
@keyframes rlTwinkle { 0%,100% { opacity: .25; } 50% { opacity: 1; } }

.rl-bird { animation: rlFly linear infinite; }
@keyframes rlFly { from { transform: translateX(-120px); } to { transform: translateX(1560px); } }
.rl-flap { animation: rlFlap .8s ease-in-out infinite; }
@keyframes rlFlap { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(.3); } }

.rl-sway { animation: rlSway 6s ease-in-out infinite; }
@keyframes rlSway { 0%,100% { transform: rotate(-1.6deg); } 50% { transform: rotate(1.6deg); } }
.rl-frond { animation: rlFrond 4.5s ease-in-out infinite; }
@keyframes rlFrond { 0%,100% { transform: rotate(calc(var(--r, 3) * -1deg)); } 50% { transform: rotate(calc(var(--r, 3) * 1deg)); } }
.rl-bob { animation: rlBob 5s ease-in-out infinite; }
@keyframes rlBob { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-3px) rotate(-1.5deg); } }

.rl-chug { animation: rlChug .42s ease-in-out infinite; }
@keyframes rlChug { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-1.2px); } }
.rl-puff { opacity: 0; animation: rlPuff 3.6s ease-out infinite; }
@keyframes rlPuff {
  0% { opacity: 0; transform: translate(0, 0) scale(.4); }
  12% { opacity: .55; }
  100% { opacity: 0; transform: translate(-120px, -46px) scale(2.6); }
}
.rl-beam { animation: rlBeam 2.4s ease-in-out infinite; }
@keyframes rlBeam { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
.rl-glint { animation: rlGlint 3.2s ease-in-out infinite; }
@keyframes rlGlint { 0%,100% { transform: scaleX(.55); opacity: .25; } 50% { transform: scaleX(1); opacity: .85; } }

/* text + progress */
.rl-letter { display: inline-block; animation: rlLetter .9s cubic-bezier(.2,.8,.2,1) both; }
@keyframes rlLetter { from { opacity: 0; transform: translateY(28px); filter: blur(8px); } to { opacity: 1; transform: none; filter: none; } }
.rl-fade { animation: rlUp .9s ease-out both; }
.rl-msg { animation: rlUp .6s ease-out both; }
@keyframes rlUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.rl-ring { animation: rlRing 1.8s ease-out infinite; }
@keyframes rlRing { 0% { transform: scale(.8); opacity: .7; } 100% { transform: scale(2.6); opacity: 0; } }
@keyframes rlIn { from { opacity: 0; } to { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .rl-root, .rl-root * { animation: none !important; }
}
`;

export default function RatnagiriLoader({ stations = STATIONS }) {
  const [i, setI] = useState(0);
  const last = stations.length - 1;

  // Walk through the stations, then hold on the last one ("approaching...")
  useEffect(() => {
    if (i >= last) return;
    const t = setTimeout(() => setI((v) => v + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [i, last]);

  const pct = (i / last) * 100;

  return (
    <div className="rl-root relative min-h-[85vh] w-full overflow-hidden bg-[#0b3149] text-white" aria-busy="true">
      <style>{CSS}</style>

      <Scene />

      {/* legibility gradient behind the progress area */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#06182a]/95 via-[#06182a]/60 to-transparent" />

      {/* wordmark */}
      <div className="relative z-10 flex flex-col items-center px-6 pt-[9vh] text-center">
        <h1 className="rl-display font-bold leading-none tracking-tight" style={{ fontSize: "clamp(3.2rem, 10vw, 7rem)" }}>
          {"Ratnagiri".split("").map((c, k) => (
            <span key={k} className="rl-letter" style={{ animationDelay: `${0.15 + k * 0.07}s` }}>
              {c}
            </span>
          ))}
        </h1>
        <p lang="mr" className="rl-fade rl-deva mt-3 text-2xl text-amber-200/90 sm:text-3xl" style={{ animationDelay: "1s" }}>
          रत्नागिरी
        </p>
        <p className="rl-fade rl-body mt-3 text-sm text-white/75 sm:text-base" style={{ animationDelay: "1.3s" }}>
          Where the Sahyadris meet the sea
        </p>
      </div>

      {/* status + station progress */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-6 px-6 pb-8 sm:pb-10">
        <p key={i} role="status" aria-live="polite" className="rl-msg rl-body text-base text-white/95 sm:text-lg">
          {stations[i].msg}
        </p>

        <div className="relative mx-auto h-9 w-[calc(100%-3rem)] max-w-xl">
          <div className="absolute inset-x-0 top-0 h-[3px] rounded-full bg-white/20" />
          <div
            className="absolute left-0 top-0 h-[3px] rounded-full bg-gradient-to-r from-amber-300 to-amber-400 transition-[width] duration-[1600ms] ease-out"
            style={{ width: `${pct}%` }}
          />

          {stations.map((s, k) => (
            <div key={s.label} className="absolute top-0 -translate-x-1/2" style={{ left: `${(k / last) * 100}%` }}>
              <span className={`absolute left-1/2 top-[1.5px] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-700 ${k <= i ? "bg-amber-200" : "bg-white/40"}`} />
              <span className={`rl-body mt-3 block whitespace-nowrap text-[10px] transition-colors duration-700 sm:text-xs ${k <= i ? "text-white" : "text-white/45"}`}>
                {s.label}
              </span>
            </div>
          ))}

          {/* the "train" marker gliding along the line */}
          <span
            className="absolute top-[1.5px] h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-[1600ms] ease-out"
            style={{ left: `${pct}%` }}
          >
            <span className="rl-ring absolute inset-0 rounded-full bg-amber-300/60" />
            <span className="absolute inset-0 rounded-full bg-amber-300 shadow-[0_0_14px_3px_rgba(252,211,77,.7)]" />
          </span>
        </div>
      </div>
    </div>
  );
}