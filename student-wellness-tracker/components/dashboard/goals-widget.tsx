import Link from "next/link";
import { Target } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type GoalItem = {
  id: string;
  label: string;
  targetValue: number;
  currentValue: number;
  progress: number;
};

export function GoalsWidget({ goals }: { goals: GoalItem[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Daily goals</CardTitle>
        <Target className="h-4 w-4 text-focus" />
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">No active goals yet.</p>
        ) : (
          <ul className="space-y-4">
            {goals.map((goal) => (
              <li key={goal.id}>
                <div className="flex items-center justify-between text-sm">
                  <span>{goal.label}</span>
                  <span className="text-muted">
                    {goal.currentValue.toFixed(1)} / {goal.targetValue}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/5">
                  <div
                    className="h-full rounded-full bg-focus transition-all"
                    style={{ width: `${Math.round(goal.progress * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link href="/dashboard/goals" className="mt-4 block text-center text-sm text-focus hover:underline">
          Manage goals
        </Link>
      </CardContent>
    </Card>
  );
}
