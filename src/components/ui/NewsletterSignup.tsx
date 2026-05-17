"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, Loader2 } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");

    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (!res.ok) {
      setMsg(data.error ?? "Something went wrong.");
      setStatus("error");
    } else {
      setStatus("success");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 my-20">
      <div className="relative rounded-2xl overflow-hidden border border-cyan/20 bg-black/30 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-cyan" />
            <span className="text-cyan text-sm uppercase tracking-widest font-semibold">Newsletter</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white font-body mb-2">
            DevOps insights, monthly
          </h2>
          <p className="text-lightGrey text-sm font-body">
            AWS tips, CI/CD patterns, and cloud architecture breakdowns — no spam, unsubscribe any time.
          </p>
        </div>

        <div className="w-full md:w-auto md:min-w-[340px]">
          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 text-cyan font-body"
            >
              <CheckCircle className="w-5 h-5" />
              <span>You&apos;re subscribed!</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {status === "error" && (
                <p className="text-red-400 text-xs font-body">{msg}</p>
              )}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={status === "loading"}
                  className="flex-1 h-11 rounded-xl bg-darkBrown border border-lightBrown px-4 text-white text-sm placeholder-grey focus:border-cyan focus:outline-none transition-colors"
                />
                <motion.button
                  type="submit"
                  disabled={status === "loading"}
                  whileTap={{ scale: 0.97 }}
                  className="h-11 px-5 rounded-xl bg-cyan text-black text-sm font-bold hover:bg-darkCyan transition-colors disabled:opacity-60 flex items-center gap-2 flex-shrink-0"
                >
                  {status === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : "Subscribe"}
                </motion.button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
