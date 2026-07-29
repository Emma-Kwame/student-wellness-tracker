"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";
import { exerciseLogSchema, type ExerciseLogInput } from "@/lib/validations/trackers";

// Simple, honestly-computable exercise badges. Streak- and distance-based
// badges aren't included here since the app doesn't track exercise-specific
// streaks or distance yet.
const EXERCISE_ACHIEVEMENTS = [
  {
    key: "first_workout",
    title: "First Workout",
    description: "Logged your very first exercise session.",
    icon: "trophy",
    xpReward: 25,
    condition: (totalMin: number, count: number) => count === 1,
  },
  {
    key: "ten_hours_exercised",
    title: "10 Hours Exercised",
    description: "Logged 10 total hours of exercise.",
    icon: "flame",
    xpReward: 100,
    condition: (totalMin: number) => totalMin >= 600,
  },
] as const;

export async function logExercise(input: ExerciseLogInput) {
  const userId = await requireUserId();
  const data = exerciseLogSchema.parse(input);

  await prisma.exerciseLog.create({
    data: {
      userId,
      type: data.type,
      durationMin: data.durationMin,
      calories: data.calories ?? null,
      intensity: data.intensity,
    },
  });

  const unlockedAchievement = await checkExerciseAchievements(userId);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/exercise");

  return { unlockedAchievement };
}

async function checkExerciseAchievements(userId: string) {
  const logs = await prisma.exerciseLog.findMany({
    where: { userId, deletedAt: null },
    select: { durationMin: true },
  });
  const totalMin = logs.reduce((sum, l) => sum + l.durationMin, 0);
  const count = logs.length;

  for (const def of EXERCISE_ACHIEVEMENTS) {
    if (!def.condition(totalMin, count)) continue;

    const achievement = await prisma.achievement.upsert({
      where: { key: def.key },
      update: { title: def.title, description: def.description, icon: def.icon, xpReward: def.xpReward },
      create: def,
    });

    const alreadyUnlocked = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId: achievement.id } },
    });
    if (alreadyUnlocked) continue;

    await prisma.$transaction([
      prisma.userAchievement.create({ data: { userId, achievementId: achievement.id } }),
      prisma.userProfile.update({ where: { userId }, data: { xp: { increment: achievement.xpReward } } }),
    ]);

    return { title: achievement.title, icon: achievement.icon };
  }

  return null;
}

export async function deleteExerciseLog(id: string) {
  const userId = await requireUserId();

  await prisma.exerciseLog.updateMany({
    where: { id, userId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/exercise");
}
