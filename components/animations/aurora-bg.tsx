"use client";

import { cn } from "@/lib/utils";

interface AuroraBgProps {
  className?: string;
}

export function AuroraBg({ className }: AuroraBgProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Blob 1 — top right */}
      <div
        className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-30 animate-aurora"
        style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }}
      />
      {/* Blob 2 — bottom left */}
      <div
        className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 animate-aurora"
        style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)", animationDelay: "2s" }}
      />
      {/* Blob 3 — center */}
      <div
        className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[120px] opacity-15 animate-aurora"
        style={{ background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)", animationDelay: "4s" }}
      />
      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
