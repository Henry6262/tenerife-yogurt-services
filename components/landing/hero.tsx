"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientMesh } from "@/components/animations/gradient-mesh";
import { BlurText } from "@/components/animations/blur-text";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Animated gradient mesh background */}
      <GradientMesh
        colors={["#2563eb", "#0891b2", "#6366f1"]}
        speed={0.8}
        blur={100}
        noiseOpacity={0.015}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-slate-900/80" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-blue-300 text-sm font-medium mb-8 backdrop-blur-sm">
          <Sparkles className="h-4 w-4" />
          La primera IA de reservas de Tenerife
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
          <BlurText text="Tu cita de belleza," delay={0.2} duration={0.8} />
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300">
            <BlurText text="sin llamadas" delay={0.6} duration={0.8} />
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Cada negocio tiene su propia IA personalizada. Habla con ella, reserva tu cita,
          y olvídate de las llamadas perdidas para siempre.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="rounded-full px-8 text-lg gap-2 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/25">
            <Link href="/ai" className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Probar IA Concierge
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-8 text-lg gap-2 border-white/20 text-white hover:bg-white/10 hover:text-white">
            <Link href="/admin/agent" className="flex items-center gap-2">
              Soy un negocio
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { value: "3", label: "IA Activas" },
            { value: "24/7", label: "Disponible" },
            { value: "0€", label: "Con Kit Digital" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500">
        <span className="text-xs uppercase tracking-widest">Descubre más</span>
        <div className="w-5 h-8 rounded-full border-2 border-slate-600 flex items-start justify-center p-1">
          <div className="w-1 h-2 bg-blue-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
