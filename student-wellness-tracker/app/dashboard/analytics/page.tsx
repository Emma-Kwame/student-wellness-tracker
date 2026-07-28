import { Flame, Trophy, Star, CalendarCheck } from "lucide-react";
import { getSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { getWeeklyProgress } from "@/lib/dashboard-data";
import { computeAttendanceRate } from "@/lib/wellness";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WeeklyProgressChart } from "@/components/dashboard/weekly-progress-chart";
import { StatTile } from "@/components/dashboard/stat-tile";

export default async function AnalyticsPage() {
  const session = await getSession();
  const userId = session!.user.id;

  const [profile, attendanceRecords, achievementCount, unlockedCount] = await Promise.all([
    prisma.userProfile.findUniqueOrThrow({ where: { userId } }),
    prisma.attendanceRecord.findMany({ where: { userId }, select: { status: true } }),
    prisma.achievement.count(),
    prisma.userAchievement.count({ where: { userId } }),
  ]);

  const weeklyProgress = await getWeeklyProgress(userId, profile);
  const attendanceRate = computeAttendanceRate(attendanceRecords);

  const avgOverview = Math.round(weeklyProgress.reduce((sum, d) => sum + d.overview, 0) / weeklyProgress.length);
  const totalStudyMinutes = weeklyProgress.reduce((sum, d) => sum + d.study, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Analytics</h1>
        <p className="mt-1 text-muted">Your trends and standing over the last 7 days.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          icon={Flame}
          label="Current streak"
          value={`${profile.currentStreak}d`}
          sublabel={`Best: ${profile.longestStreak}d`}
          accent="text-dawn"
        />
        <StatTile
          icon={Star}
          label="Level"
          value={`${profile.level}`}
          sublabel={`${profile.xp} XP`}
          accent="text-focus"
        />
        <StatTile
          icon={Trophy}
          label="Badges"
          value={`${unlockedCount}/${achievementCount}`}
          sublabel="Unlocked"
          accent="text-dawn"
        />
        <StatTile
          icon={CalendarCheck}
          label="Attendance"
          value={attendanceRate === null ? "—" : `${attendanceRate}%`}
          sublabel={`Threshold ${profile.attendanceThreshold}%`}
          href="/dashboard/attendance"
          accent="text-vitality"
        />
      </div>

      <WeeklyProgressChart data={weeklyProgress} />

      <Card>
        <CardHeader>
          <CardTitle>This week at a glance</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted">Avg. wellness score</p>
            <p className="mt-0.5 font-display text-2xl">{avgOverview}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Total study time</p>
            <p className="mt-0.5 font-display text-2xl">{Math.round(totalStudyMinutes / 60)}h</p>
          </div>
          <div>
            <p className="text-xs text-muted">Days logged</p>
            <p className="mt-0.5 font-display text-2xl">{weeklyProgress.filter((d) => d.mood !== null || d.study > 0 || d.sleep > 0).length}/7</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
