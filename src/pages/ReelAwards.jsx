// src/pages/ReelAwards.jsx  ->  route: /stories/reels
//
// Reels-only awards page: hero, top 3 by likes, award winners, creators wall, all approved reels,
// and a submission form (YouTube Shorts or Instagram reel link) that goes to admin approval.
// Every reel is shown in vertical 9:16 format. No dependencies beyond React.
//
// EDIT:  API_BASE  (your Flask backend URL, "" if the frontend proxies /api)
// Open the page with ?demo=1 to preview the layout with placeholder reels.
// A link ending in #reel-<id> opens that reel straight away (the Share button makes these links).

import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = ""; // e.g. "https://your-backend.up.railway.app"
const HASHTAG = "#RatnagiriReels";

export const AWARD_CATEGORIES = [
  "Best reel of the year",
  "Best food reel",
  "Best fort and coast reel",
  "Best village story",
  "Best homestay reel",
];

/* Layout-testing data, shown only when the page is opened with ?demo=1 and never to normal visitors.
   The two video ids are the ones already used in your DashboardOverview.jsx; the titles, creators,
   handles, places and like counts are invented placeholders, not real entries. */
const DEMO = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("demo");
const SAMPLE = [
  { id: 1, title: "Sunrise at Ganpatipule", creator: "Konkan Diaries", handle: "@konkan.diaries", place: "Ganpatipule", platform: "youtube", video_id: "BZWqwLF5mxI", likes: 412, award: "Best reel of the year", note: "Chosen by the jury for its light, its pacing and the way it lets the beach speak." },
  { id: 2, title: "A proper Konkani thali", creator: "Kokan Kitchen", handle: "@kokan.kitchen", place: "Ratnagiri", platform: "youtube", video_id: "tfi_WmqM6to", likes: 388, award: "Best food reel" },
  { id: 3, title: "Walking Ratnadurg at dusk", creator: "Sahyadri Frames", handle: "@sahyadri.frames", place: "Ratnagiri town", platform: "youtube", video_id: "BZWqwLF5mxI", likes: 301, award: "Best fort and coast reel" },
  { id: 4, title: "A quiet morning in Velneshwar", creator: "Slow Konkan", handle: "@slow.konkan", place: "Velneshwar", platform: "youtube", video_id: "tfi_WmqM6to", likes: 254, award: "Best village story" },
  { id: 5, title: "Alphonso season, orchard to box", creator: "Aamchi Kokan", handle: "@aamchi.kokan", place: "Devgad", platform: "youtube", video_id: "BZWqwLF5mxI", likes: 198, award: null },
  { id: 6, title: "Sleeping inside a mango orchard", creator: "Farm Stay Fan", handle: "@farmstayfan", place: "Devgad", platform: "youtube", video_id: "tfi_WmqM6to", likes: 143, award: null },
];

const STEPS = [
  { t: "Film a vertical reel", d: "Up to 90 seconds, shot in Ratnagiri district. Beaches, forts, food, villages and homestays all count." },
  { t: `Post it with ${HASHTAG}`, d: "Upload to YouTube Shorts or Instagram, then paste the public link in the form below." },
  { t: "We review and publish", d: "Our team approves eligible reels. Approved reels appear on this page, and the three with the most likes win the top positions." },
];

const PERKS = [
  { t: "Your reel on our website", d: "Your name, handle and reel appear on this public page once approved." },
  { t: "A link to share", d: "Every reel gets its own link that opens it in the player. Send it to family and followers." },
  { t: "A place on the podium", d: "The three reels with the most likes take 1st, 2nd and 3rd place." },
];

/* ---------- helpers ---------- */
export function parseReelLink(raw) {
  const url = (raw || "").trim();
  if (!url) return null;
  let m = url.match(/(?:youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/i);
  if (m) return { platform: "youtube", video_id: m[1] };
  m = url.match(/instagram\.com\/(?:reel|reels|p)\/([\w-]+)/i);
  if (m) return { platform: "instagram", video_id: m[1] };
  return null;
}

const embedSrc = (r) =>
  r.platform === "instagram"
    ? `https://www.instagram.com/reel/${r.video_id}/embed`
    : `https://www.youtube-nocookie.com/embed/${r.video_id}?autoplay=1&rel=0&playsinline=1&loop=1&playlist=${r.video_id}`;

const thumbOf = (r) => (r.platform === "youtube" ? `https://i.ytimg.com/vi/${r.video_id}/hqdefault.jpg` : null);
const hueOf = (r) => ((r.id || 1) * 47) % 360;
const fmt = (n) => new Intl.NumberFormat("en-IN").format(n || 0);
const initials = (name) =>
  (name || "?").replace(/^@/, "").split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("") || "?";

function useInView() {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}

/* ---------- small pieces ---------- */
function Backdrop() {
  const sparks = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({ top: (i * 29 + 7) % 96, left: (i * 53 + 11) % 98, s: 4 + (i % 3) * 2, d: (i * 370) % 4200 })),
    []
  );
  return (
    <div className="ra-bg" aria-hidden="true">
      <span className="ra-orb o1" /><span className="ra-orb o2" /><span className="ra-orb o3" /><span className="ra-orb o4" />
      <span className="ra-dots" />
      {sparks.map((p, i) => (
        <i key={i} className="ra-spark" style={{ top: `${p.top}%`, left: `${p.left}%`, width: p.s, height: p.s, animationDelay: `${p.d}ms` }} />
      ))}
    </div>
  );
}

