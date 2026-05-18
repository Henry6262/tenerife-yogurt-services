"use client";

import Link from "next/link";
import { MapPin, Phone, ArrowRight, ExternalLink } from "lucide-react";
import AnimatedContent from "@/components/react-bits/animated-content";
import { SpotlightCard } from "@/components/animations/spotlight-card";
import { DotGrid } from "@/components/animations/dot-grid";

interface Business {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  services: { id: string; name: string }[];
  agentConfig?: { agentName: string; primaryColor: string } | null;
}

interface BusinessesShowcaseProps {
  businesses: Business[];
}

export function BusinessesShowcase({ businesses }: BusinessesShowcaseProps) {
  return (
    <section className="relative py-24 bg-slate-50 overflow-hidden">
      {/* Subtle dot grid */}
      <DotGrid
        color="rgba(37,99,235,0.06)"
        spacing={60}
        size={1}
        animated={false}
        className="opacity-40"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        <AnimatedContent className="text-center mb-16" distance={50}>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            Negocios <span className="text-gradient-blue">destacados</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Salones, barberías y spas que ya usan nuestra IA para atender a sus clientes.
          </p>
        </AnimatedContent>

        <div className="grid md:grid-cols-2 gap-6">
          {businesses.map((biz, i) => (
            <AnimatedContent key={biz.id} delay={i * 0.1} distance={60}>
              <SpotlightCard className="h-full group transition-all duration-300 hover:-translate-y-0.5">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{biz.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {biz.address}
                      </div>
                    </div>
                    {biz.agentConfig && (
                      <div
                        className="px-2.5 py-1 rounded-full text-xs font-semibold transition-transform duration-300 group-hover:scale-105"
                        style={{
                          backgroundColor: `${biz.agentConfig.primaryColor}15`,
                          color: biz.agentConfig.primaryColor,
                        }}
                      >
                        {biz.agentConfig.agentName}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 my-4">
                    {biz.services.slice(0, 4).map((s) => (
                      <span
                        key={s.id}
                        className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        {s.name}
                      </span>
                    ))}
                    {biz.services.length > 4 && (
                      <span className="text-xs text-slate-400 px-1">
                        +{biz.services.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Phone className="h-3.5 w-3.5" />
                      {biz.phone}
                    </div>
                    <div className="flex items-center gap-3">
                      {biz.agentConfig && (
                        <Link
                          href={`/agent/${biz.slug}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                          style={{ color: biz.agentConfig.primaryColor }}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Agent
                        </Link>
                      )}
                      <Link
                        href={`/book?business=${biz.slug}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 group/link"
                      >
                        Reservar
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
}
