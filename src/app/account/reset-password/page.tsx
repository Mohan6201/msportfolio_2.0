"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createAuthClient } from "better-auth/react";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";

const authClient = createAuthClient();

function ResetPasswordForm() {
  const router       = useRouter();
  const params       = useSearchParams();
  const token        = params.get("token") ?? "";

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState("");

  useEffect(() => {
    if (!token) setError("Invalid or expired reset link. Please request a new one.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }
    setError(""); setLoading(true);
    try {
      await authClient.resetPassword({ newPassword: password, token });
      setSuccess(true);
      setTimeout(() => router.push("/account/login"), 3000);
    } catch {
      setError("Reset failed. The link may have expired — request a new one.");
    } finally { setLoading(false); }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green/10 border border-green/25 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green" />
        </div>
        <h2 className="font-special text-2xl font-bold text-white mb-2">Password reset!</h2>
        <p className="text-lightGrey text-sm font-mono">Redirecting you to sign in…</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-red/10 border border-red/25 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red" />
        </div>
        <h2 className="font-special text-xl font-bold text-white mb-2">Invalid link</h2>
        <p className="text-lightGrey text-sm font-mono mb-6">This reset link is invalid or has expired.</p>
        <Link href="/account/forgot-password" className="text-cyan hover:text-lightCyan text-sm font-mono transition-colors">
          Request a new link →
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-special text-2xl font-bold text-white mb-1">Set new password</h1>
      <p className="text-lightGrey text-sm font-mono mb-8">Choose a strong password for your account.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-lightGrey uppercase tracking-wider">New password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required minLength={8}
              placeholder="Min 8 characters"
              className="w-full h-11 rounded-xl bg-white/4 border border-white/10 px-4 pr-11 text-white text-sm font-mono placeholder-lightGrey/30 focus:outline-none focus:border-cyan/50 transition-all"
            />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-lightGrey/50 hover:text-lightGrey transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-lightGrey uppercase tracking-wider">Confirm password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            placeholder="Repeat password"
            className={`h-11 rounded-xl bg-white/4 border px-4 text-white text-sm font-mono placeholder-lightGrey/30 focus:outline-none transition-all ${
              confirm && confirm !== password ? "border-red/50 focus:border-red/70" : "border-white/10 focus:border-cyan/50"
            }`}
          />
        </div>

        {error && (
          <div className="text-red text-xs font-mono bg-red/8 border border-red/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="h-11 rounded-xl bg-cyan text-black font-mono font-bold text-sm flex items-center justify-center gap-2 hover:bg-lightCyan transition-colors shadow-cyanShadow disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-darkBrown flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-3 mb-8">
          <Image src="/icons/logo.svg" alt="MS Logo" width={40} height={40} className="rounded-xl" />
          <div>
            <p className="font-special font-bold text-white">Mohana Srinivasan</p>
            <p className="text-cyan text-xs font-mono">Career Centre</p>
          </div>
        </div>
        <Suspense fallback={<div className="text-lightGrey font-mono text-sm">Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>
        <div className="mt-6 text-center">
          <Link href="/account/login" className="text-xs font-mono text-lightGrey/40 hover:text-lightGrey transition-colors">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
