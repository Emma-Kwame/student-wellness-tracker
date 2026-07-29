import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function formatL(ml: number): string {
  return `${(ml / 1000).toFixed(1)} L`;
}

export function WaterSummaryCard({
  todayMl,
  goalMl,
  currentStreak,
}: {
  todayMl: number;
  goalMl: number;
  currentStreak: number;
}) {
  const pct = Math.min(100, Math.round((todayMl / goalMl) * 100));
  const remainingMl = Math.max(0, goalMl - todayMl);
  const goalReached = todayMl >= goalMl;

  return (
    <Card className={cn("border-none", goalReached ? "bg-vitality/15" : "bg-focus/5")}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-sm font-medium">💧 Hydration Today</p>
          {currentStreak > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-dawn/15 px-2.5 py-1 text-xs font-medium text-dawn">
              🔥 {currentStreak}-day streak
            </span>
          )}
        </div>

        {goalReached ? (
          <p className="mt-3 font-display text-lg">🎉 Great job! You reached today&apos;s hydration goal.</p>
        ) : null}

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-ink/5">
          <div
            className={cn("h-full rounded-full transition-all duration-500", goalReached ? "bg-vitality" : "bg-focus")}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-3xl">
              {formatL(todayMl)} <span className="text-lg text-muted">/ {formatL(goalMl)}</span>
            </p>
            <p className="text-sm text-muted">{pct}% of today&apos;s goal</p>
          </div>
          <p className="text-sm font-medium text-muted">
            {goalReached ? `${formatL(todayMl - goalMl)} over goal` : `${remainingMl} ml remaining`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
