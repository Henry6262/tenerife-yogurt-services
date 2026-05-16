import type { Metadata } from "next";
import YogurtNav from "./YogurtNav";

export const metadata: Metadata = {
  title: "Yogurt Griego Artesanal — Tenerife",
  description: "Hecho a mano en Tenerife. Entrega gratis Santa Cruz / La Laguna.",
};

export default function YogurtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-stone-50 text-stone-900">
        <YogurtNav />
        {children}
      </body>
    </html>
  );
}
