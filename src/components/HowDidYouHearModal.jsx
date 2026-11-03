import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import API_BASE_URL from "../config";

// Shown once, on a visitor's first visit. The answer (or "skipped") is
// remembered in localStorage so it never appears again on that browser, and
// is also saved to the database via POST /api/survey/how-found.
const STORAGE_KEY = "rt_source_survey_v1";
const SHOW_DELAY_MS = 1200;

// Popular places people discover websites. `mark` is the short badge text,
// `bg` its brand colour.
const SOURCES = [
  { id: "google", label: "Google", mark: "G", bg: "#4285F4" },
  { id: "youtube", label: "YouTube", mark: "▶", bg: "#FF0000" },
  { id: "instagram", label: "Instagram", mark: "IG", bg: "#C13584" },
  { id: "facebook", label: "Facebook", mark: "f", bg: "#1877F2" },
  { id: "x", label: "X (Twitter)", mark: "X", bg: "#000000" },
  { id: "whatsapp", label: "WhatsApp", mark: "W", bg: "#25D366" },
  { id: "linkedin", label: "LinkedIn", mark: "in", bg: "#0A66C2" },
  { id: "telegram", label: "Telegram", mark: "T", bg: "#26A5E4" },
  { id: "reddit", label: "Reddit", mark: "R", bg: "#FF4500" },
  { id: "pinterest", label: "Pinterest", mark: "P", bg: "#E60023" },
  { id: "snapchat", label: "Snapchat", mark: "S", bg: "#F5C400" },
  { id: "quora", label: "Quora", mark: "Q", bg: "#B92B27" },
  { id: "wikipedia", label: "Wikipedia", mark: "W", bg: "#636466" },
  { id: "bing", label: "Bing", mark: "B", bg: "#008373" },
  { id: "ai", label: "ChatGPT / AI tool", mark: "AI", bg: "#10A37F" },
  { id: "friend", label: "Friend or family", mark: "♥", bg: "#E11D48" },
  { id: "news", label: "News / newspaper", mark: "N", bg: "#334155" },
  { id: "blog", label: "Travel blog", mark: "✎", bg: "#B4532A" },
  { id: "tourism-office", label: "Tourism office / poster", mark: "i", bg: "#0F766E" },
  { id: "other", label: "Other", mark: "…", bg: "#64748B" },
];

// Fire-and-forget: a failed request must never bother the visitor.
function sendAnswer(source, other = null) {
  fetch(`${API_BASE_URL}/api/survey/how-found`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, other }),
  }).catch(() => {});
}

export default function HowDidYouHearModal() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [otherText, setOtherText] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = !!localStorage.getItem(STORAGE_KEY);
    } catch {
      /* storage blocked — just show it */
    }
    if (seen) return;
    const t = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const remember = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  };

  // Skip / X / Escape / click outside. Counted as "skipped" in the database.
  const close = () => {
    remember("skipped");
    sendAnswer("skipped");
    setOpen(false);
  };

  // Close on Escape
  useEffect(() => {
    if (!open || done) return;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, done]);

  const submit = () => {
    if (!selected) return;
    remember(selected);
    sendAnswer(selected, selected === "other" ? otherText.trim() : null);
    setDone(true);
    setTimeout(() => setOpen(false), 1400);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rt-survey-title"
      onMouseDown={(e) => e.target === e.currentTarget && !done && close()}
    >
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-[#B4532A] via-[#FBBF24] to-[#0f766e] shrink-0" />

        <button
          onClick={() => (done ? setOpen(false) : close())}
          aria-label="Close"
          className="absolute right-3 top-4 w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
        >
          <X size={18} />
        </button>

        {done ? (
          <div className="p-10 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
              <Check size={24} />
            </span>
            <p className="font-semibold text-slate-800">Thank you!</p>
            <p className="text-sm text-slate-500 mt-1">Enjoy exploring Ratnagiri.</p>
          </div>
        ) : (
          <>
            <div className="px-6 pt-6 pb-3 pr-12 shrink-0">
              <h2 id="rt-survey-title" className="text-lg font-bold text-slate-900">
                How did you get to know about this website?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Pick one — it helps us reach more travellers.
              </p>
            </div>

            <div className="px-6 py-2 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {SOURCES.map((s) => {
                  const active = selected === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelected(s.id)}
                      aria-pressed={active}
                      className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition ${
                        active
                          ? "border-teal-500 bg-teal-50 ring-2 ring-teal-500/30"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                        style={{ background: s.bg }}
                      >
                        {s.mark}
                      </span>
                      <span className="text-xs font-medium text-slate-700 leading-tight">
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selected === "other" && (
                <input
                  type="text"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  maxLength={80}
                  autoFocus
                  placeholder="Tell us where (optional)"
                  className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              )}
            </div>

            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
              <button
                onClick={close}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 transition"
              >
                Skip
              </button>
              <button
                onClick={submit}
                disabled={!selected}
                className="rounded-full bg-[#B4532A] hover:bg-[#9c4522] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2 transition"
              >
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}