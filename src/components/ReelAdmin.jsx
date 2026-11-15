// src/pages/admin/ReelAdmin.jsx  ->  route: /admin/reels
//
// Admin review for Reel Awards submissions: approve, reject, set the award, delete.
// Auth: sends "Authorization: Bearer <token>". Replace getToken() with your existing admin login token
// if the dashboard already has one; the Flask side (reels.py) checks it in require_admin().

import { useCallback, useEffect, useState } from "react";
import { AWARD_CATEGORIES } from "../ReelAwards";

const API_BASE = ""; // same as ReelAwards.jsx
const getToken = () => localStorage.getItem("admin_token") || "";

async function api(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

const TABS = ["pending", "approved", "rejected"];

export default function ReelAdmin() {
  const [tab, setTab] = useState("pending");
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(null);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    setErr("");
    try {
      const d = await api(`/api/reels/admin?status=${tab}`);
      setRows(d.reels || []);
    } catch (e) { setErr(e.message); setRows([]); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  async function patch(id, body) {
    setBusy(id);
    try {
      await api(`/api/reels/admin/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      await load();
    } catch (e) { setErr(e.message); }
    setBusy(null);
  }

  async function refreshLikes() {
    setBusy("refresh"); setErr(""); setNote("");
    try {
      const d = await api("/api/reels/admin/refresh-likes", { method: "POST" });
      setNote(`Updated likes for ${d.updated} YouTube reels.`);
      await load();
    } catch (e) { setErr(e.message); }
    setBusy(null);
  }

  async function remove(id) {
    if (!window.confirm("Delete this submission permanently?")) return;
    setBusy(id);
    try { await api(`/api/reels/admin/${id}`, { method: "DELETE" }); await load(); }
    catch (e) { setErr(e.message); }
    setBusy(null);
  }

  return (
    <main style={S.page}>
      <h1 style={S.h1}>Reel Awards: submissions</h1>

      <div style={S.tabs} role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} style={{ ...S.tab, ...(tab === t ? S.tabOn : {}) }}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <p style={S.muted}>Winners are ranked by likes. YouTube likes sync automatically; for Instagram, type the like count you see on the reel.</p>
      <button disabled={busy === "refresh"} onClick={refreshLikes} style={{ ...S.btn, marginBottom: 16 }}>Refresh YouTube likes now</button>
      {note && <p style={S.muted}>{note}</p>}
      {err && <p style={S.err} role="alert">{err}</p>}
      {!err && rows.length === 0 && <p style={S.muted}>No {tab} reels.</p>}

      <div style={S.list}>
        {rows.map((r) => (
          <article key={r.id} style={S.card}>
            <div style={S.preview}>
              <iframe
                title={r.title}
                src={r.platform === "instagram" ? `https://www.instagram.com/reel/${r.video_id}/embed` : `https://www.youtube-nocookie.com/embed/${r.video_id}?rel=0&playsinline=1`}
                style={S.frame}
                allow="encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div style={S.body}>
              <h2 style={S.h2}>{r.title}</h2>
              <p style={S.meta}>{r.name}{r.handle ? ` (${r.handle})` : ""} · {r.place}</p>
              <p style={S.meta}>{r.email}{r.phone ? ` · ${r.phone}` : ""}</p>
              <p style={S.meta}>Entered for: <strong>{r.category}</strong></p>
              <p style={S.meta}><a href={r.url} target="_blank" rel="noreferrer">Open original link</a> · {r.platform}</p>

              <label style={S.label}>Likes {r.platform === "youtube" ? "(synced from YouTube; type to override)" : "(type the count shown on Instagram)"}
                <input type="number" min="0" defaultValue={r.likes} onBlur={(e) => e.target.value !== "" && e.target.value !== String(r.likes) && patch(r.id, { likes: e.target.value })} style={S.input} />
              </label>

              <label style={S.label}>Award (leave empty for none)
                <select defaultValue={r.award || ""} onChange={(e) => patch(r.id, { award: e.target.value || null })} style={S.input}>
                  <option value="">No award</option>
                  {AWARD_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>

              <div style={S.actions}>
                {r.status !== "approved" && <button disabled={busy === r.id} onClick={() => patch(r.id, { status: "approved" })} style={{ ...S.btn, ...S.ok }}>Approve</button>}
                {r.status !== "rejected" && <button disabled={busy === r.id} onClick={() => patch(r.id, { status: "rejected" })} style={{ ...S.btn, ...S.no }}>Reject</button>}
                {r.status !== "pending" && <button disabled={busy === r.id} onClick={() => patch(r.id, { status: "pending" })} style={S.btn}>Back to pending</button>}
                <button disabled={busy === r.id} onClick={() => remove(r.id)} style={{ ...S.btn, ...S.del }}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

const S = {
  page: { maxWidth: 1100, margin: "0 auto", padding: "40px 20px 80px", fontFamily: "system-ui, sans-serif", color: "#0b3149" },
  h1: { fontSize: 32, margin: "0 0 24px" },
  h2: { fontSize: 20, margin: "0 0 6px" },
  tabs: { display: "flex", gap: 8, marginBottom: 24 },
  tab: { padding: "8px 18px", borderRadius: 999, border: "1.5px solid #0b3149", background: "transparent", cursor: "pointer", font: "600 14px system-ui" },
  tabOn: { background: "#0b3149", color: "#fff" },
  list: { display: "grid", gap: 20 },
  card: { display: "grid", gridTemplateColumns: "180px 1fr", gap: 20, padding: 16, border: "1.5px solid rgba(11,49,73,.16)", borderRadius: 16, background: "#fff" },
  preview: { aspectRatio: "9 / 16", borderRadius: 12, overflow: "hidden", background: "#000" },
  frame: { width: "100%", height: "100%", border: 0 },
  body: { minWidth: 0 },
  meta: { margin: "2px 0", fontSize: 14, color: "#4d6672", overflowWrap: "anywhere" },
  label: { display: "grid", gap: 4, fontWeight: 600, fontSize: 13, margin: "14px 0", maxWidth: 320 },
  input: { padding: "8px 10px", borderRadius: 8, border: "1.5px solid rgba(11,49,73,.25)", font: "400 14px system-ui" },
  actions: { display: "flex", flexWrap: "wrap", gap: 8 },
  btn: { padding: "8px 16px", borderRadius: 999, border: "1.5px solid #0b3149", background: "#fff", color: "#0b3149", cursor: "pointer", font: "600 14px system-ui" },
  ok: { background: "#0f766e", borderColor: "#0f766e", color: "#fff" },
  no: { background: "#b4532a", borderColor: "#b4532a", color: "#fff" },
  del: { borderColor: "#b42318", color: "#b42318" },
  err: { color: "#b42318" },
  muted: { color: "#4d6672" },
};
