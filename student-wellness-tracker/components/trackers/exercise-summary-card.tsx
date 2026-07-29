import { Card, CardContent } from "@/components/ui/card";
import { MOOD_META, MOOD_COLORS, ratio } from "@/lib/wellness";
import { formatMinutes, cn } from "@/lib/utils";
import type { Mood } from "@/generated/prisma/client";

export function ExerciseSummaryCard({
  todayMinutes,
  todayCalories,
  todayCount,
  weeklyMinutesSoFar,
  weeklyGoalMin,
  todayMood,
}: {
  todayMinutes: number;
  todayCalories: number;
  todayCount: number;
  weeklyMinutesSoFar: number;
  weeklyGoalMin: number;
  todayMood: Mood | null;
}) {
  const weeklyPct = Math.round(ratio(weeklyMinutesSoFar, weeklyGoalMin));

  return (
    <Card className="border-none bg-focus/5">
      <CardContent className="p-6">
        <p className="text-sm font-medium">🏃 Today&apos;s Activity</p>

        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          <div>
            <p className="font-display text-3xl">{formatMinutes(todayMinutes)}</p>
            <p className="text-xs text-muted">Duration</p>
          </div>
          <div>
            <p className="font-display text-3xl">{todayCalories}</p>
            <p className="text-xs text-muted">kcal (est.)</p>
          </div>
          <div>
            <p className="font-display text-3xl">{todayCount}</p>
            <p className="text-xs text-muted">{todayCount === 1 ? "workout" : "workouts"}</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Weekly Goal</span>
            <span className="text-muted">
              {weeklyMinutesSoFar} / {weeklyGoalMin} min · {weeklyPct}%
            </span>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-ink/5">
            <div className="h-full rounded-full bg-focus transition-all duration-500" style={{ width: `${Math.min(100, weeklyPct)}%` }} />
          </div>
        </div>

        {todayMood && (
          <div className={cn("mt-5 flex items-center justify-between rounded-xl p-3", MOOD_COLORS[todayMood].bg)}>
            <div>
              <p className="text-xs text-muted">Today&apos;s Mood</p>
              <p className={cn("text-sm font-medium", MOOD_COLORS[todayMood].text)}>
                {MOOD_META[todayMood].emoji} {MOOD_META[todayMood].label}
              </p>
            </div>
            {todayMinutes > 0 && (
              <p className="max-w-[55%] text-right text-xs text-muted">
                You&apos;ve exercised {formatMinutes(todayMinutes)} today — moving and mood often go together.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
