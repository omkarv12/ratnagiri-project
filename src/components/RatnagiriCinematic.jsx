import RatnagiriLoader from "./RatnagiriLoader";

/* ==================================================================
   RatnagiriCinematic — drop-in upgrade for <RatnagiriLoader />
   Keep RatnagiriLoader.jsx as-is. This wraps it and adds:
   - night → dawn colour grade + slow camera push-in
   - lit clouds, valley mist, sun lens flares
   - large foreground palms that shift with the cursor (parallax)
   - floating dust motes in the light, film grain, vignette
   - opening iris + letterbox bars that retract
   Usage: <RatnagiriCinematic />  (props pass through to the loader)
================================================================== */

const rng = (seed) => {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};
const MOTES = (() => {
  const r = rng(91);
  return Array.from({ length: 24 }, () => ({ x: r() * 100, y: 35 + r() * 55, s: 1.5 + r() * 3, dur: 9 + r() * 10, delay: -r() * 14 }));
})();

const FROND = "M0 0 C26 -30 66 -34 104 -2 C68 -14 30 -12 0 6 Z";
const ANGLES = [-172, -140, -108, -72, -40, -8, 20, 160];

function Palm({ x, y, s, d = 0, fill }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <g className="rc-sway" style={{ animationDelay: `${-d}s` }}>
        <path d="M-8 0 C-2 -100 4 -190 8 -276 L16 -275 C14 -188 10 -98 8 0 Z" />
        <g transform="translate(12 -277)">
          {ANGLES.map((a, i) => (
            <g key={a} className="rc-frond" style={{ "--r": 2 + (i % 3) * 1.4, animationDelay: `${-i * 0.55 - d}s` }}>
              <path d={FROND} transform={`rotate(${a})`} />
            </g>
          ))}
        </g>
      </g>
    </g>
  );
}

function Tile({ cls, children }) {
  return (
    <g className={cls}>
      {children}
      <g transform="translate(1440 0)">{children}</g>
    </g>
  );
}

function Atmosphere() {
  return (
    <svg className="rc-layer" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <radialGradient id="rcCloud">
          <stop offset="0" stopColor="#FFC48A" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#F08A5A" stopOpacity="0.22" />
          <stop offset="1" stopColor="#B45A6A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rcMist">
          <stop offset="0" stopColor="#FFE3B8" stopOpacity="0.3" />
          <stop offset="1" stopColor="#FFE3B8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rcFlare">
          <stop offset="0" stopColor="#FFE9B8" stopOpacity="0.55" />
          <stop offset="0.7" stopColor="#FFB45A" stopOpacity="0.18" />
          <stop offset="1" stopColor="#FFB45A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* dawn grade: whole frame starts as night and warms up */}
      <rect className="rc-night" x="-400" y="-400" width="2300" height="1400" fill="#06182a" />

      {/* clouds lit from below by the rising sun */}
      <Tile cls="rc-cloud">
        {[[180, 360, 240, 16], [620, 318, 300, 12], [1010, 372, 260, 14], [1300, 336, 200, 10]].map(([x, y, rx, ry], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="url(#rcCloud)" />
            <ellipse cx={x + rx * 0.25} cy={y - ry * 0.9} rx={rx * 0.6} ry={ry * 0.7} fill="url(#rcCloud)" opacity="0.7" />
          </g>
        ))}
      </Tile>

      {/* drifting valley haze at the shoreline */}
      <Tile cls="rc-mist">
        {[[200, 535, 340, 24], [700, 540, 420, 28], [1150, 532, 300, 20]].map(([x, y, rx, ry], i) => (
          <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="url(#rcMist)" />
        ))}
      </Tile>

      {/* lens flare that blooms once the sun has cleared the ridge */}
      <g className="rc-flare" style={{ mixBlendMode: "screen" }}>
        {[[790, 412, 34, 0.5], [690, 420, 18, 0.4], [600, 428, 46, 0.25], [500, 436, 22, 0.35]].map(([x, y, r, o], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="url(#rcFlare)" opacity={o} />
        ))}
      </g>

      {/* foreground palms frame the shot and slide against the cursor */}
      <g className="rc-px" style={{ "--k": -34 }}>
        <Palm x={60} y={830} s={1.55} d={1} fill="#03101a" />
        <Palm x={210} y={830} s={1} d={2.4} fill="#04141f" />
        <Palm x={1395} y={830} s={1.75} d={3} fill="#03101a" />
      </g>
    </svg>
  );
}

