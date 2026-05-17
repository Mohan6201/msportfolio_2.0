"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, X, Terminal, BookOpen, Mail, User, Briefcase, Award, Code2, Database, FileText } from "lucide-react";
import { FiGithub as GithubIcon } from "react-icons/fi";
import { Link } from "react-scroll";
import NextLink from "next/link";

const NAV_ITEMS = [
  { id: "about",       label: "About Me",     icon: User,      type: "scroll" },
  { id: "skills",      label: "Skills",        icon: Terminal,  type: "scroll" },
  { id: "experience",  label: "Experience",    icon: Briefcase, type: "scroll" },
  { id: "projects",    label: "Projects",      icon: Code2,     type: "scroll" },
  { id: "github",      label: "GitHub",        icon: GithubIcon, type: "scroll" },
  { id: "knowledge",   label: "KT Centre",     icon: Database,  type: "scroll" },
  { id: "certificates",label: "Certifications",icon: Award,     type: "scroll" },
  { id: "resume",      label: "Resume",        icon: FileText,  type: "scroll" },
  { id: "contact",     label: "Contact",       icon: Mail,      type: "scroll" },
  { id: "/blog",       label: "Blog",          icon: BookOpen,  type: "link" },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = NAV_ITEMS.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 80); }
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999]"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -16 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-lg z-[1000] mx-4"
            >
              <div className="terminal rounded-xl overflow-hidden shadow-2xl shadow-cyan/10">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-cyan/10">
                  <Search className="w-4 h-4 text-cyan flex-shrink-0" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Navigate to..."
                    className="flex-1 bg-transparent text-white placeholder-lightGrey/50 outline-none text-sm font-mono"
                  />
                  <button onClick={() => setOpen(false)} className="text-lightGrey hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="py-2 max-h-72 overflow-y-auto">
                  {filtered.map((item) => {
                    const Icon = item.icon;
                    if (item.type === "scroll") {
                      return (
                        <Link
                          key={item.id}
                          to={item.id}
                          smooth duration={600}
                          offset={-100}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-cyan/5 cursor-pointer group transition-colors"
                        >
                          <Icon className="w-4 h-4 text-cyan flex-shrink-0" />
                          <span className="text-white text-sm font-mono group-hover:text-cyan transition-colors">{item.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-lightGrey ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      );
                    }
                    return (
                      <NextLink
                        key={item.id}
                        href={item.id}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-cyan/5 cursor-pointer group transition-colors"
                      >
                        <Icon className="w-4 h-4 text-cyan flex-shrink-0" />
                        <span className="text-white text-sm font-mono group-hover:text-cyan transition-colors">{item.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-lightGrey ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </NextLink>
                    );
                  })}
                  {filtered.length === 0 && (
                    <p className="text-center text-lightGrey text-xs py-6 font-mono">No results found</p>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-cyan/08 flex gap-4 text-[10px] text-lightGrey font-mono">
                  <span><kbd className="px-1.5 py-0.5 rounded bg-darkGrey text-xs">↑↓</kbd> navigate</span>
                  <span><kbd className="px-1.5 py-0.5 rounded bg-darkGrey text-xs">↵</kbd> go</span>
                  <span><kbd className="px-1.5 py-0.5 rounded bg-darkGrey text-xs">esc</kbd> close</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-lightBrown/50 text-lightGrey hover:border-cyan/40 hover:text-cyan transition-all duration-200 text-xs font-mono"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Search</span>
        <kbd className="ml-1 px-1.5 py-0.5 rounded bg-darkGrey text-[10px]">⌘K</kbd>
      </button>
    </>
  );
}
