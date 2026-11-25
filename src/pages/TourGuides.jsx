import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import API_BASE_URL from "../config";
import { GUIDE_LANGUAGES, languageName, splitCsv } from "../utils/guideLanguages";
import { Stars } from "../components/StarRating";

const MAROON = "#5b0a30";
const inputCls =
  "w-full border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b0a30]";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

// today as YYYY-MM-DD in the visitor's own time zone (for the date picker's min)
const todayStr = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

/* ------------------------------ small pieces ------------------------------ */
function LangChips({ codes }) {
  return (
    <span className="inline-flex flex-wrap gap-2 align-middle">
      {splitCsv(codes).map((c) => (
        <span
          key={c}
          title={languageName(c)}
          className="grid h-8 min-w-8 place-items-center rounded-full px-2 text-sm uppercase text-white"
          style={{ background: "#4a0526" }}
        >
          {c}
        </span>
      ))}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-label={title} className="my-8 w-full max-w-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-6 py-4" style={{ background: MAROON }}>
          <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "Georgia, serif" }}>
            {title}
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-white/80 hover:text-white">
            <X size={22} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Notice({ kind, children }) {
  if (!children) return null;
  return (
    <p
      role="status"
      className={`mb-4 px-3 py-2 text-sm ${
        kind === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
      }`}
    >
      {children}
    </p>
  );
}

