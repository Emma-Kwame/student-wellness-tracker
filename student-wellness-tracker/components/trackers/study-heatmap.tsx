import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatMinutes, cn } from "@/lib/utils";

const LEVEL_CLASSES = [
  "bg-ink/5",
  "bg-focus/25",
  "bg-focus/50",
  "bg-focus/75",
  "bg-focus",
] as const;

function levelFor(minutes: number, goalMin: number): number {
  if (minutes <= 0) return 0;
  if (goalMin <= 0) return minutes > 0 ? 2 : 0;
  const pct = minutes / goalMin;
  if (pct < 0.25) return 1;
  if (pct < 0.5) return 2;
  if (pct < 0.75) return 3;
  return 4;
}

export function StudyHeatmap({ data, dailyGoalMin }: { data: { date: string; minutes: number }[]; dailyGoalMin: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>This week</CardTitle>
        <CardDescription>Darker means closer to (or past) your daily goal</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {data.map((d) => (
            <div key={d.date} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] uppercase text-muted">{d.date}</span>
              <div
                title={`${d.date}: ${formatMinutes(d.minutes)}`}
                className={cn("aspect-square w-full rounded-md", LEVEL_CLASSES[levelFor(d.minutes, dailyGoalMin)])}
              />
              <span className="text-[10px] text-muted">{d.minutes > 0 ? formatMinutes(d.minutes) : "—"}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
