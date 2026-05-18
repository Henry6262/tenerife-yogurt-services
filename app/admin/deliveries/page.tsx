import { getDeliveryLeads, markDelivered } from "@/app/yogurt/actions";
import { generateWhatsAppLink } from "@/lib/whatsapp";

export const metadata = {
  title: "Ruta de Entregas — Admin",
};

const ORIGIN = "Santa Cruz de Tenerife";

function buildMapsUrl(addresses: string[]): string {
  const encoded = addresses.map((a) => encodeURIComponent(a));
  // Google Maps dir format: /dir/Origin/Stop1/Stop2/.../Destination
  const path = [encodeURIComponent(ORIGIN), ...encoded].join("/");
  return `https://www.google.com/maps/dir/${path}`;
}

export default async function DeliveriesPage() {
  const leads = await getDeliveryLeads();

  const pendingCount = leads.length;
  const routeUrl = pendingCount > 0 ? buildMapsUrl(leads.map((l) => l.address!)) : null;

  return (
    <main className="p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Ruta de Entregas</h1>
        <p className="text-stone-500 mb-6">
          {pendingCount === 0
            ? "No hay entregas pendientes."
            : `${pendingCount} entregas pendientes para hoy.`}
        </p>

        {routeUrl && (
          <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-stone-800">Ruta optimizada</p>
              <p className="text-sm text-stone-500">
                Abre Google Maps con todas las direcciones cargadas.
              </p>
            </div>
            <a
              href={routeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition"
            >
              🗺️ Abrir ruta en Maps
            </a>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-100 text-stone-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">WhatsApp</th>
                <th className="px-4 py-3 font-medium">Dirección</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-stone-400">
                    Todas las entregas están completadas. 🚚✅
                  </td>
                </tr>
              )}
              {leads.map((lead, i) => (
                <tr key={lead.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 text-stone-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{lead.name}</td>
                  <td className="px-4 py-3">
                    <a
                      href={generateWhatsAppLink(lead.phone, `Hola ${lead.name}, estoy en camino con tu pedido. `)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline"
                    >
                      {lead.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-stone-600 max-w-xs truncate">
                    {lead.address}
                  </td>
                  <td className="px-4 py-3">
                    {lead.orderType === "subscription" ? (
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                        Sub
                      </span>
                    ) : (
                      <span className="text-stone-400 text-xs">1x</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-400">
                    {new Date(lead.createdAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <form action={markDelivered}>
                      <input type="hidden" name="id" value={lead.id} />
                      <button
                        type="submit"
                        className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-1.5 rounded transition font-medium"
                      >
                        ✅ Entregado
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {leads.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
              <p className="text-2xl font-bold text-stone-800">{leads.length}</p>
              <p className="text-xs text-stone-500">Pendientes</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">
                €{leads.reduce((sum, l) => sum + (l.orderType === "subscription" ? 8 : 10), 0)}
              </p>
              <p className="text-xs text-stone-500">Valor total</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {leads.filter((l) => l.orderType === "subscription").length}
              </p>
              <p className="text-xs text-stone-500">Suscripciones</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
