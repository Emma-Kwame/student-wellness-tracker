import "server-only";
import { prisma } from "@/lib/prisma";
import {
  startOfDay,
  endOfDay,
  daysAgo,
  computeWellnessScore,
  computeAttendanceRate,
  computeGoalProgress,
  MOOD_SCORE,
  type WellnessGoals,
} from "@/lib/wellness";
import { getTodayStats } from "@/lib/today-stats";

export interface WeeklyPoint {
  date: string;
  overview: number;
  study: number;
  sleep: number;
  mood: number | null;
}

/** Buckets the last 7 days of logs into one point per day, for the weekly
 * trend chart on both the dashboard and the analytics page. */
export async function getWeeklyProgress(userId: string, goals: WellnessGoals): Promise<WeeklyPoint[]> {
  const weekStart = daysAgo(6); // last 7 days, inclusive of today

  const [weekStudySessions, weekSleepLogs, weekMoodEntries, weekWaterLogs, weekExerciseLogs] = await Promise.all([
    prisma.studySession.findMany({
      where: { userId, deletedAt: null, startedAt: { gte: weekStart } },
      select: { startedAt: true, durationMin: true },
    }),
    prisma.sleepLog.findMany({
      where: { userId, deletedAt: null, wakeTime: { gte: weekStart } },
      select: { wakeTime: true, durationMin: true },
    }),
    prisma.moodEntry.findMany({
      where: { userId, deletedAt: null, loggedAt: { gte: weekStart } },
      select: { loggedAt: true, mood: true },
    }),
    prisma.waterLog.findMany({
      where: { userId, loggedAt: { gte: weekStart } },
      select: { loggedAt: true, amountMl: true },
    }),
    prisma.exerciseLog.findMany({
      where: { userId, deletedAt: null, loggedAt: { gte: weekStart } },
      select: { loggedAt: true, durationMin: true },
    }),
  ]);

  return Array.from({ length: 7 }).map((_, i) => {
    const day = daysAgo(6 - i);
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    const isSameDay = (d: Date) => startOfDay(d).getTime() === day.getTime();

    const studyMinutes = weekStudySessions
      .filter((s) => isSameDay(s.startedAt))
      .reduce((sum, s) => sum + (s.durationMin ?? 0), 0);
    const sleepHours =
      weekSleepLogs.filter((l) => isSameDay(l.wakeTime)).reduce((sum, l) => sum + l.durationMin, 0) / 60;
    const waterMl = weekWaterLogs.filter((l) => isSameDay(l.loggedAt)).reduce((sum, l) => sum + l.amountMl, 0);
    const exerciseMinutes = weekExerciseLogs
      .filter((l) => isSameDay(l.loggedAt))
      .reduce((sum, l) => sum + l.durationMin, 0);

    const dayMoods = weekMoodEntries.filter((m) => isSameDay(m.loggedAt));
    const mood =
      dayMoods.length === 0
        ? null
        : Math.round((dayMoods.reduce((sum, m) => sum + MOOD_SCORE[m.mood], 0) / dayMoods.length) * 10) / 10;

    const overview = computeWellnessScore({ sleepHours, waterMl, studyMinutes, exerciseMinutes }, goals);

    return { date: label, overview, study: studyMinutes, sleep: Math.round(sleepHours * 10) / 10, mood };
  });
}

export async function getDashboardData(userId: string) {
  // profile is needed by getWeeklyProgress's goal ratios, so it's fetched
  // once up front and reused rather than queried twice in parallel.
  const profile = await prisma.userProfile.findUniqueOrThrow({ where: { userId } });

  const [
    todayMood,
    todayStats,
    attendanceRecords,
    upcomingTasks,
    tasksDueToday,
    activeGoals,
    allAchievements,
    unlockedAchievements,
    weeklyProgress,
  ] = await Promise.all([
    prisma.moodEntry.findFirst({
      where: { userId, deletedAt: null, loggedAt: { gte: startOfDay(), lte: endOfDay() } },
      orderBy: { loggedAt: "desc" },
    }),
    getTodayStats(userId),
    prisma.attendanceRecord.findMany({ where: { userId } }),
    prisma.task.findMany({
      where: { userId, deletedAt: null, isCompleted: false },
      orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { priority: "desc" }],
      take: 5,
    }),
    prisma.task.findMany({
      where: { userId, deletedAt: null, dueDate: { gte: startOfDay(), lte: endOfDay() } },
      select: { isCompleted: true },
    }),
    prisma.goal.findMany({ where: { userId, deletedAt: null, isActive: true } }),
    prisma.achievement.findMany({ orderBy: { title: "asc" } }),
    prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
    getWeeklyProgress(userId, profile),
  ]);

  const wellnessScore = computeWellnessScore(todayStats, profile);
  const attendanceRate = computeAttendanceRate(attendanceRecords);

  const unlockedIds = new Set(unlockedAchievements.map((a) => a.achievementId));

  const goalsWithProgress = activeGoals.map((goal) => computeGoalProgress(goal, todayStats));

  const taskCompletion = {
    completed: tasksDueToday.filter((t) => t.isCompleted).length,
    total: tasksDueToday.length,
  };

  return {
    profile,
    todayMood,
    todayStats,
    wellnessScore,
    weeklyProgress,
    attendanceRate,
    upcomingTasks,
    taskCompletion,
    goals: goalsWithProgress,
    achievements: allAchievements,
    unlockedIds,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
