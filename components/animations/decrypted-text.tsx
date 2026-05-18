"use client";

import { forwardRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface DecryptedTextProps {
  text?: string;
  speed?: number;
  className?: string;
  revealOnMount?: boolean;
}

export const DecryptedText = forwardRef<HTMLSpanElement, DecryptedTextProps>(
  ({ text = "Decrypting...", speed = 50, className, revealOnMount = true }, ref) => {
    const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const [displayText, setDisplayText] = useState(text);
    const [progress, setProgress] = useState(0);
    const [started, setStarted] = useState(false);

    useEffect(() => {
      if (!revealOnMount) return;
      setStarted(true);
    }, [revealOnMount]);

    useEffect(() => {
      if (!started) return;
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 1) {
            clearInterval(interval);
            return 1;
          }
          return prev + 0.02;
        });
      }, speed);

      return () => clearInterval(interval);
    }, [started, text, speed]);

    useEffect(() => {
      const newText = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          const charProgress = i / text.length;
          if (charProgress < progress) {
            return char;
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
      setDisplayText(newText);
    }, [progress, text]);

    return (
      <span ref={ref} className={cn("font-mono", className)}>
        {displayText}
      </span>
    );
  }
);

DecryptedText.displayName = "DecryptedText";
