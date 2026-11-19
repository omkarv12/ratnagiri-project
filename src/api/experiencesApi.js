// src/api/experiencesApi.js
import API_BASE_URL from "../config";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, options);
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* empty or non-JSON body */
  }
  if (!res.ok || body?.success === false) {
    throw new Error(body?.error || body?.message || `Request failed (${res.status})`);
  }
  return body;
}

const json = (method, data) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

export const experiencesApi = {
  // Public: published items only, already sorted
  list: (category) =>
    request(`/api/experiences?category=${encodeURIComponent(category)}`),

  // Admin: includes drafts
  adminList: (category) =>
    request(`/api/admin/experiences?category=${encodeURIComponent(category)}`),
  create: (data) => request("/api/admin/experiences", json("POST", data)),
  update: (id, data) => request(`/api/admin/experiences/${id}`, json("PUT", data)),
  remove: (id) => request(`/api/admin/experiences/${id}`, { method: "DELETE" }),

  // Uses your existing Cloudinary endpoint. Returns { success, url }.
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append("photo", file); // field name your /api/upload-photo expects
    return request("/api/upload-photo", { method: "POST", body: fd });
  },
};

// highlights can arrive as an array or a newline-separated string
export const toHighlightList = (h) =>
  Array.isArray(h) ? h : String(h || "").split("\n").map((s) => s.trim()).filter(Boolean);

// Photos can arrive as an array, a JSON string, or newline-separated text.
// Falls back to a single URL (the old image_url) when there is no list.
export function toImageList(value, fallback) {
  let list = [];
  if (Array.isArray(value)) list = value;
  else if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      list = Array.isArray(parsed) ? parsed : [value];
    } catch {
      list = value.split("\n");
    }
  }
  list = list.map((s) => String(s).trim()).filter(Boolean);
  if (!list.length && fallback) list = [fallback];
  return list;
}