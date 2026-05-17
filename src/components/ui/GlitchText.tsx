"use client";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export default function GlitchText({ children, className, as: Tag = "span" }: Props) {
  return (
    <Tag className={cn("glitch inline-block", className)}>
      {children}
    </Tag>
  );
}
