"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createAuthClient } from "better-auth/react";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FiGithub } from "react-icons/fi";

const authClient = createAuthClient();

const FEATURES = [
  { icon: "📄", label: "Resume Studio",  desc: "7 professional templates + ATS scoring" },
  { icon: "🎯", label: "Job Tracker",    desc: "JD matching, application pipeline" },
  { icon: "🤖", label: "Interview Lab",  desc: "AI mock interviews with instant feedback" },
  { icon: "📈", label: "Career Advisor", desc: "Progression analysis + gap detection" },
];

export default function AccountLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
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
    <main className="min-h-screen bg-darkBrown flex">
      {/* ── Left panel (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] flex-shrink-0 relative overflow-hidden px-12 py-12 border-r border-white/5">
        {/* Background glow */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-cyan/4 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-16 w-[400px] h-[400px] rounded-full bg-orange/4 blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <Image src="/icons/logo.svg" alt="MS Logo" width={44} height={44} className="rounded-xl" />
          <div>
            <p className="font-special font-bold text-white text-lg leading-none">Mohana Srinivasan</p>
            <p className="text-cyan text-xs font-mono mt-0.5">Career Centre</p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <h2 className="font-special text-3xl font-bold text-white leading-snug mb-4">
            Your DevOps career,<br />
            <span className="gradient-text">all in one place</span>
          </h2>
          <p className="text-lightGrey text-sm font-mono leading-relaxed mb-8">
            Resume builder, job tracker, AI mock interviews, and career analytics — built for DevOps engineers.
          </p>

          <div className="flex flex-col gap-3">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-start gap-3 glass rounded-xl p-3 border border-white/5">
                <span className="text-xl leading-none mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-white text-sm font-semibold">{f.label}</p>
                  <p className="text-lightGrey text-xs font-mono">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer quote */}
        <div className="relative z-10">
          <p className="text-lightGrey/40 text-xs font-mono italic">
            &quot;Automate everything, monitor obsessively, keep the pager quiet.&quot;
          </p>
          <p className="text-lightGrey/30 text-xs font-mono mt-1">— Mohana Srinivasan</p>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[300px] h-[300px] rounded-full bg-cyan/3 blur-[100px]" />
        </div>

        <div className="w-full max-w-[400px] relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <Image src="/icons/logo.svg" alt="MS Logo" width={38} height={38} className="rounded-xl" />
            <div>
              <p className="font-special font-bold text-white">Mohana Srinivasan</p>
              <p className="text-cyan text-xs font-mono">Career Centre</p>
            </div>
          </div>

          <h1 className="font-special text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-lightGrey text-sm font-mono mb-8">Sign in to access your career tools</p>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-white/15 bg-white/3 hover:bg-white/6 hover:border-white/25 transition-all duration-200 text-sm font-mono text-white disabled:opacity-50 mb-3"
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FcGoogle className="w-5 h-5" />}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs font-mono text-lightGrey/40">or sign in with email</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-lightGrey uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="h-11 rounded-xl bg-white/4 border border-white/10 px-4 text-white text-sm font-mono placeholder-lightGrey/30 focus:outline-none focus:border-cyan/50 focus:bg-white/6 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-lightGrey uppercase tracking-wider">Password</label>
                <Link href="/account/forgot-password" className="text-xs font-mono text-cyan hover:text-lightCyan transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-11 rounded-xl bg-white/4 border border-white/10 px-4 pr-11 text-white text-sm font-mono placeholder-lightGrey/30 focus:outline-none focus:border-cyan/50 focus:bg-white/6 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lightGrey/50 hover:text-lightGrey transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red text-xs font-mono bg-red/8 border border-red/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-xl bg-cyan text-black font-mono font-bold text-sm flex items-center justify-center gap-2 hover:bg-lightCyan transition-colors shadow-cyanShadow disabled:opacity-50 mt-1"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-xs font-mono text-lightGrey mt-6">
            No account?{" "}
            <Link href="/account/signup" className="text-cyan hover:text-lightCyan transition-colors">
              Create one free →
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <Link href="/" className="text-xs font-mono text-lightGrey/40 hover:text-lightGrey transition-colors flex items-center justify-center gap-1">
              <FiGithub className="w-3 h-3" /> ← Back to portfolio
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
