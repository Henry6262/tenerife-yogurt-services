"use client";

import { Bot, Clock, Shield, Zap, TrendingUp, Users } from "lucide-react";
import AnimatedContent from "@/components/react-bits/animated-content";
import { SpotlightCard } from "@/components/animations/spotlight-card";

const features = [
  {
    icon: Bot,
    title: "Tu propia IA",
    description: "Cada negocio crea su agente con nombre, personalidad y tono propios.",
    color: "#2563eb",
    size: "large",
  },
  {
    icon: Clock,
    title: "24/7 Disponible",
    description: "Nunca pierdas una cita por no poder atender el teléfono.",
    color: "#0891b2",
    size: "small",
  },
  {
    icon: Zap,
    title: "Reserva en segundos",
    description: "La IA entiende lo que necesitas y encuentra el mejor horario al instante.",
    color: "#d97706",
    size: "small",
  },
  {
    icon: Shield,
    title: "Kit Digital gratis",
    description: "Puede salirte gratis con la ayuda del gobierno español para digitalización.",
    color: "#059669",
    size: "large",
  },
  {
    icon: TrendingUp,
    title: "Más reservas",
    description: "Recupera las citas que pierdes por no atender llamadas en horario punta.",
    color: "#7c3aed",
    size: "small",
  },
  {
    icon: Users,
    title: "Clientes felices",
    description: "Tus clientes reservan cuando quieren, sin esperar ni llamar.",
    color: "#db2777",
    size: "small",
  },
];

export function Features() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4">
        <AnimatedContent className="text-center mb-16" distance={50}>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            Todo lo que <span className="text-gradient-blue">necesitas</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Una plataforma completa para digitalizar tu negocio y nunca perder una cita.
          </p>
        </AnimatedContent>

        <div className="grid md:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <AnimatedContent
              key={feature.title}
              delay={i * 0.1}
              className={feature.size === "large" ? "md:col-span-2" : ""}
              distance={50}
            >
              <SpotlightCard
                className="h-full group transition-all duration-300 hover:shadow-[0_8px_40px_rgba(37,99,235,0.1)]"
                spotlightColor={`${feature.color}08`}
              >
                <div className="p-6">
                  <div
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${feature.color}12` }}
                  >
                    <feature.icon className="h-5 w-5" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                </div>
              </SpotlightCard>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
}
