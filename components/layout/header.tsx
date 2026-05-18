"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Bot, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-4 mt-3">
        <div className="glass rounded-2xl border border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="flex h-14 items-center justify-between px-5">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Tenerife<span className="text-blue-600">AI</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition">
                Inicio
              </Link>
              <Link href="/ai" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition">
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" /> IA Concierge
                </span>
              </Link>
              <Link href="/book" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Reservar
                </span>
              </Link>
              <Link href="/bookings" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition">
                Mis Citas
              </Link>
            </nav>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-2">
              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm">Iniciar sesión</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button size="sm">Crear cuenta</Button>
                  </SignUpButton>
                </>
              ) : (
                <>
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">Panel</Button>
                  </Link>
                  <UserButton />
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden border-t border-slate-100 px-5 py-4 space-y-2">
              <Link href="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100">Inicio</Link>
              <Link href="/ai" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100">IA Concierge</Link>
              <Link href="/book" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100">Reservar</Link>
              <Link href="/bookings" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100">Mis Citas</Link>
              {isSignedIn && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100">Panel</Link>
              )}
              <div className="pt-2 border-t border-slate-100">
                {!isSignedIn ? (
                  <>
                    <SignInButton mode="modal">
                      <Button variant="ghost" size="sm" className="w-full">Iniciar sesión</Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button size="sm" className="w-full mt-2">Crear cuenta</Button>
                    </SignUpButton>
                  </>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2">
                    <UserButton />
                    <span className="text-sm text-slate-600">Mi cuenta</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
