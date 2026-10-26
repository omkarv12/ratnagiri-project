import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, ImagePlus, X, ExternalLink } from "lucide-react";
import API_BASE_URL from "../config";
// Taluka -> list of villages. Point this at the same JSON your contribution
// forms use for their Taluka / Village dropdowns.
import villagesByTaluka from "../data/ratnagiriVillages.json";

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

const EMPTY = {
  taluka_name: "",
  village_name: "",
  tagline: "",
  hero_image: "",
  intro: "",
  history: "",
  history_timeline: [],
  food: [],
  flowers: [],
  birds: [],
  festivals: [],
  gallery: [],
  how_to_reach: "",
  best_time: "",
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

/* ---------- small building blocks ---------- */

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
          <img src={value} alt="" className="h-28 w-40 rounded-lg object-cover" />
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
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <ImagePlus size={18} /> {busy ? "Uploading..." : "Upload photo"}
          <input type="file" accept="image/*" onChange={pick} disabled={busy} className="hidden" />
        </label>
      )}
      {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
    </div>
  );
}

function ItemListEditor({ items, onChange, noun }) {
  const update = (i, patch) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  return (
    <div className="space-y-4">
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border border-slate-200 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <input className={inputCls} value={it.name || ""} onChange={(e) => update(i, { name: e.target.value })} />
            </div>
            <div>
              <Label>Season / when (optional)</Label>
              <input className={inputCls} value={it.season || ""} onChange={(e) => update(i, { season: e.target.value })} />
            </div>
          </div>
          <div className="mt-3">
            <Label>Description</Label>
            <textarea
              rows={2}
              className={inputCls}
              value={it.description || ""}
              onChange={(e) => update(i, { description: e.target.value })}
            />
          </div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <ImageField value={it.image_url} onChange={(url) => update(i, { image_url: url })} />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2 size={15} /> Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { name: "", description: "", season: "", image_url: "" }])}
        className="flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
      >
        <Plus size={16} /> Add {noun}
      </button>
    </div>
  );
}

/* ---------- main panel ---------- */

