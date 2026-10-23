// src/pages/ReelAwards.jsx  ->  route: /stories/reels
//
// Showcase page: YouTube playlist player in the hero, award winners by category,
// homestay reels, and how to enter. Light design in the Ratnagiri site colours.
// No dependencies beyond React.
//
// EDIT THESE THREE THINGS:
//   1. PLAYLIST_ID  - the id after "list=" in your YouTube playlist URL
//   2. WINNERS      - one entry per award; "id" is the YouTube video id (after v= or /shorts/)
//   3. HOMESTAYS    - homestay reels, same idea
// Set vertical: true for Shorts / reels so the thumbnail and pop-up player are tall.

import { useEffect, useRef, useState } from "react";

// Same ids already used in DashboardOverview.jsx, so the page works straight away.
const PLAYLIST_ID = "PLJW4HbrLXqlA";
const SAMPLE_VIDEOS = ["BZWqwLF5mxI", "tfi_WmqM6to"];
const HASHTAG = "#RatnagiriReels";

// Real YouTube playlist ids are about 34 characters. If PLAYLIST_ID is shorter than that,
// the player falls back to playing SAMPLE_VIDEOS one after another instead of showing an error.
const playlistOk = /^PL[\w-]{16,}$/.test(PLAYLIST_ID);

const WINNERS = [
  { award: "Best reel of the year", title: "Sunrise at Ganpatipule", creator: "@konkan.diaries", place: "Ganpatipule", id: SAMPLE_VIDEOS[0], hue: 192, featured: true,
    note: "Chosen by the jury for its light, its pacing and the way it lets the beach speak." },
  { award: "Best food reel", title: "A proper Konkani thali", creator: "@kokan.kitchen", place: "Ratnagiri", id: SAMPLE_VIDEOS[1], hue: 28 },
  { award: "Best fort and coast reel", title: "Walking Ratnadurg at dusk", creator: "@sahyadri.frames", place: "Ratnagiri town", id: SAMPLE_VIDEOS[0], hue: 14 },
  { award: "Best village story", title: "A quiet morning in Velneshwar", creator: "@slow.konkan", place: "Velneshwar", id: SAMPLE_VIDEOS[1], hue: 150 },
  { award: "People's choice", title: "Alphonso season, orchard to box", creator: "@aamchi.kokan", place: "Devgad", id: SAMPLE_VIDEOS[0], hue: 38 },
];

const HOMESTAYS = [
  { name: "Sagar Kinara Homestay", place: "Ganpatipule", blurb: "Rooms 200 steps from the beach, with a home-cooked fish thali.", id: SAMPLE_VIDEOS[1], hue: 200 },
  { name: "Aamrai Farm Stay", place: "Devgad", blurb: "Sleep inside a mango orchard and join the morning harvest.", id: SAMPLE_VIDEOS[0], hue: 40 },
  { name: "Jambha Wada", place: "Velneshwar", blurb: "A laterite-stone house run by a family that has lived here for four generations.", id: SAMPLE_VIDEOS[1], hue: 16 },
];

const STEPS = [
  { t: "Film a reel in Ratnagiri", d: "Up to 90 seconds, shot in the district. Beaches, forts, food, villages and homestays all count." },
  { t: `Post it with ${HASHTAG}`, d: "Upload it to YouTube and add the hashtag and the place name in the title." },
  { t: "We add it to the playlist", d: "Eligible reels join the playlist above. The jury and the public vote at the end of the season." },
];

const playerSrc = playlistOk
  ? `https://www.youtube-nocookie.com/embed/videoseries?list=${PLAYLIST_ID}&rel=0`
  : `https://www.youtube-nocookie.com/embed/${SAMPLE_VIDEOS[0]}?playlist=${SAMPLE_VIDEOS.slice(1).join(",")}&rel=0`;

