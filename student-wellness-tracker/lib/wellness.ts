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

export const MOOD_META: Record<Mood, { emoji: string; label: string; description: string; prompt: string }> = {
  AMAZING: {
    emoji: "😄",
    label: "Amazing",
    description: "Everything's going great",
    prompt: "🎉 That's awesome! What made today great?",
  },
  HAPPY: {
    emoji: "😊",
    label: "Happy",
    description: "Feeling good today",
    prompt: "😊 Great to hear! What's contributing to that?",
  },
  GOOD: {
    emoji: "🙂",
    label: "Good",
    description: "A solid, steady day",
    prompt: "🙂 Nice. Anything worth remembering about today?",
  },
  OKAY: {
    emoji: "😐",
    label: "Okay",
    description: "Nothing special, nothing bad",
    prompt: "💭 Anything you'd like to remember about today?",
  },
  STRESSED: {
    emoji: "😟",
    label: "Stressed",
    description: "Feeling the pressure",
    prompt: "🌱 Take a moment. What's been challenging today?",
  },
  SAD: {
    emoji: "😢",
    label: "Sad",
    description: "Feeling down today",
    prompt: "💙 That's okay. Want to jot down what's on your mind?",
  },
  OVERWHELMED: {
    emoji: "😭",
    label: "Overwhelmed",
    description: "Too much all at once",
    prompt: "❤️ Thanks for checking in. Writing a few words might help you reflect.",
  },
};

export const ALL_MOODS = Object.keys(MOOD_META) as Mood[];

/** Tailwind classes per mood — written out literally (not interpolated) so
 * Tailwind's source scanner can actually find and generate them. */
export const MOOD_COLORS: Record<Mood, { bg: string; text: string; ring: string; selectedBg: string }> = {
  AMAZING: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-400",
    selectedBg: "bg-emerald-100 dark:bg-emerald-500/20",
  },
  HAPPY: {
    bg: "bg-green-50 dark:bg-green-500/10",
    text: "text-green-600 dark:text-green-400",
    ring: "ring-green-400",
    selectedBg: "bg-green-100 dark:bg-green-500/20",
  },
  GOOD: {
    bg: "bg-lime-50 dark:bg-lime-500/10",
    text: "text-lime-600 dark:text-lime-400",
    ring: "ring-lime-400",
    selectedBg: "bg-lime-100 dark:bg-lime-500/20",
  },
  OKAY: {
    bg: "bg-gray-100 dark:bg-gray-500/10",
    text: "text-gray-600 dark:text-gray-400",
    ring: "ring-gray-400",
    selectedBg: "bg-gray-200 dark:bg-gray-500/20",
  },
  STRESSED: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-400",
    selectedBg: "bg-amber-100 dark:bg-amber-500/20",
  },
  SAD: {
    bg: "bg-orange-50 dark:bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    ring: "ring-orange-400",
    selectedBg: "bg-orange-100 dark:bg-orange-500/20",
  },
  OVERWHELMED: {
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    ring: "ring-red-400",
    selectedBg: "bg-red-100 dark:bg-red-500/20",
  },
};

/** 1–5 scale for charting mood trends alongside numeric metrics like sleep/study. */
export const MOOD_SCORE: Record<Mood, number> = {
  OVERWHELMED: 1,
  SAD: 2,
  STRESSED: 2,
  OKAY: 3,
  GOOD: 4,
  HAPPY: 4,
  AMAZING: 5,
};

/** 0–100 ratio, capped, for combining unlike units (ml, minutes, hours) into one score. */
export function ratio(value: number, goal: number): number {
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