function Confetti({ run, count = 48 }) {
  const pieces = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      left: (i * 37) % 100, delay: (i * 53) % 1100, dur: 2800 + ((i * 71) % 1800),
      rot: (i * 47) % 360, w: 6 + ((i * 13) % 6), hue: [42, 36, 174, 205, 18][i % 5], dx: ((i * 29) % 90) - 45,
    })),
    [count]
  );
  return (
    <div className={`ra-confetti ${run ? "is-run" : ""}`} aria-hidden="true">
      {pieces.map((p, i) => (
        <i key={i} style={{ left: `${p.left}%`, width: p.w, height: p.w * 1.7, background: `hsl(${p.hue} 85% 55%)`, animationDelay: `${p.delay}ms`, animationDuration: `${p.dur}ms`, "--rot": `${p.rot}deg`, "--dx": `${p.dx}px` }} />
      ))}
    </div>
  );
}

const METAL = { 1: ["#fff3c4", "#f2b233", "#b9770e"], 2: ["#ffffff", "#d3dae0", "#8a96a0"], 3: ["#ffe2c8", "#d58a52", "#8e4a1f"] };
function Medal({ rank }) {
  const [a, b, c] = METAL[rank];
  return (
    <svg className="ra-medal-svg" width="46" height="60" viewBox="0 0 46 60" role="img" aria-label={`Position ${rank}`}>
      <defs>
        <linearGradient id={`mg${rank}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} /><stop offset=".55" stopColor={b} /><stop offset="1" stopColor={c} />
        </linearGradient>
      </defs>
      <polygon points="11,0 22,0 26,24 15,24" fill="#0b3149" />
      <polygon points="24,0 35,0 31,24 20,24" fill="#173b45" />
      <circle cx="23" cy="38" r="19" fill={`url(#mg${rank})`} stroke={c} strokeWidth="2" />
      <circle cx="23" cy="38" r="14" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.5" />
      <text x="23" y="45" textAnchor="middle" fontFamily="Bricolage Grotesque, sans-serif" fontWeight="800" fontSize="20" fill="#0b3149">{rank}</text>
    </svg>
  );
}

function Crown({ className = "" }) {
  return (
    <svg className={`ra-crown ${className}`} width="54" height="36" viewBox="0 0 54 36" aria-hidden="true">
      <defs>
        <linearGradient id="crownG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3c4" /><stop offset=".5" stopColor="#f2b233" /><stop offset="1" stopColor="#b9770e" />
        </linearGradient>
      </defs>
      <path d="M3 32 L7 8 L19 20 L27 3 L35 20 L47 8 L51 32 Z" fill="url(#crownG)" stroke="#b9770e" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="7" cy="8" r="3" fill="#fff3c4" /><circle cx="27" cy="3" r="3" fill="#fff3c4" /><circle cx="47" cy="8" r="3" fill="#fff3c4" />
    </svg>
  );
}

const Trophy = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.9V17h3v2H8v-2h3v-2.1A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V5h3V3Zm-1 4v1a2 2 0 0 0 1.2 1.8A5 5 0 0 1 7 8V7H6Zm12 0h-1v1a5 5 0 0 1-.2 1.8A2 2 0 0 0 18 8V7Z" />
  </svg>
);

function Creator({ reel }) {
  return (
    <div className="ra-creator">
      <span className="ra-avatar" style={{ "--hue": hueOf(reel) }}>{initials(reel.creator)}</span>
      <span className="ra-creator-text">
        <strong>{reel.creator}</strong>
        <small>{reel.handle || reel.place}</small>
      </span>
    </div>
  );
}

function LikeCount({ reel }) {
  const where = reel.platform === "instagram" ? "Instagram" : "YouTube";
  return (
    <p className="ra-likes" aria-label={`${fmt(reel.likes)} likes on ${where}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7-4.4-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.6-9.5 9-9.5 9Z" /></svg>
      {fmt(reel.likes)} likes <span>on {where}</span>
    </p>
  );
}

function ShareButton({ reel }) {
  const [done, setDone] = useState(false);
  async function share() {
    const url = `${window.location.origin}${window.location.pathname}#reel-${reel.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Ratnagiri Reel Awards", text: `"${reel.title}" by ${reel.creator} on the Ratnagiri Reel Awards`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setDone(true);
        setTimeout(() => setDone(false), 2200);
      }
    } catch { /* share sheet closed */ }
  }
  return <button className="ra-share" onClick={share}>{done ? "Link copied" : "Share this reel"}</button>;
}

/* ---------- vertical poster with play button ---------- */
function Poster({ item, onPlay, badge }) {
  const [broken, setBroken] = useState(false);
  const src = thumbOf(item);
  return (
    <button className="ra-poster" style={{ "--hue": hueOf(item) }} onClick={() => onPlay(item)} aria-label={`Play reel ${item.title}`}>
      {src && !broken && <img src={src} alt="" loading="lazy" onError={() => setBroken(true)} />}
      {(!src || broken) && <span className="ra-poster-ig">{item.platform === "instagram" ? "Instagram reel" : "Reel"}</span>}
      {badge && <span className="ra-badge">{badge}</span>}
      <span className="ra-play" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5Z" /></svg>
      </span>
    </button>
  );
}

