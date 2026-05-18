import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await db.business.findFirst({
    where: { ownerId: userId },
  });
  if (!business) {
    return NextResponse.json({ error: "No business found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const bookings = await db.booking.findMany({
    where: {
      businessId: business.id,
      startsAt: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      },
    },
    include: { service: true, staff: true },
    orderBy: { startsAt: "desc" },
  });

  const headers = ["Fecha", "Hora", "Servicio", "Precio", "Cliente", "Telefono", "Email", "Profesional", "Estado", "Pago", "Deposito", "Notas"];

  const rows = bookings.map((b) => [
    b.startsAt.toISOString().slice(0, 10),
    b.startsAt.toISOString().slice(11, 16),
    b.service.name,
    String(b.service.price),
    b.customerName,
    b.customerPhone,
    b.customerEmail || "",
    b.staff.name,
    b.status,
    b.paymentStatus,
    String(b.depositAmount),
    b.notes || "",
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reservas-${business.slug}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
