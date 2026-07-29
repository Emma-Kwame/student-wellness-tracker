import { AlertTriangle } from "lucide-react";
import { TASK_CATEGORY_META, TASK_PRIORITY_META, startOfDay, daysAgo } from "@/lib/wellness";
import { cn } from "@/lib/utils";
import type { TaskCategory, TaskPriority } from "@/generated/prisma/client";

type Task = { id: string; title: string; dueDate: Date | null; category: TaskCategory; priority: TaskPriority; isCompleted: boolean };

export function TaskDueSoonBanner({ tasks }: { tasks: Task[] }) {
  const tomorrow = daysAgo(-1);
  const dueTomorrow = tasks.filter((t) => !t.isCompleted && t.dueDate && startOfDay(t.dueDate).getTime() === tomorrow.getTime());

  if (dueTomorrow.length === 0) return null;

  return (
    <div className="space-y-2">
      {dueTomorrow.map((task) => {
        const categoryMeta = TASK_CATEGORY_META[task.category];
        const priorityMeta = TASK_PRIORITY_META[task.priority];
        return (
          <div key={task.id} className="flex items-start gap-3 rounded-xl border border-dawn/30 bg-dawn/5 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-dawn" />
            <div>
              <p className="text-sm font-medium text-dawn">Due Tomorrow</p>
              <p className="mt-0.5 text-sm">{task.title}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                <span>
                  {categoryMeta.emoji} {categoryMeta.label}
                </span>
                <span className={cn("font-medium", priorityMeta.text)}>
                  {priorityMeta.emoji} {priorityMeta.label} Priority
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
