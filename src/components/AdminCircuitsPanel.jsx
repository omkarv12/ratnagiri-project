// src/components/AdminCircuitsPanel.jsx
import React, { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, Upload } from "lucide-react";
import API_BASE_URL from "../config";

const THEMES = ["Beaches", "Heritage", "Nature", "Spiritual", "Food", "Adventure", "Mixed"];

const blankStop = () => ({
  name: "", description: "", image_url: "", time_needed: "", distance_km: "", link_id: "",
});

const blankForm = () => ({
  title: "", tagline: "", hero_image: "", summary: "", theme: "Mixed",
  total_distance_km: "", duration_days: 1, best_season: "",
  start_point: "", end_point: "", how_to_reach: "",
  highlights: "", tips: "", display_order: 0, status: "published",
  stops: [blankStop()],
});

const inputCls =
  "border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

const lines = (text) => text.split("\n").map((t) => t.trim()).filter(Boolean);

// Talks to the backend and turns an HTML error page into a readable message.
async function api(path, options) {
  const res = await fetch(`${API_BASE_URL}${path}`, options);
  let data = null;
  try {
    data = await res.json();
  } catch {
    throw new Error(
      `The server sent an unexpected reply (${res.status}). Check that the circuits routes are deployed.`
    );
  }
  if (!res.ok || data?.success === false) {
    throw new Error(data?.error || `Request failed (${res.status}).`);
  }
  return data;
}

async function uploadPhoto(file) {
  const body = new FormData();
  body.append("photo", file);
  const data = await api("/api/upload-photo", { method: "POST", body });
  return data.url;
}

function Field({ label, hint, children }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-semibold text-gray-700 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-gray-500 mt-1">{hint}</span>}
    </label>
  );
}

function ImageField({ label, value, onChange, onError }) {
  const [busy, setBusy] = useState(false);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadPhoto(file));
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-3">
      <span className="block text-sm font-semibold text-gray-700 mb-1">{label}</span>
      <div className="flex items-start gap-3">
        {value ? (
          <img src={value} alt="" className="h-16 w-24 rounded object-cover border" />
        ) : (
          <div className="h-16 w-24 rounded border border-dashed grid place-items-center text-xs text-gray-400">
            No photo
          </div>
        )}
        <div className="flex-1 min-w-0">
          <input
            className={inputCls}
            placeholder="https://..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <label className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 text-sm rounded bg-gray-100 hover:bg-gray-200 cursor-pointer">
            <Upload size={15} />
            {busy ? "Uploading..." : "Upload photo"}
            <input type="file" accept="image/*" className="hidden" onChange={pick} disabled={busy} />
          </label>
        </div>
      </div>
    </div>
  );
}