async function postJson(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

/* ------------------------- tourist enquiry (modal) ------------------------ */
function EnquiryModal({ guide, destinations, onClose }) {
  const [f, setF] = useState({
    tourist_name: "", phone_number: "", email: "",
    destination: "", language: "", travel_date: "", group_size: "", message: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState("");
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const guideDests = guide ? splitCsv(guide.destinations) : destinations;
  const guideLangs = guide ? splitCsv(guide.languages) : GUIDE_LANGUAGES.map((l) => l.code);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const data = await postJson("/api/guide-enquiries", {
        ...f,
        group_size: f.group_size ? Number(f.group_size) : null,
        guide_id: guide ? guide.id : null,
      });
      setDone(data.message);
    } catch (ex) { setErr(ex.message); }
    setBusy(false);
  };

  return (
    <Modal title={guide ? `Request ${guide.guide_name}` : "Find me a guide"} onClose={onClose}>
      {done ? (
        <div>
          <Notice kind="ok">{done}</Notice>
          <button onClick={onClose} className="px-5 py-2 text-white" style={{ background: MAROON }}>Close</button>
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Notice>{err}</Notice></div>
          <div><label className={labelCls}>Your name *</label>
            <input className={inputCls} value={f.tourist_name} onChange={set("tourist_name")} required /></div>
          <div><label className={labelCls}>Phone number *</label>
            <input className={inputCls} type="tel" inputMode="numeric" value={f.phone_number} onChange={set("phone_number")} required /></div>
          <div><label className={labelCls}>Email</label>
            <input className={inputCls} type="email" value={f.email} onChange={set("email")} /></div>
          <div><label className={labelCls}>Travel date</label>
            <input className={inputCls} type="date" min={todayStr()} value={f.travel_date} onChange={set("travel_date")} /></div>
          <div><label className={labelCls}>Destination</label>
            <select className={inputCls} value={f.destination} onChange={set("destination")}>
              <option value="">Select destination</option>
              {guideDests.map((d) => <option key={d}>{d}</option>)}
            </select></div>
          <div><label className={labelCls}>Preferred language</label>
            <select className={inputCls} value={f.language} onChange={set("language")}>
              <option value="">Any language</option>
              {guideLangs.map((c) => <option key={c} value={c}>{languageName(c)}</option>)}
            </select></div>
          <div><label className={labelCls}>Group size</label>
            <input className={inputCls} type="number" min="1" max="200" value={f.group_size} onChange={set("group_size")} /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Message</label>
            <textarea className={inputCls} rows={3} value={f.message} onChange={set("message")}
              placeholder="Tell us what you would like to see or do." /></div>
          <div className="sm:col-span-2">
            <button disabled={busy} className="px-6 py-2.5 font-semibold tracking-wide text-white disabled:opacity-60"
              style={{ background: MAROON }}>
              {busy ? "Sending..." : "Send request"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

/* ------------------------- guide registration (modal) --------------------- */
function RegisterModal({ onClose }) {
  const [f, setF] = useState({
    guide_name: "", phone_number: "", email: "", languages: [], destinations: "",
    base_village: "", taluka_name: "", district_name: "Ratnagiri",
    experience_years: "", license_number: "", about: "", guide_photo: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState("");
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const toggleLang = (c) =>
    setF((p) => ({
      ...p,
      languages: p.languages.includes(c) ? p.languages.filter((x) => x !== c) : [...p.languages, c],
    }));

  const submit = async (e) => {
    e.preventDefault();
    if (!f.languages.length) return setErr("Select at least one language.");
    setBusy(true); setErr("");
    try {
      const data = await postJson("/api/guides/register", {
        ...f,
        experience_years: f.experience_years ? Number(f.experience_years) : 0,
      });
      setDone(data.message);
    } catch (ex) { setErr(ex.message); }
    setBusy(false);
  };

  return (
    <Modal title="Register as a tour guide" onClose={onClose}>
      {done ? (
        <div>
          <Notice kind="ok">{done}</Notice>
          <button onClick={onClose} className="px-5 py-2 text-white" style={{ background: MAROON }}>Close</button>
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Notice>{err}</Notice></div>
          <div><label className={labelCls}>Full name *</label>
            <input className={inputCls} value={f.guide_name} onChange={set("guide_name")} required /></div>
          <div><label className={labelCls}>Phone number *</label>
            <input className={inputCls} type="tel" inputMode="numeric" value={f.phone_number} onChange={set("phone_number")} required /></div>
          <div><label className={labelCls}>Email *</label>
            <input className={inputCls} type="email" value={f.email} onChange={set("email")} required /></div>
          <div><label className={labelCls}>Years of experience</label>
            <input className={inputCls} type="number" min="0" max="60" value={f.experience_years} onChange={set("experience_years")} /></div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Languages you speak *</label>
            <div className="flex flex-wrap gap-2">
              {GUIDE_LANGUAGES.map((l) => {
                const on = f.languages.includes(l.code);
                return (
                  <button type="button" key={l.code} onClick={() => toggleLang(l.code)} aria-pressed={on}
                    className={`rounded-full border px-3 py-1 text-sm ${on ? "text-white" : "bg-white text-gray-700"}`}
                    style={on ? { background: MAROON, borderColor: MAROON } : {}}>
                    {l.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sm:col-span-2"><label className={labelCls}>Destinations you cover *</label>
            <input className={inputCls} value={f.destinations} onChange={set("destinations")}
              placeholder="Ratnadurg Fort, Bhatye Beach (separate with commas)" required /></div>
          <div><label className={labelCls}>Base village *</label>
            <input className={inputCls} value={f.base_village} onChange={set("base_village")} required /></div>
          <div><label className={labelCls}>Taluka *</label>
            <input className={inputCls} value={f.taluka_name} onChange={set("taluka_name")} required /></div>
          <div><label className={labelCls}>District</label>
            <input className={inputCls} value={f.district_name} onChange={set("district_name")} /></div>
          <div><label className={labelCls}>Guide licence number</label>
            <input className={inputCls} value={f.license_number} onChange={set("license_number")} placeholder="If you have one" /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Photo link *</label>
            <input className={inputCls} type="url" value={f.guide_photo} onChange={set("guide_photo")}
              placeholder="https://..." required />
            <p className="mt-1 text-xs text-gray-500">Paste the link of a clear photo already hosted online. It must start with https://</p>
            {f.guide_photo && (
              <img src={f.guide_photo} alt="Preview" className="mt-2 h-24 w-20 object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
                onLoad={(e) => (e.currentTarget.style.display = "block")} />
            )}</div>
          <div className="sm:col-span-2"><label className={labelCls}>About you</label>
            <textarea className={inputCls} rows={3} value={f.about} onChange={set("about")}
              placeholder="Tell tourists what makes your tours special." /></div>
          <div className="sm:col-span-2">
            <button disabled={busy} className="px-6 py-2.5 font-semibold tracking-wide text-white disabled:opacity-60"
              style={{ background: MAROON }}>
              {busy ? "Submitting..." : "Submit registration"}
            </button>
            <p className="mt-2 text-xs text-gray-500">Your profile is listed after the department approves it.</p>
          </div>
        </form>
      )}
    </Modal>
  );
}

/* ---------------------------------- page ---------------------------------- */
export default function TourGuides() {
  const location = useLocation();
  const navigate = useNavigate();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({ destination: "", language: "", q: "" });
  const [applied, setApplied] = useState(draft);
  const [modal, setModal] = useState(null); // {type:'enquiry'|'register', guide?}

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/guides`);
        if (!res.ok) throw new Error();
        setGuides(await res.json());
      } catch {
        setError("Could not load tour guides. Please try again later.");
      }
      setLoading(false);
    })();
  }, []);

  // "Request this guide" on the detail page sends the guide id here
  useEffect(() => {
    const id = location.state?.requestGuideId;
    if (id == null) return;
    const g = guides.find((x) => x.id === id);
    if (g) {
      setModal({ type: "enquiry", guide: g });
      // clear the router state so the modal doesn't reopen on refresh or back
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [guides, location.state, location.pathname, navigate]);

  const destinations = useMemo(
    () => [...new Set(guides.flatMap((g) => splitCsv(g.destinations)))].sort(),
    [guides]
  );
  const languages = useMemo(
    () => [...new Set(guides.flatMap((g) => splitCsv(g.languages)))],
    [guides]
  );

  const visible = guides.filter((g) => {
    if (applied.q && !g.guide_name.toLowerCase().includes(applied.q.trim().toLowerCase())) return false;
    if (applied.destination && !splitCsv(g.destinations).includes(applied.destination)) return false;
    if (applied.language && !splitCsv(g.languages).includes(applied.language)) return false;
    return true;
  });

  const clear = () => {
    const empty = { destination: "", language: "", q: "" };
    setDraft(empty); setApplied(empty);
  };

  return (
    <div className="min-h-screen" style={{ background: "#f4f3f1" }}>
      {/* Hero */}
      <section
        className="relative flex h-60 items-center justify-center text-center"
        style={{ background: "linear-gradient(180deg,#a9c9cf 0%,#d7c3a0 62%,#7a5a3a 100%)" }}
      >
        <div className="px-4">
          <h1 className="text-5xl text-white" style={{ fontFamily: "Georgia, 'Times New Roman', serif", textShadow: "0 2px 6px rgba(0,0,0,.35)" }}>
            Tour Guides
          </h1>
          <p className="mt-2 text-white/90">Approved local guides of Ratnagiri district</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Filter bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); setApplied(draft); }}
          className="flex flex-wrap items-center gap-4 border border-gray-300 bg-[#efedea] p-5"
        >
          <select aria-label="Destination" value={draft.destination}
            onChange={(e) => setDraft({ ...draft, destination: e.target.value })}
            className="h-11 min-w-[200px] flex-1 border border-gray-400 bg-[#f4f3f1] px-3 text-sm uppercase tracking-widest">
            <option value="">All destinations</option>
            {destinations.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select aria-label="Language" value={draft.language}
            onChange={(e) => setDraft({ ...draft, language: e.target.value })}
            className="h-11 min-w-[170px] flex-1 border border-gray-400 bg-[#f4f3f1] px-3 text-sm uppercase tracking-widest">
            <option value="">All languages</option>
            {languages.map((c) => <option key={c} value={c}>{languageName(c)}</option>)}
          </select>
          <input aria-label="Guide name" placeholder="Enter guide name" value={draft.q}
            onChange={(e) => setDraft({ ...draft, q: e.target.value })}
            className="h-11 min-w-[180px] flex-1 border border-gray-300 bg-white px-3 text-sm" />
          <div className="flex">
            <button type="submit" className="h-11 px-8 text-sm font-semibold uppercase tracking-widest text-white"
              style={{ background: MAROON }}>Search</button>
            <button type="button" onClick={clear}
              className="h-11 border bg-white px-6 text-sm font-semibold uppercase tracking-widest"
              style={{ color: MAROON, borderColor: MAROON }}>Clear filter</button>
          </div>
        </form>

        {/* Calls to action */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600">{loading ? "Loading..." : `${visible.length} guide${visible.length === 1 ? "" : "s"} found`}</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setModal({ type: "enquiry", guide: null })}
              className="border px-5 py-2 text-sm font-semibold" style={{ color: MAROON, borderColor: MAROON }}>
              Need a guide? Send a request
            </button>
            <button onClick={() => setModal({ type: "register" })}
              className="px-5 py-2 text-sm font-semibold text-white" style={{ background: MAROON }}>
              Are you a guide? Register
            </button>
          </div>
        </div>

        {/* Cards */}
        {error && <p className="mt-8 text-red-600">{error}</p>}
        {!loading && !error && visible.length === 0 && (
          <p className="mt-10 text-center text-gray-600">
            No guides match these filters. Clear the filters or send a request and the department will find a guide for you.
          </p>
        )}
        <div className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
          {visible.map((g) => (
            <article key={g.id} className="flex bg-white shadow-sm">
              <img src={g.guide_photo} alt={g.guide_name} loading="lazy"
                className="h-auto w-32 shrink-0 object-cover sm:w-[232px]" />
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="space-y-3 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-gray-900">{g.guide_name}</h3>
                    <Link to={`/guides/${g.id}`}
                      className="shrink-0 rounded-sm bg-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white hover:bg-orange-600">
                      Know more
                    </Link>
                  </div>
                  <p className="flex items-center gap-2 text-sm text-gray-700">
                    <Stars value={Number(g.avg_rating) || 0} />
                    {g.rating_count > 0 ? `${Number(g.avg_rating).toFixed(1)} (${g.rating_count})` : "No ratings yet"}
                  </p>
                  <p className="text-[15px] text-gray-800">Registration No: {g.registration_no}</p>
                  <p className="flex flex-wrap items-center gap-2 text-[15px] text-gray-800">
                    Language(s) known: <LangChips codes={g.languages} />
                  </p>
                  <p className="text-[15px] text-gray-800">Destination(s) covered: {g.destinations}</p>
                </div>
                <div className="border-t px-4 py-3 sm:px-5">
                  <button onClick={() => setModal({ type: "enquiry", guide: g })}
                    className="text-sm font-semibold hover:underline" style={{ color: MAROON }}>
                    Request this guide
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {modal?.type === "enquiry" && (
        <EnquiryModal guide={modal.guide} destinations={destinations} onClose={() => setModal(null)} />
      )}
      {modal?.type === "register" && <RegisterModal onClose={() => setModal(null)} />}
    </div>
  );
}