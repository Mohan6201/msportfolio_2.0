"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Loader2, CheckCircle } from "lucide-react";

interface Comment {
  id: number | bigint;
  author: string;
  body: string;
  created_at: string;
}

interface Props {
  slug: string;
}

export default function CommentSection({ slug }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => { setComments(d.comments ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, author, email, body }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
    } else {
      setSubmitted(true);
      setAuthor(""); setEmail(""); setBody("");
    }
    setSubmitting(false);
  };

  return (
    <section className="mt-16 pt-10 border-t border-white/10">
      <h2 className="flex items-center gap-2 text-xl font-bold text-white font-body mb-8">
        <MessageSquare className="w-5 h-5 text-cyan" />
        Comments
        {comments.length > 0 && (
          <span className="text-sm font-normal text-grey ml-1">({comments.length})</span>
        )}
      </h2>

      {/* Approved comments */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 text-cyan animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-grey text-sm font-body mb-8">No comments yet — be the first!</p>
      ) : (
        <ul className="flex flex-col gap-4 mb-10">
          <AnimatePresence>
            {comments.map((c) => (
              <motion.li
                key={String(c.id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/30 border border-white/8 rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-cyan/20 border border-cyan/30 flex items-center justify-center text-cyan text-xs font-bold">
                    {String(c.author)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white font-body">{String(c.author)}</p>
                    <p className="text-xs text-grey font-body">
                      {new Date(String(c.created_at)).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-lightGrey font-body leading-relaxed">{String(c.body)}</p>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* Submit form */}
      <div className="bg-black/20 border border-white/8 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white font-body mb-4">Leave a Comment</h3>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-cyan text-sm font-body"
          >
            <CheckCircle className="w-4 h-4" />
            Thanks! Your comment is pending review and will appear shortly.
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {error && (
              <p className="text-red-400 text-xs font-body">{error}</p>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Your name *"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                disabled={submitting}
                className="h-10 rounded-lg bg-darkBrown border border-lightBrown px-3 text-white text-sm placeholder-grey focus:border-cyan focus:outline-none transition-colors"
              />
              <input
                type="email"
                placeholder="your@email.com *"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className="h-10 rounded-lg bg-darkBrown border border-lightBrown px-3 text-white text-sm placeholder-grey focus:border-cyan focus:outline-none transition-colors"
              />
            </div>
            <textarea
              placeholder="Write your comment… (max 1000 chars)"
              required
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={submitting}
              maxLength={1000}
              className="rounded-lg bg-darkBrown border border-lightBrown px-3 py-2 text-white text-sm placeholder-grey focus:border-cyan focus:outline-none transition-colors resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-grey font-body">Email is not displayed publicly.</p>
              <motion.button
                type="submit"
                disabled={submitting}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan text-black text-sm font-semibold hover:bg-darkCyan transition-colors disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? "Posting…" : "Post Comment"}
              </motion.button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
