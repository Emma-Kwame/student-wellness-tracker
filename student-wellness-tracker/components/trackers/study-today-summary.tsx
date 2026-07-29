import { Card, CardContent } from "@/components/ui/card";
import { formatMinutes, cn } from "@/lib/utils";
import { ratio } from "@/lib/wellness";

export function StudyTodaySummary({
  todayMinutes,
  todaySessionCount,
  currentStreak,
  weeklyMinutesSoFar,
  weeklyGoalMin,
}: {
  todayMinutes: number;
  todaySessionCount: number;
  currentStreak: number;
  weeklyMinutesSoFar: number;
  weeklyGoalMin: number;
}) {
  const pct = Math.round(ratio(weeklyMinutesSoFar, weeklyGoalMin));

  return (
    <Card className="border-none bg-focus/5">
      <CardContent className="p-6">
        <p className="text-sm font-medium">📚 Today</p>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          <div>
            <p className="font-display text-3xl">{formatMinutes(todayMinutes)}</p>
            <p className="text-xs text-muted">Studied</p>
          </div>
          <div>
            <p className="font-display text-3xl">{todaySessionCount}</p>
            <p className="text-xs text-muted">{todaySessionCount === 1 ? "Session" : "Sessions"}</p>
          </div>
          {currentStreak > 0 && (
            <div>
              <p className="font-display text-3xl">🔥 {currentStreak}</p>
              <p className="text-xs text-muted">Day streak</p>
            </div>
          )}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Weekly Goal</span>
            <span className="text-muted">
              {formatMinutes(weeklyMinutesSoFar)} / {formatMinutes(weeklyGoalMin)} · {pct}%
            </span>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-ink/5">
            <div
              className={cn("h-full rounded-full transition-all duration-500", pct >= 100 ? "bg-vitality" : "bg-focus")}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
