import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ratio } from "@/lib/wellness";

function ProgressRow({ label, percent, colorClass }: { label: string; percent: number; colorClass: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{percent}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/5">
        <div className={`h-full rounded-full ${colorClass} transition-all`} style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
    </div>
  );
}

export function TodayGoalTracker({
  studyMinutes,
  studyGoalMinutes,
  waterMl,
  waterGoalMl,
  exerciseMinutes,
  exerciseGoalMins,
  taskCompletion,
}: {
  studyMinutes: number;
  studyGoalMinutes: number;
  waterMl: number;
  waterGoalMl: number;
  exerciseMinutes: number;
  exerciseGoalMins: number;
  taskCompletion: { completed: number; total: number };
}) {
  const taskPercent = taskCompletion.total === 0 ? 100 : Math.round((taskCompletion.completed / taskCompletion.total) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Goal Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <ProgressRow label="Study Sessions" percent={Math.round(ratio(studyMinutes, studyGoalMinutes))} colorClass="bg-focus" />
        <ProgressRow label="Hydration Intake" percent={Math.round(ratio(waterMl, waterGoalMl))} colorClass="bg-focus/70" />
        <ProgressRow label="Daily Exercise" percent={Math.round(ratio(exerciseMinutes, exerciseGoalMins))} colorClass="bg-vitality" />
        <ProgressRow label="Task Completion" percent={taskPercent} colorClass="bg-dawn" />
      </CardContent>
    </Card>
  );
}
