"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface GradientMeshProps {
  className?: string;
  speed?: number;
  colors?: string[];
  noiseOpacity?: number;
  blur?: number;
  baseColor?: string;
}

export function GradientMesh({
  className,
  speed = 1,
  colors = ["#2563eb", "#0891b2", "#6366f1"],
  noiseOpacity = 0.02,
  blur = 80,
  baseColor = "#0f172a",
}: GradientMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      time += 0.005 * speed;
      const w = canvas.width;
      const h = canvas.height;

      // Clear with dark slate base
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, w, h);

      // Create gradient mesh blobs — animated over time
      const blobs = [
        {
          x: w * 0.2 + Math.sin(time * 0.7) * w * 0.15,
          y: h * 0.35 + Math.cos(time * 0.5) * h * 0.1,
          radius: Math.min(w, h) * 0.45,
          color: colors[0],
        },
        {
          x: w * 0.8 + Math.cos(time * 0.6) * w * 0.12,
          y: h * 0.65 + Math.sin(time * 0.8) * h * 0.1,
          radius: Math.min(w, h) * 0.4,
          color: colors[1],
        },
        {
          x: w * 0.5 + Math.sin(time * 0.4 + 2) * w * 0.18,
          y: h * 0.25 + Math.cos(time * 0.6 + 1) * h * 0.12,
          radius: Math.min(w, h) * 0.35,
          color: colors[2],
        },
        {
          x: w * 0.6 + Math.cos(time * 0.3 + 1) * w * 0.1,
          y: h * 0.75 + Math.sin(time * 0.5 + 2) * h * 0.08,
          radius: Math.min(w, h) * 0.3,
          color: colors[0],
        },
      ];

      // Draw each blob with radial gradient
      blobs.forEach((blob) => {
        const gradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          blob.radius
        );
        gradient.addColorStop(0, blob.color + "50"); // 31% opacity
        gradient.addColorStop(0.5, blob.color + "20"); // 12% opacity
        gradient.addColorStop(1, blob.color + "00"); // 0% opacity

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      });

      // Blend mode overlay for depth
      ctx.globalCompositeOperation = "overlay";
      const overlayGradient = ctx.createLinearGradient(0, 0, w, h);
      overlayGradient.addColorStop(0, colors[0] + "10");
      overlayGradient.addColorStop(0.5, colors[1] + "08");
      overlayGradient.addColorStop(1, colors[2] + "05");
      ctx.fillStyle = overlayGradient;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      // Add subtle noise texture
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 255 * noiseOpacity;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
      }
      ctx.putImageData(imageData, 0, 0);

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [speed, colors, noiseOpacity, baseColor]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 w-full h-full", className)}
      style={{ filter: `blur(${blur}px)` }}
    />
  );
}
