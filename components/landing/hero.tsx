"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Threads from "@/components/react-bits/threads";
import BlurText from "@/components/react-bits/blur-text";
import ShinyText from "@/components/react-bits/shiny-text";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      {/* React Bits Threads background */}
      <div className="absolute inset-0">
        <Threads
          color={[0.35, 0.55, 1]}
          amplitude={1.2}
          distance={0.3}
          enableMouseInteraction={true}
        />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-slate-950/80 pointer-events-none" />

      {/* Bottom gradient transition — fades dark hero into light sections below */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-50 via-slate-950/60 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-blue-300 text-sm font-medium mb-8 backdrop-blur-sm">
          <Sparkles className="h-4 w-4" />
          La primera IA de reservas de Tenerife
        </div>

        {/* Headline with BlurText */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
          <BlurText
            text="Tu cita de belleza,"
            delay={150}
            className="justify-center"
            animateBy="words"
            direction="top"
          />
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300">
            <BlurText
              text="sin llamadas"
              delay={300}
              className="justify-center"
              animateBy="words"
              direction="top"
            />
          </span>
        </h1>

        {/* Subheadline with ShinyText */}
        <div className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          <ShinyText
            text="Cada negocio tiene su propia IA personalizada. Habla con ella, reserva tu cita, y olvídate de las llamadas perdidas para siempre."
            speed={3}
            color="#94a3b8"
            shineColor="#ffffff"
            spread={90}
          />
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="rounded-full px-8 text-lg gap-2 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all hover:shadow-blue-600/40 hover:scale-105">
            <Link href="/ai" className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Probar IA Concierge
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-8 text-lg gap-2 border-white/20 text-white hover:bg-white/10 hover:text-white transition-all hover:scale-105">
            <Link href="/admin/agent" className="flex items-center gap-2">
              Soy un negocio
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Stats with glow */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { value: "3+", label: "IA Activas" },
            { value: "24/7", label: "Disponible" },
            { value: "0€", label: "Con Kit Digital" },
          ].map((stat) => (
            <div key={stat.label} className="text-center group">
              <div className="text-2xl sm:text-3xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.3)]">
                {stat.value}
              </div>
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
