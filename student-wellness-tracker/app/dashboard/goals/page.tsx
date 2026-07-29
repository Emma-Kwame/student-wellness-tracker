import { Target, CheckCircle2, TrendingUp, Flag } from "lucide-react";
import { getSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { getTodayStats } from "@/lib/today-stats";
import { computeGoalProgress, GOAL_TYPE_META } from "@/lib/wellness";
import {
  getDailyValuesForTypes,
  computeStreak,
  weeklyPerformance,
  suggestGoalTargets,
  TYPED_GOAL_TYPES,
  type TypedGoalType,
} from "@/lib/goal-insights";
import { Card } from "@/components/ui/card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { GoalsManager } from "@/components/trackers/goals-manager";

export default async function GoalsPage() {
  const session = await getSession();
  const userId = session!.user.id;

  const [goals, todayStats, profile, dailyValues, studySum, sleepSum, waterSum, exerciseSum] = await Promise.all([
    prisma.goal.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: "desc" } }),
    getTodayStats(userId),
    prisma.userProfile.findUniqueOrThrow({ where: { userId } }),
    getDailyValuesForTypes(userId, 30),
    prisma.studySession.aggregate({ where: { userId, deletedAt: null }, _sum: { durationMin: true } }),
    prisma.sleepLog.aggregate({ where: { userId, deletedAt: null }, _sum: { durationMin: true } }),
    prisma.waterLog.aggregate({ where: { userId }, _sum: { amountMl: true } }),
    prisma.exerciseLog.aggregate({ where: { userId, deletedAt: null }, _sum: { durationMin: true } }),
  ]);

  const goalsWithProgress = goals.map((goal) => computeGoalProgress(goal, todayStats));

  const lifetimeTotals: Record<TypedGoalType, number> = {
    STUDY_HOURS: (studySum._sum.durationMin ?? 0) / 60,
    SLEEP_HOURS: (sleepSum._sum.durationMin ?? 0) / 60,
    WATER_GLASSES: (waterSum._sum.amountMl ?? 0) / 250,
    EXERCISE_MINUTES: exerciseSum._sum.durationMin ?? 0,
  };

  const insights: Record<string, { streak: number; weekly: ReturnType<typeof weeklyPerformance>; lifetimeTotal: number } | null> = {};
  for (const goal of goalsWithProgress) {
    if (goal.type === "CUSTOM") {
      insights[goal.id] = null;
      continue;
    }
    const values = dailyValues[goal.type as TypedGoalType];
    insights[goal.id] = {
      streak: computeStreak(values, goal.targetValue),
      weekly: weeklyPerformance(values, goal.targetValue),
      lifetimeTotal: lifetimeTotals[goal.type as TypedGoalType],
    };
  }

  const suggestedDefaults: Record<TypedGoalType, { target: number; unit: string }> = {
    STUDY_HOURS: { target: profile.dailyStudyGoalHours, unit: GOAL_TYPE_META.STUDY_HOURS.unit },
    WATER_GLASSES: { target: Math.round(profile.dailyWaterGoalMl / 250), unit: GOAL_TYPE_META.WATER_GLASSES.unit },
    SLEEP_HOURS: { target: profile.dailySleepGoalHours, unit: GOAL_TYPE_META.SLEEP_HOURS.unit },
    EXERCISE_MINUTES: { target: profile.dailyExerciseGoalMins, unit: GOAL_TYPE_META.EXERCISE_MINUTES.unit },
  };

  const existingTypes = new Set(goals.map((g) => g.type));
  const recommendations = suggestGoalTargets(dailyValues, existingTypes).filter((r) => TYPED_GOAL_TYPES.includes(r.type));

  const activeGoals = goalsWithProgress.filter((g) => g.isActive);
  const completedGoals = activeGoals.filter((g) => g.progress >= 1);
  const successRate = activeGoals.length > 0 ? Math.round((completedGoals.length / activeGoals.length) * 100) : 0;
  const inProgress = activeGoals.filter((g) => g.progress < 1).sort((a, b) => b.progress - a.progress);
  const closestGoal = inProgress[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Goals</h1>
        <p className="mt-1 text-muted">Set it once, see it every day.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile icon={Target} label="Active Goals" value={String(activeGoals.length)} accent="text-focus" />
        <StatTile icon={CheckCircle2} label="Completed" value={String(completedGoals.length)} accent="text-vitality" />
        <StatTile icon={TrendingUp} label="Success Rate" value={`${successRate}%`} accent="text-dawn" />
        <StatTile
          icon={Flag}
          label="Closest Goal"
          value={closestGoal ? `${Math.round(closestGoal.progress * 100)}%` : "—"}
          sublabel={closestGoal?.label}
          accent="text-focus"
        />
      </div>

      <Card>
        <div className="p-6">
          <GoalsManager
            goals={goalsWithProgress.map((g) => ({
              id: g.id,
              type: g.type,
              label: g.label,
              unit: g.unit,
              targetValue: g.targetValue,
              currentValue: g.currentValue,
              progress: g.progress,
              isActive: g.isActive,
              reminderTime: g.reminderTime,
            }))}
            insights={insights}
            suggestedDefaults={suggestedDefaults}
            recommendations={recommendations}
          />
        </div>
      </Card>
    </div>
  );
}