export default function AdminCircuitsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null); // null = show the list
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [places, setPlaces] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await api("/api/admin/circuits"));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadPlaces = async () => {
    if (places.length) return;
    try {
      setPlaces(await api("/api/locations"));
    } catch {
      /* linking a stop to a place is optional */
    }
  };

  const openNew = () => {
    setError("");
    setEditingId(null);
    setForm(blankForm());
    loadPlaces();
  };

  const openEdit = async (id) => {
    setError("");
    try {
      const d = await api(`/api/admin/circuits/${id}`);
      const base = blankForm();
      const next = {};
      Object.keys(base).forEach((k) => {
        next[k] = d[k] ?? base[k];
      });
      next.highlights = (d.highlights || []).join("\n");
      next.tips = (d.tips || []).join("\n");
      next.stops = (d.stops?.length ? d.stops : [blankStop()]).map((s) => ({
        ...blankStop(),
        ...s,
        distance_km: s.distance_km ?? "",
        link_id: s.link_id ?? "",
      }));
      setEditingId(id);
      setForm(next);
      loadPlaces();
    } catch (e) {
      setError(e.message);
    }
  };

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const setStop = (i, patch) =>
    setForm((f) => ({
      ...f,
      stops: f.stops.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    }));

  const moveStop = (i, dir) =>
    setForm((f) => {
      const j = i + dir;
      if (j < 0 || j >= f.stops.length) return f;
      const stops = [...f.stops];
      [stops[i], stops[j]] = [stops[j], stops[i]];
      return { ...f, stops };
    });

  const removeStop = (i) =>
    setForm((f) => ({ ...f, stops: f.stops.filter((_, idx) => idx !== i) }));

  const linkPlace = (i, value) => {
    const place = places.find((p) => String(p.id) === value);
    const patch = { link_id: value };
    if (place && !form.stops[i].name.trim()) patch.name = place.location_name;
    setStop(i, patch);
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.stops.some((s) => s.name.trim())) return setError("Add at least one stop with a name.");

    setSaving(true);
    try {
      await api(editingId ? `/api/admin/circuits/${editingId}` : "/api/admin/circuits", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          highlights: lines(form.highlights),
          tips: lines(form.tips),
        }),
      });
      setForm(null);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This can't be undone.`)) return;
    try {
      await api(`/api/admin/circuits/${item.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((c) => c.id !== item.id));
    } catch (err) {
      setError(err.message);
    }
  };

  /* ------------------------------ form ------------------------------ */
  if (form) {
    return (
      <section>
        <h2 className="text-xl font-semibold mb-1">{editingId ? "Edit circuit" : "New circuit"}</h2>
        <p className="text-gray-500 text-sm mb-6">
          A circuit is an ordered route through several places, with the distance between stops.
        </p>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <form onSubmit={save} className="space-y-6">
          <div className="bg-white p-5 rounded shadow">
            <h3 className="font-semibold mb-4">About the circuit</h3>
            <div className="grid md:grid-cols-2 gap-x-6">
              <Field label="Title *">
                <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} />
              </Field>
              <Field label="Tagline">
                <input className={inputCls} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
              </Field>
              <Field label="Theme">
                <select className={inputCls} value={form.theme} onChange={(e) => set("theme", e.target.value)}>
                  {THEMES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Best season">
                <input className={inputCls} placeholder="October to February" value={form.best_season} onChange={(e) => set("best_season", e.target.value)} />
              </Field>
              <Field label="Start point">
                <input className={inputCls} value={form.start_point} onChange={(e) => set("start_point", e.target.value)} />
              </Field>
              <Field label="End point">
                <input className={inputCls} value={form.end_point} onChange={(e) => set("end_point", e.target.value)} />
              </Field>
              <Field label="Duration (days)">
                <input type="number" min="1" max="30" className={inputCls} value={form.duration_days} onChange={(e) => set("duration_days", e.target.value)} />
              </Field>
              <Field label="Total distance (km)" hint="Leave empty to add up the distances between stops.">
                <input type="number" min="0" step="0.1" className={inputCls} value={form.total_distance_km} onChange={(e) => set("total_distance_km", e.target.value)} />
              </Field>
            </div>
            <ImageField label="Hero photo" value={form.hero_image} onChange={(v) => set("hero_image", v)} onError={setError} />
            <Field label="Summary">
              <textarea rows={4} className={inputCls} value={form.summary} onChange={(e) => set("summary", e.target.value)} />
            </Field>
            <div className="grid md:grid-cols-2 gap-x-6">
              <Field label="Highlights" hint="One per line.">
                <textarea rows={4} className={inputCls} value={form.highlights} onChange={(e) => set("highlights", e.target.value)} />
              </Field>
              <Field label="Tips" hint="One per line.">
                <textarea rows={4} className={inputCls} value={form.tips} onChange={(e) => set("tips", e.target.value)} />
              </Field>
            </div>
            <Field label="How to reach">
              <textarea rows={3} className={inputCls} value={form.how_to_reach} onChange={(e) => set("how_to_reach", e.target.value)} />
            </Field>
            <div className="grid md:grid-cols-2 gap-x-6">
              <Field label="Status">
                <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option value="published">Published (visible on the site)</option>
                  <option value="draft">Draft (hidden)</option>
                </select>
              </Field>
              <Field label="Display order" hint="Smaller numbers appear first.">
                <input type="number" className={inputCls} value={form.display_order} onChange={(e) => set("display_order", e.target.value)} />
              </Field>
            </div>
          </div>

          <div className="bg-white p-5 rounded shadow">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="font-semibold">Stops, in travel order</h3>
              <button
                type="button"
                onClick={() => set("stops", [...form.stops, blankStop()])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-teal-700 text-white hover:bg-teal-800"
              >
                <Plus size={15} /> Add stop
              </button>
            </div>

            <div className="space-y-4">
              {form.stops.map((s, i) => (
                <div key={i} className="border rounded p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-sm">Stop {i + 1}</p>
                    <div className="flex gap-1">
                      <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => moveStop(i, -1)} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"><ArrowUp size={16} /></button>
                      <button type="button" aria-label="Move down" disabled={i === form.stops.length - 1} onClick={() => moveStop(i, 1)} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"><ArrowDown size={16} /></button>
                      <button type="button" aria-label="Remove stop" disabled={form.stops.length === 1} onClick={() => removeStop(i)} className="p-1.5 rounded text-red-600 hover:bg-red-50 disabled:opacity-30"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-x-6">
                    <Field label="Place name *">
                      <input className={inputCls} value={s.name} onChange={(e) => setStop(i, { name: e.target.value })} />
                    </Field>
                    <Field label="Link to a place in your database" hint="Pulls the live photo and map position.">
                      <select className={inputCls} value={s.link_id} onChange={(e) => linkPlace(i, e.target.value)}>
                        <option value="">Not linked</option>
                        {places.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.location_name}{p.village_name ? `, ${p.village_name}` : ""}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Distance from previous stop (km)" hint={i === 0 ? "Not needed for the first stop." : ""}>
                      <input type="number" min="0" step="0.1" disabled={i === 0} className={inputCls} value={i === 0 ? "" : s.distance_km} onChange={(e) => setStop(i, { distance_km: e.target.value })} />
                    </Field>
                    <Field label="Time needed">
                      <input className={inputCls} placeholder="1 hour" value={s.time_needed} onChange={(e) => setStop(i, { time_needed: e.target.value })} />
                    </Field>
                  </div>
                  <Field label="Description">
                    <textarea rows={2} className={inputCls} value={s.description} onChange={(e) => setStop(i, { description: e.target.value })} />
                  </Field>
                  <ImageField label="Photo (optional)" value={s.image_url} onChange={(v) => setStop(i, { image_url: v })} onError={setError} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-5 py-2 rounded bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-60">
              {saving ? "Saving..." : editingId ? "Save changes" : "Create circuit"}
            </button>
            <button type="button" onClick={() => { setForm(null); setEditingId(null); setError(""); }} className="px-5 py-2 rounded bg-gray-200 hover:bg-gray-300">
              Cancel
            </button>
          </div>
        </form>
      </section>
    );
  }

  /* ------------------------------ list ------------------------------ */
  return (
    <section>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">Circuits</h2>
          <p className="text-gray-500 text-sm mt-1">Themed routes that connect several places.</p>
        </div>
        <button onClick={openNew} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm font-semibold">
          + New circuit
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading circuits...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No circuits yet. Create the first one with "New circuit".</p>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c.id} className="bg-white p-4 rounded shadow flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-lg">{c.title}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${c.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {c.theme}, {c.total_distance_km ? `${c.total_distance_km} km, ` : ""}
                  {c.duration_days} {c.duration_days === 1 ? "day" : "days"}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {c.status === "published" && (
                  <a href={`/experiences/circuits/${c.slug}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-gray-200 rounded hover:bg-gray-300 text-sm">View</a>
                )}
                <button onClick={() => openEdit(c.id)} className="px-3 py-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm">Edit</button>
                <button onClick={() => remove(c)} className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
