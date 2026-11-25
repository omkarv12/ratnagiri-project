import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookText, Search, Eye, MessageCircle, Calendar, User } from "lucide-react";
import { blogApi } from "../api/blogApi";

// Banner photo for the top of the page. Put a Ratnagiri image URL here
// (for example a Cloudinary link). While it is empty, a sea-coloured
// gradient is shown instead.
const HERO_IMAGE = "";

const PAGE_SIZE = 10;

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Old stories have HTML in their excerpts; render them as plain text.
function stripTags(html) {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
}

function BlogCard({ blog, onOpen }) {
  return (
    <article
      onClick={() => onOpen(blog.slug)}
      className="group flex cursor-pointer flex-col gap-5 border-b border-slate-200 py-8 first:pt-0 last:border-b-0 sm:flex-row sm:gap-8"
    >
      {blog.cover_image ? (
        <div className="h-52 w-full shrink-0 overflow-hidden bg-slate-100 sm:h-[13.5rem] sm:w-80">
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex h-52 w-full shrink-0 items-center justify-center bg-[color:var(--rt-kokum-tint)] sm:h-[13.5rem] sm:w-80">
          <BookText size={40} className="text-[color:var(--rt-kokum)]" />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {blog.category && (
          <span className="mb-2 self-start text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--rt-kokum)]">
            {blog.category.name}
          </span>
        )}
        <h3 className="rt-display mb-3 text-2xl font-bold leading-snug text-[color:var(--rt-kokum-dark)] transition-colors group-hover:text-[color:var(--rt-kokum)] sm:text-[1.7rem]">
          {blog.title}
        </h3>
        <p className="mb-4 line-clamp-3 text-[15px] leading-relaxed text-slate-700">
          {stripTags(blog.excerpt)} …
        </p>
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
  const [searchInput, setSearchInput] = useState(""); // what is typed
  const [search, setSearch] = useState(""); // what is applied (on Search / Enter)
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
    blogApi
      .listBlogs({ category: activeCategory, search, page, limit: PAGE_SIZE })
      .then((data) => {
        setBlogs(data.blogs);
        setTotal(data.total);
        setTotalPages(data.total_pages);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeCategory, search, page]);

  const goToBlog = (slug) => navigate(`/stories/${slug}`);

  const submitSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const pickCategory = (slug) => {
    setActiveCategory(slug);
    setPage(1);
  };

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const catLink = (active) =>
    `block w-full text-left py-2.5 text-[17px] transition-colors ${
      active
        ? "font-semibold text-[color:var(--rt-kokum)]"
        : "text-slate-500 hover:text-[color:var(--rt-kokum)]"
    }`;

  return (
    <div className="bg-[color:var(--rt-sand)]">
      {/* ---------- Banner ---------- */}
      <section
        className="relative flex h-64 items-center justify-center overflow-hidden bg-cover bg-center sm:h-80"
        style={{
          backgroundImage: HERO_IMAGE
            ? `url(${HERO_IMAGE})`
            : "linear-gradient(120deg, var(--rt-ink-deep) 0%, var(--rt-ink) 50%, var(--rt-teal) 100%)",
        }}
      >
        <div className="rt-scrim-hero-y absolute inset-0" />
        <h1 className="rt-display relative px-4 text-center text-3xl font-bold text-white drop-shadow-lg sm:text-5xl">
          Ratnagiri Tourism Stories
        </h1>
      </section>

      {/* ---------- Tab + search bar ---------- */}
      <section className="bg-[color:var(--rt-ink)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0">
          <nav aria-label="Story tabs" className="flex">
            <button
              type="button"
              onClick={() => pickCategory("All")}
              className="relative px-6 py-5 text-sm font-bold uppercase tracking-wide text-white sm:text-base"
            >
              All
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[color:var(--rt-kokum)]" />
            </button>
          </nav>

          <form onSubmit={submitSearch} className="flex w-full gap-3 sm:max-w-xl">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search titles or topics..."
                aria-label="Search stories"
                className="h-11 w-full rounded-lg bg-white pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--rt-gold)]"
              />
            </div>
            <button
              type="submit"
              className="flex h-11 shrink-0 items-center gap-2 rounded-lg bg-[color:var(--rt-kokum)] px-5 text-sm font-bold text-white transition-colors hover:bg-[color:var(--rt-kokum-dark)]"
            >
              <Search size={16} />
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ---------- List + sidebar ---------- */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-0">
          {/* MAIN COLUMN */}
          <div className="min-w-0 flex-1 lg:pr-12">
            <p className="mb-6 text-sm text-slate-600">
              {total > 0 ? `Showing ${from}–${to} of ${total} stories` : "\u00A0"}
            </p>

            {loading && (
              <p className="animate-pulse py-16 text-center text-slate-400">Loading stories...</p>
            )}
            {error && (
              <p className="py-16 text-center text-red-500">Couldn't load stories: {error}</p>
            )}
            {!loading && !error && blogs.length === 0 && (
              <p className="border border-slate-200 bg-white py-16 text-center text-slate-500">
                No stories found{search ? ` for "${search}"` : ""}.
              </p>
            )}

            {!loading && !error && (
              <div>
                {blogs.map((b) => (
                  <BlogCard key={b.id} blog={b} onOpen={goToBlog} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-[color:var(--rt-kokum-line)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--rt-kokum-dark)] hover:bg-[color:var(--rt-kokum-tint)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-sm text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-[color:var(--rt-kokum-line)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--rt-kokum-dark)] hover:bg-[color:var(--rt-kokum-tint)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="w-full shrink-0 border-slate-300 lg:w-80 lg:border-l lg:pl-12">
            <h2 className="rt-display mb-4 border-b border-dotted border-slate-400 pb-4 text-sm font-extrabold uppercase tracking-[0.3em] text-[color:var(--rt-kokum-dark)]">
              Categories
            </h2>
            <ul className="mb-10">
              <li>
                <button onClick={() => pickCategory("All")} className={catLink(activeCategory === "All")}>
                  All Stories
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => pickCategory(c.slug)}
                    className={catLink(activeCategory === c.slug)}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>

            <h2 className="rt-display mb-4 border-b border-dotted border-slate-400 pb-4 text-sm font-extrabold uppercase tracking-[0.3em] text-[color:var(--rt-kokum-dark)]">
              Latest Stories
            </h2>
            <ul className="space-y-4">
              {latest.map((b) => (
                <li
                  key={b.id}
                  onClick={() => goToBlog(b.slug)}
                  className="group flex cursor-pointer gap-3"
                >
                  {b.cover_image ? (
                    <img src={b.cover_image} alt="" className="h-14 w-14 shrink-0 object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-[color:var(--rt-kokum-tint)]">
                      <BookText size={20} className="text-[color:var(--rt-kokum)]" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-700 group-hover:text-[color:var(--rt-kokum)]">
                      {b.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{timeAgo(b.published_at)}</p>
                  </div>
                </li>
              ))}
              {latest.length === 0 && (
                <p className="text-xs text-slate-400">No stories published yet.</p>
              )}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}