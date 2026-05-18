"use client";

import { forwardRef, useMemo } from "react";
import { cn } from "@/lib/utils";

export interface ParticlesProps {
  color?: string;
  count?: number;
  speed?: number;
  size?: number;
  className?: string;
  connect?: boolean;
}

export const Particles = forwardRef<HTMLDivElement, ParticlesProps>(
  (
    { color = "#ffffff", count = 80, speed = 1, size = 2, className, connect = true },
    ref
  ) => {
    const particles = useMemo(() => {
      return Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.3 * speed,
        vy: (Math.random() - 0.5) * 0.3 * speed,
        size: Math.random() * size + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      }));
    }, [count, speed, size]);

    return (
      <div ref={ref} className={cn("absolute inset-0 overflow-hidden", className)}>
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: color,
              opacity: p.opacity,
              animation: `particleFloat ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
        {connect && (
          <svg className="absolute inset-0 h-full w-full opacity-10">
            {particles.map((p1, i) =>
              particles.slice(i + 1).map((p2, j) => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 15) {
                  return (
                    <line
                      key={`${i}-${j}`}
                      x1={`${p1.x}%`}
                      y1={`${p1.y}%`}
                      x2={`${p2.x}%`}
                      y2={`${p2.y}%`}
                      stroke={color}
                      strokeWidth="0.5"
                      opacity={0.3 * (1 - dist / 15)}
                    />
                  );
                }
                return null;
              })
            )}
          </svg>
        )}
        <style>{`
          @keyframes particleFloat {
            0%, 100% { transform: translateY(0); opacity: 0.6; }
            50% { transform: translateY(-20px); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }
);

Particles.displayName = "Particles";
