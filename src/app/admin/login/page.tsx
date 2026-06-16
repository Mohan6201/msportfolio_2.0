"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createAuthClient } from "better-auth/react";
import { Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const authClient = createAuthClient();

export default function AdminLoginPage() {
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
      if (result.error) setError("Invalid email or password. Please try again.");
      else router.push("/admin");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({ provider: "google", callbackURL: "/admin" });
    } catch {
      setError("Google sign-in failed.");
      setGoogleLoading(false);
    }
  }

  const hasError = !!error;

  return (
    <main
      className="min-h-screen flex flex-col relative"
      style={{ backgroundColor: "#0A0A0B" }}
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #1a1a1e 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.35,
        }}
      />

      {/* Top-left breadcrumb */}
      <div className="absolute top-5 left-5 flex items-center gap-1.5 z-10">
        <Image src="/icons/Actual_Logo.ico" alt="MS" width={18} height={18} className="rounded opacity-60" />
        <span className="text-[11px] font-mono" style={{ color: "#6B7280" }}>ms-portfolio</span>
        <span className="text-[11px] font-mono" style={{ color: "#3a3a3a" }}>/</span>
        <span className="text-[11px] font-mono" style={{ color: "#6B7280" }}>account-centre</span>
        <span className="text-[11px] font-mono" style={{ color: "#3a3a3a" }}>/</span>
        <span className="text-[11px] font-mono font-semibold" style={{ color: "#00D964" }}>login</span>
      </div>

      {/* Top-right version */}
      <div className="absolute top-5 right-5 z-10">
        <span className="text-[11px] font-mono" style={{ color: "#3a3a3a" }}>v2.4.1</span>
      </div>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center px-4 py-20 relative z-10">
        <div
          className="w-full max-w-[440px] rounded-xl shadow-2xl"
          style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}
        >
          <div className="p-8">

            {/* Brand header */}
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
                Account Centre
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-white text-[26px] font-bold text-center mb-2">Welcome back</h1>
            <p className="text-center text-[13px] mb-7" style={{ color: "#6B7280" }}>
              Access your resume, job tracker, and career tools
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Email */}
              <div>
                <label className="block text-[12px] text-white font-medium mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg px-4 py-3 text-[13px] font-mono text-white placeholder-[#444] focus:outline-none transition-colors"
                  style={{
                    backgroundColor: "#0A0A0B",
                    border: hasError ? "1.5px solid #EF4444" : "1px solid #26262B",
                  }}
                />
                {hasError && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#EF4444" }} />
                    <span className="text-[12px] font-mono" style={{ color: "#EF4444" }}>{error}</span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[12px] text-white font-medium">Password</label>
                  <Link
                    href="/account/forgot-password"
                    className="text-[12px] font-mono transition-colors"
                    style={{ color: "#6B7280" }}
                  >
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
                    className="w-full rounded-lg px-4 py-3 text-[13px] font-mono text-white placeholder-[#444] focus:outline-none transition-colors pr-12"
                    style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B" }}
                  />
                </div>
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="flex items-center gap-1.5 text-[11px] font-mono transition-colors"
                    style={{ color: "#6B7280" }}
                  >
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showPw ? "Hide password" : "Show password"}
                  </button>
                </div>
              </div>

              {/* Sign In button */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-2 rounded-lg py-3 font-bold text-[15px] transition-all disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#00D964",
                  color: "#0a0a0b",
                  opacity: loading || googleLoading ? 0.85 : 1,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ backgroundColor: "#26262B" }} />
              <span className="text-[11px] font-mono" style={{ color: "#4a4a4a" }}>or continue with</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "#26262B" }} />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-3 rounded-lg py-3 text-white text-[14px] font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B" }}
            >
              {googleLoading
                ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#00D964" }} />
                : <FcGoogle className="w-5 h-5" />
              }
              Continue with Google
            </button>

            {/* Footer */}
            <p className="text-center text-[13px] mt-6" style={{ color: "#6B7280" }}>
              Don&apos;t have an account?{" "}
              <Link href="/account/signup" className="font-semibold" style={{ color: "#00D964" }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom note */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center z-10">
        <p className="text-[11px] font-mono" style={{ color: "#2a2a2a" }}>
          · Account Centre · personal tools · not for public registration
        </p>
      </div>
    </main>
  );
}