const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/* ---------- pop-up player ---------- */
function PlayerModal({ item, onClose }) {
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
    <div className="ra-modal" role="dialog" aria-modal="true" aria-label={item.title || item.name} onClick={onClose}>
      <div className={`ra-modal-box ${item.vertical ? "is-tall" : ""}`} onClick={(e) => e.stopPropagation()}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${item.id}?autoplay=1&rel=0&playsinline=1`}
          title={item.title || item.name}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
        <button ref={closeRef} className="ra-close" onClick={onClose} aria-label="Close video">×</button>
      </div>
    </div>
  );
}

/* ---------- thumbnail with play button ---------- */
function Poster({ item, onPlay, label }) {
  const [broken, setBroken] = useState(false);
  return (
    <button
      className="ra-poster"
      style={{ "--hue": item.hue, aspectRatio: item.vertical ? "9 / 16" : "16 / 10" }}
      onClick={() => onPlay(item)}
      aria-label={`Play ${label}`}
    >
      {!broken && <img src={thumb(item.id)} alt="" loading="lazy" onError={() => setBroken(true)} />}
      <span className="ra-play" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5Z" /></svg>
      </span>
    </button>
  );
}

/* ---------- page ---------- */
export default function ReelAwards() {
  const [playing, setPlaying] = useState(null);
  const hero = WINNERS.find((w) => w.featured);
  const others = WINNERS.filter((w) => !w.featured);

  return (
    <main className="ra">
      <style>{CSS}</style>

      {/* hero + playlist */}
      <section className="ra-hero">
        <div className="ra-hero-copy">
          <p className="ra-year">Season 2026</p>
          <h1>Ratnagiri Reel Awards</h1>
          <p className="ra-lead">
            The best short films of the Konkan coast, made by travellers and locals and picked by a jury and the public.
          </p>
          <div className="ra-cta">
            <a className="ra-btn ra-btn-solid" href="#winners">See the winners</a>
            <a className="ra-btn ra-btn-line" href="#enter">Enter your reel</a>
          </div>
        </div>

        <div className="ra-player-wrap" id="playlist">
          <div className="ra-player">
            <iframe
              src={playerSrc}
              title="Ratnagiri Reel Awards playlist"
              allow="encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
          <p className="ra-player-note">
            All nominated reels, playing in order.
            {playlistOk && (
              <a href={`https://www.youtube.com/playlist?list=${PLAYLIST_ID}`} target="_blank" rel="noreferrer">Open on YouTube</a>
            )}
          </p>
        </div>
      </section>

      {/* winners */}
      <section className="ra-section" id="winners">
        <h2 className="ra-h2">The winners</h2>
        <p className="ra-h2-sub">One reel per award. Select a reel to watch it.</p>

        <div className="ra-awards">
          <article className={`ra-feature ${hero.vertical ? "is-tall" : ""}`}>
            <Poster item={hero} onPlay={setPlaying} label={hero.title} />
            <div className="ra-feature-body">
              <span className="ra-medal">{hero.award}</span>
              <h3>{hero.title}</h3>
              <p className="ra-by">{hero.creator} · {hero.place}</p>
              <p className="ra-note">{hero.note}</p>
              <button className="ra-btn ra-btn-solid" onClick={() => setPlaying(hero)}>Watch the winner</button>
            </div>
          </article>

          {others.map((w) => (
            <article className="ra-award" key={w.award}>
              <Poster item={w} onPlay={setPlaying} label={w.title} />
              <div className="ra-award-body">
                <span className="ra-medal ra-medal-sm">{w.award}</span>
                <h3>{w.title}</h3>
                <p className="ra-by">{w.creator} · {w.place}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* homestays */}
      <section className="ra-section ra-stays" id="homestays">
        <div className="ra-stays-head">
          <div>
            <h2 className="ra-h2">Best homestay reels</h2>
            <p className="ra-h2-sub">Hosts who showed their home and village on camera.</p>
          </div>
          <a className="ra-btn ra-btn-line" href="/experiences/discover-your-stay">Find a stay</a>
        </div>
        <div className="ra-stay-grid">
          {HOMESTAYS.map((h) => (
            <article className="ra-stay" key={h.name}>
              <Poster item={h} onPlay={setPlaying} label={h.name} />
              <h3>{h.name}</h3>
              <p className="ra-by">{h.place}</p>
              <p className="ra-stay-blurb">{h.blurb}</p>
            </article>
          ))}
        </div>
      </section>

      {/* how to enter */}
      <section className="ra-section" id="enter">
        <h2 className="ra-h2">How to enter</h2>
        <ol className="ra-steps">
          {STEPS.map((s, i) => (
            <li key={s.t}>
              <span className="ra-step-n">{i + 1}</span>
              <div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {playing && <PlayerModal item={playing} onClose={() => setPlaying(null)} />}
    </main>
  );
}

/* ---------- styles ---------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap');

.ra {
  /* Ratnagiri site colours */
  --navy: #0b3149; --navy-2: #173b45; --laterite: #b4532a; --laterite-d: #9c4522;
  --teal: #0f766e; --gold: #f2b233; --sand: #e8dfc8; --paper: #fbf7ee; --mist: #e2f0ed;
  --dim: #4d6672; --line: rgba(11,49,73,.16);
  background: radial-gradient(900px 480px at 88% -4%, rgba(242,178,51,.22), transparent 62%), var(--paper);
  color: var(--navy); font-family: 'Instrument Sans', system-ui, sans-serif;
  padding: 56px clamp(18px, 5vw, 72px) 96px; line-height: 1.5;
}
.ra *, .ra *::before, .ra *::after { box-sizing: border-box; }
.ra h1, .ra h2, .ra h3 { font-family: 'Bricolage Grotesque', 'Instrument Sans', system-ui, sans-serif; margin: 0; letter-spacing: -.02em; }
.ra :focus-visible { outline: 3px solid var(--teal); outline-offset: 3px; }

/* hero */
.ra-hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr); gap: clamp(28px, 5vw, 72px); align-items: center; max-width: 1280px; margin: 0 auto 96px; }
.ra-year { color: var(--laterite); font-weight: 600; margin: 0 0 14px; }
.ra-hero h1 { font-size: clamp(44px, 6.4vw, 88px); line-height: .98; font-weight: 800; color: var(--navy); }
.ra-lead { font-size: 18px; color: var(--dim); max-width: 46ch; margin: 22px 0 30px; }
.ra-cta { display: flex; flex-wrap: wrap; gap: 12px; }
.ra-btn { display: inline-block; border-radius: 999px; padding: 12px 24px; font: 600 15px 'Instrument Sans', sans-serif; text-decoration: none; cursor: pointer; border: 1.5px solid transparent; transition: background .2s, color .2s, border-color .2s; }
.ra-btn-solid { background: var(--laterite); color: #fff; }
.ra-btn-solid:hover { background: var(--laterite-d); }
.ra-btn-line { border-color: var(--navy); color: var(--navy); background: transparent; }
.ra-btn-line:hover { background: var(--navy); color: #fff; }

.ra-player-wrap { position: relative; }
.ra-player { position: relative; aspect-ratio: 16 / 9; border-radius: 20px; overflow: hidden; background: var(--sand);
  box-shadow: 0 0 0 3px var(--gold), 0 0 0 11px rgba(242,178,51,.22), 0 24px 56px rgba(11,49,73,.22); }
.ra-player iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.ra-player-note { margin: 24px 4px 0; color: var(--dim); font-size: 14px; }
.ra-player-note a { color: var(--laterite); font-weight: 600; margin-left: 10px; }

/* sections */
.ra-section { max-width: 1280px; margin: 0 auto 96px; }
.ra-h2 { font-size: clamp(30px, 3.6vw, 46px); font-weight: 800; line-height: 1.05; }
.ra-h2-sub { color: var(--dim); margin: 10px 0 36px; }

.ra-poster { position: relative; display: block; width: 100%; border: 0; padding: 0; cursor: pointer; overflow: hidden; border-radius: 16px; color: #fff;
  background: radial-gradient(120% 80% at 20% 10%, hsl(var(--hue) 60% 55%), transparent 60%), linear-gradient(170deg, hsl(var(--hue) 50% 38%), hsl(calc(var(--hue) + 30) 55% 22%)); }
.ra-poster img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }
.ra-poster:hover img { transform: scale(1.04); }
.ra-play { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 56px; height: 56px; border-radius: 50%; display: grid; place-items: center; background: rgba(11,49,73,.72); backdrop-filter: blur(4px); padding-left: 3px; transition: background .2s, color .2s; }
.ra-poster:hover .ra-play { background: var(--gold); color: var(--navy); }

.ra-medal { display: inline-block; background: var(--gold); color: var(--navy); font-weight: 600; font-size: 14px; padding: 5px 14px; border-radius: 999px; margin-bottom: 14px; }
.ra-medal-sm { font-size: 13px; padding: 4px 11px; margin-bottom: 10px; }
.ra-by { color: var(--dim); font-size: 14px; margin: 6px 0 0; }

.ra-awards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; }
.ra-feature { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0, 460px) 1fr; gap: clamp(24px, 4vw, 56px); align-items: center; padding: 28px; border-radius: 24px;
  background: linear-gradient(135deg, #fdeec4, #fff 70%); border: 2px solid var(--gold); box-shadow: 0 18px 40px rgba(11,49,73,.10); }
.ra-feature.is-tall { grid-template-columns: minmax(0, 300px) 1fr; }
.ra-feature-body h3 { font-size: clamp(30px, 3.8vw, 52px); line-height: 1.02; font-weight: 800; }
.ra-note { max-width: 52ch; margin: 18px 0 26px; font-size: 17px; }
.ra-award h3 { font-size: 20px; line-height: 1.15; font-weight: 600; }
.ra-award .ra-poster { margin-bottom: 16px; }

/* homestays */
.ra-stays { background: var(--mist); border-radius: 28px; padding: clamp(24px, 4vw, 56px); }
.ra-stays-head { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; }
.ra-stay-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px; }
.ra-stay .ra-poster { margin-bottom: 16px; }
.ra-stay h3 { font-size: 22px; font-weight: 600; }
.ra-stay-blurb { margin: 10px 0 0; font-size: 15px; max-width: 38ch; }

