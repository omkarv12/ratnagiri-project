import React, { useCallback, useEffect, useState } from "react";
import API_BASE_URL from "../config";
import { languageName, splitCsv } from "../utils/guideLanguages";

const STATUS_STYLE = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700",
};

async function api(path, options) {
  const res = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
const post = (path, body) =>
  api(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });

export default function AdminGuidesPanel({ canEdit = true, onPendingCountChange }) {
  const [view, setView] = useState("guides"); // guides | enquiries
  const [status, setStatus] = useState("pending");
  const [guides, setGuides] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadGuides = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const d = await api(`/api/admin/guides?status=${status}`);
      setGuides(d.guides);
      setCounts(d.counts);
      onPendingCountChange?.(d.counts.pending);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, [status, onPendingCountChange]);

  const loadEnquiries = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const d = await api("/api/admin/guide-enquiries");
      setEnquiries(d.enquiries);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { view === "guides" ? loadGuides() : loadEnquiries(); }, [view, loadGuides, loadEnquiries]);

  const act = async (fn) => {
    try { await fn(); await loadGuides(); } catch (e) { setError(e.message); }
  };
  const approve = (g) => act(() => post(`/api/admin/guides/${g.id}/approve`));
  const reject = (g) => {
    const note = window.prompt(`Reason for rejecting ${g.guide_name} (optional):`, "");
    if (note === null) return;
    act(() => post(`/api/admin/guides/${g.id}/reject`, { note }));
  };
  const remove = (g) => {
    if (!window.confirm(`Delete ${g.guide_name}? This can't be undone.`)) return;
    act(() => api(`/api/admin/guides/${g.id}`, { method: "DELETE" }));
  };
  const setEnquiryStatus = async (id, s) => {
    try {
      await post(`/api/admin/guide-enquiries/${id}/status`, { status: s });
      setEnquiries((p) => p.map((e) => (e.id === id ? { ...e, status: s } : e)));
    } catch (e) { setError(e.message); }
  };

  const tabBtn = (key, label, badge) => (
    <button key={key} onClick={() => setView(key)}
      className={`px-4 py-2 text-sm font-semibold rounded ${view === key ? "bg-teal-700 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}>
      {label}{badge > 0 && <span className="ml-2 rounded-full bg-orange-500 px-2 text-xs text-white">{badge}</span>}
    </button>
  );

  return (
    <section>
      <h2 className="text-xl font-semibold mb-1">Tour Guides</h2>
      <p className="text-gray-500 text-sm mb-5">Review guide registrations and tourist requests.</p>

      <div className="flex gap-2 mb-5">
        {tabBtn("guides", "Guide registrations", counts.pending)}
        {tabBtn("enquiries", "Tourist requests", 0)}
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {view === "guides" && (
        <>
          <div className="flex gap-2 mb-5 flex-wrap">
            {["pending", "approved", "rejected"].map((s) => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-3 py-1.5 text-sm rounded-full border capitalize ${status === s ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-700"}`}>
                {s} ({counts[s]})
              </button>
            ))}
          </div>

          {loading ? <p className="text-gray-500">Loading guides...</p>
            : guides.length === 0 ? <p className="text-gray-500">No {status} guides.</p>
            : (
              <div className="space-y-4">
                {guides.map((g) => (
                  <div key={g.id} className="bg-white p-4 rounded shadow flex gap-4 flex-wrap sm:flex-nowrap">
                    <img src={g.guide_photo} alt={g.guide_name} className="h-36 w-28 object-cover rounded shrink-0 bg-gray-100" />
                    <div className="min-w-0 flex-1 text-sm space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{g.guide_name}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${STATUS_STYLE[g.status]}`}>{g.status}</span>
                        {g.registration_no && <span className="text-xs text-gray-500">{g.registration_no}</span>}
                      </div>
                      <p><strong>Phone:</strong> {g.phone_number} &nbsp; <strong>Email:</strong> {g.email}</p>
                      <p><strong>Languages:</strong> {splitCsv(g.languages).map(languageName).join(", ")}</p>
                      <p><strong>Destinations:</strong> {g.destinations}</p>
                      <p><strong>Base:</strong> {g.base_village}, {g.taluka_name}, {g.district_name} &nbsp; <strong>Experience:</strong> {g.experience_years} yrs</p>
                      {g.license_number && <p><strong>Licence:</strong> {g.license_number}</p>}
                      {g.about && <p className="text-gray-600">{g.about}</p>}
                      {g.admin_note && <p className="text-red-600"><strong>Rejection note:</strong> {g.admin_note}</p>}
                      <p className="text-xs text-gray-400">Submitted {new Date(g.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>

                      {canEdit && (
                        <div className="flex gap-2 pt-2 flex-wrap">
                          {g.status !== "approved" && (
                            <button onClick={() => approve(g)} className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                          )}
                          {g.status !== "rejected" && (
                            <button onClick={() => reject(g)} className="px-3 py-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600">Reject</button>
                          )}
                          <button onClick={() => remove(g)} className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </>
      )}

      {view === "enquiries" && (
        loading ? <p className="text-gray-500">Loading requests...</p>
          : enquiries.length === 0 ? <p className="text-gray-500">No tourist requests yet.</p>
          : (
            <div className="space-y-3">
              {enquiries.map((e) => (
                <div key={e.id} className="bg-white p-4 rounded shadow text-sm flex justify-between gap-4 flex-wrap">
                  <div className="space-y-1 min-w-0">
                    <p className="font-semibold text-base">{e.tourist_name} <span className="font-normal text-gray-500">· {e.phone_number}{e.email ? ` · ${e.email}` : ""}</span></p>
                    <p><strong>Guide:</strong> {e.guide_name || "Any guide (department to assign)"}</p>
                    <p><strong>Destination:</strong> {e.destination || "—"} &nbsp; <strong>Language:</strong> {e.language ? languageName(e.language) : "Any"}</p>
                    <p><strong>Date:</strong> {e.travel_date || "—"} &nbsp; <strong>Group:</strong> {e.group_size || "—"}</p>
                    {e.message && <p className="text-gray-600">{e.message}</p>}
                    <p className="text-xs text-gray-400">{new Date(e.created_at).toLocaleString("en-IN")}</p>
                  </div>
                  <select value={e.status} disabled={!canEdit} onChange={(ev) => setEnquiryStatus(e.id, ev.target.value)}
                    className="border rounded px-2 py-1 h-9 self-start" aria-label="Request status">
                    <option value="new">New</option>
                    <option value="forwarded">Forwarded to guide</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              ))}
            </div>
          )
      )}
    </section>
  );
}
