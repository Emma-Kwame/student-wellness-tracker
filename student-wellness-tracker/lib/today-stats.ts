import "server-only";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, type TodayStats } from "@/lib/wellness";

export async function getTodayStats(userId: string): Promise<TodayStats> {
  const todayStart = startOfDay();
  const todayEnd = endOfDay();

  const [sleepLogs, waterLogs, studySessions, exerciseLogs] = await Promise.all([
    prisma.sleepLog.findMany({
      where: { userId, deletedAt: null, wakeTime: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.waterLog.findMany({
      where: { userId, loggedAt: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.studySession.findMany({
      where: { userId, deletedAt: null, startedAt: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.exerciseLog.findMany({
      where: { userId, deletedAt: null, loggedAt: { gte: todayStart, lte: todayEnd } },
    }),
  ]);

  return {
    sleepHours: sleepLogs.reduce((sum, l) => sum + l.durationMin, 0) / 60,
    waterMl: waterLogs.reduce((sum, l) => sum + l.amountMl, 0),
    studyMinutes: studySessions.reduce((sum, s) => sum + (s.durationMin ?? 0), 0),
    exerciseMinutes: exerciseLogs.reduce((sum, e) => sum + e.durationMin, 0),
  };
}
