"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";
import { studySessionSchema, type StudySessionInput } from "@/lib/validations/trackers";
import { daysAgo } from "@/lib/wellness";

// Honestly-computable badges only — no fabricated streaks beyond what's tracked.
const STUDY_ACHIEVEMENTS = [
  {
    key: "first_study_session",
    title: "First Study Session",
    description: "Logged your very first study session.",
    icon: "trophy",
    xpReward: 25,
    condition: (ctx: AchievementContext) => ctx.count === 1,
  },
  {
    key: "hundred_hours_studied",
    title: "100 Hours Studied",
    description: "Logged 100 total hours of study time.",
    icon: "flame",
    xpReward: 150,
    condition: (ctx: AchievementContext) => ctx.totalMin >= 6000,
  },
  {
    key: "weekly_study_goal",
    title: "Weekly Goal Achieved",
    description: "Met your weekly study goal.",
    icon: "trophy",
    xpReward: 75,
    condition: (ctx: AchievementContext) => ctx.weeklyMin >= ctx.weeklyGoalMin && ctx.weeklyGoalMin > 0,
  },
] as const;

type AchievementContext = { totalMin: number; count: number; weeklyMin: number; weeklyGoalMin: number };

export async function logStudySession(input: StudySessionInput, isPomodoro = false) {
  const userId = await requireUserId();
  const data = studySessionSchema.parse(input);

  const startedAt = new Date(data.startedAt);
  const endedAt = new Date(data.endedAt);
  const durationMin = Math.round((endedAt.getTime() - startedAt.getTime()) / 60_000);

  // courseId is optional and user-supplied — verify ownership rather than
  // trusting it, so a stale or spoofed id can't attach a session to
  // someone else's course.
  const courseId = data.courseId
    ? (await prisma.course.findFirst({ where: { id: data.courseId, userId }, select: { id: true } }))?.id ?? null
    : null;

  await prisma.studySession.create({
    data: { userId, courseId, startedAt, endedAt, durationMin, isPomodoro, notes: data.notes || null },
  });

  const unlockedAchievement = await checkStudyAchievements(userId);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/study");

  return { durationMin, unlockedAchievement };
}

async function checkStudyAchievements(userId: string) {
  const [sessions, profile] = await Promise.all([
    prisma.studySession.findMany({ where: { userId, deletedAt: null }, select: { durationMin: true, startedAt: true } }),
    prisma.userProfile.findUniqueOrThrow({ where: { userId } }),
  ]);

  const totalMin = sessions.reduce((sum, s) => sum + (s.durationMin ?? 0), 0);
  const count = sessions.length;
  const weekStart = daysAgo(6);
  const weeklyMin = sessions.filter((s) => s.startedAt >= weekStart).reduce((sum, s) => sum + (s.durationMin ?? 0), 0);
  const weeklyGoalMin = profile.dailyStudyGoalHours * 60 * 7;

  const ctx: AchievementContext = { totalMin, count, weeklyMin, weeklyGoalMin };

  for (const def of STUDY_ACHIEVEMENTS) {
    if (!def.condition(ctx)) continue;

    const achievement = await prisma.achievement.upsert({
      where: { key: def.key },
      update: { title: def.title, description: def.description, icon: def.icon, xpReward: def.xpReward },
      create: { key: def.key, title: def.title, description: def.description, icon: def.icon, xpReward: def.xpReward },
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

export async function deleteStudySession(id: string) {
  const userId = await requireUserId();

  await prisma.studySession.updateMany({
    where: { id, userId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/study");
}
