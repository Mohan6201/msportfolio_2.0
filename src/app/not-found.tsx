import Link from "next/link";
import { Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-darkBrown grid-bg flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Glitch 404 */}
        <div className="relative mb-8 inline-block">
          <p className="text-[8rem] sm:text-[10rem] font-special font-black leading-none gradient-text glitch select-none">
            404
          </p>
        </div>

        {/* Terminal block */}
        <div className="terminal mb-8 text-left">
          <div className="terminal-bar gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-orange/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green/70" />
            <span className="font-mono text-xs text-lightGrey/50 ml-2">bash</span>
          </div>
          <div className="terminal-body">
            <p><span className="terminal-prompt">$ cd</span> <span className="text-white">/this-page</span></p>
            <p className="text-red/80 mt-1">bash: /this-page: No such file or directory</p>
            <p className="terminal-prompt mt-2">$ ls / <span className="terminal-cursor" /></p>
          </div>
        </div>

        <p className="text-lightGrey mb-8 text-sm font-mono">
          The page you&apos;re looking for doesn&apos;t exist — or was moved.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan text-black font-mono font-bold text-sm hover:bg-lightCyan transition-colors shadow-cyanShadow">
            <Terminal className="w-4 h-4" /> Go Home
          </Link>
          <Link href="/blog"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-lightBrown/40 text-lightGrey font-mono text-sm hover:border-cyan/30 hover:text-cyan transition-all">
            Read Blog →
          </Link>
        </div>
      </div>
    </main>
  );
}
