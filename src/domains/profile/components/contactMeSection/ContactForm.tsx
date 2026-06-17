"use client";
import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const form = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.current || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      // Save to DB
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      // Send email via EmailJS
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        form.current,
        { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY! }
      );

      setName(""); setEmail(""); setMessage("");
      setStatus("success");
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <div className="w-full">
      {status === "success" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-cyan/10 border border-cyan/30 text-cyan rounded-xl px-4 py-3 mb-4 text-sm"
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          Message sent! I&apos;ll reply within 24 hours.
        </motion.div>
      )}
      {status === "error" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-4 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMsg}
        </motion.div>
      )}

      <form ref={form} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-lightGrey uppercase tracking-wider">Name</label>
          <input
            type="text"
            name="from_name"
            placeholder="Your name"
            required
            className="w-full h-12 rounded-xl bg-darkBrown border border-lightBrown px-4 text-white text-base placeholder-grey focus:border-cyan focus:outline-none transition-colors duration-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status === "loading"}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-lightGrey uppercase tracking-wider">Email</label>
          <input
            type="email"
            name="from_email"
            placeholder="your@email.com"
            required
            className="w-full h-12 rounded-xl bg-darkBrown border border-lightBrown px-4 text-white text-base placeholder-grey focus:border-cyan focus:outline-none transition-colors duration-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-lightGrey uppercase tracking-wider">Message</label>
          <textarea
            name="message"
            rows={6}
            placeholder="Tell me about your project or opportunity…"
            required
            className="w-full rounded-xl bg-darkBrown border border-lightBrown px-4 py-3 text-white text-base placeholder-grey focus:border-cyan focus:outline-none transition-colors duration-200 resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={status === "loading"}
          />
          <span className="text-xs text-grey text-right">{message.length}/2000</span>
        </div>

        <motion.button
          type="submit"
          disabled={status === "loading"}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-xl bg-cyan text-black h-12 font-bold flex items-center justify-center gap-2 hover:bg-darkCyan transition-colors duration-300 disabled:opacity-60"
        >
          {status === "loading" ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
          ) : (
            <><Send className="w-4 h-4" /> Send Message</>
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default ContactForm;
