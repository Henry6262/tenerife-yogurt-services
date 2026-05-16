import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Clock, Euro } from "lucide-react";

export default async function ServicesPage() {
  const services = await db.service.findMany({
    include: { business: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver al panel
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Servicios</h1>

      <div className="grid gap-3">
        {services.map((s) => (
          <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: s.colorCode }}>
                {s.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{s.name}</div>
                <div className="text-xs text-gray-500">{s.business.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {s.durationMinutes} min</span>
              <span className="flex items-center gap-1"><Euro className="w-3.5 h-3.5" /> {s.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
