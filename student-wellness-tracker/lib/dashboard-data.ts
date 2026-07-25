import "server-only";
import { prisma } from "@/lib/prisma";
import {
  startOfDay,
  endOfDay,
  daysAgo,
  computeWellnessScore,
  computeAttendanceRate,
  computeGoalProgress,
} from "@/lib/wellness";
import { getTodayStats } from "@/lib/today-stats";

export async function getDashboardData(userId: string) {
  const weekStart = daysAgo(6); // last 7 days, inclusive of today

  const [
    profile,
    todayMood,
    todayStats,
    weekStudySessions,
    attendanceRecords,
    upcomingTasks,
    activeGoals,
    allAchievements,
    unlockedAchievements,
  ] = await Promise.all([
    prisma.userProfile.findUniqueOrThrow({ where: { userId } }),
    prisma.moodEntry.findFirst({
      where: { userId, deletedAt: null, loggedAt: { gte: startOfDay(), lte: endOfDay() } },
      orderBy: { loggedAt: "desc" },
    }),
    getTodayStats(userId),
    prisma.studySession.findMany({
      where: { userId, deletedAt: null, startedAt: { gte: weekStart } },
      select: { startedAt: true, durationMin: true },
    }),
    prisma.attendanceRecord.findMany({ where: { userId } }),
    prisma.task.findMany({
      where: { userId, deletedAt: null, isCompleted: false },
      orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { priority: "desc" }],
      take: 5,
    }),
    prisma.goal.findMany({ where: { userId, deletedAt: null, isActive: true } }),
    prisma.achievement.findMany({ orderBy: { title: "asc" } }),
    prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
  ]);

  const wellnessScore = computeWellnessScore(todayStats, profile);
  const attendanceRate = computeAttendanceRate(attendanceRecords);

  // Bucket the week's study sessions into 7 daily totals for the trend chart.
  const weeklyStudy: { date: string; minutes: number }[] = Array.from({ length: 7 }).map((_, i) => {
    const day = daysAgo(6 - i);
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    const minutes = weekStudySessions
      .filter((s) => startOfDay(s.startedAt).getTime() === day.getTime())
      .reduce((sum, s) => sum + (s.durationMin ?? 0), 0);
    return { date: label, minutes };
  });

  const unlockedIds = new Set(unlockedAchievements.map((a) => a.achievementId));

  const goalsWithProgress = activeGoals.map((goal) => computeGoalProgress(goal, todayStats));

  return {
    profile,
    todayMood,
    todayStats,
    wellnessScore,
    weeklyStudy,
    attendanceRate,
    upcomingTasks,
    goals: goalsWithProgress,
    achievements: allAchievements,
    unlockedIds,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
