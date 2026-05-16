"use client";

import { ServicePicker } from "./service-picker";
import { TimePicker } from "./time-picker";
import { ConfirmStep } from "./confirm-step";

interface BusinessData {
  id: string;
  name: string;
  slug: string;
  services: { id: string; name: string; durationMinutes: number; price: number; description: string | null; colorCode: string }[];
  staff: { id: string; name: string; bio: string | null; colorCode: string; staffServices: { serviceId: string }[] }[];
}

interface WizardProps {
  business: BusinessData;
  params: {
    service?: string;
    staff?: string;
    date?: string;
    time?: string;
    step?: string;
  };
  step: string;
}

export function BookingWizard({ business, params, step }: WizardProps) {
  const selectedService = business.services.find((s) => s.id === params.service);

  if (step === "1" || !selectedService) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">
          Elige un servicio
        </h1>
        <p className="text-gray-500 text-center mb-8">{business.name}</p>
        <ServicePicker
          services={business.services}
          selected={params.service}
          businessSlug={business.slug}
        />
      </div>
    );
  }

  if (step === "2") {
    const qualifiedStaff = business.staff.filter((s) =>
      s.staffServices.some((ss) => ss.serviceId === selectedService.id)
    );

    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">
          {selectedService.name}
        </h1>
        <p className="text-gray-500 text-center mb-8">
          {selectedService.durationMinutes} min · {selectedService.price}€
        </p>
        <TimePicker
          service={selectedService}
          staff={qualifiedStaff}
          businessSlug={business.slug}
          selectedStaff={params.staff}
          selectedDate={params.date}
          selectedTime={params.time}
        />
      </div>
    );
  }

  if (step === "3" && params.time) {
    const selectedStaff = business.staff.find((s) => s.id === params.staff);
    return (
      <ConfirmStep
        service={selectedService}
        staff={selectedStaff ?? null}
        dateStr={params.date ?? ""}
        timeStr={params.time}
        businessSlug={business.slug}
      />
    );
  }

  return null;
}
