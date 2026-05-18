import { NextRequest, NextResponse } from "next/server";
import { loadSlotsForStaff } from "@/lib/slots";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const staffId = searchParams.get("staffId");
  const date = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (!staffId || !date || !serviceId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const result = await loadSlotsForStaff(staffId, date, serviceId);
  return NextResponse.json(result);
}
