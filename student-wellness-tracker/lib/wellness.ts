import type { Mood, AttendanceStatus } from "@/generated/prisma/client";

export function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function daysAgo(n: number, from = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}

export const MOOD_META: Record<Mood, { emoji: string; label: string }> = {
  HAPPY: { emoji: "😀", label: "Happy" },
  NEUTRAL: { emoji: "😐", label: "Neutral" },
  SAD: { emoji: "😔", label: "Sad" },
  STRESSED: { emoji: "😰", label: "Stressed" },
  TIRED: { emoji: "😴", label: "Tired" },
  EXCITED: { emoji: "🤩", label: "Excited" },
  MOTIVATED: { emoji: "😎", label: "Motivated" },
};

export const ALL_MOODS = Object.keys(MOOD_META) as Mood[];

/** 0–100 ratio, capped, for combining unlike units (ml, minutes, hours) into one score. */
function ratio(value: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.max(0, Math.min(1, value / goal)) * 100;
}

export interface TodayStats {
  sleepHours: number;
  waterMl: number;
  studyMinutes: number;
  exerciseMinutes: number;
}

export interface WellnessGoals {
  dailySleepGoalHours: number;
  dailyWaterGoalMl: number;
  dailyStudyGoalHours: number;
  dailyExerciseGoalMins: number;
}

/** Average of four goal-completion ratios. Simple and legible on purpose —
 * a student should be able to guess why the number moved. */
export function computeWellnessScore(stats: TodayStats, goals: WellnessGoals): number {
  const components = [
    ratio(stats.sleepHours, goals.dailySleepGoalHours),
    ratio(stats.waterMl, goals.dailyWaterGoalMl),
    ratio(stats.studyMinutes, goals.dailyStudyGoalHours * 60),
    ratio(stats.exerciseMinutes, goals.dailyExerciseGoalMins),
  ];
  return Math.round(components.reduce((a, b) => a + b, 0) / components.length);
}

/** EXCUSED records count toward neither side — they're neither a present
 * nor an absent mark for the purpose of the percentage. */
export function computeAttendanceRate(records: { status: AttendanceStatus }[]): number | null {
  const counted = records.filter((r) => r.status !== "EXCUSED");
  if (counted.length === 0) return null;
  const present = counted.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
  return Math.round((present / counted.length) * 100);
}

export interface GoalLike {
  type: "STUDY_HOURS" | "WATER_GLASSES" | "SLEEP_HOURS" | "EXERCISE_MINUTES" | "CUSTOM";
  targetValue: number;
  currentValue: number;
}

/** For the four typed goal categories, "current" is derived live from
 * today's logs rather than the stored `currentValue` — so the goal reflects
 * reality even if the student never manually updates it. CUSTOM goals have
 * no log to derive from, so they fall back to the stored value. */
export function computeGoalProgress<T extends GoalLike>(goal: T, stats: TodayStats): T & { currentValue: number; progress: number } {
  let current = goal.currentValue;
  if (goal.type === "STUDY_HOURS") current = stats.studyMinutes / 60;
  if (goal.type === "WATER_GLASSES") current = stats.waterMl / 250; // ~1 glass
  if (goal.type === "SLEEP_HOURS") current = stats.sleepHours;
  if (goal.type === "EXERCISE_MINUTES") current = stats.exerciseMinutes;
  return { ...goal, currentValue: current, progress: Math.min(1, current / goal.targetValue) };
}

const QUOTES = [
  "Small, boring, repeated actions beat big, exciting, one-time ones.",
  "You don't need a perfect week. You need a slightly better one.",
  "Rest is not the opposite of progress — it's part of it.",
  "The version of you a month from now is built today, in minutes, not hours.",
  "Consistency is a skill. It gets easier the more you practice it.",
  "One tracked day won't change your semester. Thirty will.",
  "Progress hides in the days that felt like nothing happened.",
];

/** Deterministic by date, not random — same quote all day, changes tomorrow. */
export function quoteOfTheDay(date = new Date()): string {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  return QUOTES[dayIndex % QUOTES.length]!;
}
