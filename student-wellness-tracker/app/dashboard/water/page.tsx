import { getSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { daysAgo, startOfDay, endOfDay } from "@/lib/wellness";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WaterLogForm } from "@/components/trackers/water-log-form";
import { WaterHistoryList } from "@/components/trackers/water-history-list";
import { WaterSummaryCard } from "@/components/trackers/water-summary-card";
import { WaterGoalEditor } from "@/components/trackers/water-goal-editor";
import { WaterWeeklyChart } from "@/components/trackers/water-weekly-chart";
import { WaterInsightCard } from "@/components/trackers/water-insight-card";

export default async function WaterPage() {
  const session = await getSession();
  const userId = session!.user.id;
  const weekStart = daysAgo(6);

  const [profile, entries, weekLogs] = await Promise.all([
    prisma.userProfile.findUniqueOrThrow({ where: { userId } }),
    prisma.waterLog.findMany({
      where: { userId, loggedAt: { gte: startOfDay(), lte: endOfDay() } },
      orderBy: { loggedAt: "desc" },
    }),
    prisma.waterLog.findMany({
      where: { userId, loggedAt: { gte: weekStart } },
      select: { loggedAt: true, amountMl: true },
    }),
  ]);

  const total = entries.reduce((sum, e) => sum + e.amountMl, 0);

  const weeklyChartData = Array.from({ length: 7 }).map((_, i) => {
    const day = daysAgo(6 - i);
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    const ml = weekLogs
      .filter((l) => startOfDay(l.loggedAt).getTime() === day.getTime())
      .reduce((sum, l) => sum + l.amountMl, 0);
    return { date: label, liters: Math.round((ml / 1000) * 10) / 10 };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl tracking-tight">💧 Hydration</h1>
        <p className="mt-1 text-muted">{(total / 1000).toFixed(1)} L logged today.</p>
      </div>

      <WaterSummaryCard todayMl={total} goalMl={profile.dailyWaterGoalMl} currentStreak={profile.currentStreak} />
      <WaterInsightCard entries={entries} todayMl={total} goalMl={profile.dailyWaterGoalMl} />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Add water</CardTitle>
          <WaterGoalEditor goalMl={profile.dailyWaterGoalMl} />
        </CardHeader>
        <CardContent>
          <WaterLogForm />
        </CardContent>
      </Card>

      <WaterWeeklyChart data={weeklyChartData} goalL={profile.dailyWaterGoalMl / 1000} />

      <Card>
        <CardHeader>
          <CardTitle>Today</CardTitle>
        </CardHeader>
        <CardContent>
          <WaterHistoryList entries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}
