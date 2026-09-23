import { useMemo } from "react";

/* Seeded random so particles don't jump on re-render */
const rng = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

export const ambientCss = `
.rt-palm{transform-origin:100px 360px;animation:rtSway 7s ease-in-out infinite}
.rt-frond{transform-origin:0 0;animation:rtFrond 5s ease-in-out infinite}
.rt-swing{animation:rtSwing 4.5s ease-in-out infinite}
.rt-flutter{transform-origin:0 0;animation:rtFrond 3.2s ease-in-out infinite}
.rt-branch{transform-origin:258px 20px;animation:rtSway 9s ease-in-out infinite}
.rt-fall{position:absolute;top:0;animation:rtFall linear infinite;will-change:transform}
.rt-fall svg{animation:rtFlutter ease-in-out infinite}
.rt-spark{position:absolute;border-radius:9999px;animation:rtRise linear infinite;box-shadow:0 0 10px 2px currentColor}
.rt-bird{position:absolute;left:0;animation:rtFly linear infinite}
.rt-flap{transform-origin:20px 8px;animation:rtFlap .7s ease-in-out infinite}
.rt-wave{animation:rtWave linear infinite;will-change:transform}
.rt-cloud{position:absolute;left:0;animation:rtDrift linear infinite}
.rt-rays{animation:rtSpin 120s linear infinite}
.rt-glow{animation:rtGlow 7s ease-in-out infinite}
.rt-shimmer{animation:rtShimmer 9s ease-in-out infinite}
.rt-boat{animation:rtBob 6s ease-in-out infinite;transform-origin:652px 460px}
@keyframes rtSway{0%,100%{transform:rotate(-1.4deg)}50%{transform:rotate(1.4deg)}}
@keyframes rtFrond{0%,100%{transform:rotate(calc(var(--r,3)*-1deg))}50%{transform:rotate(calc(var(--r,3)*1deg))}}
@keyframes rtSwing{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
@keyframes rtFall{0%{transform:translate3d(0,-40px,0);opacity:0}8%{opacity:1}90%{opacity:1}100%{transform:translate3d(var(--drift),var(--fall),0);opacity:0}}
@keyframes rtFlutter{0%,100%{transform:translateX(-14px) rotate(-40deg)}50%{transform:translateX(14px) rotate(40deg)}}
@keyframes rtRise{0%{transform:translate3d(0,0,0);opacity:0}20%{opacity:.9}100%{transform:translate3d(var(--dx),calc(var(--rise)*-1),0);opacity:0}}
@keyframes rtFly{from{transform:translate3d(-8vw,0,0)}to{transform:translate3d(108vw,-50px,0)}}
@keyframes rtFlap{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.3)}}
@keyframes rtWave{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes rtDrift{from{transform:translateX(-40vw)}to{transform:translateX(110vw)}}
@keyframes rtSpin{to{transform:rotate(360deg)}}
@keyframes rtGlow{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.12)}}
@keyframes rtShimmer{0%{left:-40%;opacity:0}30%,70%{opacity:1}100%{left:120%;opacity:0}}
@keyframes rtBob{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-4px) rotate(-.6deg)}}
@media (prefers-reduced-motion:reduce){
.rt-palm,.rt-frond,.rt-swing,.rt-flutter,.rt-branch,.rt-fall,.rt-fall svg,.rt-spark,.rt-bird,.rt-flap,.rt-wave,.rt-cloud,.rt-rays,.rt-glow,.rt-shimmer,.rt-boat{animation:none!important}}
`;

/* ---------- Coconut palm: trunk sways, each frond flutters ---------- */
const FROND = "M0 0 C26 -30 66 -34 104 -2 C68 -14 30 -12 0 6 Z";
const ANGLES = [-172, -140, -108, -72, -40, -8, 20, 160];

