"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient();

export default function RecruiterLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? "Invalid credentials");
      } else {
        router.push("/recruiter");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-darkBrown flex items-center justify-center px-4">
      <div className="glass rounded-2xl border border-white/10 p-8 w-full max-w-sm">
        <div className="mb-6">
          <p className="text-cyan text-[10px] font-mono uppercase tracking-widest mb-1">Recruiter Portal</p>
          <h1 className="font-special text-2xl font-bold text-white mb-1">Welcome Back</h1>
          <p className="text-lightGrey text-sm font-mono">MS Portfolio · Talent View</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono text-lightGrey mb-1">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyan/50"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-lightGrey mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyan/50"
            />
          </div>

          {error && <p className="text-red text-xs font-mono">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan text-black font-mono font-bold text-sm py-2.5 rounded-lg hover:bg-lightCyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs font-mono text-lightGrey mt-6">
          No account?{" "}
          <Link href="/recruiter/signup" className="text-cyan hover:underline">
            Request access
          </Link>
        </p>
      </div>
    </main>
  );
}
