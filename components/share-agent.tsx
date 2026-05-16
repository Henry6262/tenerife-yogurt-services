"use client";

import { QRCode } from "./qr-code";
import { Copy, ExternalLink, Share2 } from "lucide-react";

interface ShareAgentProps {
  businessSlug: string;
  businessName: string;
  agentName: string;
  primaryColor: string;
}

export function ShareAgent({ businessSlug, businessName, agentName, primaryColor }: ShareAgentProps) {
  const agentUrl = `http://localhost:3004/agent/${businessSlug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(agentUrl);
    alert("¡Enlace copiado!");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="w-5 h-5" style={{ color: primaryColor }} />
        <h3 className="font-bold text-gray-900">Comparte tu agente</h3>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Tus clientes pueden hablar con {agentName} escaneando este código o visitando el enlace.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="p-3 bg-white border border-gray-200 rounded-xl">
          <QRCode url={agentUrl} size={140} color={primaryColor} />
        </div>

        <div className="flex-1 space-y-2 w-full">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={agentUrl}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
            />
            <button
              onClick={copyLink}
              className="px-3 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
              style={{ backgroundColor: primaryColor }}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <a
            href={agentUrl}
            target="_blank"
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
            style={{ color: primaryColor }}
          >
            <ExternalLink className="w-4 h-4" />
            Probar agente en vivo
          </a>

          <p className="text-xs text-gray-400">
            Imprime el QR y ponlo en tu mostrador, redes sociales, o tarjetas de visita.
          </p>
        </div>
      </div>
    </div>
  );
}
