"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-scroll";
import NextLink from "next/link";
import { Menu, X } from "lucide-react";
import CommandPalette from "@/components/ui/CommandPalette";
import ThemeToggle from "@/domains/profile/components/navbar/ThemeToggle";
import { FiGithub, FiLinkedin } from "react-icons/fi";

const NAV_LINKS = [
  { label: "About",      to: "about",        type: "scroll" },
  { label: "Experience", to: "experience",   type: "scroll" },
  { label: "Skills",     to: "skills",       type: "scroll" },
  { label: "Projects",   to: "projects",     type: "scroll" },
  { label: "Contact",    to: "contact",      type: "scroll" },
];

export default function NavbarMain() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      scrolled
        ? "bg-black/88 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/40"
        : "bg-transparent"
    )}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NextLink href="/" className="flex items-center gap-2.5 group">
            <img
              src="/icons/Actual_Logo.ico"
              alt="MS Logo"
              className="w-8 h-8 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]"
            />
            <span className="font-mono font-semibold text-white text-sm hidden sm:block tracking-tight">
              Mohana Srinivasan
            </span>
          </NextLink>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((item) =>
              isHome ? (
                <Link
                  key={item.label}
                  to={item.to}
                  smooth duration={600}
                  offset={-80}
                  className="px-3 py-2 text-sm font-mono text-lightGrey hover:text-cyan cursor-pointer transition-colors duration-200 rounded-lg hover:bg-cyan/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60 relative group"
                >
                  {item.label}
                  <span className="absolute bottom-1 left-3 right-3 h-[1px] bg-cyan origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </Link>
              ) : (
                <NextLink
                  key={item.label}
                  href={`/#${item.to}`}
                  className="px-3 py-2 text-sm font-mono text-lightGrey hover:text-cyan transition-colors duration-200 rounded-lg hover:bg-cyan/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60 relative group"
                >
                  {item.label}
                  <span className="absolute bottom-1 left-3 right-3 h-[1px] bg-cyan origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </NextLink>
              )
            )}
          </div>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-2">
            <CommandPalette />
            <a href="https://github.com/Mohan6201" target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-lightGrey hover:text-white hover:bg-white/5 transition-all duration-200">
              <FiGithub className="w-4 h-4" />
            </a>
            <a href="https://www.linkedin.com/in/mohan6201" target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-lightGrey hover:text-cyan hover:bg-cyan/5 transition-all duration-200">
              <FiLinkedin className="w-4 h-4" />
            </a>
            {isHome ? (
              <Link to="contact" smooth duration={600} offset={-80} className="cursor-pointer">
                <motion.button whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg bg-cyan text-black text-sm font-mono font-bold hover:bg-lightCyan transition-colors duration-200 shadow-cyanShadow">
                  Hire Me →
                </motion.button>
              </Link>
            ) : (
              <NextLink href="/#contact">
                <motion.button whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg bg-cyan text-black text-sm font-mono font-bold hover:bg-lightCyan transition-colors duration-200 shadow-cyanShadow">
                  Hire Me →
                </motion.button>
              </NextLink>
            )}
          </div>

          {/* Theme toggle — always visible, both mobile and desktop */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Mobile toggle */}
            <button onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-lightBrown/40 text-lightGrey hover:text-white hover:border-cyan/30 transition-all">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="lg:hidden overflow-hidden border-t border-white/5 bg-black/94 backdrop-blur-xl"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((item) =>
                isHome ? (
                  <Link key={item.label} to={item.to} smooth duration={600} offset={-80}
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2.5 text-sm font-mono text-lightGrey hover:text-cyan hover:bg-cyan/5 rounded-lg cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60">
                    <span className="text-green mr-2">$</span>{item.label}
                  </Link>
                ) : (
                  <NextLink key={item.label} href={`/#${item.to}`}
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2.5 text-sm font-mono text-lightGrey hover:text-cyan hover:bg-cyan/5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60">
                    <span className="text-green mr-2">$</span>{item.label}
                  </NextLink>
                )
              )}
              <div className="pt-3 mt-2 border-t border-white/5">
                {isHome ? (
                  <Link to="contact" smooth duration={600} offset={-80} onClick={() => setMenuOpen(false)}>
                    <button className="w-full py-2.5 rounded-lg bg-cyan text-black text-sm font-mono font-bold hover:bg-lightCyan transition-colors">
                      Hire Me →
                    </button>
                  </Link>
                ) : (
                  <NextLink href="/#contact" onClick={() => setMenuOpen(false)}>
                    <button className="w-full py-2.5 rounded-lg bg-cyan text-black text-sm font-mono font-bold hover:bg-lightCyan transition-colors">
                      Hire Me →
                    </button>
                  </NextLink>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
