import "server-only";
import { prisma } from "@/lib/prisma";
import { daysAgo, startOfDay } from "@/lib/wellness";

export type TypedGoalType = "STUDY_HOURS" | "WATER_GLASSES" | "SLEEP_HOURS" | "EXERCISE_MINUTES";

export const TYPED_GOAL_TYPES: TypedGoalType[] = ["STUDY_HOURS", "WATER_GLASSES", "SLEEP_HOURS", "EXERCISE_MINUTES"];

export interface DailyValue {
  date: Date;
  value: number;
}

/** Buckets the last `days` days of the underlying logs into daily totals, in
 * the same unit as each goal type's targetValue (hours, glasses, minutes). */
export async function getDailyValuesForTypes(userId: string, days = 30): Promise<Record<TypedGoalType, DailyValue[]>> {
  const start = daysAgo(days - 1);

  const [studySessions, sleepLogs, waterLogs, exerciseLogs] = await Promise.all([
    prisma.studySession.findMany({
      where: { userId, deletedAt: null, startedAt: { gte: start } },
      select: { startedAt: true, durationMin: true },
    }),
    prisma.sleepLog.findMany({
      where: { userId, deletedAt: null, wakeTime: { gte: start } },
      select: { wakeTime: true, durationMin: true },
    }),
    prisma.waterLog.findMany({
      where: { userId, loggedAt: { gte: start } },
      select: { loggedAt: true, amountMl: true },
    }),
    prisma.exerciseLog.findMany({
      where: { userId, deletedAt: null, loggedAt: { gte: start } },
      select: { loggedAt: true, durationMin: true },
    }),
  ]);

  function bucket(items: { date: Date; amount: number }[]): DailyValue[] {
    return Array.from({ length: days }, (_, i) => {
      const day = daysAgo(days - 1 - i);
      const value = items
        .filter((it) => startOfDay(it.date).getTime() === day.getTime())
        .reduce((sum, it) => sum + it.amount, 0);
      return { date: day, value };
    });
  }

  return {
    STUDY_HOURS: bucket(studySessions.map((s) => ({ date: s.startedAt, amount: (s.durationMin ?? 0) / 60 }))),
    SLEEP_HOURS: bucket(sleepLogs.map((s) => ({ date: s.wakeTime, amount: s.durationMin / 60 }))),
    WATER_GLASSES: bucket(waterLogs.map((s) => ({ date: s.loggedAt, amount: s.amountMl / 250 }))),
    EXERCISE_MINUTES: bucket(exerciseLogs.map((s) => ({ date: s.loggedAt, amount: s.durationMin }))),
  };
}

/** Consecutive days (working backward from today) where the daily total met
 * `target`. Today doesn't break the streak if it's simply not over yet. */
export function computeStreak(dailyValues: DailyValue[], target: number): number {
  const today = startOfDay();
  let streak = 0;
  for (let i = dailyValues.length - 1; i >= 0; i--) {
    const dv = dailyValues[i]!;
    if (dv.value >= target) {
      streak++;
      continue;
    }
    if (dv.date.getTime() === today.getTime()) continue; // today in progress — don't break the streak yet
    break;
  }
  return streak;
}

export type DayOutcome = "met" | "missed" | "pending";

export function weeklyPerformance(dailyValues: DailyValue[], target: number): { date: Date; outcome: DayOutcome }[] {
  const today = startOfDay();
  return dailyValues.slice(-7).map((dv) => ({
    date: dv.date,
    outcome: dv.value >= target ? "met" : dv.date.getTime() === today.getTime() ? "pending" : "missed",
  }));
}

export interface GoalRecommendation {
  type: TypedGoalType;
  suggestedTarget: number;
}

/** Real suggestions from the student's own last-7-days average — not generic
 * advice — for categories they don't already have an active goal for. */
export function suggestGoalTargets(
  dailyValues: Record<TypedGoalType, DailyValue[]>,
  existingTypes: Set<string>,
): GoalRecommendation[] {
  const recs: GoalRecommendation[] = [];
  for (const type of TYPED_GOAL_TYPES) {
    if (existingTypes.has(type)) continue;
    const recent = dailyValues[type].slice(-7).map((d) => d.value).filter((v) => v > 0);
    if (recent.length < 3) continue;
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    if (avg <= 0) continue;

    let suggestedTarget = avg;
    if (type === "STUDY_HOURS" || type === "SLEEP_HOURS") suggestedTarget = Math.round(avg * 2) / 2;
    if (type === "WATER_GLASSES") suggestedTarget = Math.round(avg);
    if (type === "EXERCISE_MINUTES") suggestedTarget = Math.round(avg / 5) * 5;

    recs.push({ type, suggestedTarget });
  }
  return recs;
}
