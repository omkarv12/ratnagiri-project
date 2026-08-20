import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookText, Search, Eye, MessageCircle, Calendar, User } from "lucide-react";
import { blogApi } from "../api/blogapi";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function BlogCard({ blog, onOpen }) {
  return (
    <article
      onClick={() => onOpen(blog.slug)}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-400 transition-all cursor-pointer overflow-hidden flex flex-col sm:flex-row"
    >
      {blog.cover_image && (
        <div className="sm:w-56 h-48 sm:h-auto shrink-0 bg-slate-100">
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1 min-w-0">
        {blog.category && (
          <span className="self-start mb-2 px-2.5 py-1 bg-orange-100 text-orange-700 text-[11px] font-bold rounded uppercase tracking-wide">
            {blog.category.name}
          </span>
        )}
        <h3 className="text-lg font-bold text-slate-800 mb-1 leading-snug">{blog.title}</h3>
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{blog.excerpt}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          {blog.author_name && (
            <span className="flex items-center gap-1"><User size={12} /> {blog.author_name}</span>
          )}
          <span className="flex items-center gap-1"><Calendar size={12} /> {timeAgo(blog.published_at)}</span>
          <span className="flex items-center gap-1"><MessageCircle size={12} /> {blog.comment_count}</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {blog.views}</span>
        </div>
      </div>
    </article>
  );
}

export default function Stories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [latest, setLatest] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // categories + latest posts load once
  useEffect(() => {
    blogApi.listCategories().then(setCategories).catch(() => {});
    blogApi.listLatest(5).then(setLatest).catch(() => {});
  }, []);

  // main list reloads on filter/search/page change
  useEffect(() => {
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      blogApi
        .listBlogs({ category: activeCategory, search, page, limit: 6 })
        .then((data) => {
          setBlogs(data.blogs);
          setTotal(data.total);
          setTotalPages(data.total_pages);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, search ? 350 : 0); // debounce search typing
    return () => clearTimeout(timer);
  }, [activeCategory, search, page]);

  const goToBlog = (slug) => navigate(`/stories/${slug}`);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 lg:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-orange-600 text-white py-10 sm:py-12 text-center rounded-2xl mb-6 sm:mb-8">
          <BookText size={48} className="mx-auto mb-3 sm:mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold">Stories</h1>
          <p className="text-white/90 mt-2 text-sm sm:text-base px-4">
            Read stories and experiences from Ratnagiri
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* MAIN COLUMN */}
          <div className="flex-1 min-w-0 order-2 lg:order-1">
            {/* Search + category chips (mobile-friendly horizontal scroll) */}
            <div className="mb-6 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search stories..."
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 lg:hidden">
                {["All", ...categories.map((c) => c.slug)].map((slug) => {
                  const label = slug === "All" ? "All" : categories.find((c) => c.slug === slug)?.name;
                  return (
                    <button
                      key={slug}
                      onClick={() => { setActiveCategory(slug); setPage(1); }}
                      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        activeCategory === slug
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-white text-slate-600 border-slate-300"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {loading && (
              <p className="text-center text-slate-400 py-16 animate-pulse">Loading stories...</p>
            )}
            {error && (
              <p className="text-center text-red-500 py-16">Couldn't load stories: {error}</p>
            )}
            {!loading && !error && blogs.length === 0 && (
              <p className="text-center text-slate-500 bg-white border border-slate-200 rounded-xl py-16">
                No stories found{search ? ` for "${search}"` : ""}.
              </p>
            )}

            <div className="space-y-5">
              {blogs.map((b) => (
                <BlogCard key={b.id} blog={b} onOpen={goToBlog} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                >
                  Prev
                </button>
                <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="w-full lg:w-72 shrink-0 order-1 lg:order-2 space-y-6">
            {/* Categories — desktop list, hidden on mobile (chips above cover it) */}
            <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => { setActiveCategory("All"); setPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between transition-colors ${
                      activeCategory === "All" ? "bg-orange-100 text-orange-700 font-semibold" : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    All Stories
                  </button>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => { setActiveCategory(c.slug); setPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between transition-colors ${
                        activeCategory === c.slug ? "bg-orange-100 text-orange-700 font-semibold" : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-slate-400">{c.post_count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Latest posts */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Latest Stories</h3>
              <ul className="space-y-3">
                {latest.map((b) => (
                  <li
                    key={b.id}
                    onClick={() => goToBlog(b.slug)}
                    className="flex gap-3 cursor-pointer group"
                  >
                    {b.cover_image ? (
                      <img src={b.cover_image} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                        <BookText size={20} className="text-orange-500" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-700 group-hover:text-orange-600 line-clamp-2 leading-snug">
                        {b.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{timeAgo(b.published_at)}</p>
                    </div>
                  </li>
                ))}
                {latest.length === 0 && (
                  <p className="text-xs text-slate-400">No stories published yet.</p>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}