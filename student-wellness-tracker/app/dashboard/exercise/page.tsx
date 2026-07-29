import { getSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { daysAgo, startOfDay, endOfDay } from "@/lib/wellness";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExerciseLogForm } from "@/components/trackers/exercise-log-form";
import { ExerciseHistoryList } from "@/components/trackers/exercise-history-list";
import { ExerciseSummaryCard } from "@/components/trackers/exercise-summary-card";
import { ExerciseWeeklyChart } from "@/components/trackers/exercise-weekly-chart";

export default async function ExercisePage() {
  const session = await getSession();
  const userId = session!.user.id;
  const weekStart = daysAgo(6);

  const [profile, entries, weekLogs, todayMood] = await Promise.all([
    prisma.userProfile.findUniqueOrThrow({ where: { userId } }),
    prisma.exerciseLog.findMany({
      where: { userId, deletedAt: null },
      orderBy: { loggedAt: "desc" },
      take: 50,
    }),
    prisma.exerciseLog.findMany({
      where: { userId, deletedAt: null, loggedAt: { gte: weekStart } },
      select: { loggedAt: true, durationMin: true },
    }),
    prisma.moodEntry.findFirst({
      where: { userId, deletedAt: null, loggedAt: { gte: startOfDay(), lte: endOfDay() } },
      orderBy: { loggedAt: "desc" },
    }),
  ]);

  const todayStart = startOfDay();
  const todayEnd = endOfDay();
  const todayEntries = entries.filter((e) => e.loggedAt >= todayStart && e.loggedAt <= todayEnd);
  const todayMinutes = todayEntries.reduce((sum, e) => sum + e.durationMin, 0);
  const todayCalories = todayEntries.reduce((sum, e) => sum + (e.calories ?? 0), 0);

  const weeklyMinutesSoFar = weekLogs.reduce((sum, l) => sum + l.durationMin, 0);
  const weeklyGoalMin = profile.dailyExerciseGoalMins * 7;

  const weeklyChartData = Array.from({ length: 7 }).map((_, i) => {
    const day = daysAgo(6 - i);
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    const minutes = weekLogs
      .filter((l) => startOfDay(l.loggedAt).getTime() === day.getTime())
      .reduce((sum, l) => sum + l.durationMin, 0);
    return { date: label, minutes };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Exercise</h1>
        <p className="mt-1 text-muted">Walking, gym, football, cycling, yoga — whatever moved you.</p>
      </div>

      <ExerciseSummaryCard
        todayMinutes={todayMinutes}
        todayCalories={todayCalories}
        todayCount={todayEntries.length}
        weeklyMinutesSoFar={weeklyMinutesSoFar}
        weeklyGoalMin={weeklyGoalMin}
        todayMood={todayMood?.mood ?? null}
      />

      <Card>
        <CardHeader>
          <CardTitle>Log exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <ExerciseLogForm weeklyMinutesSoFar={weeklyMinutesSoFar} weeklyGoalMin={weeklyGoalMin} />
        </CardContent>
      </Card>

      <ExerciseWeeklyChart data={weeklyChartData} />

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <ExerciseHistoryList entries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}
