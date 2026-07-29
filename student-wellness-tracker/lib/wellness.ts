import type {
  Mood,
  AttendanceStatus,
  SleepQuality,
  Restedness,
  ExerciseType,
  ExerciseIntensity,
} from "@/generated/prisma/client";
import { formatMinutes } from "@/lib/utils";

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

export const SLEEP_QUALITY_META: Record<SleepQuality, { emoji: string; label: string; value: number }> = {
  POOR: { emoji: "😴", label: "Poor", value: 1 },
  FAIR: { emoji: "😐", label: "Fair", value: 2 },
  GOOD: { emoji: "🙂", label: "Good", value: 3 },
  GREAT: { emoji: "😊", label: "Great", value: 4 },
  EXCELLENT: { emoji: "🤩", label: "Excellent", value: 5 },
};

export const ALL_SLEEP_QUALITIES = Object.keys(SLEEP_QUALITY_META) as SleepQuality[];

/** Worst-to-best color scale, mirroring the mood picker's visual language. */
export const SLEEP_QUALITY_COLORS: Record<SleepQuality, { bg: string; text: string; ring: string; selectedBg: string }> = {
  POOR: {
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    ring: "ring-red-400",
    selectedBg: "bg-red-100 dark:bg-red-500/20",
  },
  FAIR: {
    bg: "bg-orange-50 dark:bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    ring: "ring-orange-400",
    selectedBg: "bg-orange-100 dark:bg-orange-500/20",
  },
  GOOD: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-400",
    selectedBg: "bg-amber-100 dark:bg-amber-500/20",
  },
  GREAT: {
    bg: "bg-lime-50 dark:bg-lime-500/10",
    text: "text-lime-600 dark:text-lime-400",
    ring: "ring-lime-400",
    selectedBg: "bg-lime-100 dark:bg-lime-500/20",
  },
  EXCELLENT: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-400",
    selectedBg: "bg-emerald-100 dark:bg-emerald-500/20",
  },
};

export const RESTEDNESS_META: Record<Restedness, { emoji: string; label: string }> = {
  EXHAUSTED: { emoji: "😴", label: "Exhausted" },
  OKAY: { emoji: "😐", label: "Okay" },
  REFRESHED: { emoji: "😊", label: "Refreshed" },
};

export const ALL_RESTEDNESS = Object.keys(RESTEDNESS_META) as Restedness[];

export const IDEAL_SLEEP_HOURS = { min: 7, max: 9 };

/** 0–100: 60% how close duration is to the 7–9h ideal band, 40% self-rated quality. */
export function computeSleepScore(durationMin: number, quality: SleepQuality): number {
  const hours = durationMin / 60;
  const { min, max } = IDEAL_SLEEP_HOURS;
  const deviation = hours < min ? min - hours : hours > max ? hours - max : 0;
  const durationScore = Math.max(0, 100 - deviation * 15);
  const qualityScore = (SLEEP_QUALITY_META[quality].value / 5) * 100;
  return Math.round(durationScore * 0.6 + qualityScore * 0.4);
}

export function sleepScoreBand(score: number): { label: string; dot: string; text: string } {
  if (score >= 85) return { label: "Excellent", dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 70) return { label: "Good", dot: "bg-amber-400", text: "text-amber-600 dark:text-amber-400" };
  if (score >= 50) return { label: "Fair", dot: "bg-orange-500", text: "text-orange-600 dark:text-orange-400" };
  return { label: "Poor", dot: "bg-red-500", text: "text-red-600 dark:text-red-400" };
}

/** A plain-language nudge based on how the logged duration compares to the
 * recommended 7–9h band — shown live in the form and on the summary card. */
export function sleepRecommendation(durationMin: number): { message: string; isGood: boolean } {
  const hours = durationMin / 60;
  const { min, max } = IDEAL_SLEEP_HOURS;
  if (hours < min) {
    return {
      message: `⚠️ You slept only ${formatSleepDuration(durationMin)}. Aim for ${min}–${max} hours of sleep.`,
      isGood: false,
    };
  }
  if (hours > max) {
    return {
      message: `😴 That's ${formatSleepDuration(durationMin)} — more than the usual ${min}–${max}h range. If you're oversleeping often, it's worth mentioning to a doctor.`,
      isGood: false,
    };
  }
  return { message: "🌙 Great job! You met the recommended sleep duration.", isGood: true };
}

