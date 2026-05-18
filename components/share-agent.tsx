"use client";

import { useState } from "react";
import { QRCode } from "./qr-code";
import { Copy, ExternalLink, Share2, Code } from "lucide-react";

interface ShareAgentProps {
  businessSlug: string;
  businessName: string;
  agentName: string;
  primaryColor: string;
}

export function ShareAgent({ businessSlug, businessName, agentName, primaryColor }: ShareAgentProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tenerife-services-indol.vercel.app";
  const agentUrl = `${baseUrl}/agent/${businessSlug}`;
  const widgetUrl = `${baseUrl}/widget/${businessSlug}`;
  const profileUrl = `${baseUrl}/b/${businessSlug}`;
  const embedCode = `<iframe src="${widgetUrl}" width="100%" height="600" frameborder="0" style="border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);"></iframe>`;

  const [tab, setTab] = useState<"agent" | "widget" | "profile">("agent");

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("¡Copiado!");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="w-5 h-5" style={{ color: primaryColor }} />
        <h3 className="font-bold text-gray-900">Comparte tu negocio</h3>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setTab("agent")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            tab === "agent" ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          style={tab === "agent" ? { backgroundColor: primaryColor } : {}}
        >
          AI Agent
        </button>
        <button
          onClick={() => setTab("widget")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            tab === "widget" ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          style={tab === "widget" ? { backgroundColor: primaryColor } : {}}
        >
          Widget
        </button>
        <button
          onClick={() => setTab("profile")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            tab === "profile" ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          style={tab === "profile" ? { backgroundColor: primaryColor } : {}}
        >
          Perfil
        </button>
      </div>

      {tab === "agent" && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Tus clientes pueden hablar con {agentName} escaneando este código o visitando el enlace.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="p-3 bg-white border border-gray-200 rounded-xl">
              <QRCode url={agentUrl} size={140} color={primaryColor} />
            </div>
            <div className="flex-1 space-y-2 w-full">
              <div className="flex items-center gap-2">
                <input readOnly value={agentUrl} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700" />
                <button onClick={() => copy(agentUrl)} className="px-3 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition" style={{ backgroundColor: primaryColor }}>
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <a href={agentUrl} target="_blank" className="inline-flex items-center gap-2 text-sm font-medium hover:underline" style={{ color: primaryColor }}>
                <ExternalLink className="w-4 h-4" /> Probar agente en vivo
              </a>
              <p className="text-xs text-gray-400">Imprime el QR y ponlo en tu mostrador, redes sociales, o tarjetas de visita.</p>
            </div>
          </div>
        </>
      )}
      {tab === "widget" && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Incrusta el widget de reservas directamente en tu web o Instagram bio.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input readOnly value={widgetUrl} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700" />
              <button onClick={() => copy(widgetUrl)} className="px-3 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition" style={{ backgroundColor: primaryColor }}>
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-300 p-3 rounded-lg text-xs overflow-x-auto">{embedCode}</pre>
              <button
                onClick={() => copy(embedCode)}
                className="absolute top-2 right-2 p-1.5 bg-white/10 rounded hover:bg-white/20 transition"
              >
                <Copy className="w-3 h-3 text-white" />
              </button>
            </div>
            <a href={widgetUrl} target="_blank" className="inline-flex items-center gap-2 text-sm font-medium hover:underline" style={{ color: primaryColor }}>
              <ExternalLink className="w-4 h-4" /> Previsualizar widget
            </a>
          </div>
        </>
      )}
      {tab === "profile" && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Página pública con tus servicios, equipo y botones de reserva. Ideal para Instagram bio.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input readOnly value={profileUrl} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700" />
              <button onClick={() => copy(profileUrl)} className="px-3 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition" style={{ backgroundColor: primaryColor }}>
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <a href={profileUrl} target="_blank" className="inline-flex items-center gap-2 text-sm font-medium hover:underline" style={{ color: primaryColor }}>
              <ExternalLink className="w-4 h-4" /> Ver perfil público
            </a>
          </div>
        </>
      )}
    </div>
  );
}
