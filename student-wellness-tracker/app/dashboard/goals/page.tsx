import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTodayStats } from "@/lib/today-stats";
import { computeGoalProgress } from "@/lib/wellness";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GoalForm } from "@/components/trackers/goal-form";
import { GoalList } from "@/components/trackers/goal-list";

export default async function GoalsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;

  const [goals, todayStats] = await Promise.all([
    prisma.goal.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: "desc" } }),
    getTodayStats(userId),
  ]);

  const goalsWithProgress = goals.map((goal) => computeGoalProgress(goal, todayStats));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Goals</h1>
        <p className="mt-1 text-muted">Set it once, see it every day.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add goal</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your goals</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalList goals={goalsWithProgress} />
        </CardContent>
      </Card>
    </div>
  );
}
