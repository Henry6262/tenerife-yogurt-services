"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function YogurtNav() {
  const { totalItems } = useCart();

  return (
    <div className="fixed top-4 right-4 z-50">
      <Link
        href="/yogurt/cart"
        className="flex items-center gap-2 rounded-full bg-white border border-stone-200 px-4 py-2 shadow-sm hover:shadow-md transition"
      >
        <span className="text-lg">🛒</span>
        <span className="text-sm font-medium">
          {totalItems > 0
            ? `${totalItems} artículo${totalItems > 1 ? "s" : ""}`
            : "Carrito"}
        </span>
      </Link>
    </div>
  );
}