function PalmShape({ fill, delay = 0 }) {
  return (
    <g className="rt-palm" style={{ animationDelay: `${-delay}s` }} fill={fill}>
      <path d="M92 360 C98 260 104 170 108 84 L116 85 C114 172 110 262 108 360 Z" />
      <g transform="translate(112 82)">
        {ANGLES.map((a, i) => (
          <g key={a} className="rt-frond" style={{ "--r": 2 + (i % 3) * 1.5, animationDelay: `${-i * 0.6 - delay}s` }}>
            <path d={FROND} transform={`rotate(${a})`} />
          </g>
        ))}
        <circle cx="-4" cy="8" r="5" /><circle cx="6" cy="10" r="5" /><circle cx="1" cy="16" r="4.5" />
      </g>
    </g>
  );
}

export function Palm({ className = "", fill = "#0f766e", delay = 0 }) {
  return (
    <svg className={className} viewBox="0 0 200 360" overflow="visible" aria-hidden="true">
      <PalmShape fill={fill} delay={delay} />
    </svg>
  );
}

/* ---------- Mango + hanging branch with swinging fruit ---------- */
function Mango() {
  return (
    <g>
      <path d="M0 -14 C13 -14 18 2 12 15 C6 27 -10 25 -13 10 C-16 -4 -9 -14 0 -14 Z" fill="#F2B233" />
      <path d="M4 -12 C14 -8 15 8 9 18 C14 4 12 -6 4 -12Z" fill="#E4632D" opacity=".75" />
      <path d="M0 -14 L1 -19" stroke="#5B7B2A" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function MangoBranch({ className = "" }) {
  const fruit = [[205, 34, 0], [150, 42, 1.3], [92, 50, 2.4]];
  const leaves = [[225, 30, -20], [170, 38, 15], [118, 46, -18], [64, 56, 20]];
  return (
    <svg className={className} viewBox="0 0 260 150" overflow="visible" fill="none" aria-hidden="true">
      <g className="rt-branch">
        <path d="M262 20 C200 28 130 38 40 60" stroke="#7C4A24" strokeWidth="4" strokeLinecap="round" />
        {leaves.map(([x, y, r], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
            <g className="rt-flutter" style={{ "--r": 5, animationDelay: `${-i}s` }}>
              <ellipse cx="0" cy="-14" rx="7" ry="20" fill="#3F7D4E" />
            </g>
          </g>
        ))}
        {fruit.map(([x, y, d], i) => (
          <g key={i} className="rt-swing" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${-d}s` }}>
            <line x1={x} y1={y} x2={x} y2={y + 30} stroke="#5B7B2A" strokeWidth="2" />
            <g transform={`translate(${x} ${y + 48}) scale(1.3)`}><Mango /></g>
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ---------- Particles ---------- */
export function FallingLeaves({ count = 12, fall = 800, seed = 7 }) {
  const items = useMemo(() => {
    const r = rng(seed);
    const colors = ["#0f766e", "#3F7D4E", "#6B9A3A", "#B4532A"];
    return Array.from({ length: count }, (_, i) => ({
      x: r() * 100, size: 14 + r() * 14, dur: 14 + r() * 12, delay: r() * 26,
      drift: (r() - 0.5) * 180, sway: 3 + r() * 3, op: 0.35 + r() * 0.35,
      color: colors[Math.floor(r() * 4)], mango: i % 7 === 3,
    }));
  }, [count, seed]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {items.map((p, i) => (
        <span key={i} className="rt-fall" style={{ left: `${p.x}%`, "--fall": `${fall}px`, "--drift": `${p.drift}px`, animationDuration: `${p.dur}s`, animationDelay: `-${p.delay}s` }}>
          <svg width={p.size} height={p.size} viewBox="-16 -20 32 40" style={{ animationDuration: `${p.sway}s`, opacity: p.op }}>
            {p.mango ? <Mango /> : (<>
              <path d="M0 -9 C7 -5 7 5 0 9 C-7 5 -7 -5 0 -9Z" transform="scale(1.6)" fill={p.color} />
              <path d="M0 -13 L0 13" stroke="rgba(0,0,0,.25)" strokeWidth="1" />
            </>)}
          </svg>
        </span>
      ))}
    </div>
  );
}

export function Sparks({ count = 16, rise = 320, seed = 3, color = "#FDE68A" }) {
  const items = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({ x: r() * 100, y: r() * 40, s: 2 + r() * 3, dur: 8 + r() * 8, delay: r() * 14, dx: (r() - 0.5) * 60 }));
  }, [count, seed]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {items.map((p, i) => (
        <span key={i} className="rt-spark" style={{ left: `${p.x}%`, bottom: `${p.y}%`, width: p.s, height: p.s, color, background: color, "--rise": `${rise}px`, "--dx": `${p.dx}px`, animationDuration: `${p.dur}s`, animationDelay: `-${p.delay}s` }} />
      ))}
    </div>
  );
}

function Birds() {
  const flock = [[14, 26, 0, 40], [22, 32, -9, 30], [8, 38, -18, 24]];
  return flock.map(([top, dur, delay, w], i) => (
    <span key={i} className="rt-bird" style={{ top: `${top}%`, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
      <svg width={w} height={w * 0.4} viewBox="0 0 40 16" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="2.2" strokeLinecap="round">
        <g className="rt-flap"><path d="M0 8 Q10 -4 20 8" /><path d="M20 8 Q30 -4 40 8" /></g>
      </svg>
    </span>
  ));
}

/* ---------- Scrolling wave layer ---------- */
export function WaveLayer({ height = 90, fill = "#0f766e", opacity = 0.12, duration = 14, reverse = false }) {
  const d = "M0 30 q90 -30 180 0" + " t180 0".repeat(15) + " V120 H0 Z";
  return (
    <div className="absolute inset-x-0 bottom-0 overflow-hidden pointer-events-none" style={{ height }} aria-hidden="true">
      <svg className="rt-wave" width="200%" height="100%" viewBox="0 0 2880 120" preserveAspectRatio="none"
        style={{ animationDuration: `${duration}s`, animationDirection: reverse ? "reverse" : "normal" }}>
        <path d={d} fill={fill} opacity={opacity} />
      </svg>
    </div>
  );
}

/* ---------- Live overlay for the hero photo carousel ---------- */
export function HeroAmbientOverlay() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="rt-shimmer absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <Birds />
      <Sparks count={22} rise={420} />
      <FallingLeaves count={8} fall={700} seed={11} />
      <Palm className="absolute -right-6 -bottom-8 h-[80%] w-auto opacity-70" fill="#06202e" />
      <Palm className="absolute right-[14%] -bottom-10 h-[52%] w-auto opacity-50 hidden sm:block" fill="#06202e" delay={2} />
    </div>
  );
}

/* ---------- Section backdrops (same names as your originals) ---------- */
export function KonkanBackdrop() {
  const clouds = [[8, 340, 70, 70, 0, 0.7], [22, 260, 56, 95, -40, 0.5]];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#EAF5F3_0%,#E4F0EE_38%,#F7EEE0_100%)]" />
      <div className="rt-rays absolute -top-52 right-[-5%] w-[600px] h-[600px] rounded-full"
        style={{ background: "repeating-conic-gradient(rgba(232,163,61,.14) 0 5deg,transparent 5deg 15deg)", WebkitMaskImage: "radial-gradient(circle,#000 0,transparent 70%)", maskImage: "radial-gradient(circle,#000 0,transparent 70%)" }} />
      <div className="rt-glow absolute top-[-90px] right-[10%] w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(232,163,61,0.28)_0%,rgba(232,163,61,0)_68%)]" />
      {clouds.map(([top, w, h, dur, delay, op], i) => (
        <div key={i} className="rt-cloud rounded-full bg-white blur-2xl" style={{ top: `${top}%`, width: w, height: h, opacity: op, animationDuration: `${dur}s`, animationDelay: `${delay}s` }} />
      ))}
      <svg className="absolute inset-x-0 bottom-0 w-full h-full" viewBox="0 0 1440 620" preserveAspectRatio="xMidYMax slice" fill="none">
        <path d="M0 322 L96 286 L178 312 L262 262 L352 306 L438 272 L536 318 L628 288 L720 326 L812 292 L904 330 L1002 296 L1096 334 L1190 300 L1286 336 L1378 306 L1440 330 L1440 620 L0 620 Z" fill="#0b3149" opacity="0.07" />
        <path d="M0 386 L120 362 L248 392 L376 356 L512 398 L648 370 L788 404 L928 374 L1070 406 L1212 378 L1348 408 L1440 388 L1440 620 L0 620 Z" fill="#0f766e" opacity="0.10" />
        <g opacity="0.16" fill="#0b3149">
          <path d="M1246 380 L1252 300 L1268 300 L1274 380 Z" /><rect x="1248" y="288" width="24" height="9" rx="2" /><path d="M1254 288 L1260 276 L1266 288 Z" />
        </g>
        <circle className="rt-glow" cx="1260" cy="292" r="16" fill="#F2B233" opacity="0.5" style={{ transformOrigin: "1260px 292px" }} />
        <svg x="30" y="250" width="170" height="306" viewBox="0 0 200 360" overflow="visible" opacity="0.2"><PalmShape fill="#0f766e" /></svg>
        <svg x="1330" y="300" width="120" height="216" viewBox="0 0 200 360" overflow="visible" opacity="0.18"><PalmShape fill="#0f766e" delay={3} /></svg>
        <g className="rt-boat" opacity="0.16" fill="#B4532A">
          <path d="M604 442 L700 442 L688 460 L616 460 Z" /><rect x="648" y="404" width="4" height="38" /><path d="M652 408 L684 438 L652 438 Z" />
        </g>
      </svg>
      <WaveLayer height={150} fill="#0f766e" opacity={0.12} duration={20} />
      <WaveLayer height={110} fill="#0b3149" opacity={0.08} duration={13} reverse />
      <WaveLayer height={70} fill="#F7EEE0" opacity={0.95} duration={9} />
    </div>
  );
}

export function MangoGroveBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#FFFDF9_0%,#FDF6EC_60%,#FDF3E4_100%)]" />
      <div className="rt-glow absolute top-[-70px] left-[-60px] w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.14)_0%,rgba(217,119,6,0)_70%)]" />
      <div className="rt-glow absolute bottom-[-90px] right-[-50px] w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(180,83,42,0.14)_0%,rgba(180,83,42,0)_70%)]" style={{ animationDelay: "-3s" }} />
      <MangoBranch className="absolute right-0 top-0 w-[300px] sm:w-[420px] opacity-60" />
      <Palm className="absolute left-2 bottom-0 h-64 w-auto opacity-[0.10]" fill="#3F7D4E" delay={1} />
      <FallingLeaves count={12} fall={700} seed={5} />
      <Sparks count={10} rise={260} seed={9} color="#F5B83D" />
    </div>
  );
}

export function FortSkylineBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#FAFBFC_0%,#F2F6F5_100%)]" />
      <svg className="absolute inset-x-0 bottom-0 w-full h-44" viewBox="0 0 1440 200" preserveAspectRatio="xMidYMax slice" fill="#0b3149" opacity="0.05">
        <path d="M0 200 L0 140 L40 140 L40 110 L70 110 L70 140 L110 140 L110 90 L130 90 L130 70 L150 70 L150 90 L170 90 L170 140 L230 140 L230 120 L260 120 L260 140 L360 140 L360 100 L390 100 L390 80 L410 80 L410 100 L440 100 L440 140 L560 140 L560 200 Z" />
        <path d="M760 200 L760 130 L800 130 L800 95 L830 95 L830 60 L860 60 L860 95 L890 95 L890 130 L930 130 L930 200 Z" />
        <path d="M1080 200 L1080 150 L1120 150 L1120 115 L1150 115 L1150 150 L1200 150 L1200 200 Z" />
        <path d="M1280 200 L1280 140 L1310 140 L1310 115 L1340 115 L1340 90 L1370 90 L1370 115 L1400 115 L1400 140 L1440 140 L1440 200 Z" />
      </svg>
      <Palm className="absolute left-4 bottom-0 h-72 w-auto opacity-[0.09]" fill="#0f766e" />
      <Palm className="absolute right-8 bottom-0 h-56 w-auto opacity-[0.08]" fill="#0f766e" delay={2} />
      <Sparks count={12} rise={300} seed={21} color="#2DD4BF" />
    </div>
  );
}