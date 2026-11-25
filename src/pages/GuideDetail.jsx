import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Award, Languages, MapPin, Phone, Route } from "lucide-react";
import API_BASE_URL from "../config";
import { languageName, splitCsv } from "../utils/guideLanguages";
import { Stars, StarInput } from "../components/StarRating";

const MAROON = "#5b0a30";
const inputCls =
  "w-full border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b0a30]";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

const fmtDate = (s) =>
  new Date(s.replace(" ", "T")).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function ReviewForm({ guideId, guideName, onDone }) {
  const empty = { reviewer_name: "", phone_number: "", email: "", rating: 0, message: "", website: "" };
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!f.rating) return setErr("Please choose a star rating.");
    setBusy(true); setErr("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/guides/${guideId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not submit your review.");
      setOk(data.message);
      setF(empty);
      if (data.status === "approved") onDone?.();
    } catch (ex) { setErr(ex.message); }
    setBusy(false);
  };

  if (ok)
    return (
      <div className="bg-green-50 p-4 text-sm text-green-800">
        {ok}
        <button onClick={() => setOk("")} className="ml-3 underline">Write another</button>
      </div>
    );

  return (
    <form onSubmit={submit} className="grid gap-4">
      {err && <p role="alert" className="sm:col-span-2 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
      <div className="sm:col-span-2">
        <label className={labelCls}>Your rating for {guideName} *</label>
        <StarInput value={f.rating} onChange={(n) => setF((p) => ({ ...p, rating: n }))} />
      </div>
      <div><label className={labelCls}>Your name *</label>
        <input className={inputCls} value={f.reviewer_name} onChange={set("reviewer_name")} required /></div>
      <div><label className={labelCls}>Phone number *</label>
        <input className={inputCls} type="tel" inputMode="numeric" value={f.phone_number} onChange={set("phone_number")} required />
        <p className="mt-1 text-xs text-gray-500">Kept private. Used only to stop duplicate reviews.</p></div>
      <div className="sm:col-span-2"><label className={labelCls}>Email</label>
        <input className={inputCls} type="email" value={f.email} onChange={set("email")} />
        <p className="mt-1 text-xs text-gray-500">Kept private. Optional.</p></div>
      <div className="sm:col-span-2"><label className={labelCls}>Your experience</label>
        <textarea className={inputCls} rows={4} maxLength={1000} value={f.message} onChange={set("message")}
          placeholder="What was the tour like? Was the guide punctual, knowledgeable, friendly?" /></div>
      {/* honeypot: hidden from people, bots fill it */}
      <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set("website")}
        style={{ position: "absolute", left: "-9999px", height: 0, width: 0, opacity: 0 }} />
      <div className="sm:col-span-2">
        <button disabled={busy} className="px-6 py-2.5 font-semibold text-white disabled:opacity-60" style={{ background: MAROON }}>
          {busy ? "Submitting..." : "Submit review"}
        </button>
        <p className="mt-2 text-xs text-gray-500">Reviews appear after the department approves them.</p>
      </div>
    </form>
  );
}

