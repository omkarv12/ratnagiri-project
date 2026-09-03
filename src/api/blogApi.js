import API_BASE_URL from "../config";
export const getYoutubeVideos = () => request("/youtube-videos");
export const listVillageProfiles = () => request("/village-profiles");

// Shared fetch helper for the blog/stories endpoints — matches the
// fetch(`${API_BASE_URL}/api/...`) pattern used by AdminDashboard.jsx.

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const blogApi = {
  listCategories: () => request("/blog-categories"),

  listBlogs: ({ category, search, page = 1, limit = 6 } = {}) => {
    const params = new URLSearchParams();
    if (category && category !== "All") params.set("category", category);
    if (search) params.set("search", search);
    params.set("page", page);
    params.set("limit", limit);
    return request(`/blogs?${params.toString()}`);
  },

  listLatest: (count = 5) => request(`/blogs?latest=${count}`),

  getBlog: (slug) => request(`/blogs/${slug}`),

  addComment: (blogId, { name, email, comment }) =>
    request(`/blogs/${blogId}/comments`, {
      method: "POST",
      body: JSON.stringify({ name, email, comment }),
    }),

  // admin//
  adminListBlogs: () => request("/admin/blogs"),
  adminCreateBlog: (payload) =>
    request("/admin/blogs", { method: "POST", body: JSON.stringify(payload) }),
  adminUpdateBlog: (id, payload) =>
    request(`/admin/blogs/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  adminDeleteBlog: (id) => request(`/admin/blogs/${id}`, { method: "DELETE" }),
  adminCreateCategory: (name) =>
    request("/admin/blog-categories", { method: "POST", body: JSON.stringify({ name }) }),
};

export const getVillageProfile = (taluka, village) =>
  request(`/village-profile/${encodeURIComponent(taluka)}/${encodeURIComponent(village)}`);

export const adminListVillageProfiles = () => request("/admin/village-profiles");

export const adminSaveVillageProfile = (payload) =>
  request("/admin/village-profile", { method: "POST", body: JSON.stringify(payload) });

export const adminDeleteVillageProfile = (taluka, village) =>
  request(`/admin/village-profile/${encodeURIComponent(taluka)}/${encodeURIComponent(village)}`, {
    method: "DELETE",
  });