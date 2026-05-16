import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function escapeCsv(value: string | number | null | undefined): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  const where: any = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to + "T23:59:59.999Z");
  }

  const orders = await db.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "ID",
    "Fecha",
    "Cliente",
    "Teléfono",
    "Email",
    "Dirección",
    "Horario",
    "Productos",
    "Total",
    "Estado",
    "Pago",
    "Notas",
  ];

  const rows = orders.map((order) => [
    order.id.slice(0, 8),
    order.createdAt.toISOString(),
    escapeCsv(order.customerName),
    escapeCsv(order.customerPhone),
    escapeCsv(order.customerEmail),
    escapeCsv(order.address),
    escapeCsv(order.deliveryTimeSlot),
    escapeCsv(order.items.map((i) => `${i.quantity}x ${i.productName}`).join("; ")),
    order.total.toFixed(2),
    order.status,
    order.paymentStatus,
    escapeCsv(order.notes),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pedidos-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
