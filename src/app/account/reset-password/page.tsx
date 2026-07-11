"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createAuthClient } from "better-auth/react";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, ChevronRight } from "lucide-react";

const authClient = createAuthClient();

function ResetPasswordForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const token   = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

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
      <div className="text-center py-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: "rgba(0,217,100,0.1)", border: "1px solid rgba(0,217,100,0.25)" }}
        >
          <CheckCircle2 className="w-8 h-8" style={{ color: "#00D964" }} />
        </div>
        <h2 className="text-white text-[22px] font-bold mb-2">Password reset!</h2>
        <p className="text-[13px] font-mono" style={{ color: "#6B7280" }}>Redirecting you to sign in…</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center py-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <XCircle className="w-8 h-8" style={{ color: "#EF4444" }} />
        </div>
        <h2 className="text-white text-[20px] font-bold mb-2">Invalid link</h2>
        <p className="text-[13px] font-mono mb-5" style={{ color: "#6B7280" }}>
          This reset link is invalid or has expired.
        </p>
        <Link href="/account/forgot-password" className="text-sm font-mono font-semibold" style={{ color: "#00D964" }}>
          Request a new link →
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-white text-[26px] font-bold mb-1">Set new password</h1>
      <p className="text-[13px] font-mono mb-7" style={{ color: "#6B7280" }}>
        Choose a strong password for your account.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-[12px] text-white font-medium mb-2">New password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required minLength={8}
              placeholder="Min 8 characters"
              className="w-full rounded-lg px-4 py-3 pr-12 text-[13px] font-mono text-white placeholder-[#444] focus:outline-none focus:ring-2 focus:ring-cyan/60 transition-colors"
              style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B" }}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "#6B7280" }}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[12px] text-white font-medium mb-2">Confirm password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            placeholder="Repeat password"
            className="w-full rounded-lg px-4 py-3 text-[13px] font-mono text-white placeholder-[#444] focus:outline-none focus:ring-2 focus:ring-cyan/60 transition-colors"
            style={{
              backgroundColor: "#0A0A0B",
              border: confirm && confirm !== password ? "1.5px solid #EF4444" : "1px solid #26262B",
            }}
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
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : "Reset Password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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

          <Suspense fallback={<div className="text-[13px] font-mono py-8 text-center" style={{ color: "#6B7280" }}>Loading…</div>}>
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-5 text-center">
            <Link
              href="/account/login"
              className="text-[12px] font-mono transition-colors"
              style={{ color: "#6B7280" }}
            >
              ← Back to sign in
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[11px] font-mono transition-colors" style={{ color: "#333" }}>
            <ChevronRight className="w-3 h-3 rotate-180" /> Back to portfolio
          </Link>
        </div>
      </div>
    </main>
  );
}
