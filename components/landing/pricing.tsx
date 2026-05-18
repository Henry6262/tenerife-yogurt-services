"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

const plans = [
  {
    name: "Gratis",
    price: "0",
    description: "Para probar la plataforma",
    features: [
      "1 agente IA personalizado",
      "Hasta 50 reservas/mes",
      "Chat básico con reglas",
      "Widget de reservas",
      "Notificaciones por WhatsApp",
    ],
    cta: "Empezar gratis",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "29",
    description: "Para salones en crecimiento",
    features: [
      "Todo lo de Gratis",
      "Reservas ilimitadas",
      "IA con GPT-4o-mini",
      "Depósitos con Stripe",
      "Recordatorios automáticos",
      "Email de confirmación",
      "Soporte prioritario",
    ],
    cta: "Empezar prueba",
    href: "/sign-up",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "79",
    description: "Para cadenas y spas",
    features: [
      "Todo lo de Pro",
      "Múltiples locales",
      "Analytics avanzados",
      "API personalizada",
      "Integración con Instagram",
      "Onboarding personalizado",
      "Soporte 24/7",
    ],
    cta: "Contactar",
    href: "mailto:hola@tenerifeai.com",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section className="relative py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Precios simples</h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            Empieza gratis y escala cuando tu negocio crezca. Sin comisiones por reserva.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 0.12}>
              <div
                className={`relative rounded-2xl p-6 h-full transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlighted
                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/30 scale-[1.02] hover:shadow-slate-900/50"
                    : "bg-white border border-slate-200 hover:border-blue-200 hover:shadow-lg"
                }`}
              >
                {/* Glow effect for highlighted plan */}
                {plan.highlighted && (
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-blue-500/20 to-cyan-500/20 opacity-50 blur-sm" />
                )}

                <div className="relative z-10">
                  <div className="mb-4">
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <p
                      className={`text-sm ${
                        plan.highlighted ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}€</span>
                    <span
                      className={`text-sm ${
                        plan.highlighted ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      /mes
                    </span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            plan.highlighted ? "text-blue-400" : "text-emerald-500"
                          }`}
                        />
                        <span
                          className={
                            plan.highlighted ? "text-slate-300" : "text-slate-600"
                          }
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] ${
                      plan.highlighted
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
