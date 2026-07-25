"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";
import { goalSchema, type GoalInput } from "@/lib/validations/trackers";

export async function createGoal(input: GoalInput) {
  const userId = await requireUserId();
  const data = goalSchema.parse(input);

  await prisma.goal.create({
    data: { userId, type: data.type, label: data.label, targetValue: data.targetValue },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/goals");
}

export async function toggleGoal(id: string, isActive: boolean) {
  const userId = await requireUserId();

  await prisma.goal.updateMany({
    where: { id, userId },
    data: { isActive },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/goals");
}

export async function deleteGoal(id: string) {
  const userId = await requireUserId();

  await prisma.goal.updateMany({
    where: { id, userId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/goals");
}
