// src/components/AdminMediaPanel.jsx
//
// "Reels & Videos" review section for the Admin Dashboard.
//   Sub-section 1: Reels  (YouTube Shorts + Instagram reels)
//   Sub-section 2: Videos (regular YouTube videos)
// Each has Pending / Approved / Rejected lists with approve, reject,
// award, likes override and delete.
//
// Auth: the reels endpoints need "Authorization: Bearer <ADMIN_TOKEN>".
// The token is read from localStorage("admin_token"); if it is missing or
// wrong, the panel asks for it once and remembers it.

import React, { useCallback, useEffect, useState } from "react";
import API_BASE_URL from "../config";
import { AWARD_CATEGORIES } from "../pages/ReelAwards";

const STATUSES = ["pending", "approved", "rejected"];
const SECTIONS = [
  { key: "reel", label: "Reels", hint: "YouTube Shorts and Instagram reels" },
  { key: "video", label: "Videos", hint: "Regular YouTube videos" },
];

export default function AdminMediaPanel() {
  const [section, setSection] = useState("reel");
  const [status, setStatus] = useState("pending");
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem("admin_token") || "");
  const [tokenDraft, setTokenDraft] = useState("");

  const api = useCallback(
    async (path, opts = {}) => {
      const res = await fetch(`${API_BASE_URL}${path}`, {
        ...opts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(opts.headers || {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        localStorage.removeItem("admin_token");
        setToken("");
        throw new Error("Admin token missing or wrong. Enter it again.");
      }
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      return data;
    },
    [token]
  );

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const d = await api(`/api/reels/admin?status=${status}&kind=${section}`);
      setRows(d.reels || []);
      setCounts(d.counts || {});
    } catch (e) {
      setError(e.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [api, status, section, token]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (id, body) => {
    setBusy(id);
    setError("");
    try {
      await api(`/api/reels/admin/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      await load();
    } catch (e) {
      setError(e.message);
    }
    setBusy(null);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this submission permanently?")) return;
    setBusy(id);
    setError("");
    try {
      await api(`/api/reels/admin/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e.message);
    }
    setBusy(null);
  };

  const refreshLikes = async () => {
    setBusy("refresh");
    setError("");
    setInfo("");
    try {
      const d = await api("/api/reels/admin/refresh-likes", { method: "POST" });
      setInfo(`Updated likes for ${d.updated} YouTube items.`);
      await load();
    } catch (e) {
      setError(e.message);
    }
    setBusy(null);
  };

  const saveToken = (e) => {
    e.preventDefault();
    const t = tokenDraft.trim();
    if (!t) return;
    localStorage.setItem("admin_token", t);
    setToken(t);
    setTokenDraft("");
    setError("");
  };

  const current = SECTIONS.find((s) => s.key === section);
  const isReel = section === "reel";

  // ---- token gate ----
  if (!token) {
    return (
      <section>
        <h2 className="text-xl font-semibold mb-2">Reels &amp; Videos</h2>
        <form onSubmit={saveToken} className="bg-white p-5 rounded shadow max-w-md space-y-3">
          <p className="text-sm text-gray-600">
            Enter the admin token (the <code>ADMIN_TOKEN</code> set on the server) to review submissions.
          </p>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <input
            type="password"
            value={tokenDraft}
            onChange={(e) => setTokenDraft(e.target.value)}
            placeholder="Admin token"
            className="border rounded px-3 py-2 w-full"
          />
          <button className="px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-800 text-sm font-semibold">
            Save token
          </button>
        </form>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h2 className="text-xl font-semibold">Reels &amp; Videos</h2>
          <p className="text-sm text-gray-500 mt-1">
            Review community submissions. Approved reels appear in the Reel Awards ranked by likes.
          </p>
        </div>
        <button
          disabled={busy === "refresh"}
          onClick={refreshLikes}
          className="px-3 py-2 bg-white border border-gray-300 rounded text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
        >
          Refresh YouTube likes
        </button>
      </div>

      {/* Main sub-sections: Reels | Videos */}
      <div className="flex gap-2 mb-4 border-b border-gray-200" role="tablist">
        {SECTIONS.map((s) => {
          const pending = counts[`${s.key}_pending`] || 0;
          const on = section === s.key;
          return (
            <button
              key={s.key}
              role="tab"
              aria-selected={on}
              onClick={() => {
                setSection(s.key);
                setStatus("pending");
              }}
              className={`px-4 py-2 -mb-px text-sm font-semibold border-b-2 transition-colors ${
                on
                  ? "border-orange-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {s.label}
              {pending > 0 && (
                <span className="ml-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">{pending}</span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mb-3">{current.hint}</p>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUSES.map((st) => (
          <button
            key={st}
            onClick={() => setStatus(st)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
              status === st
                ? "bg-[#0c2a2e] text-white border-[#0c2a2e]"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {st[0].toUpperCase() + st.slice(1)}
            <span className="ml-1.5 opacity-70">{counts[`${section}_${st}`] || 0}</span>
          </button>
        ))}
      </div>

      {info && <p className="text-sm text-gray-600 mb-3">{info}</p>}
      {error && (
        <p className="text-sm text-red-500 mb-3" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : rows.length === 0 && !error ? (
        <p className="text-gray-500">
          No {status} {current.label.toLowerCase()}.
        </p>
      ) : (
        <div className="space-y-5">
          {rows.map((r) => (
            <article key={r.id} className="bg-white p-4 rounded shadow flex gap-5 flex-wrap sm:flex-nowrap">
              {/* Preview: tall for reels, wide for videos */}
              <div
                className={`shrink-0 rounded-lg overflow-hidden bg-black ${
                  isReel ? "w-[180px] aspect-[9/16]" : "w-full sm:w-[320px] aspect-video"
                }`}
              >
                <iframe
                  title={r.title}
                  src={
                    r.platform === "instagram"
                      ? `https://www.instagram.com/reel/${r.video_id}/embed`
                      : `https://www.youtube-nocookie.com/embed/${r.video_id}?rel=0&playsinline=1`
                  }
                  className="w-full h-full border-0"
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg">{r.title}</h3>
                <p className="text-sm text-gray-600 break-words">
                  {r.name}
                  {r.handle ? ` (${r.handle})` : ""} · {r.place}
                </p>
                <p className="text-sm text-gray-600 break-words">
                  {r.email}
                  {r.phone ? ` · ${r.phone}` : ""}
                </p>
                {isReel && r.category && (
                  <p className="text-sm text-gray-600">
                    Entered for: <strong>{r.category}</strong>
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <a href={r.url} target="_blank" rel="noreferrer" className="text-teal-700 underline">
                    Open original link
                  </a>{" "}
                  · {r.platform}
                </p>

                <div className="flex gap-4 flex-wrap mt-4">
                  <label className="grid gap-1 text-xs font-semibold text-gray-700">
                    Likes {r.platform === "youtube" ? "(auto from YouTube; type to override)" : "(type the Instagram count)"}
                    <input
                      type="number"
                      min="0"
                      defaultValue={r.likes}
                      onBlur={(e) =>
                        e.target.value !== "" &&
                        e.target.value !== String(r.likes) &&
                        patch(r.id, { likes: e.target.value })
                      }
                      className="border rounded px-2 py-1.5 w-40 font-normal"
                    />
                  </label>

                  {isReel && (
                    <label className="grid gap-1 text-xs font-semibold text-gray-700">
                      Award
                      <select
                        defaultValue={r.award || ""}
                        onChange={(e) => patch(r.id, { award: e.target.value || null })}
                        className="border rounded px-2 py-1.5 font-normal"
                      >
                        <option value="">No award</option>
                        {AWARD_CATEGORIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap mt-4">
                  {r.status !== "approved" && (
                    <button
                      disabled={busy === r.id}
                      onClick={() => patch(r.id, { status: "approved" })}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button
                      disabled={busy === r.id}
                      onClick={() => patch(r.id, { status: "rejected" })}
                      className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm disabled:opacity-50"
                    >
                      Reject
                    </button>
                  )}
                  {r.status !== "pending" && (
                    <button
                      disabled={busy === r.id}
                      onClick={() => patch(r.id, { status: "pending" })}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm disabled:opacity-50"
                    >
                      Back to pending
                    </button>
                  )}
                  <button
                    disabled={busy === r.id}
                    onClick={() => remove(r.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
