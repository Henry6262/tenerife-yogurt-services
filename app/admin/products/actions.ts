"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price"));
  const comparePrice = formData.get("comparePrice")
    ? Number(formData.get("comparePrice"))
    : null;
  const isSubscription = formData.get("isSubscription") === "on";
  const subscriptionInterval = (formData.get("subscriptionInterval") as string) || null;
  const isBundle = formData.get("isBundle") === "on";
  const sortOrder = Number(formData.get("sortOrder") || 0);

  await db.product.create({
    data: {
      name,
      slug,
      description,
      price,
      comparePrice,
      isSubscription,
      subscriptionInterval,
      isBundle,
      sortOrder,
      isActive: true,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/yogurt");
}

export async function updateProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price"));
  const comparePrice = formData.get("comparePrice")
    ? Number(formData.get("comparePrice"))
    : null;
  const isSubscription = formData.get("isSubscription") === "on";
  const subscriptionInterval = (formData.get("subscriptionInterval") as string) || null;
  const isBundle = formData.get("isBundle") === "on";
  const isActive = formData.get("isActive") === "on";
  const sortOrder = Number(formData.get("sortOrder") || 0);

  await db.product.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      price,
      comparePrice,
      isSubscription,
      subscriptionInterval,
      isBundle,
      isActive,
      sortOrder,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/yogurt");
}

export async function deleteProduct(formData: FormData) {
  const id = formData.get("id") as string;
  await db.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/yogurt");
}
