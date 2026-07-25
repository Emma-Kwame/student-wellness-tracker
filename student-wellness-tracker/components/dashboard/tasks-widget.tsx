"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { ListChecks } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toggleTask } from "@/app/actions/tasks";
import { formatShortDate, cn } from "@/lib/utils";

type TaskItem = {
  id: string;
  title: string;
  dueDate: Date | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
};

const PRIORITY_DOT: Record<TaskItem["priority"], string> = {
  LOW: "bg-muted",
  MEDIUM: "bg-focus",
  HIGH: "bg-dawn",
  URGENT: "bg-danger",
};

function TaskRow({ task }: { task: TaskItem }) {
  const [isPending, startTransition] = useTransition();

  return (
    <li className="flex items-center gap-3 py-2">
      <button
        type="button"
        disabled={isPending}
        aria-label={`Mark "${task.title}" complete`}
        onClick={() => startTransition(async () => {
          try {
            await toggleTask(task.id, true);
          } catch {
            toast.error("Couldn't update that task.");
          }
        })}
        className="h-4 w-4 shrink-0 rounded-full border-2 border-line transition-colors hover:border-focus disabled:opacity-50"
      />
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", PRIORITY_DOT[task.priority])} />
      <span className="flex-1 truncate text-sm">{task.title}</span>
      {task.dueDate && <span className="shrink-0 text-xs text-muted">{formatShortDate(task.dueDate)}</span>}
    </li>
  );
}

export function TasksWidget({ tasks }: { tasks: TaskItem[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Upcoming tasks</CardTitle>
        <ListChecks className="h-4 w-4 text-dawn" />
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">Nothing due. Add a task to get started.</p>
        ) : (
          <ul className="divide-y divide-line">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
        )}
        <Link href="/dashboard/tasks" className="mt-3 block text-center text-sm text-focus hover:underline">
          View all tasks
        </Link>
      </CardContent>
    </Card>
  );
}
