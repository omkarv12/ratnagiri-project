import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Eye, MessageCircle, Send } from "lucide-react";
import { blogApi } from "../api/blogapi";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    blogApi
      .getBlog(slug)
      .then(setBlog)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [slug]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const newComment = await blogApi.addComment(blog.id, { name, email, comment });
      setBlog((prev) => ({
        ...prev,
        comments: [newComment, ...prev.comments],
        comment_count: prev.comment_count + 1,
      }));
      setName("");
      setEmail("");
      setComment("");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 animate-pulse">Loading story...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-red-500">{error || "Story not found."}</p>
        <button
          onClick={() => navigate("/stories")}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl"
        >
          <ArrowLeft size={18} /> Back to Stories
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 lg:p-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {blog.cover_image && (
          <img src={blog.cover_image} alt={blog.title} className="w-full h-56 sm:h-80 object-cover" />
        )}

        <div className="p-5 sm:p-10">
          <button
            onClick={() => navigate("/stories")}
            className="flex items-center gap-2 text-sm text-orange-600 font-semibold mb-6 hover:text-orange-700"
          >
            <ArrowLeft size={16} /> Back to Stories
          </button>

          {blog.category && (
            <span className="inline-block mb-3 px-2.5 py-1 bg-orange-100 text-orange-700 text-[11px] font-bold rounded uppercase tracking-wide">
              {blog.category.name}
            </span>
          )}

          <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-3 leading-tight">{blog.title}</h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mb-8 pb-6 border-b border-slate-100">
            {blog.author_name && <span className="flex items-center gap-1"><User size={14} /> {blog.author_name}</span>}
            <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(blog.published_at)}</span>
            <span className="flex items-center gap-1"><Eye size={14} /> {blog.views} views</span>
            <span className="flex items-center gap-1"><MessageCircle size={14} /> {blog.comment_count} comments</span>
          </div>

          {/* Article body — content stored as HTML from the admin editor.
              If you're storing markdown instead, swap this for a markdown renderer. */}
          <article
            className="prose prose-slate max-w-none prose-img:rounded-xl prose-headings:font-bold text-lg leading-8 text-slate-700"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* COMMENTS */}
          <section className="mt-12 pt-8 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <MessageCircle size={18} /> {blog.comment_count} Comments
            </h2>

            <form onSubmit={handleSubmitComment} className="bg-slate-50 rounded-xl p-4 sm:p-5 mb-8 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <input
                  type="email"
                  placeholder="Email (optional, not shown publicly)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <textarea
                placeholder="Share your thoughts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={3}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
              />
              {submitError && <p className="text-xs text-red-500">{submitError}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                <Send size={14} /> {submitting ? "Posting..." : "Post Comment"}
              </button>
            </form>

            <div className="space-y-5">
              {blog.comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0 text-sm">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 text-sm">{c.name}</span>
                      <span className="text-xs text-slate-400">{formatDate(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{c.comment}</p>
                  </div>
                </div>
              ))}
              {blog.comments.length === 0 && (
                <p className="text-sm text-slate-400">Be the first to comment on this story.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}