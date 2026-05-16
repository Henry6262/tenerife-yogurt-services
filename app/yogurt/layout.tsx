import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yogurt Griego Artesanal — Tenerife",
  description: "4 tarros por €10. Entrega mañana. Hecho en Tenerife.",
};

export default function YogurtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-stone-50 text-stone-900">
        {children}
      </body>
    </html>
  );
}
