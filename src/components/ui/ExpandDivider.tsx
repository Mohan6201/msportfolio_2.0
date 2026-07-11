"use client";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

interface ExpandDividerProps {
  expanded: boolean;
  onToggle: () => void;
  caption?: string;
}

/** A horizontal divider line with a circular expand/collapse button blended into it. */
export default function ExpandDivider({ expanded, onToggle, caption }: ExpandDividerProps) {
  return (
    <div className="flex flex-col items-center gap-2 mt-8">
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
        <button
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={expanded ? "Show less" : "Show more"}
          className="w-10 h-10 rounded-full border border-white/10 bg-darkBrown flex items-center justify-center text-lightGrey hover:border-cyan/40 hover:text-cyan hover:bg-cyan/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan/60 shrink-0"
        >
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </button>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
      </div>
      {caption && (
        <p className="text-[10px] font-mono text-lightGrey/40">{caption}</p>
      )}
    </div>
  );
}
