"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState("");

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
    <main className="min-h-screen bg-darkBrown flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <Image src="/icons/Actual_Logo.ico" alt="MS Logo" width={40} height={40} className="rounded-xl" />
          <div>
            <p className="font-special font-bold text-white">Mohana Srinivasan</p>
            <p className="text-cyan text-xs font-mono">Career Centre</p>
          </div>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green/10 border border-green/25 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green" />
            </div>
            <h1 className="font-special text-2xl font-bold text-white mb-2">Check your email</h1>
            <p className="text-lightGrey text-sm font-mono mb-6">
              We sent a reset link to{" "}
              <span className="text-cyan">{email}</span>.
              The link expires in 1 hour.
            </p>
            <p className="text-lightGrey/50 text-xs font-mono mb-8">
              Didn&apos;t receive it? Check your spam folder or{" "}
              <button onClick={() => setSent(false)} className="text-cyan hover:underline">
                try again
              </button>.
            </p>
            <Link
              href="/account/login"
              className="inline-flex items-center gap-2 text-sm font-mono text-lightGrey hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/25 flex items-center justify-center mb-6">
              <Mail className="w-6 h-6 text-cyan" />
            </div>
            <h1 className="font-special text-2xl font-bold text-white mb-2">Forgot password?</h1>
            <p className="text-lightGrey text-sm font-mono mb-8">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-lightGrey uppercase tracking-wider">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="h-11 rounded-xl bg-white/4 border border-white/10 px-4 text-white text-sm font-mono placeholder-lightGrey/30 focus:outline-none focus:border-cyan/50 focus:bg-white/6 transition-all"
                />
              </div>

              {error && (
                <div className="text-red text-xs font-mono bg-red/8 border border-red/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="h-11 rounded-xl bg-cyan text-black font-mono font-bold text-sm flex items-center justify-center gap-2 hover:bg-lightCyan transition-colors shadow-cyanShadow disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/account/login" className="inline-flex items-center gap-1.5 text-xs font-mono text-lightGrey/50 hover:text-lightGrey transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
