"use client";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const raw = useMotionValue(0);
  const smooth = useSpring(raw, { stiffness: 200, damping: 40 });

  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const pct = el.scrollTop / (el.scrollHeight - el.clientHeight);
      raw.set(isNaN(pct) ? 0 : pct);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [raw]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left"
      style={{
        scaleX: smooth,
        background: "linear-gradient(90deg, #15d1e9 0%, #fb9718 50%, #15d1e9 100%)",
      }}
    />
  );
}
