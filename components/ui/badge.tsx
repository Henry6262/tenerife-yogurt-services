import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "ghost";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
        {
          "bg-blue-600 text-white": variant === "default",
          "bg-blue-50 text-blue-700": variant === "secondary",
          "border border-slate-200 text-slate-600": variant === "outline",
          "text-slate-500": variant === "ghost",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
