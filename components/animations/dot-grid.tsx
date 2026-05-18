"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface DotGridProps {
  color?: string;
  spacing?: number;
  size?: number;
  animated?: boolean;
  className?: string;
}

export const DotGrid = forwardRef<HTMLDivElement, DotGridProps>(
  (
    { color = "rgba(255,255,255,0.15)", spacing = 40, size = 2, animated = true, className },
    ref
  ) => {
    return (
      <div ref={ref} className={cn("absolute inset-0", className)}>
        <svg className="h-full w-full">
          <defs>
            <pattern id="dot-grid" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
              <circle
                cx={spacing / 2}
                cy={spacing / 2}
                r={size}
                fill={color}
                style={animated ? { animation: "dotPulse 3s ease-in-out infinite" } : undefined}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>
        <style>{`
          @keyframes dotPulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.7; }
          }
        `}</style>
      </div>
    );
  }
);

DotGrid.displayName = "DotGrid";