/* steps */
.ra-steps { list-style: none; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px; padding: 0; margin: 36px 0 0; }
.ra-steps li { display: flex; gap: 16px; }
.ra-step-n { flex: none; width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; background: var(--teal); color: #fff; font: 800 18px 'Bricolage Grotesque', sans-serif; }
.ra-steps h3 { font-size: 20px; font-weight: 600; margin-bottom: 6px; }
.ra-steps p { margin: 0; color: var(--dim); }

/* modal */
.ra-modal { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 20px; background: rgba(11,49,73,.7); backdrop-filter: blur(6px); }
.ra-modal-box { position: relative; width: min(960px, 100%); aspect-ratio: 16 / 9; background: #000; border-radius: 16px; box-shadow: 0 0 0 4px var(--gold); }
.ra-modal-box.is-tall { width: auto; height: min(86vh, 860px); aspect-ratio: 9 / 16; max-width: 100%; }
.ra-modal-box iframe { width: 100%; height: 100%; border: 0; border-radius: 16px; }
.ra-close { position: absolute; top: -16px; right: -16px; width: 40px; height: 40px; border-radius: 50%; border: 0; background: var(--laterite); color: #fff; font-size: 26px; line-height: 1; cursor: pointer; }

@media (max-width: 980px) {
  .ra-hero { grid-template-columns: 1fr; margin-bottom: 72px; }
  .ra-awards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ra-stay-grid, .ra-steps { grid-template-columns: 1fr; }
}
@media (max-width: 700px) {
  .ra-feature, .ra-feature.is-tall { grid-template-columns: 1fr; padding: 18px; }
  .ra-close { top: 8px; right: 8px; }
}
@media (prefers-reduced-motion: reduce) { .ra * { transition: none !important; } }
`;