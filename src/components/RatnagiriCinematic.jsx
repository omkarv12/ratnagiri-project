/* ==================================================================
   Minimal page loader for the Ratnagiri Tourism site.
   Name, a thin progress line, one status word. No illustration.

   Same filename and default export as before, so DashboardOverview
   needs no change. RatnagiriLoader.jsx is no longer used and can be
   deleted.
================================================================== */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600&family=Plus+Jakarta+Sans:wght@400;500&family=Noto+Sans+Devanagari:wght@500&display=swap');

.rm-root { animation: rmIn .4s ease-out both; }
.rm-name { font-family: 'Fraunces', Georgia, serif; }
.rm-deva { font-family: 'Noto Sans Devanagari', 'Plus Jakarta Sans', sans-serif; }
.rm-body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

.rm-track { position: relative; width: 120px; height: 2px; overflow: hidden; border-radius: 2px; background: #dbe4ea; }
.rm-bar { position: absolute; inset: 0 auto 0 0; width: 40%; border-radius: 2px; background: #0f766e; animation: rmSlide 1.3s cubic-bezier(.65,0,.35,1) infinite; }
@keyframes rmSlide { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
@keyframes rmIn { from { opacity: 0; } to { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .rm-root { animation: none; }
  .rm-bar { animation: none; width: 100%; opacity: .5; }
}
`;

export default function RatnagiriCinematic() {
  return (
    <div
      className="rm-root flex min-h-[70vh] flex-col items-center justify-center px-6 text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <style>{CSS}</style>

      <h1 className="rm-name text-4xl text-[#0b3149] sm:text-5xl">Ratnagiri</h1>
      <p lang="mr" className="rm-deva mt-1 text-lg text-slate-500">
        रत्नागिरी
      </p>

      <div className="rm-track mt-8" aria-hidden="true">
        <div className="rm-bar" />
      </div>

      <p className="rm-body mt-4 text-sm text-slate-500">Loading</p>
    </div>
  );
}