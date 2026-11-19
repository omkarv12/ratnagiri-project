import { useEffect, useRef, useState, useCallback } from "react";
import { ImagePlus, ExternalLink, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EXPERIENCE_LIST, EXPERIENCES } from "../config/experienceConfig";
import { experiencesApi, toHighlightList, toImageList } from "../api/experiencesApi";

const EMPTY = {
  title: "",
  summary: "",
  description: "",
  images: [],
  location: "",
  duration: "",
  price: "",
  season: "",
  highlights: "",
  contact: "",
  display_order: 0,
  status: "published",
};

const inputCls =
  "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

function Field({ label, hint, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-semibold text-gray-700 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-gray-400 mt-1">{hint}</span>}
    </label>
  );
}

export default function AdminExperiencesPanel() {
  const navigate = useNavigate();
  const [category, setCategory] = useState(EXPERIENCE_LIST[0].slug);
  const config = EXPERIENCES[category];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // form: null = closed, otherwise { id?: number, data: {...} }
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await experiencesApi.adminList(category);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    setForm(null);
    setUrlDraft("");
    load();
  }, [load]);

  const setField = (key, value) =>
    setForm((f) => ({ ...f, data: { ...f.data, [key]: value } }));

  const openNew = () => {
    setUrlDraft("");
    setForm({ data: { ...EMPTY, images: [], display_order: items.length + 1 } });
  };

  const openEdit = (item) => {
    setUrlDraft("");
    setForm({
      id: item.id,
      data: {
        ...EMPTY,
        ...item,
        highlights: toHighlightList(item.highlights).join("\n"),
        images: toImageList(item.images, item.image_url),
      },
    });
  };

  /* ---------- photo helpers ---------- */

  const addImages = (urls) =>
    setForm((f) => ({
      ...f,
      data: { ...f.data, images: [...f.data.images, ...urls] },
    }));

  const removeImage = (idx) =>
    setForm((f) => ({
      ...f,
      data: { ...f.data, images: f.data.images.filter((_, i) => i !== idx) },
    }));

  const makeCover = (idx) =>
    setForm((f) => {
      const imgs = [...f.data.images];
      const [picked] = imgs.splice(idx, 1);
      return { ...f, data: { ...f.data, images: [picked, ...imgs] } };
    });

  const addUrl = () => {
    const url = urlDraft.trim();
    if (!url) return;
    addImages([url]);
    setUrlDraft("");
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError(null);
    const urls = [];
    try {
      for (const file of files) {
        const { url } = await experiencesApi.uploadImage(file);
        urls.push(url);
      }
    } catch (err) {
      setError(`Image upload failed: ${err.message}`);
    } finally {
      if (urls.length) addImages(urls);
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  /* ---------- save / status / delete ---------- */

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.data.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      ...form.data,
      category,
      title: form.data.title.trim(),
      highlights: toHighlightList(form.data.highlights),
      images: form.data.images,
      image_url: form.data.images[0] || "",
      display_order: Number(form.data.display_order) || 0,
    };
    try {
      if (form.id) await experiencesApi.update(form.id, payload);
      else await experiencesApi.create(payload);
      setForm(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item) => {
    const next = item.status === "published" ? "draft" : "published";
    try {
      await experiencesApi.update(item.id, { ...item, status: next });
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: next } : i)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This can't be undone.`)) return;
    try {
      await experiencesApi.remove(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(err.message);
    }
  };

  const L = config.labels;

  return (
    <section>
      <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
        <div>
          <h2 className="text-xl font-semibold">Local Experiences</h2>
          <p className="text-gray-500 text-sm mt-1">
            Add and edit what visitors see on the Guided Walks, Konkani Food and Community
            Interaction pages.
          </p>
        </div>
        <button
          onClick={() => navigate(config.route)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800"
        >
          View {config.title} page <ExternalLink size={14} />
        </button>
      </div>

      {/* category tabs */}
      <div className="flex gap-2 flex-wrap mb-6" role="tablist">
        {EXPERIENCE_LIST.map((exp) => (
          <button
            key={exp.slug}
            role="tab"
            aria-selected={exp.slug === category}
            onClick={() => setCategory(exp.slug)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              exp.slug === category
                ? "bg-teal-700 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-teal-600"
            }`}
          >
            {exp.title}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 mb-4">
          {error}
        </p>
      )}

      {/* ---------- form ---------- */}
      {form && (
        <form onSubmit={handleSave} className="bg-white p-5 rounded shadow mb-8 space-y-4">
          <h3 className="font-semibold text-lg">
            {form.id ? `Edit ${config.noun}` : `Add a ${config.noun}`}
          </h3>

          <Field label="Title">
            <input
              className={inputCls}
              value={form.data.title}
              onChange={(e) => setField("title", e.target.value)}
              required
            />
          </Field>

          <Field label="Short summary" hint="Shown on the card. One or two sentences.">
            <textarea
              className={inputCls}
              rows={2}
              value={form.data.summary}
              onChange={(e) => setField("summary", e.target.value)}
            />
          </Field>

          <Field label="Full description" hint="Shown when a visitor opens the card. Blank lines make paragraphs.">
            <textarea
              className={inputCls}
              rows={6}
              value={form.data.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </Field>

          {/* photos */}
          <div>
            <span className="block text-sm font-semibold text-gray-700 mb-1">
              Photos <span className="font-normal text-gray-400">(first photo is the cover)</span>
            </span>

            {form.data.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                {form.data.images.map((src, idx) => (
                  <div key={`${src}-${idx}`} className="relative">
                    <div
                      className="h-24 rounded bg-gray-100 bg-cover bg-center border border-gray-200"
                      style={{ backgroundImage: `url(${src})` }}
                      aria-label={`Photo ${idx + 1}`}
                    />
                    {idx === 0 && (
                      <span className="absolute left-1 top-1 text-[10px] font-bold uppercase bg-teal-700 text-white px-1.5 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                    <div className="absolute right-1 top-1 flex gap-1">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => makeCover(idx)}
                          title="Make cover"
                          aria-label={`Make photo ${idx + 1} the cover`}
                          className="w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
                        >
                          <ArrowLeft size={12} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        title="Remove"
                        aria-label={`Remove photo ${idx + 1}`}
                        className="w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 flex-wrap items-center">
              <input
                className={`${inputCls} flex-1 min-w-[220px]`}
                placeholder="Paste an image URL and press Add"
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addUrl();
                  }
                }}
              />
              <button
                type="button"
                onClick={addUrl}
                className="px-3 py-2 rounded border border-gray-300 text-sm font-semibold hover:bg-gray-50"
              >
                Add
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                className="hidden"
                id="exp-image-upload"
              />
              <label
                htmlFor="exp-image-upload"
                className={`inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-300 text-sm font-semibold cursor-pointer hover:bg-gray-50 ${
                  uploading ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                <ImagePlus size={15} />
                {uploading ? "Uploading..." : "Upload photos"}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={L.location}>
              <input className={inputCls} value={form.data.location} onChange={(e) => setField("location", e.target.value)} />
            </Field>
            <Field label={L.duration}>
              <input className={inputCls} value={form.data.duration} onChange={(e) => setField("duration", e.target.value)} />
            </Field>
            <Field label={L.price}>
              <input className={inputCls} value={form.data.price} onChange={(e) => setField("price", e.target.value)} />
            </Field>
            <Field label={L.season}>
              <input className={inputCls} value={form.data.season} onChange={(e) => setField("season", e.target.value)} />
            </Field>
          </div>

          <Field label="What to expect" hint="One point per line. Shown as a checklist.">
            <textarea
              className={inputCls}
              rows={4}
              value={form.data.highlights}
              onChange={(e) => setField("highlights", e.target.value)}
            />
          </Field>

          <Field label="Contact for booking" hint="Name and phone number, e.g. Sunita Gawde, 98xxxxxx12">
            <input className={inputCls} value={form.data.contact} onChange={(e) => setField("contact", e.target.value)} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Position on page" hint="Lower numbers appear first.">
              <input
                type="number"
                min="0"
                className={inputCls}
                value={form.data.display_order}
                onChange={(e) => setField("display_order", e.target.value)}
              />
            </Field>
            <Field label="Status" hint="Drafts are hidden from visitors.">
              <select className={inputCls} value={form.data.status} onChange={(e) => setField("status", e.target.value)}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </Field>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm font-semibold disabled:opacity-60"
            >
              {saving ? "Saving..." : form.id ? "Save changes" : `Add ${config.noun}`}
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ---------- list ---------- */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="font-semibold">
          {config.title} <span className="text-gray-400 font-normal">({items.length})</span>
        </h3>
        {!form && (
          <button
            onClick={openNew}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm font-semibold"
          >
            + Add a {config.noun}
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading {config.nounPlural}...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">
          No {config.nounPlural} yet. Use "Add a {config.noun}" to create the first one.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const imgs = toImageList(item.images, item.image_url);
            return (
              <div key={item.id} className="bg-white p-3 rounded shadow flex items-center gap-4 flex-wrap">
                <div className="relative h-16 w-24 shrink-0">
                  <div
                    className="h-full w-full rounded bg-gray-100 bg-cover bg-center"
                    style={{ backgroundImage: `url(${imgs[0] || config.cover})` }}
                  />
                  {imgs.length > 1 && (
                    <span className="absolute bottom-1 right-1 text-[10px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded">
                      {imgs.length} photos
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold truncate">{item.title}</h4>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                        item.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {[item.location, item.duration, item.price].filter(Boolean).join(" · ") || "No details added"}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(item)} className="px-3 py-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm">
                    Edit
                  </button>
                  <button onClick={() => toggleStatus(item)} className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                    {item.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => handleDelete(item)} className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}