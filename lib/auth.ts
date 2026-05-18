import { auth } from "@clerk/nextjs/server";
import { db } from "./db";

export async function getCurrentUserBusiness() {
  const { userId } = await auth();
  if (!userId) return null;

  const business = await db.business.findFirst({
    where: { ownerId: userId },
    include: {
      services: true,
      staff: true,
      bookings: { orderBy: { createdAt: "desc" }, take: 10, include: { service: true, staff: true } },
      agentConfig: true,
    },
  });

  return business;
}

export async function requireBusiness() {
  const business = await getCurrentUserBusiness();
  if (!business) {
    throw new Error("No business found for this user");
  }
  return business;
}

export async function getCurrentUserId() {
  const { userId } = await auth();
  return userId;
}
