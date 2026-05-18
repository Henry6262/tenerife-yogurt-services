import { Suspense } from "react";
import { db } from "@/lib/db";
import { BookingWizard } from "./booking-wizard";
import Aurora from "@/components/react-bits/aurora";

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
    <div className="relative min-h-screen bg-slate-950">
      {/* Subtle Aurora background */}
      <div className="absolute inset-0 opacity-30">
        <Aurora
          colorStops={["#1e3a5f", "#2563eb", "#1e3a5f"]}
          amplitude={0.8}
          blend={0.5}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950 pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">
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
                    isCurrent ? "text-blue-400" : isActive ? "text-white" : "text-slate-600"
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isCurrent
                        ? "bg-blue-600 text-white"
                        : isActive
                        ? "bg-slate-700 text-slate-300"
                        : "bg-slate-800 text-slate-600"
                    }`}
                  >
                    {isActive && !isCurrent ? "✓" : stepNum}
                  </span>
                  <span className="hidden sm:inline text-sm font-medium">{label}</span>
                </div>
                {i < 2 && (
                  <div
                    className={`w-8 sm:w-12 h-0.5 ${
                      isActive && stepNum < currentStep ? "bg-blue-600" : "bg-slate-800"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </nav>

        <Suspense fallback={<p className="text-center text-slate-500">Cargando...</p>}>
          <BookingWizard business={business} params={params} step={step} />
        </Suspense>
      </div>
    </div>
  );
}
