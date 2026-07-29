import { ListTodo, CheckCircle2, CalendarClock, AlertCircle } from "lucide-react";
import { getSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { effectiveTaskStatus, startOfDay, endOfDay } from "@/lib/wellness";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { TasksManager } from "@/components/trackers/tasks-manager";
import { TaskCalendar } from "@/components/trackers/task-calendar";
import { TaskDueSoonBanner } from "@/components/trackers/task-due-soon-banner";

export default async function TasksPage() {
  const session = await getSession();
  const userId = session!.user.id;

  const [tasks, profile] = await Promise.all([
    prisma.task.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ isCompleted: "asc" }, { dueDate: { sort: "asc", nulls: "last" } }, { priority: "desc" }],
    }),
    prisma.userProfile.findUniqueOrThrow({ where: { userId } }),
  ]);

  const todayStart = startOfDay();
  const todayEnd = endOfDay();
  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const dueTodayCount = tasks.filter((t) => !t.isCompleted && t.dueDate && t.dueDate >= todayStart && t.dueDate <= todayEnd).length;
  const overdueCount = tasks.filter((t) => effectiveTaskStatus(t.status, t.dueDate) === "OVERDUE").length;
  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Tasks</h1>
        <p className="mt-1 text-muted">Due dates, priority, and category — without the Gantt chart.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile icon={ListTodo} label="Total Tasks" value={String(totalTasks)} accent="text-focus" />
        <StatTile icon={CheckCircle2} label="Completed" value={String(completedCount)} accent="text-vitality" />
        <StatTile icon={CalendarClock} label="Due Today" value={String(dueTodayCount)} accent="text-dawn" />
        <StatTile icon={AlertCircle} label="Overdue" value={String(overdueCount)} accent="text-danger" />
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Task Progress</span>
            <span className="text-muted">
              {completedCount} of {totalTasks} completed
            </span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-ink/5">
            <div className="h-full rounded-full bg-focus transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
            <span>🔥 {profile.currentStreak}-day streak</span>
            <span>⭐ Level {profile.level}</span>
            <span>{profile.xp} XP</span>
          </div>
        </CardContent>
      </Card>

      <TaskDueSoonBanner tasks={tasks} />

      <Card>
        <CardHeader>
          <CardTitle>Manage Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <TasksManager tasks={tasks} />
        </CardContent>
      </Card>

      <TaskCalendar tasks={tasks} />
    </div>
  );
}
