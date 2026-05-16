"use server";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";

export async function createPromoCode(formData: FormData) {
  const code = (formData.get("code") as string).toUpperCase().trim();
  const description = formData.get("description") as string;
  const discountType = formData.get("discountType") as string;
  const discountValue = Number(formData.get("discountValue"));
  const maxUses = formData.get("maxUses") ? Number(formData.get("maxUses")) : null;
  const eventTag = (formData.get("eventTag") as string) || null;

  const coupon = await stripe.coupons.create({
    name: code,
    [discountType === "percentage" ? "percent_off" : "amount_off"]:
      discountType === "percentage" ? discountValue : Math.round(discountValue * 100),
    currency: "eur",
    duration: "once",
    max_redemptions: maxUses ?? undefined,
  });

  await db.promoCode.create({
    data: {
      code,
      description,
      stripeCouponId: coupon.id,
      discountType,
      discountValue,
      maxUses,
      eventTag,
      isActive: true,
    },
  });

  revalidatePath("/admin/promos");
}

export async function deletePromoCode(formData: FormData) {
  const id = formData.get("id") as string;
  const promo = await db.promoCode.findUnique({ where: { id } });
  if (promo) {
    await stripe.coupons.del(promo.stripeCouponId).catch(() => {});
    await db.promoCode.delete({ where: { id } });
  }
  revalidatePath("/admin/promos");
}

export async function togglePromoCode(formData: FormData) {
  const id = formData.get("id") as string;
  const promo = await db.promoCode.findUnique({ where: { id } });
  if (promo) {
    await db.promoCode.update({
      where: { id },
      data: { isActive: !promo.isActive },
    });
  }
  revalidatePath("/admin/promos");
}
