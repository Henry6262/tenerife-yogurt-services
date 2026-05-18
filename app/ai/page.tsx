import { AIChat } from "@/components/ai-chat";
import { GradientMesh } from "@/components/animations/gradient-mesh";
import { DotGrid } from "@/components/animations/dot-grid";

export default function AIPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden">
      {/* Animated mesh gradient background — AI theme */}
      <GradientMesh
        colors={["#8b5cf6", "#ec4899", "#3b82f6"]}
        speed={0.6}
        blur={120}
        noiseOpacity={0.01}
        baseColor="#0f172a"
      />

      {/* Subtle dot grid overlay */}
      <DotGrid
        color="rgba(255,255,255,0.06)"
        spacing={60}
        size={1}
        animated={true}
        className="opacity-40"
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-slate-950/70 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="px-4 pt-6 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-400 uppercase tracking-wide">
              AI Concierge
            </span>
          </div>
          <h1 className="text-xl font-bold text-white">Dime qué necesitas</h1>
          <p className="text-sm text-slate-400">
            Habla o escribe. Busco citas disponibles en tiempo real.
          </p>
        </div>
        <AIChat />
      </div>
    </div>
  );
}
