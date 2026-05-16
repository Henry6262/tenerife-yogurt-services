"use client";

import { useEffect, useRef } from "react";

interface QRCodeProps {
  url: string;
  size?: number;
  color?: string;
}

export function QRCode({ url, size = 160, color = "#000000" }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Simple QR-like pattern generator (not real QR but scannable-looking for demo)
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cells = 25;
    const cellSize = size / cells;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Generate pseudo-random pattern from URL
    let seed = 0;
    for (let i = 0; i < url.length; i++) seed += url.charCodeAt(i);

    const rand = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    ctx.fillStyle = color;

    // Position patterns (corners)
    const drawPosition = (x: number, y: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
            ctx.fillRect((x + i) * cellSize, (y + j) * cellSize, cellSize, cellSize);
          }
        }
      }
    };
    drawPosition(0, 0);
    drawPosition(cells - 7, 0);
    drawPosition(0, cells - 7);

    // Data pattern
    for (let i = 0; i < cells; i++) {
      for (let j = 0; j < cells; j++) {
        if (i < 7 && j < 7) continue;
        if (i >= cells - 7 && j < 7) continue;
        if (i < 7 && j >= cells - 7) continue;
        if (rand(seed + i * cells + j) > 0.5) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [url, size, color]);

  return <canvas ref={canvasRef} width={size} height={size} className="rounded-lg" />;
}
