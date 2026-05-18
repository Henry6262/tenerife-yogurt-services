import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Phone, Mail, Scissors, User, Clock, MessageCircle, ExternalLink } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function BusinessProfilePage({ params }: PageProps) {
  const { slug } = await params;

  const business = await db.business.findUnique({
    where: { slug, isActive: true },
    include: {
      services: { where: { isActive: true } },
      staff: { where: { isActive: true } },
      agentConfig: true,
    },
  });

  if (!business) notFound();

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: business.agentConfig?.primaryColor || "#f43f5e" }}
          >
            {business.name.charAt(0)}
          </div>
          <h1 className="text-2xl font-bold text-stone-900">{business.name}</h1>
          <p className="text-stone-500 text-sm capitalize mt-1">{business.type}</p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-sm text-stone-500">
            {business.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {business.address}
              </span>
            )}
            {business.phone && (
              <a href={`tel:${business.phone}`} className="flex items-center gap-1 text-emerald-600 hover:underline">
                <Phone className="w-4 h-4" /> {business.phone}
              </a>
            )}
          </div>

          <div className="flex gap-3 mt-6 justify-center">
            <a
              href={`/agent/${business.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm hover:opacity-90 transition"
              style={{ backgroundColor: business.agentConfig?.primaryColor || "#f43f5e" }}
            >
              <MessageCircle className="w-4 h-4" />
              Hablar con IA
            </a>
            <a
              href={`/widget/${business.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 font-medium text-sm hover:bg-stone-50 transition"
            >
              <Calendar className="w-4 h-4" />
              Reservar
            </a>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="max-w-lg mx-auto px-4 py-8">
        <h2 className="text-lg font-bold text-stone-900 mb-4">Servicios</h2>
        <div className="space-y-3">
          {business.services.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: s.colorCode }}
              >
                <Scissors className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-stone-900">{s.name}</div>
                {s.description && <div className="text-xs text-stone-500">{s.description}</div>}
              </div>
              <div className="text-right">
                <div className="font-bold text-stone-900">{s.price}€</div>
                <div className="text-xs text-stone-500">{s.durationMinutes} min</div>
              </div>
            </div>
          ))}
        </div>

        {/* Staff */}
        <h2 className="text-lg font-bold text-stone-900 mb-4 mt-8">Equipo</h2>
        <div className="space-y-3">
          {business.staff.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: s.colorCode }}
              >
                {s.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-stone-900">{s.name}</div>
                {s.bio && <div className="text-xs text-stone-500">{s.bio}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 border-t border-stone-200">
        <p className="text-xs text-stone-400">
          Reservas powered by <a href="/" className="text-emerald-600 hover:underline">Bookit AI</a>
        </p>
      </div>
    </main>
  );
}
