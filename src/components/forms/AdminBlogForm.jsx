import { useEffect, useState } from "react";
import { blogApi } from "../../api/blogApi";
/**
 * Drop this into your admin panel (next to wherever RegistrationForm-style
 * "add location" forms live). On submit it POSTs straight to the same
 * backend the public Stories page reads from — so a post saved here with
 * status "published" shows up on /stories immediately, no extra wiring.
 *
 * Props:
 *   onSaved?: () => void    called after a successful create/update
 *   onCancel?: () => void   called when the user backs out without saving
 *   existingBlog?: object   pass a blog object to edit instead of create
 */
export default function AdminBlogForm({ onSaved, onCancel, existingBlog }) {
  const isEditing = Boolean(existingBlog);

  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  const [title, setTitle] = useState(existingBlog?.title || "");
  const [excerpt, setExcerpt] = useState(existingBlog?.excerpt || "");
  const [content, setContent] = useState(existingBlog?.content || "");
  const [coverImage, setCoverImage] = useState(existingBlog?.cover_image || "");
  const [authorName, setAuthorName] = useState(existingBlog?.author_name || "");
  const [categoryId, setCategoryId] = useState(existingBlog?.category?.id || "");
  const [status, setStatus] = useState(existingBlog?.status || "draft");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    blogApi.listCategories().then(setCategories).catch(() => {});
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    try {
      const created = await blogApi.adminCreateCategory(newCategoryName.trim());
      setCategories((prev) => [...prev, { ...created, post_count: 0 }]);
      setCategoryId(created.id);
      setNewCategoryName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingCategory(false);
    }
  };

  const handleSubmit = async (e, submitStatus) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content,
      cover_image: coverImage.trim() || null,
      author_name: authorName.trim() || null,
      category_id: categoryId || null,
      status: submitStatus,
    };

    try {
      if (isEditing) {
        await blogApi.adminUpdateBlog(existingBlog.id, payload);
      } else {
        await blogApi.adminCreateBlog(payload);
      }
      setSuccess(true);
      if (!isEditing) {
        setTitle(""); setExcerpt(""); setContent(""); setCoverImage("");
        setAuthorName(""); setCategoryId(""); setStatus("draft");
      }
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-5 max-w-2xl">
      <h2 className="text-lg font-bold text-slate-800">
        {isEditing ? "Edit Story" : "Write a New Story"}
      </h2>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Dapoli: Temples, Beaches and Forts"
          className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
            className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="+ New category"
              className="flex-1 border rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={addingCategory}
              className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Author</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Khursheed Dinshaw"
            className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Cover image URL</label>
        <input
          type="text"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://... (Cloudinary / Drive thumbnail link, same as your other images)"
          className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
        />
        {coverImage && (
          <img src={coverImage} alt="Preview" className="mt-2 h-32 rounded-lg object-cover border border-slate-200" />
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Excerpt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="Short summary shown on the story cards — leave blank to auto-generate from the content."
          className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Content *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          placeholder="Full story content. Paste HTML (e.g. <p>...</p>, <figure><img .../></figure>) — it's rendered as-is on the story page."
          className="w-full border rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-orange-500 outline-none"
        />
        <p className="text-xs text-slate-400 mt-1">
          Swap this for a rich-text editor (TipTap, Quill, etc.) whenever you're ready — the backend just stores whatever HTML string comes through.
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-emerald-600">Saved successfully.</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={(e) => handleSubmit(e, "draft")}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, "published")}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
        >
          {saving ? "Publishing..." : "Publish"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}