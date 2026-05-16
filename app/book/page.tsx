import { Suspense } from "react";
import { db } from "@/lib/db";
import { BookingWizard } from "./booking-wizard";

interface PageProps {
  searchParams: Promise<{
    business?: string;
    service?: string;
    staff?: string;
    date?: string;
    time?: string;
    step?: string;
  }>;
}

export default async function BookPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const step = params.step ?? "1";

  const business = params.business
    ? await db.business.findUnique({
        where: { slug: params.business },
        include: {
          services: { where: { isActive: true } },
          staff: {
            where: { isActive: true },
            include: { staffServices: true },
          },
        },
      })
    : await db.business.findFirst({
        where: { isActive: true },
        include: {
          services: { where: { isActive: true } },
          staff: {
            where: { isActive: true },
            include: { staffServices: true },
          },
        },
      });

  if (!business) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">No hay negocios disponibles todavía.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Step indicator */}
      <nav className="flex items-center justify-center gap-2 mb-10">
        {["Servicio", "Fecha y hora", "Confirmar"].map((label, i) => {
          const stepNum = i + 1;
          const currentStep = parseInt(step);
          const isActive = currentStep >= stepNum;
          const isCurrent = currentStep === stepNum;
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 ${
                  isCurrent ? "text-rose-600" : isActive ? "text-gray-900" : "text-gray-300"
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCurrent
                      ? "bg-rose-600 text-white"
                      : isActive
                      ? "bg-gray-200 text-gray-700"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isActive && !isCurrent ? "✓" : stepNum}
                </span>
                <span className="hidden sm:inline text-sm font-medium">{label}</span>
              </div>
              {i < 2 && (
                <div
                  className={`w-8 sm:w-12 h-0.5 ${
                    isActive && stepNum < currentStep ? "bg-rose-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </nav>

      <Suspense fallback={<p className="text-center text-gray-400">Cargando...</p>}>
        <BookingWizard business={business} params={params} step={step} />
      </Suspense>
    </div>
  );
}
