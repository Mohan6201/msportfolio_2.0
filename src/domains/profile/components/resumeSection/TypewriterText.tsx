"use client";
import { useState, useEffect } from "react";

interface TypewriterTextProps {
  texts: string[];
  speed?: number;
}

const TypewriterText = ({ texts, speed = 100 }: TypewriterTextProps) => {
  const [displayed, setDisplayed] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplayed(current.slice(0, charIndex + 1));
        if (charIndex + 1 === current.length) {
          setTimeout(() => setDeleting(true), 1200);
        } else {
          setCharIndex((c) => c + 1);
        }
      } else {
        setDisplayed(current.slice(0, charIndex - 1));
        if (charIndex === 0) {
          setDeleting(false);
          setTextIndex((t) => (t + 1) % texts.length);
        } else {
          setCharIndex((c) => c - 1);
        }
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, textIndex, texts, speed]);

  return <span>{displayed}<span className="animate-pulse">|</span></span>;
};

export default TypewriterText;
