import { getSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { daysAgo, startOfDay, endOfDay, studyQuoteOfTheDay } from "@/lib/wellness";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StudySessionForm } from "@/components/trackers/study-session-form";
import { CourseForm } from "@/components/trackers/course-form";
import { StudyHistoryList } from "@/components/trackers/study-history-list";
import { StudyTodaySummary } from "@/components/trackers/study-today-summary";
import { StudyHeatmap } from "@/components/trackers/study-heatmap";
import { StudyInsightsCard } from "@/components/trackers/study-insights-card";

export default async function StudyPage() {
  const session = await getSession();
  const userId = session!.user.id;
  const weekStart = daysAgo(6);

  const [profile, courses, entries, weekSessions] = await Promise.all([
    prisma.userProfile.findUniqueOrThrow({ where: { userId } }),
    prisma.course.findMany({ where: { userId, deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.studySession.findMany({
      where: { userId, deletedAt: null },
      orderBy: { startedAt: "desc" },
      take: 50,
      include: { course: { select: { name: true, color: true } } },
    }),
    prisma.studySession.findMany({
      where: { userId, deletedAt: null, startedAt: { gte: weekStart } },
      select: { startedAt: true, durationMin: true },
    }),
  ]);

  const todayStart = startOfDay();
  const todayEnd = endOfDay();
  const todayEntries = entries.filter((e) => e.startedAt >= todayStart && e.startedAt <= todayEnd);
  const todayMinutes = todayEntries.reduce((sum, e) => sum + (e.durationMin ?? 0), 0);

  const dailyGoalMin = Math.round(profile.dailyStudyGoalHours * 60);
  const weeklyGoalMin = dailyGoalMin * 7;
  const weeklyMinutesSoFar = weekSessions.reduce((sum, s) => sum + (s.durationMin ?? 0), 0);

  const heatmapData = Array.from({ length: 7 }).map((_, i) => {
    const day = daysAgo(6 - i);
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    const minutes = weekSessions
      .filter((s) => startOfDay(s.startedAt).getTime() === day.getTime())
      .reduce((sum, s) => sum + (s.durationMin ?? 0), 0);
    return { date: label, minutes };
  });

  const quote = studyQuoteOfTheDay();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Study</h1>
        <p className="mt-1 text-muted">Start a session, or log time you already put in.</p>
      </div>

      <StudyTodaySummary
        todayMinutes={todayMinutes}
        todaySessionCount={todayEntries.length}
        currentStreak={profile.currentStreak}
        weeklyMinutesSoFar={weeklyMinutesSoFar}
        weeklyGoalMin={weeklyGoalMin}
      />

      <Card className="border-dashed">
        <CardContent className="p-4 text-sm text-muted">
          💡 &ldquo;{quote.text}&rdquo; — {quote.author}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent>
          <StudySessionForm courses={courses} todayMinutesSoFar={todayMinutes} dailyGoalMin={dailyGoalMin} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <StudyHeatmap data={heatmapData} dailyGoalMin={dailyGoalMin} />
        <StudyInsightsCard sessions={entries} />
      </div>

      <Card id="courses-section">
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>Add the courses you want to track hours and attendance against.</CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <StudyHistoryList entries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}
