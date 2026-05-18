import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { WidgetBooking } from "./widget-booking";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ service?: string; staff?: string; date?: string }>;
}

export const dynamic = "force-dynamic";

export default async function WidgetPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { service, staff, date } = await searchParams;

  const business = await db.business.findUnique({
    where: { slug, isActive: true },
    include: {
      services: { where: { isActive: true } },
      staff: {
        where: { isActive: true },
        include: { staffServices: true },
      },
    },
  });

  if (!business) notFound();

  if (business.services.length === 0 || business.staff.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <p className="text-lg font-medium text-gray-900 mb-2">{business.name}</p>
        <p className="text-sm text-gray-500">Este negocio aún no tiene servicios disponibles para reservar online.</p>
        <p className="text-xs text-gray-400 mt-4">
          Powered by <a href="/" target="_blank" className="text-emerald-600 hover:underline">TenerifeAI</a>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <WidgetBooking
        business={business}
        preselectedService={service}
        preselectedStaff={staff}
        preselectedDate={date}
      />
      <div className="mt-auto py-3 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Powered by <a href="/" target="_blank" className="text-emerald-600 hover:underline">TenerifeAI</a>
        </p>
      </div>
    </div>
  );
}
