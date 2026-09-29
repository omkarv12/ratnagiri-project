import { useEffect, useState } from "react";
import { blogApi } from "../../api/blogApi";
import API_BASE_URL from "../../config";
import RichTextEditor from "../RichTextEditor";

/**
 * Admin form to write / edit a story.
 * Save as: src/components/forms/AdminBlogForm.jsx
 * (RichTextEditor.jsx lives in src/components/)
 *
 * Props (unchanged):
 *   onSaved?: () => void    called after a successful create/update
 *   onCancel?: () => void   called when the user backs out without saving
 *   existingBlog?: object   pass a blog object to edit instead of create
 */

// Uses your existing upload endpoint for the cover AND for photos inside the story.
async function uploadPhoto(file) {
  const formData = new FormData();
  formData.append("photo", file);
  const res = await fetch(`${API_BASE_URL}/api/upload-photo`, { method: "POST", body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || "Image upload failed.");
  return data.url;
}

const plainText = (html) =>
  (html || "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

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

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      setCoverImage(await uploadPhoto(file));
    } catch (err) {
      setError(err.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e, submitStatus) => {
    e.preventDefault();
    const hasBody = plainText(content) || /<(img|iframe)/i.test(content);
    if (!title.trim() || !hasBody) {
      setError("Title and content are required.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload = {
      title: title.trim(),
      // if left empty, build a clean text summary (no HTML tags) from the story
      excerpt: excerpt.trim() || plainText(content).slice(0, 160),
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
        setAuthorName(""); setCategoryId("");
      }
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-5 max-w-3xl" onSubmit={(e) => e.preventDefault()}>
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
        <label className="block text-sm font-semibold text-slate-700 mb-1">Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleCoverUpload}
          disabled={uploading}
          className="w-full border rounded-lg p-2.5 text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-orange-100 file:text-orange-700 file:font-semibold"
        />
        {uploading && <p className="text-xs text-slate-400 mt-1">Uploading...</p>}
        {coverImage && (
          <div className="mt-2 flex items-start gap-3">
            <img src={coverImage} alt="Preview" className="h-32 rounded-lg object-cover border border-slate-200" />
            <button
              type="button"
              onClick={() => setCoverImage("")}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Excerpt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          maxLength={200}
          placeholder="Short summary shown on the story cards — leave blank to auto-generate from the content."
          className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Content *</label>
        <RichTextEditor value={content} onChange={setContent} onUploadImage={uploadPhoto} />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-emerald-600">Saved successfully.</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={(e) => handleSubmit(e, "draft")}
          disabled={saving || uploading}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, "published")}
          disabled={saving || uploading}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : isEditing && existingBlog.status === "published" ? "Update" : "Publish"}
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