"use client";

import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-violet-400 to-purple-500",
  "from-cyan-400 to-blue-500",
  "from-lime-400 to-emerald-500",
];

function getGradient(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function getInitials(name: string) {
  const words = name.split(" ");
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

interface ProductImageProps {
  name: string;
  imageUrl?: string | null;
  className?: string;
}

export function ProductImage({ name, imageUrl, className }: ProductImageProps) {
  if (imageUrl) {
    return (
      <div className={cn("relative overflow-hidden rounded-xl", className)}>
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
    );
  }

  const gradient = getGradient(name);
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br",
        gradient,
        className
      )}
    >
      <div className="absolute inset-0 bg-white/10" />
      <span className="relative z-10 text-3xl font-black text-white/90 drop-shadow-lg">
        {initials}
      </span>
      {/* Decorative circles */}
      <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/10" />
      <div className="absolute -top-4 -left-4 h-12 w-12 rounded-full bg-white/10" />
    </div>
  );
}
