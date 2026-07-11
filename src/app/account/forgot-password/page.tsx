"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, ArrowLeft, Mail, CheckCircle2, ChevronRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectTo: "/account/reset-password" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message ?? "Request failed");
      }
      setSent(true);
    } catch (err) {
      setError((err as Error).message ?? "Failed to send reset email. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12 relative"
      style={{ backgroundColor: "#0A0A0B" }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #1a1a1e 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.3,
        }}
      />

      {/* Top-left breadcrumb */}
      <div className="absolute top-5 left-5 flex items-center gap-1.5 z-10">
        <Image src="/icons/Actual_Logo.ico" alt="MS" width={18} height={18} className="rounded opacity-60" />
        <span className="text-[11px] font-mono" style={{ color: "#6B7280" }}>ms-portfolio</span>
        <span className="text-[11px] font-mono" style={{ color: "#3a3a3a" }}>/</span>
        <span className="text-[11px] font-mono" style={{ color: "#6B7280" }}>career-centre</span>
        <span className="text-[11px] font-mono" style={{ color: "#3a3a3a" }}>/</span>
        <span className="text-[11px] font-mono font-semibold" style={{ color: "#00D964" }}>forgot-password</span>
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="rounded-xl p-8 shadow-2xl" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>

          {/* Brand */}
          <div className="flex items-center gap-3 mb-7">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#00D964" }}
            >
              <Image src="/icons/Actual_Logo.ico" alt="MS" width={22} height={22} className="rounded" />
            </div>
            <span className="text-white font-bold text-[15px]">MS Portfolio</span>
            <span
              className="text-[11px] font-mono px-2 py-0.5 rounded-md"
              style={{ backgroundColor: "#1e1e24", border: "1px solid #2e2e36", color: "#6B7280" }}
            >
              Career Centre
            </span>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: "rgba(0,217,100,0.1)", border: "1px solid rgba(0,217,100,0.25)" }}
              >
                <CheckCircle2 className="w-8 h-8" style={{ color: "#00D964" }} />
              </div>
              <h1 className="text-white text-[22px] font-bold mb-2">Check your email</h1>
              <p className="text-[13px] font-mono mb-5 leading-relaxed" style={{ color: "#6B7280" }}>
                We sent a reset link to{" "}
                <span style={{ color: "#00D964" }}>{email}</span>.
                The link expires in 1 hour.
              </p>
              <p className="text-[12px] font-mono mb-6" style={{ color: "#4a4a4a" }}>
                Didn&apos;t receive it? Check your spam folder or{" "}
                <button onClick={() => setSent(false)} className="font-semibold" style={{ color: "#00D964" }}>
                  try again
                </button>.
              </p>
              <Link
                href="/account/login"
                className="inline-flex items-center gap-2 text-sm font-mono transition-colors"
                style={{ color: "#6B7280" }}
              >
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ backgroundColor: "rgba(0,217,100,0.1)", border: "1px solid rgba(0,217,100,0.25)" }}
              >
                <Mail className="w-6 h-6" style={{ color: "#00D964" }} />
              </div>
              <h1 className="text-white text-[26px] font-bold mb-1">Forgot password?</h1>
              <p className="text-[13px] font-mono mb-7" style={{ color: "#6B7280" }}>
                Enter your email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-[12px] text-white font-medium mb-2">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-lg px-4 py-3 text-[13px] font-mono text-white placeholder-[#444] focus:outline-none focus:ring-2 focus:ring-cyan/60 transition-colors"
                    style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B" }}
                  />
                </div>

                {error && (
                  <p className="text-[12px] font-mono" style={{ color: "#EF4444" }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg py-3 font-bold text-[15px] transition-all disabled:opacity-50"
                  style={{ backgroundColor: "#00D964", color: "#0a0a0b" }}
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link
                  href="/account/login"
                  className="inline-flex items-center gap-1.5 text-[12px] font-mono transition-colors"
                  style={{ color: "#6B7280" }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[11px] font-mono transition-colors" style={{ color: "#333" }}>
            <ChevronRight className="w-3 h-3 rotate-180" /> Back to portfolio
          </Link>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
        <p className="text-[11px] font-mono" style={{ color: "#222" }}>
          · Career Centre · personal tools · account required
        </p>
      </div>
    </main>
  );
}