const CSS = `
.rc { position: relative; overflow: hidden; background: #06182a; }
.rc-dolly { position: relative; transform-origin: 60% 70%; animation: rcDolly 40s cubic-bezier(.3,.1,.3,1) both; }
@keyframes rcDolly { from { transform: scale(1); } to { transform: scale(1.05); } }
.rc-layer { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.rc-px { transition: transform .6s ease-out; transform: translate(calc(var(--mx, 0) * var(--k, 0) * 1px), calc(var(--my, 0) * var(--k, 0) * .35px)); }

.rc-cloud, .rc-mist { will-change: transform; animation: rcScroll linear infinite; }
.rc-cloud { animation-duration: 240s; }
.rc-mist { animation-duration: 60s; }
@keyframes rcScroll { to { transform: translateX(-1440px); } }
.rc-night { opacity: 0; animation: rcNight 13s ease-out; }
@keyframes rcNight { from { opacity: .6; } }
.rc-flare { animation: rcFlare 4s ease-out 9s backwards; }
@keyframes rcFlare { from { opacity: 0; } }

.rc-sway { animation: rcSway 7s ease-in-out infinite; }
@keyframes rcSway { 0%,100% { transform: rotate(-1.4deg); } 50% { transform: rotate(1.4deg); } }
.rc-frond { animation: rcFrond 4.5s ease-in-out infinite; }
@keyframes rcFrond { 0%,100% { transform: rotate(calc(var(--r, 3) * -1deg)); } 50% { transform: rotate(calc(var(--r, 3) * 1deg)); } }

.rc-mote { position: absolute; border-radius: 9999px; background: #ffe3a3; box-shadow: 0 0 8px 2px rgba(255,214,140,.6); opacity: 0; pointer-events: none; animation: rcMote linear infinite; }
@keyframes rcMote { 0% { opacity: 0; transform: translate(0,0); } 15% { opacity: .8; } 100% { opacity: 0; transform: translate(60px,-160px); } }

.rc-vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 55%, transparent 55%, rgba(3,10,18,.6) 100%); }
.rc-grain { position: absolute; inset: -10%; pointer-events: none; opacity: .07; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  animation: rcGrain .8s steps(1) infinite; }
@keyframes rcGrain { 0% { transform: translate(0,0); } 25% { transform: translate(-3%,2%); } 50% { transform: translate(2%,-3%); } 75% { transform: translate(3%,3%); } }

.rc-bar { position: absolute; left: 0; right: 0; height: 9vh; background: #02080f; z-index: 20; pointer-events: none; transform: scaleY(0); animation: rcBar 2.6s cubic-bezier(.7,0,.2,1) .6s backwards; }
.rc-bar-t { top: 0; transform-origin: top; }
.rc-bar-b { bottom: 0; transform-origin: bottom; }
@keyframes rcBar { from { transform: scaleY(1); } }
.rc-iris { position: absolute; inset: 0; z-index: 30; pointer-events: none; background: #02080f; opacity: 0; animation: rcIris 1.5s ease-out; }
@keyframes rcIris { from { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .rc, .rc * { animation: none !important; transition: none !important; }
}
`;

export default function RatnagiriCinematic(props) {
  const onMove = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5) * 2);
    el.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5) * 2);
  };

  return (
    <div className="rc" onPointerMove={onMove}>
      <style>{CSS}</style>

      <div className="rc-dolly">
        <RatnagiriLoader {...props} />
        <Atmosphere />
      </div>

      {MOTES.map((m, i) => (
        <span key={i} className="rc-mote" style={{ left: `${m.x}%`, top: `${m.y}%`, width: m.s, height: m.s, animationDuration: `${m.dur}s`, animationDelay: `${m.delay}s` }} />
      ))}

      <div className="rc-vignette" />
      <div className="rc-grain" />
      <div className="rc-bar rc-bar-t" />
      <div className="rc-bar rc-bar-b" />
      <div className="rc-iris" />
    </div>
  );
}