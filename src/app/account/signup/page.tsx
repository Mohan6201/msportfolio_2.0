"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createAuthClient } from "better-auth/react";
import { Eye, EyeOff, Loader2, ArrowRight, Check, ChevronRight } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const authClient = createAuthClient();

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ chars",   ok: password.length >= 8 },
    { label: "Uppercase",  ok: /[A-Z]/.test(password) },
    { label: "Number",     ok: /\d/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex gap-3 mt-2">
      {checks.map(({ label, ok }) => (
        <div key={label} className="flex items-center gap-1 text-[10px] font-mono" style={{ color: ok ? "#00D964" : "#374151" }}>
          <Check className="w-2.5 h-2.5" style={{ opacity: ok ? 1 : 0.3 }} />
          {label}
        </div>
      ))}
    </div>
  );
}

export default function AccountSignupPage() {
  const router = useRouter();
  const [name,     setName]     = useState("");
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

      <div className="w-full max-w-[440px] relative z-10">
        {/* Card */}
        <div className="rounded-xl p-6 sm:p-8 shadow-2xl" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>

          {/* Brand header */}
          <div className="flex items-center gap-3 mb-7">
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

          <h1 className="text-white text-[26px] font-bold text-center mb-2">Create your account</h1>
          <p className="text-center text-[13px] mb-7" style={{ color: "#6B7280" }}>
            Free access to all career tools
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-lg py-3 text-white text-[14px] font-mono transition-all disabled:opacity-50 mb-4"
            style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B" }}
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#00D964" }} /> : <FcGoogle className="w-5 h-5" />}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ backgroundColor: "#26262B" }} />
            <span className="text-[11px] font-mono" style={{ color: "#3a3a3a" }}>or sign up with email</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#26262B" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[12px] text-white font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Mohana Srinivasan"
                className="w-full rounded-lg px-4 py-3 text-base sm:text-[13px] font-mono text-white placeholder-[#444] focus:outline-none transition-colors"
                style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B" }}
              />
            </div>

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
            </div>

            <div>
              <label className="block text-[12px] text-white font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                  className="w-full rounded-lg px-4 py-3 pr-12 text-base sm:text-[13px] font-mono text-white placeholder-[#444] focus:outline-none transition-colors"
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
              <PasswordStrength password={password} />
            </div>

            {error && (
              <p className="text-[12px] font-mono" style={{ color: "#EF4444" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-3 font-bold text-[15px] transition-all disabled:cursor-not-allowed"
              style={{ backgroundColor: "#00D964", color: "#0a0a0b", opacity: loading ? 0.85 : 1 }}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-[13px] mt-6" style={{ color: "#6B7280" }}>
            Already have an account?{" "}
            <Link href="/account/login" className="font-semibold" style={{ color: "#00D964" }}>
              Sign in →
            </Link>
          </p>
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
