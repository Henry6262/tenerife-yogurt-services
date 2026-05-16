import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Mail, Phone } from "lucide-react";

export default async function StaffPage() {
  const staff = await db.staff.findMany({
    include: { business: true, staffServices: { include: { service: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver al panel
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Equipo</h1>

      <div className="grid gap-3">
        {staff.map((s) => (
          <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: s.colorCode }}>
                  {s.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{s.name}</div>
                  <div className="text-xs text-gray-500">{s.business.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                {s.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {s.phone}</span>}
                {s.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {s.email}</span>}
              </div>
            </div>
            {s.bio && <p className="text-sm text-gray-600 mb-2">{s.bio}</p>}
            <div className="flex flex-wrap gap-2">
              {s.staffServices.map((ss) => (
                <span key={ss.serviceId} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{ss.service.name}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
