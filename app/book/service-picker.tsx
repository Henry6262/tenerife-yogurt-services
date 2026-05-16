"use client";

import Link from "next/link";
import { Clock, Euro } from "lucide-react";

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  description: string | null;
  colorCode: string;
}

interface Props {
  services: Service[];
  selected?: string;
  businessSlug: string;
}

export function ServicePicker({ services, selected, businessSlug }: Props) {
  return (
    <div className="grid gap-3">
      {services.map((service) => (
        <Link
          key={service.id}
          href={`/book?business=${businessSlug}&service=${service.id}&step=2`}
          className={`flex items-center justify-between p-4 rounded-xl border transition ${
            selected === service.id
              ? "border-rose-500 bg-rose-50"
              : "border-gray-200 bg-white hover:border-rose-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: service.colorCode }}
            >
              {service.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{service.name}</div>
              {service.description && (
                <div className="text-xs text-gray-500">{service.description}</div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="w-3.5 h-3.5" />
              {service.durationMinutes} min
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
              <Euro className="w-3.5 h-3.5" />
              {service.price}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
