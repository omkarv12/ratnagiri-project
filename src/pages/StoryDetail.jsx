import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Eye, MessageCircle, User } from "lucide-react";
import { blogApi } from "../api/blogApi";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function StoryDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    blogApi
      .getBlog(slug)
      .then(setBlog)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    setPosting(true);
    setPostError(null);
    try {
      await blogApi.addComment(blog.id, { name: name.trim(), email: email.trim(), comment: comment.trim() });
      setBlog((prev) => ({
        ...prev,
        comments: [{ id: Date.now(), name, comment, created_at: new Date().toISOString() }, ...(prev.comments || [])],
      }));
      setName(""); setEmail(""); setComment("");
    } catch (err) {
      setPostError(err.message);
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 animate-pulse">Loading story...</div>;
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">{error || "Story not found."}</p>
        <button onClick={() => navigate("/stories")} className="text-orange-600 font-semibold text-sm">
          ← Back to Stories
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 lg:p-10">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/stories")}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-600 mb-6"
        >
          <ArrowLeft size={16} /> Back to Stories
        </button>

        {blog.cover_image && (
          <img src={blog.cover_image} alt={blog.title} className="w-full h-64 sm:h-96 object-cover rounded-2xl mb-6" />
        )}

        {blog.category && (
          <span className="inline-block mb-3 px-2.5 py-1 bg-orange-100 text-orange-700 text-[11px] font-bold rounded uppercase tracking-wide">
            {blog.category.name}
          </span>
        )}

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">{blog.title}</h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mb-8 pb-6 border-b border-slate-200">
          {blog.author_name && <span className="flex items-center gap-1"><User size={14} /> {blog.author_name}</span>}
          <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(blog.published_at)}</span>
          <span className="flex items-center gap-1"><Eye size={14} /> {blog.views} views</span>
          <span className="flex items-center gap-1"><MessageCircle size={14} /> {blog.comments?.length || 0} comments</span>
        </div>

        <div
          className="prose prose-slate max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-xl font-bold text-slate-800 mb-5">Comments ({blog.comments?.length || 0})</h2>

          <form onSubmit={handleCommentSubmit} className="bg-white border border-slate-200 rounded-xl p-5 mb-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text" placeholder="Your name *" value={name}
                onChange={(e) => setName(e.target.value)}
                className="border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <input
                type="email" placeholder="Email (optional)" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <textarea
              placeholder="Write a comment... *" value={comment} rows={3}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            />
            {postError && <p className="text-sm text-red-500">{postError}</p>}
            <button
              type="submit" disabled={posting}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
            >
              {posting ? "Posting..." : "Post Comment"}
            </button>
          </form>

          <div className="space-y-4">
            {(blog.comments || []).map((c) => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-slate-800">{c.name}</span>
                  <span className="text-xs text-slate-400">{formatDate(c.created_at)}</span>
                </div>
                <p className="text-sm text-slate-600">{c.comment}</p>
              </div>
            ))}
            {(!blog.comments || blog.comments.length === 0) && (
              <p className="text-sm text-slate-400 text-center py-6">Be the first to comment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}