export default function GuideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/guides/${id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not load this guide.");
      setGuide(data); setError("");
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, [id]);

  useEffect(() => { setLoading(true); load(); window.scrollTo(0, 0); }, [load]);

  // how many reviews per star, from the (up to 100) reviews returned
  const spread = useMemo(() => {
    const n = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    (guide?.reviews || []).forEach((r) => { n[r.rating] += 1; });
    return n;
  }, [guide]);

  if (loading) return <p className="p-10 text-center text-gray-500">Loading guide...</p>;
  if (error || !guide)
    return (
      <div className="p-10 text-center">
        <p className="text-red-600">{error || "Guide not found."}</p>
        <Link to="/guides" className="mt-4 inline-block underline" style={{ color: MAROON }}>Back to all guides</Link>
      </div>
    );

  const total = Number(guide.rating_count) || 0;

  return (
    <div className="min-h-screen" style={{ background: "#f4f3f1" }}>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link to="/guides" className="mb-5 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: MAROON }}>
          <ArrowLeft size={16} /> All tour guides
        </Link>

        {/* profile */}
        <section className="flex flex-col gap-6 bg-white p-5 shadow-sm sm:flex-row sm:p-6">
          <img src={guide.guide_photo} alt={guide.guide_name} className="h-72 w-full shrink-0 object-cover sm:h-80 sm:w-60" />
          <div className="min-w-0 flex-1 space-y-3 text-[15px] text-gray-800">
            <h1 className="text-3xl text-gray-900" style={{ fontFamily: "Georgia, serif" }}>{guide.guide_name}</h1>
            <div className="flex items-center gap-2">
              <Stars value={guide.avg_rating} size={20} />
              <span className="font-semibold">{total ? guide.avg_rating.toFixed(1) : "No ratings yet"}</span>
              {total > 0 && <span className="text-sm text-gray-500">({total} review{total === 1 ? "" : "s"})</span>}
            </div>
            <p className="flex items-center gap-2"><Award size={16} /> Registration No: {guide.registration_no}</p>
            <p className="flex items-center gap-2"><MapPin size={16} /> {guide.base_village}, {guide.taluka_name}, {guide.district_name}</p>
            <p>Experience: {guide.experience_years} year{guide.experience_years === 1 ? "" : "s"}</p>
            <p className="flex flex-wrap items-center gap-2">
              <Languages size={16} />
              {splitCsv(guide.languages).map((c) => (
                <span key={c} className="rounded-full px-3 py-0.5 text-sm text-white" style={{ background: "#4a0526" }}>{languageName(c)}</span>
              ))}
            </p>
            <div>
              <p className="mb-1 flex items-center gap-2"><Route size={16} /> Destinations covered</p>
              <ul className="flex flex-wrap gap-2">
                {splitCsv(guide.destinations).map((d) => (
                  <li key={d} className="border border-gray-300 bg-[#f4f3f1] px-3 py-1 text-sm">{d}</li>
                ))}
              </ul>
            </div>
            {guide.about && <p className="max-w-prose leading-relaxed text-gray-700">{guide.about}</p>}
            <button
              onClick={() => navigate("/guides", { state: { requestGuideId: guide.id } })}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 font-semibold text-white" style={{ background: MAROON }}>
              <Phone size={16} /> Request this guide
            </button>
            <p className="text-xs text-gray-500">The guide's phone and email are shared by the department after your request.</p>
          </div>
        </section>

        {/* ratings + reviews */}
        <div className="mt-8 grid gap-8 md:grid-cols-5">
          <section className="md:col-span-3">
            <h2 className="mb-4 text-xl text-gray-900" style={{ fontFamily: "Georgia, serif" }}>Tourist reviews</h2>

            {total > 0 && (
              <div className="mb-5 flex items-center gap-6 bg-white p-4 shadow-sm">
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900">{guide.avg_rating.toFixed(1)}</p>
                  <Stars value={guide.avg_rating} />
                  <p className="mt-1 text-xs text-gray-500">{total} review{total === 1 ? "" : "s"}</p>
                </div>
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((n) => (
                    <div key={n} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="w-3">{n}</span>
                      <div className="h-2 flex-1 bg-gray-200">
                        <div className="h-2" style={{ width: `${total ? (spread[n] / guide.reviews.length) * 100 : 0}%`, background: "#e8a317" }} />
                      </div>
                      <span className="w-5 text-right">{spread[n]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {guide.reviews.length === 0 ? (
              <p className="bg-white p-5 text-sm text-gray-600 shadow-sm">No reviews yet. Be the first to rate this guide.</p>
            ) : (
              <ul className="space-y-3">
                {guide.reviews.map((r) => (
                  <li key={r.id} className="bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900">{r.reviewer_name}</p>
                      <span className="text-xs text-gray-500">{fmtDate(r.created_at)}</span>
                    </div>
                    <Stars value={r.rating} size={14} />
                    {r.message && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">{r.message}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="md:col-span-2">
            <h2 className="mb-4 text-xl text-gray-900" style={{ fontFamily: "Georgia, serif" }}>Rate this guide</h2>
            <div className="bg-white p-5 shadow-sm">
              <ReviewForm guideId={guide.id} guideName={guide.guide_name} onDone={load} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
