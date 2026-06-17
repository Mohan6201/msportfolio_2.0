"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createAuthClient } from "better-auth/react";
import { Eye, EyeOff, Loader2, ArrowRight, ChevronRight } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const authClient = createAuthClient();

const FEATURES = [
  { icon: "📄", label: "Resume Studio",  desc: "7 pro templates + ATS scoring + AI cover letters" },
  { icon: "🎯", label: "Job Tracker",    desc: "Live job listings matched to your resume" },
  { icon: "🤖", label: "Interview Lab",  desc: "AI mock interviews with instant feedback" },
  { icon: "📈", label: "Career Advisor", desc: "Skill gap analysis + career roadmap" },
];

export default function AccountLoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) setError(result.error.message ?? "Invalid credentials");
      else router.push("/account");
    } catch {
      setError("Login failed. Please try again.");
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({ provider: "google", callbackURL: "/account" });
    } catch {
      setError("Google sign-in failed.");
      setGoogleLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex" style={{ backgroundColor: "#0A0A0B" }}>
      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #1a1a1e 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.3,
        }}
      />

      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 relative overflow-hidden px-10 py-10 z-10"
        style={{ borderRight: "1px solid #26262B" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/10">
            <Image src="/images/icons/badge-hex-bronze.png" alt="MS" width={40} height={40} className="w-full h-full object-cover" />
          </div>
          <span className="text-white font-bold text-[15px]">MS Portfolio</span>
          <span
            className="text-[11px] font-mono px-2 py-0.5 rounded-md"
            style={{ backgroundColor: "#1e1e24", border: "1px solid #2e2e36", color: "#6B7280" }}
          >
            Career Centre
          </span>
        </div>

        {/* Headline */}
        <div>
          <h2 className="text-white text-3xl font-bold leading-snug mb-3">
            Your DevOps career,<br />
            <span style={{ color: "#00D964" }}>all in one place.</span>
          </h2>
          <p className="text-sm font-mono mb-8 leading-relaxed" style={{ color: "#6B7280" }}>
            Resume builder, live job matching, AI mock interviews, and career analytics — built for DevOps engineers.
          </p>

          <div className="flex flex-col gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-start gap-3 rounded-xl p-3"
                style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}
              >
                <span className="text-xl leading-none mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-white text-sm font-semibold">{f.label}</p>
                  <p className="text-[12px] font-mono mt-0.5" style={{ color: "#6B7280" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-[11px] font-mono italic" style={{ color: "#2e2e36" }}>
          &quot;Automate everything, monitor obsessively, keep the pager quiet.&quot;
        </p>
      </div>

      {/* ── Right panel (form) ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 pb-16 relative z-10">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#00D964" }}
            >
              <Image src="/icons/Actual_Logo.ico" alt="MS" width={22} height={22} className="rounded" />
            </div>
            <div>
              <p className="text-white font-bold text-[15px]">MS Portfolio</p>
              <p className="text-[11px] font-mono" style={{ color: "#6B7280" }}>Career Centre</p>
            </div>
          </div>

          <h1 className="text-white text-[26px] font-bold mb-1">Welcome back</h1>
          <p className="text-sm font-mono mb-8" style={{ color: "#6B7280" }}>
            Sign in to access your career tools
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-lg py-3 text-white text-[14px] font-mono transition-all disabled:opacity-50"
            style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#00D964" }} /> : <FcGoogle className="w-5 h-5" />}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ backgroundColor: "#26262B" }} />
            <span className="text-[11px] font-mono" style={{ color: "#3a3a3a" }}>or sign in with email</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#26262B" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[12px] text-white font-medium mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-lg px-4 py-3 text-base sm:text-[13px] font-mono text-white placeholder-[#444] focus:outline-none transition-colors"
                style={{ backgroundColor: "#0A0A0B", border: error ? "1.5px solid #EF4444" : "1px solid #26262B" }}
              />
              {error && (
                <p className="text-[12px] font-mono mt-1.5" style={{ color: "#EF4444" }}>{error}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] text-white font-medium">Password</label>
                <Link href="/account/forgot-password" className="text-[12px] font-mono transition-colors" style={{ color: "#6B7280" }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg px-4 py-3 pr-12 text-base sm:text-[13px] font-mono text-white placeholder-[#444] focus:outline-none transition-colors"
                  style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[11px] font-mono"
                  style={{ color: "#6B7280" }}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-3 font-bold text-[15px] transition-all disabled:cursor-not-allowed"
              style={{ backgroundColor: "#00D964", color: "#0a0a0b", opacity: loading ? 0.85 : 1 }}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-[13px] mt-6" style={{ color: "#6B7280" }}>
            No account?{" "}
            <Link href="/account/signup" className="font-semibold" style={{ color: "#00D964" }}>
              Create one free →
            </Link>
          </p>

          <div className="mt-6 pt-5 text-center" style={{ borderTop: "1px solid #26262B" }}>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[11px] font-mono transition-colors"
              style={{ color: "#333" }}
            >
              <ChevronRight className="w-3 h-3 rotate-180" /> Back to portfolio
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom note */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
        <p className="text-[11px] font-mono" style={{ color: "#222" }}>
          · Career Centre · personal tools · account required
        </p>
      </div>
    </main>
  );
}