export default function AdminExploreVillagesPanel({ canEdit = true }) {
  const [view, setView] = useState("list"); // list | form
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const loadList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/explore-villages`);
      const d = await res.json();
      if (!Array.isArray(d)) throw new Error(d.error || "Could not load villages.");
      setRows(d);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  const openNew = () => {
    setForm(EMPTY);
    setEditingId(null);
    setError("");
    setView("form");
  };

  const openEdit = async (id) => {
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/explore-villages/${id}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not open this village.");
      setForm({ ...EMPTY, ...d });
      setEditingId(id);
      setView("form");
    } catch (e) {
      setError(e.message);
    }
  };

  const save = async () => {
    if (!form.taluka_name || !form.village_name) {
      setError("Choose a taluka and a village first.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = editingId
        ? `${API_BASE_URL}/api/admin/explore-villages/${editingId}`
        : `${API_BASE_URL}/api/admin/explore-villages`;
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
    if (!window.confirm(`Delete the page for ${row.village_name}? This can't be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/explore-villages/${row.id}`, { method: "DELETE" });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || d.success === false) throw new Error(d.error || "Delete failed.");
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (e) {
      setError(e.message);
    }
  };

  const addGalleryPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setGalleryBusy(true);
    setError("");
    try {
      const urls = [];
      for (const file of files.slice(0, Math.max(0, 12 - form.gallery.length))) {
        urls.push(await uploadPhoto(file));
      }
      set("gallery", [...form.gallery, ...urls]);
    } catch (x) {
      setError(x.message);
    } finally {
      setGalleryBusy(false);
    }
  };

  /* ---------------- list view ---------------- */
  if (view === "list") {
    return (
      <section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Explore Villages</h2>
            <p className="mt-1 text-sm text-gray-500">
              Add the story of each village. Places to visit and homestays appear on the village page
              automatically from the Locations and Homestays you have already approved for that village.
            </p>
          </div>
          {canEdit && (
            <button
              onClick={openNew}
              className="flex items-center gap-1.5 rounded bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              <Plus size={16} /> New village page
            </button>
          )}
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-gray-500">No village pages yet. Create the first one.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded bg-white p-4 shadow">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{r.village_name}</h3>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${
                        r.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {r.taluka_name} taluka{r.tagline ? ` · ${r.tagline}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/experiences/explore-villages/${encodeURIComponent(r.taluka_name)}/${encodeURIComponent(r.village_name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
                  >
                    <ExternalLink size={14} /> View
                  </a>
                  {canEdit && (
                    <>
                      <button
                        onClick={() => openEdit(r.id)}
                        className="flex items-center gap-1 rounded bg-yellow-500 px-3 py-1.5 text-sm text-white hover:bg-yellow-600"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => remove(r)}
                        className="flex items-center gap-1 rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
                      >
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
  const villageOptions = villagesByTaluka[form.taluka_name] || [];

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">
          {editingId ? `Edit ${form.village_name}` : "New village page"}
        </h2>
        <button onClick={() => setView("list")} className="rounded px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">
          Back to list
        </button>
      </div>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <Card title="Village" hint={editingId ? "Taluka and village are fixed once the page is created." : undefined}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Taluka</Label>
            <select
              className={inputCls}
              value={form.taluka_name}
              disabled={Boolean(editingId)}
              onChange={(e) => setForm((f) => ({ ...f, taluka_name: e.target.value, village_name: "" }))}
            >
              <option value="">Select taluka</option>
              {Object.keys(villagesByTaluka).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Village</Label>
            <select
              className={inputCls}
              value={form.village_name}
              disabled={Boolean(editingId) || !form.taluka_name}
              onChange={(e) => set("village_name", e.target.value)}
            >
              <option value="">Select village</option>
              {villageOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label>Tagline</Label>
            <input className={inputCls} maxLength={200} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </div>
          <div>
            <Label>Hero photo</Label>
            <ImageField value={form.hero_image} onChange={(url) => set("hero_image", url)} />
          </div>
          <div>
            <Label>Status</Label>
            <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="published">Published (visible to visitors)</option>
              <option value="draft">Draft (hidden)</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title="About">
        <textarea rows={4} className={inputCls} value={form.intro} onChange={(e) => set("intro", e.target.value)} />
      </Card>

      <Card title="History" hint="Write the story, then add key dates to show as a timeline.">
        <textarea rows={6} className={inputCls} value={form.history} onChange={(e) => set("history", e.target.value)} />
        <div className="mt-4 space-y-2">
          {form.history_timeline.map((row, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={`${inputCls} !w-28 shrink-0`}
                placeholder="Year"
                value={row.year || ""}
                onChange={(e) =>
                  set("history_timeline", form.history_timeline.map((r, idx) => (idx === i ? { ...r, year: e.target.value } : r)))
                }
              />
              <input
                className={inputCls}
                placeholder="What happened"
                value={row.text || ""}
                onChange={(e) =>
                  set("history_timeline", form.history_timeline.map((r, idx) => (idx === i ? { ...r, text: e.target.value } : r)))
                }
              />
              <button
                type="button"
                aria-label="Remove row"
                onClick={() => set("history_timeline", form.history_timeline.filter((_, idx) => idx !== i))}
                className="rounded px-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set("history_timeline", [...form.history_timeline, { year: "", text: "" }])}
            className="flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
          >
            <Plus size={16} /> Add timeline entry
          </button>
        </div>
      </Card>

      <Card title="Local food" hint="Dishes and specialities of this village.">
        <ItemListEditor items={form.food} onChange={(v) => set("food", v)} noun="dish" />
      </Card>

      <Card title="Flowers" hint="Flowers that bloom here, and when.">
        <ItemListEditor items={form.flowers} onChange={(v) => set("flowers", v)} noun="flower" />
      </Card>

      <Card title="Birds" hint="Birds visitors may spot.">
        <ItemListEditor items={form.birds} onChange={(v) => set("birds", v)} noun="bird" />
      </Card>

      <Card title="Festivals">
        <ItemListEditor items={form.festivals} onChange={(v) => set("festivals", v)} noun="festival" />
      </Card>

      <Card title="Gallery" hint="Up to 12 photos.">
        <div className="flex flex-wrap gap-3">
          {form.gallery.map((url) => (
            <div key={url} className="relative">
              <img src={url} alt="" className="h-24 w-32 rounded-lg object-cover" />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => set("gallery", form.gallery.filter((u) => u !== url))}
                className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {form.gallery.length < 12 && (
            <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <ImagePlus size={20} /> {galleryBusy ? "Uploading..." : "Add photos"}
              <input type="file" accept="image/*" multiple onChange={addGalleryPhotos} disabled={galleryBusy} className="hidden" />
            </label>
          )}
        </div>
      </Card>

      <Card title="How to reach">
        <textarea rows={3} className={inputCls} value={form.how_to_reach} onChange={(e) => set("how_to_reach", e.target.value)} />
        <div className="mt-3">
          <Label>Best time to visit</Label>
          <input className={inputCls} maxLength={200} value={form.best_time} onChange={(e) => set("best_time", e.target.value)} />
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-6 flex gap-3 border-t border-slate-200 bg-gray-50/95 px-6 py-4 backdrop-blur">
        <button
          onClick={save}
          disabled={saving || galleryBusy}
          className="rounded bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save village page"}
        </button>
        <button onClick={() => setView("list")} className="rounded px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100">
          Cancel
        </button>
      </div>
    </section>
  );
}