"use client";

import { Mic, Search, CalendarCheck } from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";

const steps = [
  {
    icon: Mic,
    title: "Habla o escribe",
    description: "Di lo que necesitas: \"Necesito un corte de pelo urgente\" o \"Un masaje para mañana\".",
    color: "#2563eb",
    bgColor: "#eff6ff",
  },
  {
    icon: Search,
    title: "La IA busca",
    description: "Tu agente consulta todos los horarios disponibles y te presenta las mejores opciones.",
    color: "#0891b2",
    bgColor: "#ecfeff",
  },
  {
    icon: CalendarCheck,
    title: "Reserva confirmada",
    description: "Elige tu slot favorito y confirma. Recibirás recordatorio por WhatsApp o SMS.",
    color: "#059669",
    bgColor: "#ecfdf5",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-24 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4">
        <FadeIn className="text-center mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            Así de <span className="text-gradient-blue">simple</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Tres pasos. Cero llamadas. Tu cita reservada en menos de un minuto.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <FadeIn key={step.title} delay={i * 0.15}>
              <div className="glass-card p-8 text-center h-full group hover:-translate-y-1 transition-transform duration-300">
                {/* Step number */}
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Paso {i + 1}
                </div>

                {/* Icon */}
                <div
                  className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-5"
                  style={{ backgroundColor: step.bgColor }}
                >
                  <step.icon className="h-6 w-6" style={{ color: step.color }} />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
