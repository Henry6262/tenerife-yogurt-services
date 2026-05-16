import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.toUpperCase().trim();
  if (!code) {
    return NextResponse.json({ valid: false, error: "No code provided" });
  }

  const promo = await db.promoCode.findUnique({ where: { code } });
  if (!promo) {
    return NextResponse.json({ valid: false, error: "Código no encontrado" });
  }

  if (!promo.isActive) {
    return NextResponse.json({ valid: false, error: "Código inactivo" });
  }

  if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    return NextResponse.json({ valid: false, error: "Código agotado" });
  }

  if (promo.validUntil && new Date() > promo.validUntil) {
    return NextResponse.json({ valid: false, error: "Código expirado" });
  }

  return NextResponse.json({
    valid: true,
    code: promo.code,
    stripeCouponId: promo.stripeCouponId,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
  });
}
