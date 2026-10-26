import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, ImagePlus, X, ExternalLink, ArrowUp, ArrowDown } from "lucide-react";
import API_BASE_URL from "../config";

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

const THEMES = ["Beaches", "Heritage", "Nature", "Spiritual", "Food", "Adventure", "Mixed"];
const STOP_TYPES = [
  { value: "visit", label: "Visit a place" },
  { value: "stay", label: "Stay" },
  { value: "food", label: "Food" },
  { value: "travel", label: "Travel" },
  { value: "activity", label: "Activity" },
];

const EMPTY_STOP = { type: "visit", time: "", title: "", description: "", image_url: "", link_id: null };
const EMPTY_DAY = { title: "", summary: "", stops: [{ ...EMPTY_STOP }] };
const EMPTY = {
  title: "",
  tagline: "",
  hero_image: "",
  summary: "",
  theme: "Mixed",
  best_season: "",
  budget_note: "",
  suited_for: "",
  start_point: "",
  end_point: "",
  days: [{ ...EMPTY_DAY, stops: [{ ...EMPTY_STOP }] }],
  tips: [],
  how_to_reach: "",
  display_order: 0,
  status: "published",
};

async function uploadPhoto(file) {
  const fd = new FormData();
  fd.append("photo", file);
  const res = await fetch(`${API_BASE_URL}/api/upload-photo`, { method: "POST", body: fd });
  const d = await res.json().catch(() => ({}));
  if (!res.ok || !d.success) throw new Error(d.error || "Photo upload failed.");
  return d.url;
}

function Card({ title, hint, children }) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      {hint && <p className="mb-3 mt-0.5 text-sm text-slate-500">{hint}</p>}
      <div className={hint ? "" : "mt-3"}>{children}</div>
    </section>
  );
}

function Label({ children }) {
  return <label className="mb-1 block text-sm font-medium text-slate-700">{children}</label>;
}

function ImageField({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      onChange(await uploadPhoto(file));
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="h-24 w-36 rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove photo"
            className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <ImagePlus size={16} /> {busy ? "Uploading..." : "Upload photo"}
          <input type="file" accept="image/*" onChange={pick} disabled={busy} className="hidden" />
        </label>
      )}
      {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
    </div>
  );
}

