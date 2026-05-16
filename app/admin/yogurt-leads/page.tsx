import { getYogurtLeads, sendLeadWhatsApp } from "@/app/yogurt/actions";
import { generateWhatsAppLink } from "@/lib/whatsapp";

export const metadata = {
  title: "Yogurt Leads — Admin",
};

export default async function YogurtLeadsAdminPage() {
  const leads = await getYogurtLeads();

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-yellow-100 text-yellow-700",
    converted: "bg-emerald-100 text-emerald-700",
    dead: "bg-stone-100 text-stone-500",
  };

  return (
    <main className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Yogurt Leads</h1>

        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-100 text-stone-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">WhatsApp</th>
                <th className="px-4 py-3 font-medium">Origen</th>
                <th className="px-4 py-3 font-medium">Evento</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {leads.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-stone-400">
                    Sin leads todavía. Sal a dar muestras. 🥛
                  </td>
                </tr>
              )}
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium">{lead.name}</td>
                  <td className="px-4 py-3">
                    <a
                      href={generateWhatsAppLink(lead.phone, `Hola ${lead.name}, `)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline"
                    >
                      {lead.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 capitalize">{lead.source}</td>
                  <td className="px-4 py-3 text-stone-500">{lead.eventLocation || "—"}</td>
                  <td className="px-4 py-3">
                    {lead.orderType === "subscription" ? (
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                        Suscripción
                      </span>
                    ) : (
                      <span className="text-stone-400">Una vez</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        statusColors[lead.status] || "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-400">
                    {new Date(lead.createdAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <form action={sendLeadWhatsApp}>
                        <input type="hidden" name="id" value={lead.id} />
                        <input type="hidden" name="template" value="followup" />
                        <button
                          type="submit"
                          className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-1 rounded transition"
                        >
                          📩 Seguimiento
                        </button>
                      </form>
                      <form action={sendLeadWhatsApp}>
                        <input type="hidden" name="id" value={lead.id} />
                        <input type="hidden" name="template" value="orderConfirmation" />
                        <button
                          type="submit"
                          className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-2 py-1 rounded transition"
                        >
                          ✅ Confirmar pedido
                        </button>
                      </form>
                      <form action={sendLeadWhatsApp}>
                        <input type="hidden" name="id" value={lead.id} />
                        <input type="hidden" name="template" value="deliveryReminder" />
                        <button
                          type="submit"
                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition"
                        >
                          🚚 Recordatorio envío
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex gap-6 text-stone-400 text-sm">
          <span>Total: <strong className="text-stone-700">{leads.length}</strong> leads</span>
          <span>Suscripciones: <strong className="text-stone-700">{leads.filter((l) => l.orderType === "subscription").length}</strong></span>
          <span>Convertidos: <strong className="text-stone-700">{leads.filter((l) => l.status === "converted").length}</strong></span>
        </div>
      </div>
    </main>
  );
}
