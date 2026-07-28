import { Moon, BookOpen, Dumbbell, CalendarCheck } from "lucide-react";
import { getSession } from "@/lib/auth-utils";
import { getDashboardData } from "@/lib/dashboard-data";
import { formatMinutes } from "@/lib/utils";
import { quoteOfTheDay } from "@/lib/wellness";
import { WellnessScoreRing } from "@/components/dashboard/wellness-score-ring";
import { StatTile } from "@/components/dashboard/stat-tile";
import { MoodWidget } from "@/components/dashboard/mood-widget";
import { WaterWidget } from "@/components/dashboard/water-widget";
import { WeeklyProgressChart } from "@/components/dashboard/weekly-progress-chart";
import { TasksWidget } from "@/components/dashboard/tasks-widget";
import { AchievementHighlightCard } from "@/components/dashboard/achievement-highlight-card";
import { TodayGoalTracker } from "@/components/dashboard/today-goal-tracker";
import { AiInsightCard } from "@/components/dashboard/ai-insight-card";
import { QuickReflectionCard } from "@/components/dashboard/quick-reflection-card";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await getSession();
  const firstName = session!.user.name.split(" ")[0] ?? "there";

  const data = await getDashboardData(session!.user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl tracking-tight">
            {greeting()}, {firstName} 👋
          </h1>
          <p className="mt-1 text-muted">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} ·{" "}
            <span className="italic">&quot;{quoteOfTheDay()}&quot;</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-6 lg:col-span-3">
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-card px-6 py-5 sm:flex-row sm:items-center">
            <WellnessScoreRing score={data.wellnessScore} />
            <div>
              <p className="text-sm font-medium">Personal Wellness Score</p>
              <p className="text-xs text-muted">Sleep, study, water &amp; exercise vs. today&apos;s goals</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile
              icon={Moon}
              label="Sleep"
              value={`${data.todayStats.sleepHours.toFixed(1)}h`}
              sublabel={`Goal ${data.profile.dailySleepGoalHours}h`}
              href="/dashboard/sleep"
              accent="text-focus"
            />
            <StatTile
              icon={BookOpen}
              label="Study"
              value={formatMinutes(data.todayStats.studyMinutes)}
              sublabel={`Goal ${data.profile.dailyStudyGoalHours}h`}
              href="/dashboard/study"
              accent="text-focus"
            />
            <StatTile
              icon={Dumbbell}
              label="Exercise"
              value={formatMinutes(data.todayStats.exerciseMinutes)}
              sublabel={`Goal ${data.profile.dailyExerciseGoalMins}m`}
              href="/dashboard/exercise"
              accent="text-vitality"
            />
            <StatTile
              icon={CalendarCheck}
              label="Attendance"
              value={data.attendanceRate === null ? "—" : `${data.attendanceRate}%`}
              sublabel={
                data.attendanceRate !== null && data.attendanceRate < data.profile.attendanceThreshold
                  ? "Below your threshold"
                  : "On track"
              }
              href="/dashboard/attendance"
              accent="text-dawn"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <MoodWidget todayMood={data.todayMood} />
            <WaterWidget todayMl={data.todayStats.waterMl} goalMl={data.profile.dailyWaterGoalMl} />
          </div>

          <WeeklyProgressChart data={data.weeklyProgress} />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <TasksWidget tasks={data.upcomingTasks} />
            <AchievementHighlightCard achievements={data.achievements} unlockedIds={data.unlockedIds} />
          </div>
        </div>

        <div className="space-y-6">
          <TodayGoalTracker
            studyMinutes={data.todayStats.studyMinutes}
            studyGoalMinutes={data.profile.dailyStudyGoalHours * 60}
            waterMl={data.todayStats.waterMl}
            waterGoalMl={data.profile.dailyWaterGoalMl}
            exerciseMinutes={data.todayStats.exerciseMinutes}
            exerciseGoalMins={data.profile.dailyExerciseGoalMins}
            taskCompletion={data.taskCompletion}
          />
          <AiInsightCard firstName={firstName} />
          <QuickReflectionCard />
        </div>
      </div>
    </div>
  );
}
