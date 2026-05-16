"use client";

import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  if (pathname?.startsWith("/yogurt")) return null;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="font-bold text-lg text-rose-600">
          Tenerife Services
        </a>
        <nav className="flex gap-4 text-sm">
          <a href="/" className="text-gray-600 hover:text-gray-900">Explorar</a>
          <a href="/book" className="text-gray-600 hover:text-gray-900">Reservar</a>
          <a href="/admin" className="text-gray-600 hover:text-gray-900">Admin</a>
        </nav>
      </div>
    </header>
  );
}
