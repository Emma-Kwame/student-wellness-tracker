import { Card, CardContent } from "@/components/ui/card";

type Entry = { amountMl: number; loggedAt: Date };

function timeBucket(date: Date): "morning" | "afternoon" | "evening" {
  const hour = date.getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export function WaterInsightCard({ entries, todayMl, goalMl }: { entries: Entry[]; todayMl: number; goalMl: number }) {
  const pct = Math.min(100, Math.round((todayMl / goalMl) * 100));
  const insights: string[] = [];

  if (todayMl >= goalMl) {
    insights.push("💡 You've hit your hydration goal for today — nice consistency.");
  } else {
    insights.push(`💡 You're ${pct}% toward today's goal.`);
    const remaining = goalMl - todayMl;
    insights.push(`💡 ${remaining} ml left — a couple more glasses will get you there.`);
  }

  if (entries.length > 0) {
    const totals: Record<string, number> = { morning: 0, afternoon: 0, evening: 0 };
    for (const entry of entries) totals[timeBucket(entry.loggedAt)] += entry.amountMl;
    const [topBucket] = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]!;
    if (totals[topBucket]! > 0) {
      const label = topBucket.charAt(0).toUpperCase() + topBucket.slice(1);
      insights.push(`💡 Most of your water today was logged in the ${label.toLowerCase()}.`);
    }
  }

  return (
    <Card className="border-dashed">
      <CardContent className="space-y-1.5 p-4">
        {insights.map((line) => (
          <p key={line} className="text-sm text-muted">
            {line}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}
