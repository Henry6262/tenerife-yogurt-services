"use client";

import { forwardRef, type ReactNode, useEffect, useRef as useLocalRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ScrollRevealProps {
  children?: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  once?: boolean;
}

export const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(
  (
    { children, direction = "up", delay = 0, duration = 0.6, distance = 30, className, once = true },
    ref
  ) => {
    const localRef = useLocalRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const el = (ref as React.RefObject<HTMLDivElement>)?.current || localRef.current;
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) observer.unobserve(el);
          } else if (!once) {
            setIsVisible(false);
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(el);
      return () => observer.disconnect();
    }, [ref, once]);

    const translateMap = {
      up: `translateY(${distance}px)`,
      down: `translateY(-${distance}px)`,
      left: `translateX(${distance}px)`,
      right: `translateX(-${distance}px)`,
    };

    return (
      <div
        ref={(ref as React.RefObject<HTMLDivElement>) || localRef}
        className={cn("transition-all will-change-[opacity,transform]", className)}
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translate(0, 0)" : translateMap[direction],
          transitionDuration: `${duration}s`,
          transitionDelay: `${delay}s`,
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {children}
      </div>
    );
  }
);

ScrollReveal.displayName = "ScrollReveal";
