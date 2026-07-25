"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleTask, deleteTask } from "@/app/actions/tasks";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { formatShortDate, cn } from "@/lib/utils";
import type { TaskPriority, TaskCategory } from "@/generated/prisma/client";

type Task = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: TaskPriority;
  category: TaskCategory;
  isCompleted: boolean;
};

const PRIORITY_DOT: Record<TaskPriority, string> = {
  LOW: "bg-muted",
  MEDIUM: "bg-focus",
  HIGH: "bg-dawn",
  URGENT: "bg-danger",
};

function TaskRow({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleTask(task.id, !task.isCompleted);
      } catch {
        toast.error("Couldn't update that task.");
      }
    });
  }

  return (
    <li className="flex items-start gap-3 py-3">
      <button
        type="button"
        disabled={isPending}
        aria-label={task.isCompleted ? "Mark incomplete" : "Mark complete"}
        onClick={handleToggle}
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 transition-colors disabled:opacity-50",
          task.isCompleted ? "border-focus bg-focus" : "border-line hover:border-focus",
        )}
      />
      <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", PRIORITY_DOT[task.priority])} />
      <div className="flex-1">
        <p className={cn("text-sm font-medium", task.isCompleted && "text-muted line-through")}>{task.title}</p>
        {task.description && <p className="text-xs text-muted">{task.description}</p>}
        <p className="mt-0.5 text-xs text-muted">
          {task.category.charAt(0) + task.category.slice(1).toLowerCase()}
          {task.dueDate && ` · Due ${formatShortDate(task.dueDate)}`}
        </p>
      </div>
      <DeleteButton id={task.id} action={deleteTask} label="Delete task" />
    </li>
  );
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  const open = tasks.filter((t) => !t.isCompleted);
  const completed = tasks.filter((t) => t.isCompleted);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-xs uppercase tracking-wide text-muted">Open ({open.length})</p>
        {open.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">Nothing open. Add a task above.</p>
        ) : (
          <ul className="divide-y divide-line">
            {open.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
        )}
      </div>
      {completed.length > 0 && (
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-muted">Completed ({completed.length})</p>
          <ul className="divide-y divide-line">
            {completed.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
