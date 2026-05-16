"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

export function BlurText({ text, className, delay = 0, duration = 0.8 }: BlurTextProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  const words = text.split(" ");

  return (
    <span className={cn("inline-flex flex-wrap gap-x-[0.25em]", className)}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block transition-all will-change-[filter,opacity,transform]"
          style={{
            filter: isVisible ? "blur(0px)" : "blur(12px)",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(10px)",
            transitionDuration: `${duration}s`,
            transitionDelay: `${delay + i * 0.08}s`,
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
