import { getSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { daysAgo, startOfDay, sleepTipOfTheDay } from "@/lib/wellness";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SleepLogForm } from "@/components/trackers/sleep-log-form";
import { SleepHistoryList } from "@/components/trackers/sleep-history-list";
import { SleepSummaryCard } from "@/components/trackers/sleep-summary-card";
import { SleepWeeklyChart } from "@/components/trackers/sleep-weekly-chart";

export default async function SleepPage() {
  const session = await getSession();
  const userId = session!.user.id;
  const weekStart = daysAgo(6);

  const [entries, weekLogs] = await Promise.all([
    prisma.sleepLog.findMany({
      where: { userId, deletedAt: null },
      orderBy: { bedtime: "desc" },
      take: 50,
    }),
    prisma.sleepLog.findMany({
      where: { userId, deletedAt: null, wakeTime: { gte: weekStart } },
      select: { wakeTime: true, durationMin: true },
    }),
  ]);

  const weeklyChartData = Array.from({ length: 7 }).map((_, i) => {
    const day = daysAgo(6 - i);
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    const minutes = weekLogs
      .filter((l) => startOfDay(l.wakeTime).getTime() === day.getTime())
      .reduce((sum, l) => sum + l.durationMin, 0);
    return { date: label, hours: Math.round((minutes / 60) * 10) / 10 };
  });

  const lastNight = entries[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Sleep</h1>
        <p className="mt-1 text-muted">Bedtime, wake time, and how rested you actually felt.</p>
      </div>

      {lastNight && <SleepSummaryCard log={lastNight} />}

      <Card className="border-dashed">
        <CardContent className="p-4 text-sm text-muted">{sleepTipOfTheDay()}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log sleep</CardTitle>
        </CardHeader>
        <CardContent>
          <SleepLogForm />
        </CardContent>
      </Card>

      <SleepWeeklyChart data={weeklyChartData} />

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <SleepHistoryList entries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}
