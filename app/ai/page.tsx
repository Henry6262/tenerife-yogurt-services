import { AIChat } from "@/components/ai-chat";
import Aurora from "@/components/react-bits/aurora";

export default function AIPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden">
      {/* React Bits Aurora background */}
      <div className="absolute inset-0">
        <Aurora
          colorStops={["#8b5cf6", "#ec4899", "#3b82f6"]}
          amplitude={1.2}
          blend={0.6}
        />
      </div>

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
