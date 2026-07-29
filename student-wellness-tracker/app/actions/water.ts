"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";
import { waterLogSchema, waterGoalSchema } from "@/lib/validations/trackers";

export async function logWater(amountMl: number) {
  const userId = await requireUserId();
  const data = waterLogSchema.parse({ amountMl });

  await prisma.waterLog.create({
    data: { userId, amountMl: data.amountMl },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/water");
}

export async function updateWaterGoal(goalMl: number) {
  const userId = await requireUserId();
  const data = waterGoalSchema.parse({ goalMl });

  await prisma.userProfile.update({
    where: { userId },
    data: { dailyWaterGoalMl: data.goalMl },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/water");
}

export async function deleteWaterLog(id: string) {
  const userId = await requireUserId();

  // No soft delete on WaterLog by design — a mis-tapped glass should just
  // disappear, not leave a tombstone row behind.
  await prisma.waterLog.deleteMany({ where: { id, userId } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/water");
}
