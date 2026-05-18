"use client";

import { forwardRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface TextTypeProps {
  text?: string;
  speed?: number;
  cursor?: boolean;
  className?: string;
  onComplete?: () => void;
}

export const TextType = forwardRef<HTMLSpanElement, TextTypeProps>(
  ({ text = "Typing Animation...", speed = 50, cursor = true, className, onComplete }, ref) => {
    const [displayText, setDisplayText] = useState("");
    const [showCursor, setShowCursor] = useState(cursor);

    useEffect(() => {
      setDisplayText("");
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.substring(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setShowCursor(false);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(interval);
    }, [text, speed, onComplete]);

    return (
      <span ref={ref} className={cn("relative", className)}>
        {displayText}
        {cursor && showCursor && <span className="ml-0.5 animate-pulse">|</span>}
      </span>
    );
  }
);

TextType.displayName = "TextType";
