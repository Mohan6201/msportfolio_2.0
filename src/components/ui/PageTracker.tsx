"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Skip tracking for admin and account routes
const SKIP_PREFIXES = ["/admin", "/account", "/api"];

export default function PageTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;
    if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return;

    lastPath.current = pathname;
    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