export function formatSleepDuration(durationMin: number): string {
  const hours = Math.floor(durationMin / 60);
  const minutes = durationMin % 60;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

const SLEEP_TIPS = [
  "💡 Avoid screens 30 minutes before bed — blue light delays your body's melatonin release.",
  "💡 Keep your room cool, ideally around 18°C (65°F), for deeper sleep.",
  "💡 Consistent sleep schedules improve concentration more than extra weekend sleep-ins.",
  "💡 Caffeine can affect sleep up to 6 hours after drinking it — cut off by early afternoon.",
  "💡 A short walk after lunch can improve how quickly you fall asleep at night.",
  "💡 If you can't fall asleep in 20 minutes, get up and do something calm until you feel drowsy.",
  "💡 Naps under 30 minutes boost alertness without wrecking your nighttime sleep.",
];

/** Deterministic by date, not random — same tip all day, changes tomorrow. */
export function sleepTipOfTheDay(date = new Date()): string {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  return SLEEP_TIPS[dayIndex % SLEEP_TIPS.length]!;
}

export const EXERCISE_TYPE_META: Record<ExerciseType, { emoji: string; label: string }> = {
  WALKING: { emoji: "🚶", label: "Walking" },
  RUNNING: { emoji: "🏃", label: "Running" },
  CYCLING: { emoji: "🚴", label: "Cycling" },
  GYM: { emoji: "🏋️", label: "Gym" },
  FOOTBALL: { emoji: "⚽", label: "Football" },
  YOGA: { emoji: "🧘", label: "Yoga" },
  BASKETBALL: { emoji: "🏀", label: "Basketball" },
  OTHER: { emoji: "➕", label: "Other" },
};

export const ALL_EXERCISE_TYPES = Object.keys(EXERCISE_TYPE_META) as ExerciseType[];

export const EXERCISE_INTENSITY_META: Record<ExerciseIntensity, { emoji: string; label: string; dot: string }> = {
  LOW: { emoji: "🟢", label: "Light", dot: "bg-emerald-500" },
  MODERATE: { emoji: "🟡", label: "Moderate", dot: "bg-amber-400" },
  HIGH: { emoji: "🔴", label: "Intense", dot: "bg-red-500" },
};

export const ALL_EXERCISE_INTENSITIES = Object.keys(EXERCISE_INTENSITY_META) as ExerciseIntensity[];

// MET (metabolic equivalent) per activity/intensity — standard exercise-physiology
// reference values. Calories = MET × 3.5 × bodyweight(kg) / 200 × minutes.
const MET_TABLE: Record<ExerciseType, Record<ExerciseIntensity, number>> = {
  WALKING: { LOW: 2.8, MODERATE: 3.5, HIGH: 4.5 },
  RUNNING: { LOW: 6.0, MODERATE: 9.0, HIGH: 12.0 },
  CYCLING: { LOW: 4.0, MODERATE: 8.0, HIGH: 10.0 },
  GYM: { LOW: 3.0, MODERATE: 5.0, HIGH: 6.5 },
  FOOTBALL: { LOW: 5.0, MODERATE: 7.0, HIGH: 10.0 },
  YOGA: { LOW: 2.0, MODERATE: 3.0, HIGH: 4.0 },
  BASKETBALL: { LOW: 4.5, MODERATE: 6.5, HIGH: 8.0 },
  OTHER: { LOW: 3.0, MODERATE: 5.0, HIGH: 7.0 },
};

// We don't collect body weight, so this assumes an average 70kg adult — it's a
// starting estimate the student can (and should) overwrite, not a personalized figure.
const ASSUMED_BODYWEIGHT_KG = 70;

export function estimateExerciseCalories(type: ExerciseType, intensity: ExerciseIntensity, durationMin: number): number {
  const met = MET_TABLE[type][intensity];
  return Math.round(((met * 3.5 * ASSUMED_BODYWEIGHT_KG) / 200) * durationMin);
}

export function exerciseMotivationMessage(durationMin: number, weeklyMinutesSoFar: number, weeklyGoalMin: number): string {
  const remaining = weeklyGoalMin - weeklyMinutesSoFar;
  if (weeklyMinutesSoFar >= weeklyGoalMin) {
    return `🎉 Nice work! You exercised for ${formatMinutes(durationMin)} today — and you've hit your weekly goal.`;
  }
  if (remaining <= 30) {
    return `💪 Great consistency. You're only ${remaining} minutes away from your weekly goal.`;
  }
  return `🎉 Nice work! You exercised for ${formatMinutes(durationMin)} today. Keep it up!`;
}

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

const STUDY_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Well begun is half done.", author: "Aristotle" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
] as const;

/** Deterministic by date, not random — same quote all day, changes tomorrow. */
export function studyQuoteOfTheDay(date = new Date()): { text: string; author: string } {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  return STUDY_QUOTES[dayIndex % STUDY_QUOTES.length]!;
}

const STUDY_HOUR_WINDOWS = [
  { label: "Early morning (5 AM–8 AM)", start: 5, end: 8 },
  { label: "Morning (8 AM–11 AM)", start: 8, end: 11 },
  { label: "Midday (11 AM–2 PM)", start: 11, end: 14 },
  { label: "Afternoon (2 PM–5 PM)", start: 14, end: 17 },
  { label: "Evening (5 PM–8 PM)", start: 17, end: 20 },
  { label: "Night (8 PM–11 PM)", start: 20, end: 23 },
  { label: "Late night (11 PM–5 AM)", start: 23, end: 29 }, // wraps past midnight
] as const;

export interface StudyInsights {
  bestWindowLabel: string;
  avgMinutes: number;
  longestMinutes: number;
}

/** Computed from the student's own history — not a generic claim. Returns
 * null until there's enough data (3+ sessions) for the numbers to mean anything. */
export function computeStudyInsights(sessions: { startedAt: Date; durationMin: number | null }[]): StudyInsights | null {
  const timed = sessions.filter((s): s is { startedAt: Date; durationMin: number } => (s.durationMin ?? 0) > 0);
  if (timed.length < 3) return null;

  const windowTotals = STUDY_HOUR_WINDOWS.map(() => 0);
  for (const s of timed) {
    const hour = s.startedAt.getHours();
    const normalizedHour = hour < 5 ? hour + 24 : hour; // fold early-AM hours into the "late night" window
    const idx = STUDY_HOUR_WINDOWS.findIndex((w) => normalizedHour >= w.start && normalizedHour < w.end);
    if (idx >= 0) windowTotals[idx] = windowTotals[idx]! + s.durationMin;
  }
  const bestIdx = windowTotals.indexOf(Math.max(...windowTotals));

  const totalMinutes = timed.reduce((sum, s) => sum + s.durationMin, 0);

  return {
    bestWindowLabel: STUDY_HOUR_WINDOWS[bestIdx]!.label,
    avgMinutes: Math.round(totalMinutes / timed.length),
    longestMinutes: Math.max(...timed.map((s) => s.durationMin)),
  };
}
