"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createAuthClient } from "better-auth/react";
import { Eye, EyeOff, Loader2, ArrowRight, Check } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const authClient = createAuthClient();

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters",    ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number",           ok: /\d/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex gap-2 mt-1">
      {checks.map(({ label, ok }) => (
        <div key={label} className={`flex items-center gap-1 text-[10px] font-mono ${ok ? "text-green" : "text-lightGrey/40"}`}>
          <Check className={`w-2.5 h-2.5 ${ok ? "opacity-100" : "opacity-30"}`} />
          {label}
        </div>
      ))}
    </div>
  );
}

export default function AccountSignupPage() {
  const router = useRouter();
  const [name, setName]         = useState("");
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
      const result = await authClient.signUp.email({ name, email, password });
      if (result.error) setError(result.error.message ?? "Registration failed");
      else router.push("/account");
    } catch {
      setError("Registration failed. Please try again.");
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
    <main className="min-h-screen bg-darkBrown flex items-center justify-center px-4 sm:px-8 py-12">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <Image src="/icons/Actual_Logo.ico" alt="MS Logo" width={42} height={42} className="rounded-xl" />
          <div>
            <p className="font-special font-bold text-white">Mohana Srinivasan</p>
            <p className="text-cyan text-xs font-mono">Career Centre</p>
          </div>
        </div>

        <h1 className="font-special text-2xl font-bold text-white mb-1">Create your account</h1>
        <p className="text-lightGrey text-sm font-mono mb-8">Free access to all career tools</p>

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
          <span className="text-xs font-mono text-lightGrey/40">or sign up with email</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-lightGrey uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Mohana Srinivasan"
              className="h-11 rounded-xl bg-white/4 border border-white/10 px-4 text-white text-sm font-mono placeholder-lightGrey/30 focus:outline-none focus:border-cyan/50 focus:bg-white/6 transition-all"
            />
          </div>
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
            <label className="text-xs font-mono text-lightGrey uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Min 8 characters"
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
            <PasswordStrength password={password} />
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-xs font-mono text-lightGrey mt-6">
          Already have an account?{" "}
          <Link href="/account/login" className="text-cyan hover:text-lightCyan transition-colors">
            Sign in →
          </Link>
        </p>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <Link href="/" className="text-xs font-mono text-lightGrey/40 hover:text-lightGrey transition-colors">
            ← Back to portfolio
          </Link>
        </div>
      </div>
    </main>
  );
}
