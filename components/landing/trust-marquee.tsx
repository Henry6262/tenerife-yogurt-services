"use client";

import { Marquee } from "@/components/animations/marquee";
import AnimatedContent from "@/components/react-bits/animated-content";

const categories = [
  "Peluquería",
  "Barbería",
  "Manicura",
  "Pedicura",
  "Masaje",
  "Spa",
  "Facial",
  "Tinte",
  "Depilación",
  "Maquillaje",
  "Uñas",
  "Bienestar",
];

export function TrustMarquee() {
  return (
    <section className="py-12 border-y border-slate-100 bg-slate-50/50 overflow-hidden">
      <AnimatedContent>
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]">
            Servicios disponibles
          </p>
        </div>
      </AnimatedContent>
      <Marquee pauseOnHover speed="slow">
        {categories.map((cat) => (
          <div
            key={cat}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600 whitespace-nowrap hover:border-blue-300 hover:text-blue-600 hover:shadow-md hover:shadow-blue-100/50 transition-all duration-300 cursor-default"
          >
            {cat}
          </div>
        ))}
      </Marquee>
    </section>
  );
}
