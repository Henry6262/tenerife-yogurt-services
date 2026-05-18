"use client";

import { Mic, Search, CalendarCheck } from "lucide-react";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { DotGrid } from "@/components/animations/dot-grid";

const steps = [
  {
    icon: Mic,
    title: "Habla o escribe",
    description: "Di lo que necesitas: \"Necesito un corte de pelo urgente\" o \"Un masaje para mañana\".",
    color: "#2563eb",
    bgColor: "#eff6ff",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Search,
    title: "La IA busca",
    description: "Tu agente consulta todos los horarios disponibles y te presenta las mejores opciones.",
    color: "#0891b2",
    bgColor: "#ecfeff",
    gradient: "from-cyan-500/20 to-teal-500/20",
  },
  {
    icon: CalendarCheck,
    title: "Reserva confirmada",
    description: "Elige tu slot favorito y confirma. Recibirás recordatorio por WhatsApp o SMS.",
    color: "#059669",
    bgColor: "#ecfdf5",
    gradient: "from-emerald-500/20 to-green-500/20",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-24 bg-slate-50 overflow-hidden">
      {/* DotGrid background */}
      <DotGrid
        color="rgba(37,99,235,0.08)"
        spacing={48}
        size={1.5}
        animated={true}
        className="opacity-60"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        <ScrollReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-4">
            <CalendarCheck className="h-4 w-4" />
            Cómo funciona
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            Así de <span className="text-gradient-blue">simple</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Tres pasos. Cero llamadas. Tu cita reservada en menos de un minuto.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <ScrollReveal key={step.title} delay={i * 0.15}>
              <div className="relative glass-card p-8 text-center h-full group hover:-translate-y-1.5 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(37,99,235,0.12)]">
                {/* Gradient glow on hover */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10">
                  {/* Step number */}
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Paso {i + 1}
                  </div>

                  {/* Icon */}
                  <div
                    className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: step.bgColor }}
                  >
                    <step.icon className="h-6 w-6" style={{ color: step.color }} />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
