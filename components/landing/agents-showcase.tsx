"use client";

import Link from "next/link";
import { ArrowRight, Bot, MessageCircle } from "lucide-react";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { SpotlightCard } from "@/components/animations/spotlight-card";

interface Agent {
  slug: string;
  agentName: string;
  businessName: string;
  tone: string;
  greeting: string;
  primaryColor: string;
}

interface AgentsShowcaseProps {
  agents: Agent[];
}

export function AgentsShowcase({ agents }: AgentsShowcaseProps) {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4">
        <ScrollReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-4">
            <Bot className="h-4 w-4" />
            Agentes Inteligentes
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            Conoce a nuestros <span className="text-gradient-blue">agentes IA</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Cada negocio tiene su propia personalidad. Habla con ellos y reserva al instante.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {agents.map((agent, i) => (
            <ScrollReveal key={agent.slug} delay={i * 0.15}>
              <Link href={`/agent/${agent.slug}`}>
                <SpotlightCard
                  className="h-full group cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  spotlightColor={`${agent.primaryColor}12`}
                >
                  <div className="p-6">
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: agent.primaryColor }}
                      >
                        {agent.agentName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{agent.agentName}</h3>
                        <p className="text-xs text-slate-500">{agent.businessName}</p>
                      </div>
                    </div>

                    {/* Tone badge */}
                    <div
                      className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-4"
                      style={{
                        backgroundColor: `${agent.primaryColor}15`,
                        color: agent.primaryColor,
                      }}
                    >
                      {agent.tone}
                    </div>

                    {/* Greeting preview */}
                    <p className="text-sm text-slate-600 leading-relaxed mb-6 line-clamp-3">
                      &ldquo;{agent.greeting.slice(0, 120)}...&rdquo;
                    </p>

                    {/* CTA */}
                    <div
                      className="flex items-center gap-2 text-sm font-semibold transition-transform duration-300 group-hover:gap-3"
                      style={{ color: agent.primaryColor }}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Hablar ahora
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </SpotlightCard>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
