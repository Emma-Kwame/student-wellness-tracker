"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";
import { goalSchema, type GoalInput } from "@/lib/validations/trackers";

export async function createGoal(input: GoalInput) {
  const userId = await requireUserId();
  const data = goalSchema.parse(input);

  await prisma.goal.create({
    data: {
      userId,
      type: data.type,
      label: data.label,
      targetValue: data.targetValue,
      unit: data.unit || null,
      reminderTime: data.reminderTime || null,
    },
  });

  const existingCount = await prisma.goal.count({ where: { userId, deletedAt: null } });
  let unlockedAchievement: { title: string; icon: string } | null = null;
  if (existingCount === 1) {
    const achievement = await prisma.achievement.upsert({
      where: { key: "first_goal" },
      update: {},
      create: { key: "first_goal", title: "First Goal", description: "Created your first goal.", icon: "trophy", xpReward: 25 },
    });
    const already = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId: achievement.id } },
    });
    if (!already) {
      await prisma.$transaction([
        prisma.userAchievement.create({ data: { userId, achievementId: achievement.id } }),
        prisma.userProfile.update({ where: { userId }, data: { xp: { increment: achievement.xpReward } } }),
      ]);
      unlockedAchievement = { title: achievement.title, icon: achievement.icon };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/goals");

  return { unlockedAchievement };
}

export async function updateGoal(id: string, input: GoalInput) {
  const userId = await requireUserId();
  const data = goalSchema.parse(input);

  await prisma.goal.updateMany({
    where: { id, userId },
    data: {
      type: data.type,
      label: data.label,
      targetValue: data.targetValue,
      unit: data.unit || null,
      reminderTime: data.reminderTime || null,
    },
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