function StopEditor({ stop, onChange, onRemove, onMove, canUp, canDown, places, stays }) {
  const linkable = stop.type === "visit" || stop.type === "stay";
  const options = stop.type === "visit"
    ? places.map((p) => ({ id: p.id, label: `${p.location_name}${p.village_name ? ` (${p.village_name})` : ""}` }))
    : stays.map((s) => ({ id: s.id, label: `${s.homestay_name}${s.village_town_city ? ` (${s.village_town_city})` : ""}` }));

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Type</Label>
          <select
            className={inputCls}
            value={stop.type}
            onChange={(e) => {
              const type = e.target.value;
              onChange({ type, link_id: type === "visit" || type === "stay" ? null : null });
            }}
          >
            {STOP_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Time (optional)</Label>
          <input className={inputCls} placeholder="e.g. 9:00 AM" value={stop.time || ""} onChange={(e) => onChange({ time: e.target.value })} />
        </div>
        <div>
          <Label>Title</Label>
          <input className={inputCls} value={stop.title || ""} onChange={(e) => onChange({ title: e.target.value })} />
        </div>
      </div>

      {linkable && (
        <div className="mt-3">
          <Label>
            Link to an existing {stop.type === "visit" ? "place" : "homestay"} (optional)
          </Label>
          <select
            className={inputCls}
            value={stop.link_id ?? ""}
            onChange={(e) => onChange({ link_id: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">Not linked</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Linking shows its photo and profile link, and adds it to the day's Google Maps route.
          </p>
        </div>
      )}

      <div className="mt-3">
        <Label>Description</Label>
        <textarea rows={2} className={inputCls} value={stop.description || ""} onChange={(e) => onChange({ description: e.target.value })} />
      </div>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <ImageField value={stop.image_url} onChange={(url) => onChange({ image_url: url })} />
        <div className="flex gap-1">
          <button type="button" disabled={!canUp} onClick={() => onMove(-1)} aria-label="Move up"
            className="rounded p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30">
            <ArrowUp size={16} />
          </button>
          <button type="button" disabled={!canDown} onClick={() => onMove(1)} aria-label="Move down"
            className="rounded p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30">
            <ArrowDown size={16} />
          </button>
          <button type="button" onClick={onRemove}
            className="flex items-center gap-1 rounded px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">
            <Trash2 size={15} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminItinerariesPanel({ canEdit = true }) {
  const [view, setView] = useState("list");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [places, setPlaces] = useState([]);
  const [stays, setStays] = useState([]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const loadList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/itineraries`);
      const d = await res.json();
      if (!Array.isArray(d)) throw new Error(d.error || "Could not load itineraries.");
      setRows(d);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Existing places and homestays, for the "link to" dropdowns. Optional: a failure just leaves them empty.
  const loadLinkables = async () => {
    try {
      const [pl, st] = await Promise.all([
        fetch(`${API_BASE_URL}/api/locations`).then((r) => r.json()),
        fetch(`${API_BASE_URL}/api/homestays`).then((r) => r.json()),
      ]);
      if (Array.isArray(pl)) setPlaces(pl);
      if (Array.isArray(st)) setStays(st);
    } catch { /* dropdowns stay empty */ }
  };

  useEffect(() => {
    loadList();
    loadLinkables();
  }, []);

  const openNew = () => {
    setForm({ ...EMPTY, days: [{ ...EMPTY_DAY, stops: [{ ...EMPTY_STOP }] }] });
    setEditingId(null);
    setError("");
    setView("form");
  };

  const openEdit = async (id) => {
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/itineraries/${id}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not open this itinerary.");
      setForm({ ...EMPTY, ...d, days: d.days?.length ? d.days : EMPTY.days, tips: d.tips || [] });
      setEditingId(id);
      setView("form");
    } catch (e) {
      setError(e.message);
    }
  };

  const save = async () => {
    if (!form.title.trim()) {
      setError("Give the itinerary a title.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = editingId
        ? `${API_BASE_URL}/api/admin/itineraries/${editingId}`
        : `${API_BASE_URL}/api/admin/itineraries`;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || d.success === false) throw new Error(d.error || "Save failed.");
      await loadList();
      setView("list");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete "${row.title}"? This can't be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/itineraries/${row.id}`, { method: "DELETE" });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || d.success === false) throw new Error(d.error || "Delete failed.");
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (e) {
      setError(e.message);
    }
  };

  /* ---- day / stop helpers ---- */
  const setDay = (di, patch) =>
    set("days", form.days.map((d, i) => (i === di ? { ...d, ...patch } : d)));
  const setStop = (di, si, patch) =>
    setDay(di, { stops: form.days[di].stops.map((s, i) => (i === si ? { ...s, ...patch } : s)) });
  const moveStop = (di, si, dir) => {
    const stops = [...form.days[di].stops];
    const to = si + dir;
    if (to < 0 || to >= stops.length) return;
    [stops[si], stops[to]] = [stops[to], stops[si]];
    setDay(di, { stops });
  };

  /* ---------------- list view ---------------- */
  if (view === "list") {
    return (
      <section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Itineraries</h2>
            <p className="mt-1 text-sm text-gray-500">
              Build day-by-day plans. Stops can be linked to places and homestays you have already approved.
            </p>
          </div>
          {canEdit && (
            <button onClick={openNew}
              className="flex items-center gap-1.5 rounded bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
              <Plus size={16} /> New itinerary
            </button>
          )}
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-gray-500">No itineraries yet. Create the first one.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded bg-white p-4 shadow">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{r.title}</h3>
                    <span className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${
                      r.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                    }`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {r.theme} · {r.duration_days} {r.duration_days === 1 ? "day" : "days"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a href={`/experiences/itineraries/${r.slug}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 rounded bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200">
                    <ExternalLink size={14} /> View
                  </a>
                  {canEdit && (
                    <>
                      <button onClick={() => openEdit(r.id)}
                        className="flex items-center gap-1 rounded bg-yellow-500 px-3 py-1.5 text-sm text-white hover:bg-yellow-600">
                        <Pencil size={14} /> Edit
                      </button>
                      <button onClick={() => remove(r)}
                        className="flex items-center gap-1 rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700">
                        <Trash2 size={14} /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  /* ---------------- form view ---------------- */
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{editingId ? `Edit: ${form.title}` : "New itinerary"}</h2>
        <button onClick={() => setView("list")} className="rounded px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">
          Back to list
        </button>
      </div>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <Card title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Title</Label>
            <input className={inputCls} maxLength={200} value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Tagline</Label>
            <input className={inputCls} maxLength={250} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </div>
          <div>
            <Label>Theme</Label>
            <select className={inputCls} value={form.theme} onChange={(e) => set("theme", e.target.value)}>
              {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <Label>Status</Label>
            <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="published">Published (visible to visitors)</option>
              <option value="draft">Draft (hidden)</option>
            </select>
          </div>
          <div>
            <Label>Best season</Label>
            <input className={inputCls} value={form.best_season} onChange={(e) => set("best_season", e.target.value)} />
          </div>
          <div>
            <Label>Budget note</Label>
            <input className={inputCls} placeholder="e.g. ₹3,000 to ₹5,000 per person" value={form.budget_note}
              onChange={(e) => set("budget_note", e.target.value)} />
          </div>
          <div>
            <Label>Suited for</Label>
            <input className={inputCls} placeholder="e.g. Families, couples" value={form.suited_for}
              onChange={(e) => set("suited_for", e.target.value)} />
          </div>
          <div>
            <Label>Display order (lower shows first)</Label>
            <input type="number" className={inputCls} value={form.display_order}
              onChange={(e) => set("display_order", e.target.value)} />
          </div>
          <div>
            <Label>Start point</Label>
            <input className={inputCls} value={form.start_point} onChange={(e) => set("start_point", e.target.value)} />
          </div>
          <div>
            <Label>End point</Label>
            <input className={inputCls} value={form.end_point} onChange={(e) => set("end_point", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Hero photo</Label>
            <ImageField value={form.hero_image} onChange={(url) => set("hero_image", url)} />
          </div>
        </div>
      </Card>

      <Card title="Summary">
        <textarea rows={4} className={inputCls} value={form.summary} onChange={(e) => set("summary", e.target.value)} />
      </Card>

      {form.days.map((day, di) => (
        <Card key={di} title={`Day ${di + 1}`}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Day title</Label>
              <input className={inputCls} placeholder="e.g. Forts and beaches" value={day.title || ""}
                onChange={(e) => setDay(di, { title: e.target.value })} />
            </div>
            <div>
              <Label>Short summary</Label>
              <input className={inputCls} value={day.summary || ""} onChange={(e) => setDay(di, { summary: e.target.value })} />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {day.stops.map((stop, si) => (
              <StopEditor
                key={si}
                stop={stop}
                places={places}
                stays={stays}
                canUp={si > 0}
                canDown={si < day.stops.length - 1}
                onMove={(dir) => moveStop(di, si, dir)}
                onChange={(patch) => setStop(di, si, patch)}
                onRemove={() => setDay(di, { stops: day.stops.filter((_, i) => i !== si) })}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => setDay(di, { stops: [...day.stops, { ...EMPTY_STOP }] })}
              className="flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
              <Plus size={16} /> Add stop
            </button>
            {form.days.length > 1 && (
              <button type="button"
                onClick={() => {
                  if (window.confirm(`Remove Day ${di + 1} and all its stops?`))
                    set("days", form.days.filter((_, i) => i !== di));
                }}
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                <Trash2 size={16} /> Remove day
              </button>
            )}
          </div>
        </Card>
      ))}

      {form.days.length < 14 && (
        <button type="button"
          onClick={() => set("days", [...form.days, { ...EMPTY_DAY, stops: [{ ...EMPTY_STOP }] }])}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-teal-600 px-5 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-50">
          <Plus size={16} /> Add another day
        </button>
      )}

      <Card title="Travel tips" hint="Short practical tips, one per line.">
        <div className="space-y-2">
          {form.tips.map((tip, i) => (
            <div key={i} className="flex gap-2">
              <input className={inputCls} value={tip}
                onChange={(e) => set("tips", form.tips.map((t, idx) => (idx === i ? e.target.value : t)))} />
              <button type="button" aria-label="Remove tip"
                onClick={() => set("tips", form.tips.filter((_, idx) => idx !== i))}
                className="rounded px-2 text-red-600 hover:bg-red-50">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => set("tips", [...form.tips, ""])}
            className="flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
            <Plus size={16} /> Add tip
          </button>
        </div>
      </Card>

      <Card title="How to reach">
        <textarea rows={3} className={inputCls} value={form.how_to_reach} onChange={(e) => set("how_to_reach", e.target.value)} />
      </Card>

      <div className="sticky bottom-0 -mx-6 flex gap-3 border-t border-slate-200 bg-gray-50/95 px-6 py-4 backdrop-blur">
        <button onClick={save} disabled={saving}
          className="rounded bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {saving ? "Saving..." : "Save itinerary"}
        </button>
        <button onClick={() => setView("list")} className="rounded px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100">
          Cancel
        </button>
      </div>
    </section>
  );
}
