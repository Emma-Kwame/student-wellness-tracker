import { Moon, BookOpen, Dumbbell, CalendarCheck } from "lucide-react";
import { getSession } from "@/lib/auth-utils";
import { getDashboardData } from "@/lib/dashboard-data";
import { formatMinutes } from "@/lib/utils";
import { quoteOfTheDay } from "@/lib/wellness";
import { WellnessScoreRing } from "@/components/dashboard/wellness-score-ring";
import { StatTile } from "@/components/dashboard/stat-tile";
import { MoodWidget } from "@/components/dashboard/mood-widget";
import { WaterWidget } from "@/components/dashboard/water-widget";
import { WeeklyStudyChart } from "@/components/dashboard/weekly-study-chart";
import { TasksWidget } from "@/components/dashboard/tasks-widget";
import { GoalsWidget } from "@/components/dashboard/goals-widget";
import { BadgesWidget } from "@/components/dashboard/badges-widget";
import { QuoteCard, AiInsightCard } from "@/components/dashboard/quote-and-insight-card";
import { CalendarStrip } from "@/components/dashboard/calendar-strip";

export default async function DashboardPage() {
  const session = await getSession();
  const firstName = session!.user.name.split(" ")[0] ?? "there";

  const data = await getDashboardData(session!.user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Hey {firstName}.</h1>
          <p className="mt-1 text-muted">Here&apos;s today&apos;s rhythm.</p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-card px-5 py-3">
          <WellnessScoreRing score={data.wellnessScore} />
          <div>
            <p className="text-sm font-medium">Wellness score</p>
            <p className="text-xs text-muted">Sleep, study, water &amp; exercise vs. today&apos;s goals</p>
          </div>
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
          sublabel={data.attendanceRate !== null && data.attendanceRate < data.profile.attendanceThreshold ? "Below your threshold" : "On track"}
          href="/dashboard/attendance"
          accent="text-dawn"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <MoodWidget todayMood={data.todayMood} />
            <WaterWidget todayMl={data.todayStats.waterMl} goalMl={data.profile.dailyWaterGoalMl} />
          </div>
          <WeeklyStudyChart data={data.weeklyStudy} />
          <BadgesWidget achievements={data.achievements} unlockedIds={data.unlockedIds} />
        </div>
        <div className="space-y-6">
          <QuoteCard quote={quoteOfTheDay()} />
          <AiInsightCard />
          <CalendarStrip dueDates={data.upcomingTasks.filter((t) => t.dueDate).map((t) => t.dueDate!)} />
          <TasksWidget tasks={data.upcomingTasks} />
          <GoalsWidget goals={data.goals} />
        </div>
      </div>
    </div>
  );
}