/* ---------- pop-up reel player (always vertical) ---------- */
function PlayerModal({ item, caption, special, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="ra-modal" role="dialog" aria-modal="true" aria-label={item.title} onClick={onClose}>
      {special && <Confetti run count={60} />}
      <div className="ra-modal-wrap" onClick={(e) => e.stopPropagation()}>
        <div className={`ra-modal-box ${special ? "is-special" : ""}`}>
          <iframe src={embedSrc(item)} title={item.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
          <button ref={closeRef} className="ra-close" onClick={onClose} aria-label="Close reel">×</button>
        </div>
        <div className="ra-modal-cap">
          <Creator reel={item} />
          {caption && <span className="ra-cap-tag"><Trophy /> {caption}</span>}
        </div>
      </div>
    </div>
  );
}

/* ---------- submission form ---------- */
function SubmitForm() {
  const empty = { name: "", handle: "", email: "", phone: "", place: "", title: "", category: AWARD_CATEGORIES[0], link: "", consent: false };
  const [f, setF] = useState(empty);
  const [state, setState] = useState({ status: "idle", msg: "" }); // idle | sending | done | error
  const parsed = useMemo(() => parseReelLink(f.link), [f.link]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (!parsed) return setState({ status: "error", msg: "Paste a YouTube Shorts or Instagram reel link." });
    setState({ status: "sending", msg: "" });
    try {
      const res = await fetch(`${API_BASE}/api/reels/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, url: f.link.trim(), ...parsed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not submit your reel. Try again in a moment.");
      setState({ status: "done", msg: "" });
      setF(empty);
    } catch (err) {
      setState({ status: "error", msg: err.message });
    }
  }

  if (state.status === "done") {
    return (
      <div className="ra-form ra-form-done" role="status">
        <h3>Your reel is in</h3>
        <p>We review every entry. Once your reel is approved, it appears on this page with your name on it.</p>
        <button className="ra-btn ra-btn-line" onClick={() => setState({ status: "idle", msg: "" })}>Submit another reel</button>
      </div>
    );
  }

  return (
    <form className="ra-form" onSubmit={submit} noValidate>
      <div className="ra-grid2">
        <label>Your name *<input required value={f.name} onChange={set("name")} autoComplete="name" /></label>
        <label>Instagram or YouTube handle<input value={f.handle} onChange={set("handle")} placeholder="@yourname" /></label>
        <label>Email *<input required type="email" value={f.email} onChange={set("email")} autoComplete="email" /></label>
        <label>Phone (optional)<input type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" /></label>
        <label>Reel title *<input required value={f.title} onChange={set("title")} placeholder="Sunrise at Ganpatipule" /></label>
        <label>Place in Ratnagiri *<input required value={f.place} onChange={set("place")} placeholder="Ganpatipule" /></label>
      </div>
      <label>Award category *
        <select value={f.category} onChange={set("category")}>
          {AWARD_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label>Reel link (YouTube Shorts or Instagram) *
        <input required value={f.link} onChange={set("link")} placeholder="https://www.instagram.com/reel/..." inputMode="url" />
      </label>
      {f.link && (
        <p className={`ra-hint ${parsed ? "ok" : "bad"}`}>
          {parsed ? `Found a ${parsed.platform === "youtube" ? "YouTube Short" : "Instagram reel"}.` : "This is not a YouTube Shorts or Instagram reel link."}
        </p>
      )}
      <label className="ra-check">
        <input type="checkbox" required checked={f.consent} onChange={set("consent")} />
        <span>I made this reel, I shot it in Ratnagiri district, and I allow it to be shown on this website.</span>
      </label>
      {state.status === "error" && <p className="ra-hint bad" role="alert">{state.msg}</p>}
      <button className="ra-btn ra-btn-solid" disabled={state.status === "sending"}>
        {state.status === "sending" ? "Submitting..." : "Submit my reel"}
      </button>
    </form>
  );
}

/* ---------- page ---------- */
export default function ReelAwards() {
  const [reels, setReels] = useState(DEMO ? SAMPLE : []);
  const [loaded, setLoaded] = useState(DEMO);
  const [playing, setPlaying] = useState(null);
  const [stageRef, stageSeen] = useInView();
  const deepLinked = useRef(false);

  useEffect(() => {
    if (DEMO) return undefined; // demo mode keeps the placeholder data
    let live = true;
    fetch(`${API_BASE}/api/reels`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => live && Array.isArray(d.reels) && setReels(d.reels))
      .catch(() => {})
      .finally(() => live && setLoaded(true));
    return () => { live = false; };
  }, []);

  // A shared link ending in #reel-<id> opens that reel once.
  useEffect(() => {
    if (deepLinked.current || reels.length === 0) return;
    const m = window.location.hash.match(/^#reel-(\d+)$/);
    if (!m) return;
    deepLinked.current = true;
    const hit = reels.find((r) => String(r.id) === m[1]);
    if (hit) setPlaying(hit);
  }, [reels]);

  const top3 = useMemo(() => [...reels].sort((a, b) => b.likes - a.likes).slice(0, 3), [reels]);
  const podium = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3; // 2nd, 1st, 3rd
  const rankOf = (r) => top3.indexOf(r) + 1;
  const winners = reels.filter((r) => r.award);
  const stage = winners.find((w) => w.award === AWARD_CATEGORIES[0]) || winners[0];
  const otherWinners = winners.filter((w) => w !== stage);
  const hero = stage || top3[0];
  const rest = reels.filter((r) => !top3.includes(r));

  const creators = useMemo(() => {
    const seen = new Map();
    reels.forEach((r) => { if (!seen.has(r.creator)) seen.set(r.creator, r); });
    return [...seen.values()];
  }, [reels]);
  const wall = useMemo(() => {
    if (creators.length === 0) return [];
    const base = Array.from({ length: Math.ceil(8 / creators.length) }, () => creators).flat();
    return [...base, ...base];
  }, [creators]);
  const totalLikes = reels.reduce((s, r) => s + (r.likes || 0), 0);

  const captionFor = (r) => (r.award ? r.award : rankOf(r) ? `Position ${rankOf(r)} by likes` : "");

  return (
    <main className="ra">
      <style>{CSS}</style>
      <Backdrop />

      <div className="ra-page">
        {/* hero */}
        <section className="ra-hero">
          <div className="ra-hero-copy">
            <h1>Ratnagiri Reel Awards</h1>
            <p className="ra-lead">
              Season 2026. The best vertical reels of the Konkan coast, made by travellers and locals. The three reels with the most likes take the podium.
            </p>
            <div className="ra-cta">
              <a className="ra-btn ra-btn-solid" href="#enter">Submit your reel</a>
              <a className="ra-btn ra-btn-line" href={reels.length ? "#top3" : "#enter"}>{reels.length ? "See the podium" : "How to enter"}</a>
            </div>
            {reels.length > 0 && (
              <dl className="ra-stats">
                <div><dt>Reels</dt><dd>{fmt(reels.length)}</dd></div>
                <div><dt>Creators</dt><dd>{fmt(creators.length)}</dd></div>
                <div><dt>Likes</dt><dd>{fmt(totalLikes)}</dd></div>
              </dl>
            )}
          </div>
          {hero && (
            <div className="ra-hero-reel">
              <Crown className="ra-crown-float" />
              <div className="ra-ring ra-ring-lg">
                <Poster item={hero} onPlay={setPlaying} badge={hero.award || "Most liked"} />
              </div>
              <p className="ra-hero-by"><strong>{hero.title}</strong>by {hero.creator}</p>
            </div>
          )}
        </section>

        {loaded && reels.length === 0 && (
          <section className="ra-section ra-empty">
            <h2 className="ra-h2">The first reels are coming</h2>
            <p className="ra-h2-sub">No reel has been approved yet. Yours could open the page.</p>
            <a className="ra-btn ra-btn-solid" href="#enter">Submit your reel</a>
          </section>
        )}

        {/* top 3 */}
        {reels.length > 0 && (
          <section className="ra-section" id="top3">
            <h2 className="ra-h2">The podium</h2>
            <p className="ra-h2-sub">The three reels with the most likes on YouTube and Instagram. The ranking updates automatically.</p>
            <div className="ra-podium">
              {podium.map((r) => {
                const rank = rankOf(r);
                return (
                  <article className={`ra-pod ra-pod-${rank}`} key={r.id}>
                    <div className="ra-pod-media">
                      {rank === 1 && <Crown className="ra-crown-pod" />}
                      <div className={rank === 1 ? "ra-ring" : "ra-plain"}>
                        <Poster item={r} onPlay={setPlaying} />
                      </div>
                      <Medal rank={rank} />
                    </div>
                    <h3>{r.title}</h3>
                    <Creator reel={r} />
                    <LikeCount reel={r} />
                    <ShareButton reel={r} />
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* winners */}
        {stage && (
          <section className="ra-section" id="winners">
            <h2 className="ra-h2">Award winners</h2>
            <p className="ra-h2-sub">One reel for each award, chosen by the jury.</p>

            <div className="ra-stage" ref={stageRef}>
              <Confetti run={stageSeen} />
              <div className="ra-stage-media">
                <div className="ra-ring"><Poster item={stage} onPlay={setPlaying} /></div>
                <Crown className="ra-crown-stage" />
              </div>
              <div className="ra-stage-body">
                <span className="ra-award-tag"><Trophy /> {stage.award}</span>
                <p className="ra-congrats">Congratulations, {stage.creator}</p>
                <h3>{stage.title}</h3>
                <p className="ra-by">Shot in {stage.place}</p>
                {stage.note && <p className="ra-note">{stage.note}</p>}
                <LikeCount reel={stage} />
                <div className="ra-actions">
                  <button className="ra-btn ra-btn-solid" onClick={() => setPlaying(stage)}>Watch the winner</button>
                  <ShareButton reel={stage} />
                </div>
              </div>
            </div>

            {otherWinners.length > 0 && (
              <div className="ra-awards">
                {otherWinners.map((w) => (
                  <article className="ra-award" key={w.id}>
                    <Poster item={w} onPlay={setPlaying} />
                    <span className="ra-award-tag"><Trophy /> {w.award}</span>
                    <h3>{w.title}</h3>
                    <Creator reel={w} />
                    <ShareButton reel={w} />
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* creators wall */}
        {creators.length > 0 && (
          <section className="ra-section ra-wall" aria-label="Creators on this website">
            <h2 className="ra-h2">The people behind the reels</h2>
            <p className="ra-h2-sub">Every creator here has a reel on this website.</p>
            <div className="ra-marquee">
              <ul className="ra-marquee-track">
                {wall.map((c, i) => (
                  <li key={i} aria-hidden={i >= wall.length / 2 ? "true" : undefined}>
                    <span className="ra-avatar" style={{ "--hue": hueOf(c) }}>{initials(c.creator)}</span>
                    <span className="ra-chip-text"><strong>{c.creator}</strong><small>{c.place}</small></span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* all reels */}
        {rest.length > 0 && (
          <section className="ra-section" id="reels">
            <h2 className="ra-h2">More reels from the coast</h2>
            <p className="ra-h2-sub">Watch them all. A reel moves up the podium as its likes grow.</p>
            <div className="ra-reel-grid">
              {rest.map((r) => (
                <article className="ra-reel" key={r.id}>
                  <Poster item={r} onPlay={setPlaying} />
                  <h3>{r.title}</h3>
                  <Creator reel={r} />
                  <LikeCount reel={r} />
                  <ShareButton reel={r} />
                </article>
              ))}
            </div>
          </section>
        )}

        {/* how to enter + form */}
        <section className="ra-section" id="enter">
          <h2 className="ra-h2">How to enter</h2>
          <ol className="ra-steps">
            {STEPS.map((s, i) => (
              <li key={s.t}>
                <span className="ra-step-n">{i + 1}</span>
                <div><h3>{s.t}</h3><p>{s.d}</p></div>
              </li>
            ))}
          </ol>

          <div className="ra-enter">
            <div>
              <h2 className="ra-h2 ra-form-title">Submit your reel</h2>
              <SubmitForm />
            </div>
            <aside className="ra-perks" aria-label="What you get">
              <h3>What you get</h3>
              <ul>
                {PERKS.map((p) => (
                  <li key={p.t}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
                    <div><strong>{p.t}</strong><p>{p.d}</p></div>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>
      </div>

      {playing && <PlayerModal item={playing} caption={captionFor(playing)} special={Boolean(playing.award || rankOf(playing))} onClose={() => setPlaying(null)} />}
    </main>
  );
}

/* ---------- styles ---------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Instrument+Sans:wght@400;500;600&family=Newsreader:ital,opsz,wght@1,6..72,500&display=swap');

.ra {
  --pearl: #f7f9fa; --ink: #0b3149; --dim: #52697a; --teal: #0f766e; --laterite: #b4532a;
  --gold: #e8a920; --gold-l: #fdf0c8; --line: rgba(11,49,73,.12);
  --glass: rgba(255,255,255,.72);
  position: relative; isolation: isolate; overflow-x: clip;
  background: linear-gradient(180deg, #fbfcfd 0%, var(--pearl) 40%, #f3f7f8 100%);
  color: var(--ink); font-family: 'Instrument Sans', system-ui, sans-serif; line-height: 1.55;
}
.ra *, .ra *::before, .ra *::after { box-sizing: border-box; }
.ra h1, .ra h2, .ra h3 { font-family: 'Bricolage Grotesque', 'Instrument Sans', system-ui, sans-serif; margin: 0; letter-spacing: -.02em; }
.ra :focus-visible { outline: 3px solid var(--teal); outline-offset: 3px; }
.ra-page { position: relative; z-index: 1; padding: 64px clamp(18px, 5vw, 72px) 112px; }

/* ---- animated background ---- */
.ra-bg { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.ra-orb { position: absolute; border-radius: 50%; filter: blur(70px); will-change: transform; }
.ra-orb.o1 { width: 620px; height: 620px; top: -140px; right: -120px; background: rgba(242,178,51,.30); animation: ra-drift1 22s ease-in-out infinite alternate; }
.ra-orb.o2 { width: 560px; height: 560px; top: 26%; left: -180px; background: rgba(15,118,110,.18); animation: ra-drift2 26s ease-in-out infinite alternate; }
.ra-orb.o3 { width: 520px; height: 520px; top: 58%; right: -140px; background: rgba(110,160,220,.22); animation: ra-drift3 24s ease-in-out infinite alternate; }
.ra-orb.o4 { width: 460px; height: 460px; bottom: -120px; left: 18%; background: rgba(242,178,51,.22); animation: ra-drift1 28s ease-in-out infinite alternate-reverse; }
.ra-dots { position: absolute; inset: 0; background-image: radial-gradient(rgba(11,49,73,.10) 1px, transparent 1.2px); background-size: 28px 28px;
  -webkit-mask-image: linear-gradient(180deg, #000 0%, transparent 70%); mask-image: linear-gradient(180deg, #000 0%, transparent 70%); }
.ra-spark { position: absolute; border-radius: 50%; background: #f2b233; box-shadow: 0 0 10px 3px rgba(242,178,51,.55); opacity: 0; animation: ra-twinkle 4.2s ease-in-out infinite; }
@keyframes ra-drift1 { to { transform: translate3d(-90px, 70px, 0) scale(1.12); } }
@keyframes ra-drift2 { to { transform: translate3d(110px, -60px, 0) scale(1.08); } }
@keyframes ra-drift3 { to { transform: translate3d(-70px, -90px, 0) scale(1.15); } }
@keyframes ra-twinkle { 0%, 100% { opacity: 0; transform: scale(.6); } 50% { opacity: .9; transform: scale(1.1); } }

/* ---- hero ---- */
.ra-hero { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: clamp(32px, 6vw, 88px); align-items: center; max-width: 1280px; margin: 0 auto 120px; }
.ra-hero h1 { font-size: clamp(46px, 7vw, 96px); line-height: .95; font-weight: 800; max-width: 11ch; }
.ra-lead { font-size: 19px; color: var(--dim); max-width: 44ch; margin: 24px 0 32px; }
.ra-cta { display: flex; flex-wrap: wrap; gap: 12px; }
.ra-btn { display: inline-block; border-radius: 999px; padding: 13px 26px; font: 600 15px 'Instrument Sans', sans-serif; text-decoration: none; cursor: pointer; border: 1.5px solid transparent; transition: background .2s, color .2s, border-color .2s; }
.ra-btn:disabled { opacity: .6; cursor: wait; }
.ra-btn-solid { background: var(--ink); color: #fff; }
.ra-btn-solid:hover:not(:disabled) { background: var(--teal); }
.ra-btn-line { border-color: var(--ink); color: var(--ink); background: rgba(255,255,255,.5); }
.ra-btn-line:hover { background: var(--ink); color: #fff; }
.ra-stats { display: flex; gap: clamp(24px, 4vw, 48px); margin: 44px 0 0; padding-top: 24px; border-top: 1px solid var(--line); width: fit-content; }
.ra-stats dt { font-size: 14px; color: var(--dim); }
.ra-stats dd { margin: 2px 0 0; font: 800 clamp(28px, 3vw, 38px) 'Bricolage Grotesque', sans-serif; letter-spacing: -.02em; }

.ra-hero-reel { position: relative; justify-self: center; width: min(310px, 100%); animation: ra-hero-in .9s cubic-bezier(.2,.7,.2,1) both; }
.ra-hero-by { margin: 22px 0 0; text-align: center; color: var(--dim); font-size: 14px; }
.ra-hero-by strong { display: block; color: var(--ink); font: 600 17px 'Bricolage Grotesque', sans-serif; margin-bottom: 2px; }
@keyframes ra-hero-in { from { opacity: 0; transform: translateY(28px) scale(.97); } to { opacity: 1; transform: none; } }

/* ---- the gold ring: the one big moment ---- */
.ra-ring { position: relative; padding: 4px; border-radius: 22px; overflow: hidden; background: var(--gold); box-shadow: 0 22px 50px rgba(185,119,14,.28); }
.ra-ring::before { content: ""; position: absolute; inset: -60%; background: conic-gradient(from 0deg, #f2b233, #fff6d6, #d98f12, #fff6d6, #f2b233); animation: ra-spin 5s linear infinite; }
.ra-ring > .ra-poster { position: relative; z-index: 1; border-radius: 18px; }
.ra-ring-lg { padding: 5px; border-radius: 30px; }
.ra-ring-lg > .ra-poster { border-radius: 25px; }
@keyframes ra-spin { to { transform: rotate(360deg); } }
.ra-plain { border-radius: 18px; overflow: hidden; box-shadow: 0 14px 34px rgba(11,49,73,.14); }

.ra-crown { filter: drop-shadow(0 4px 6px rgba(185,119,14,.35)); }
.ra-crown-float { position: absolute; top: -34px; left: 50%; transform: translateX(-50%); z-index: 3; animation: ra-bob 3.2s ease-in-out infinite; }
@keyframes ra-bob { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-6px); } }

/* ---- sections ---- */
.ra-section { max-width: 1280px; margin: 0 auto 120px; }
.ra-h2 { font-size: clamp(30px, 3.6vw, 46px); font-weight: 800; line-height: 1.05; }
.ra-h2-sub { color: var(--dim); margin: 12px 0 44px; max-width: 56ch; }
.ra-by { color: var(--dim); font-size: 14px; margin: 6px 0 0; }

/* poster: every reel is 9:16 */
.ra-poster { position: relative; display: block; width: 100%; aspect-ratio: 9 / 16; border: 0; padding: 0; cursor: pointer; overflow: hidden; border-radius: 16px; color: #fff;
  background: radial-gradient(120% 80% at 20% 10%, hsl(var(--hue) 60% 60%), transparent 60%), linear-gradient(170deg, hsl(var(--hue) 50% 42%), hsl(calc(var(--hue) + 30) 55% 26%)); }
.ra-poster img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .5s; }
.ra-poster:hover img { transform: scale(1.05); }
.ra-poster-ig { position: absolute; left: 12px; bottom: 12px; font-size: 13px; font-weight: 600; background: rgba(11,49,73,.6); padding: 4px 10px; border-radius: 999px; }
.ra-badge { position: absolute; top: 12px; left: 12px; background: var(--gold); color: var(--ink); font-weight: 800; font-size: 14px; padding: 4px 12px; border-radius: 999px; z-index: 1; }
.ra-play { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 58px; height: 58px; border-radius: 50%; display: grid; place-items: center; background: rgba(11,49,73,.72); backdrop-filter: blur(4px); padding-left: 3px; transition: background .2s, color .2s, transform .2s; }
.ra-poster:hover .ra-play { background: var(--gold); color: var(--ink); transform: translate(-50%, -50%) scale(1.08); }

/* creator, likes, share */
.ra-creator { display: flex; align-items: center; gap: 10px; margin-top: 12px; }
.ra-avatar { flex: none; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; color: #fff; font: 800 13px 'Bricolage Grotesque', sans-serif;
  background: linear-gradient(135deg, hsl(var(--hue) 70% 58%), hsl(calc(var(--hue) + 35) 65% 40%)); box-shadow: 0 0 0 2px #fff, 0 0 0 3.5px rgba(11,49,73,.14); }
.ra-creator-text, .ra-chip-text { display: grid; line-height: 1.2; min-width: 0; }
.ra-creator-text strong, .ra-chip-text strong { font-family: 'Newsreader', Georgia, serif; font-style: italic; font-weight: 500; font-size: 17px; overflow-wrap: anywhere; }
.ra-creator-text small, .ra-chip-text small { color: var(--dim); font-size: 13px; }
.ra-likes { margin: 12px 0 0; display: flex; align-items: center; gap: 6px; color: var(--laterite); font: 600 14px 'Instrument Sans', sans-serif; }
.ra-likes span { color: var(--dim); font-weight: 400; }
.ra-share { margin-top: 10px; padding: 0; border: 0; background: none; color: var(--teal); font: 600 14px 'Instrument Sans', sans-serif; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.ra-share:hover { color: var(--ink); }
.ra-award-tag { display: inline-flex; align-items: center; gap: 6px; margin: 16px 0 8px; padding: 5px 13px; border-radius: 999px; font-weight: 600; font-size: 13px; color: #7a4a05;
  background: linear-gradient(100deg, #fdf0c8, #fff8e0 45%, #fdf0c8); border: 1px solid rgba(232,169,32,.55); }

/* ---- podium ---- */
.ra-podium { padding-top: 44px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(20px, 3vw, 44px); align-items: end; max-width: 980px; }
.ra-pod h3 { font-size: 20px; line-height: 1.15; font-weight: 600; margin-top: 18px; }
.ra-pod-media { position: relative; }
.ra-medal-svg { position: absolute; top: -16px; right: -10px; z-index: 3; filter: drop-shadow(0 6px 8px rgba(11,49,73,.25)); }
.ra-pod-1 { transform: translateY(-28px); }
.ra-pod-1 h3 { font-size: 24px; }
.ra-crown-pod { position: absolute; top: -34px; left: 50%; transform: translateX(-50%); z-index: 3; animation: ra-bob 3.2s ease-in-out infinite; }

/* ---- winner stage ---- */
.ra-stage { position: relative; overflow: hidden; display: grid; grid-template-columns: minmax(0, 270px) 1fr; gap: clamp(28px, 5vw, 72px); align-items: center; padding: clamp(26px, 4vw, 52px); border-radius: 32px;
  background: linear-gradient(135deg, rgba(255,246,214,.9), rgba(255,255,255,.85) 55%); border: 1.5px solid rgba(232,169,32,.6); box-shadow: 0 30px 70px rgba(185,119,14,.16); }
.ra-stage > * { position: relative; z-index: 1; }
.ra-stage > .ra-confetti { z-index: 2; }
.ra-stage-media { position: relative; }
.ra-crown-stage { position: absolute; top: -32px; left: 50%; transform: translateX(-50%); animation: ra-bob 3.2s ease-in-out infinite; }
.ra-congrats { margin: 4px 0 8px; font: italic 500 clamp(22px, 2.4vw, 30px) 'Newsreader', Georgia, serif; color: #8a5a06; }
.ra-stage-body h3 { font-size: clamp(32px, 4vw, 56px); line-height: 1.02; font-weight: 800; }
.ra-note { max-width: 52ch; margin: 18px 0 8px; font-size: 17px; }
.ra-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 22px; margin-top: 24px; }
.ra-actions .ra-share { margin: 0; }
.ra-awards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 32px; margin-top: 64px; }
.ra-award h3 { font-size: 20px; line-height: 1.15; font-weight: 600; }

/* ---- creators wall ---- */
.ra-marquee { overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
.ra-marquee-track { list-style: none; display: flex; gap: 14px; width: max-content; margin: 0; padding: 6px 0; animation: ra-marq 45s linear infinite; }
.ra-marquee:hover .ra-marquee-track { animation-play-state: paused; }
.ra-marquee-track li { display: flex; align-items: center; gap: 12px; padding: 10px 22px 10px 12px; border-radius: 999px; background: var(--glass); backdrop-filter: blur(8px); border: 1px solid var(--line); }
@keyframes ra-marq { to { transform: translateX(-50%); } }

/* ---- more reels ---- */
.ra-reel-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 36px 28px; }
.ra-reel h3 { font-size: 18px; line-height: 1.2; font-weight: 600; margin-top: 16px; }

/* ---- steps ---- */
.ra-steps { list-style: none; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px; padding: 0; margin: 36px 0 72px; }
.ra-steps li { display: flex; gap: 16px; }
.ra-step-n { flex: none; width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; background: var(--teal); color: #fff; font: 800 18px 'Bricolage Grotesque', sans-serif; }
.ra-steps h3 { font-size: 20px; font-weight: 600; margin-bottom: 6px; }
.ra-steps p { margin: 0; color: var(--dim); }

/* ---- form ---- */
.ra-enter { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: clamp(28px, 5vw, 64px); align-items: start; }
.ra h2.ra-form-title { margin-bottom: 24px; }
.ra-form { display: grid; gap: 18px; padding: clamp(22px, 3vw, 38px); background: var(--glass); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,.9); border-radius: 26px; box-shadow: 0 24px 60px rgba(11,49,73,.10), 0 0 0 1px var(--line); }
.ra-form label { display: grid; gap: 6px; font-weight: 600; font-size: 14px; }
.ra-form input:not([type=checkbox]), .ra-form select { font: 400 16px 'Instrument Sans', sans-serif; padding: 12px 14px; border: 1.5px solid var(--line); border-radius: 12px; background: #fff; color: var(--ink); width: 100%; }
.ra-form input:focus, .ra-form select:focus { border-color: var(--teal); }
.ra-grid2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.ra-check { grid-template-columns: auto 1fr; align-items: start; font-weight: 400 !important; gap: 10px !important; }
.ra-check input { margin-top: 4px; width: 18px; height: 18px; accent-color: var(--teal); }
.ra-hint { margin: -6px 0 0; font-size: 14px; }
.ra-hint.ok { color: var(--teal); } .ra-hint.bad { color: #b42318; }
.ra-form .ra-btn { justify-self: start; }
.ra-form-done h3 { font-size: 30px; font-weight: 800; }
.ra-form-done p { margin: 0; color: var(--dim); max-width: 46ch; }
.ra-perks { padding: 8px 0 0; }
.ra-perks h3 { font-size: 22px; font-weight: 800; margin-bottom: 20px; }
.ra-perks ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 22px; }
.ra-perks li { display: flex; gap: 14px; }
.ra-perks svg { flex: none; margin-top: 2px; padding: 3px; width: 26px; height: 26px; border-radius: 50%; background: var(--gold-l); color: #8a5a06; }
.ra-perks strong { display: block; font-weight: 600; }
.ra-perks p { margin: 4px 0 0; color: var(--dim); font-size: 15px; }

/* ---- modal ---- */
.ra-modal { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 20px; background: rgba(11,49,73,.72); backdrop-filter: blur(8px); overflow: hidden; }
.ra-modal-wrap { position: relative; z-index: 3; display: grid; justify-items: center; gap: 16px; max-width: 100%; }
.ra-modal-box { position: relative; height: min(74vh, 780px); aspect-ratio: 9 / 16; max-width: 100%; background: #000; border-radius: 18px; box-shadow: 0 0 0 4px #fff; }
.ra-modal-box.is-special { box-shadow: 0 0 0 4px var(--gold), 0 0 50px 8px rgba(242,178,51,.45); }
.ra-modal-box iframe { width: 100%; height: 100%; border: 0; border-radius: 18px; }
.ra-close { position: absolute; top: -16px; right: -16px; width: 40px; height: 40px; border-radius: 50%; border: 0; background: #fff; color: var(--ink); font-size: 26px; line-height: 1; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,.25); }
.ra-modal-cap { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px 18px; color: #fff; }
.ra-modal-cap .ra-creator { margin: 0; }
.ra-modal-cap .ra-creator-text small { color: rgba(255,255,255,.75); }
.ra-cap-tag { display: inline-flex; align-items: center; gap: 6px; padding: 5px 13px; border-radius: 999px; background: var(--gold); color: var(--ink); font-weight: 600; font-size: 13px; }

/* ---- confetti ---- */
.ra-confetti { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 1; }
.ra-confetti i { position: absolute; top: -24px; opacity: 0; border-radius: 2px; }
.ra-confetti.is-run i { animation-name: ra-fall; animation-timing-function: linear; animation-iteration-count: 1; animation-fill-mode: forwards; }
@keyframes ra-fall { 0% { opacity: 1; transform: translate3d(0, -24px, 0) rotate(0); } 85% { opacity: 1; } 100% { opacity: 0; transform: translate3d(var(--dx), 110vh, 0) rotate(calc(var(--rot) + 600deg)); } }

@media (max-width: 1100px) {
  .ra-awards, .ra-reel-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 980px) {
  .ra-hero { grid-template-columns: 1fr; margin-bottom: 88px; }
  .ra-hero h1 { max-width: none; }
  .ra-hero-reel { margin-top: 28px; }
  .ra-awards, .ra-reel-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ra-steps, .ra-enter { grid-template-columns: 1fr; }
}
@media (max-width: 700px) {
  .ra-podium { grid-template-columns: 1fr; max-width: 320px; gap: 40px; }
  .ra-pod-1 { order: -1; transform: none; margin-top: 24px; }
  .ra-stage { grid-template-columns: 1fr; padding: 22px; }
  .ra-stage-media { max-width: 260px; margin: 18px auto 0; }
  .ra-grid2 { grid-template-columns: 1fr; }
  .ra-close { top: 8px; right: 8px; }
}
@media (max-width: 520px) {
  .ra-awards, .ra-reel-grid { grid-template-columns: 1fr; max-width: 300px; }
}
@media (prefers-reduced-motion: reduce) {
  .ra *, .ra *::before, .ra *::after { animation: none !important; transition: none !important; }
  .ra-confetti, .ra-spark { display: none; }
}
`;