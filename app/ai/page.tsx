import { AIChat } from "@/components/ai-chat";

export default function AIPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
            AI Concierge
          </span>
        </div>
        <h1 className="text-xl font-bold text-slate-900">Dime qué necesitas</h1>
        <p className="text-sm text-slate-500">
          Habla o escribe. Busco citas disponibles en tiempo real.
        </p>
      </div>
      <AIChat />
    </div>
  );
}
