"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Bot, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex h-11 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5">
            <div className={`flex h-7 w-7 items-center justify-center rounded-md text-white transition-colors ${scrolled ? "bg-blue-600" : "bg-white/20"}`}>
              <Bot className="h-4 w-4" />
            </div>
            <span className={`text-base font-bold tracking-tight transition-colors ${scrolled ? "text-slate-900" : "text-white"}`}>
              Bookit<span className={scrolled ? "text-blue-600" : "text-blue-400"}>AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "/", label: "Inicio" },
              { href: "/ai", label: "IA Concierge", icon: MessageCircle },
              { href: "/book", label: "Reservar", icon: Calendar },
              { href: "/bookings", label: "Mis Citas" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2.5 py-1 text-sm font-medium rounded-md transition ${
                  scrolled
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-1">
                  {item.icon && <item.icon className="h-3 w-3" />}
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-1.5">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className={`text-sm h-8 ${scrolled ? "" : "text-white/80 hover:text-white hover:bg-white/10"}`}>
                    Iniciar sesión
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm" className="text-sm h-8 bg-blue-600 hover:bg-blue-500">Crear cuenta</Button>
                </SignUpButton>
              </>
            ) : (
              <>
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className={`text-sm h-8 ${scrolled ? "" : "text-white/80 hover:text-white hover:bg-white/10"}`}>Panel</Button>
                </Link>
                <UserButton />
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-1.5 rounded-md transition ${
              scrolled
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 py-3 space-y-1 rounded-b-xl mb-2 shadow-lg">
            {[
              { href: "/", label: "Inicio" },
              { href: "/ai", label: "IA Concierge" },
              { href: "/book", label: "Reservar" },
              { href: "/bookings", label: "Mis Citas" },
              ...(isSignedIn ? [{ href: "/admin", label: "Panel" }] : []),
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100">
              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm" className="w-full text-sm">Iniciar sesión</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button size="sm" className="w-full mt-1.5 text-sm">Crear cuenta</Button>
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
    </header>
  );
}
