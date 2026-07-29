"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Search, Pencil, Copy, RotateCcw, Link as LinkIcon, Repeat } from "lucide-react";
import { createTask, updateTask, toggleTask, duplicateTask, deleteTask } from "@/app/actions/tasks";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TASK_CATEGORY_META, TASK_PRIORITY_META, TASK_STATUS_META, effectiveTaskStatus } from "@/lib/wellness";
import { formatShortDate, cn } from "@/lib/utils";
import type { TaskPriority, TaskCategory, TaskRecurrence } from "@/generated/prisma/client";

type Task = {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  dueDate: Date | null;
  priority: TaskPriority;
  category: TaskCategory;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  recurrence: TaskRecurrence;
  isCompleted: boolean;
};

const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const CATEGORIES: TaskCategory[] = ["ACADEMIC", "PERSONAL", "HEALTH", "SOCIAL", "OTHER"];
const RECURRENCES: TaskRecurrence[] = ["NONE", "DAILY", "WEEKLY", "MONTHLY"];
const RECURRENCE_LABEL: Record<TaskRecurrence, string> = { NONE: "Does not repeat", DAILY: "Daily", WEEKLY: "Weekly", MONTHLY: "Monthly" };

type StatusFilter = "ALL" | "OPEN" | "COMPLETED" | "OVERDUE";
type SortOption = "DUE_DATE" | "PRIORITY" | "CATEGORY" | "RECENT";

const PRIORITY_ORDER: Record<TaskPriority, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

function emptyForm() {
  return { title: "", description: "", link: "", dueDate: "", priority: "MEDIUM" as TaskPriority, category: "ACADEMIC" as TaskCategory, recurrence: "NONE" as TaskRecurrence };
}

export function TasksManager({ tasks }: { tasks: Task[] }) {
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | "">("");
  const [sortBy, setSortBy] = useState<SortOption>("DUE_DATE");

  function resetForm() {
    setForm(emptyForm());
    setEditingId(null);
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description ?? "",
      link: task.link ?? "",
      dueDate: task.dueDate ? task.dueDate.toISOString().slice(0, 10) : "",
      priority: task.priority,
      category: task.category,
      recurrence: task.recurrence,
    });
  }

  function save() {
    if (!form.title.trim()) {
      toast.error("Give the task a title.");
      return;
    }
    startTransition(async () => {
      try {
        const input = {
          title: form.title.trim(),
          description: form.description || undefined,
          link: form.link || undefined,
          dueDate: form.dueDate || undefined,
          priority: form.priority,
          category: form.category,
          recurrence: form.recurrence,
        };
        if (editingId) {
          await updateTask(editingId, input);
          toast.success("Task updated.");
        } else {
          await createTask(input);
          toast.success("Task added.");
        }
        resetForm();
      } catch {
        toast.error("Couldn't save that task.");
      }
    });
  }

  function handleComplete(task: Task) {
    startTransition(async () => {
      try {
        await toggleTask(task.id, !task.isCompleted);
        if (!task.isCompleted && task.recurrence !== "NONE") {
          toast.success(`Completed — next ${RECURRENCE_LABEL[task.recurrence].toLowerCase()} occurrence created.`);
        }
      } catch {
        toast.error("Couldn't update that task.");
      }
    });
  }

  function handleDuplicate(id: string) {
    startTransition(async () => {
      try {
        await duplicateTask(id);
        toast.success("Task duplicated.");
      } catch {
        toast.error("Couldn't duplicate that task.");
      }
    });
  }

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => (search ? t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase()) : true))
      .filter((t) => (categoryFilter ? t.category === categoryFilter : true))
      .filter((t) => {
        if (statusFilter === "ALL") return true;
        const eff = effectiveTaskStatus(t.status, t.dueDate);
        if (statusFilter === "OVERDUE") return eff === "OVERDUE";
        if (statusFilter === "COMPLETED") return t.isCompleted;
        return !t.isCompleted; // OPEN
      })
      .sort((a, b) => {
        if (sortBy === "PRIORITY") return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (sortBy === "CATEGORY") return a.category.localeCompare(b.category);
        if (sortBy === "DUE_DATE") {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        }
        return 0; // RECENT — tasks already arrive newest-first from the query
      });
  }, [tasks, search, categoryFilter, statusFilter, sortBy]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-line p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" placeholder="Finish problem set 4" />
          </div>
          <div>
            <Label htmlFor="task-due">Due date</Label>
            <Input id="task-due" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="task-link">Link (optional)</Label>
            <Input id="task-link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="mt-1.5" placeholder="https://…" />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="task-description">Notes (optional)</Label>
          <Input id="task-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5" />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Priority</Label>
            <div className="mt-1.5 flex gap-1.5">
              {PRIORITIES.map((p) => {
                const meta = TASK_PRIORITY_META[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    className={cn(
                      "flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
                      form.priority === p ? cn(meta.bg, meta.text, "border-transparent") : "border-line text-muted hover:bg-ink/5",
                    )}
                  >
                    {meta.emoji} {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <Label htmlFor="task-category">Category</Label>
            <select
              id="task-category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as TaskCategory })}
              className="mt-1.5 h-10 w-full rounded-md border border-line bg-card px-3 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {TASK_CATEGORY_META[c].emoji} {TASK_CATEGORY_META[c].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="task-recurrence">
              <Repeat className="mr-1 inline h-3.5 w-3.5" /> Repeat
            </Label>
            <select
              id="task-recurrence"
              value={form.recurrence}
              onChange={(e) => setForm({ ...form, recurrence: e.target.value as TaskRecurrence })}
              className="mt-1.5 h-10 w-full rounded-md border border-line bg-card px-3 text-sm"
            >
              {RECURRENCES.map((r) => (
                <option key={r} value={r}>
                  {RECURRENCE_LABEL[r]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={save} isLoading={isPending}>
            {editingId ? "Update Task" : "+ Add Task"}
          </Button>
          {editingId && (
            <Button variant="ghost" onClick={resetForm} type="button">
              <RotateCcw className="h-4 w-4" /> Reset Form
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." className="pl-9" />
        </div>
        <div className="flex gap-1 rounded-full bg-ink/5 p-1">
          {(["ALL", "OPEN", "COMPLETED", "OVERDUE"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === f ? "bg-card text-ink shadow-soft" : "text-muted hover:text-ink",
              )}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as TaskCategory | "")}
          className="h-9 rounded-md border border-line bg-card px-3 text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {TASK_CATEGORY_META[c].emoji} {TASK_CATEGORY_META[c].label}
            </option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="h-9 rounded-md border border-line bg-card px-3 text-sm">
          <option value="DUE_DATE">Sort: Due Date</option>
          <option value="PRIORITY">Sort: Priority</option>
          <option value="CATEGORY">Sort: Category</option>
          <option value="RECENT">Sort: Recently Added</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <span className="text-4xl">📋</span>
          <p className="font-medium">{tasks.length === 0 ? "No tasks yet" : "No tasks match your filters"}</p>
          <p className="max-w-xs text-sm text-muted">
            {tasks.length === 0 ? "Stay organized by adding your first task." : "Try clearing search or filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((task) => {
            const categoryMeta = TASK_CATEGORY_META[task.category];
            const priorityMeta = TASK_PRIORITY_META[task.priority];
            const eff = effectiveTaskStatus(task.status, task.dueDate);
            const statusMeta = eff === "OVERDUE" ? { emoji: "🔴", label: "Overdue", text: "text-red-600 dark:text-red-400" } : TASK_STATUS_META[eff];

            return (
              <Card key={task.id} className={cn(task.isCompleted && "opacity-60")}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleComplete(task)}
                      aria-label={task.isCompleted ? "Mark incomplete" : "Mark complete"}
                      className={cn(
                        "mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 transition-colors disabled:opacity-50",
                        task.isCompleted ? "border-focus bg-focus text-focus-foreground" : "border-line hover:border-focus",
                      )}
                    >
                      {task.isCompleted && "✓"}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={cn("flex items-center gap-1.5 font-medium", task.isCompleted && "text-muted line-through")}>
                        {categoryMeta.emoji} {task.title}
                        {task.recurrence !== "NONE" && <Repeat className="h-3 w-3 shrink-0 text-muted" />}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">{categoryMeta.label}</p>
                      {task.description && <p className="mt-1 text-xs text-muted">{task.description}</p>}
                      {task.link && (
                        <a href={task.link} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 text-xs text-focus hover:underline">
                          <LinkIcon className="h-3 w-3" /> {task.link}
                        </a>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", priorityMeta.bg, priorityMeta.text)}>
                          {priorityMeta.emoji} {priorityMeta.label}
                        </span>
                        <span className={cn("text-[11px] font-medium", statusMeta.text)}>
                          {statusMeta.emoji} {statusMeta.label}
                        </span>
                        {task.dueDate && <span className="text-[11px] text-muted">Due: {formatShortDate(task.dueDate)}</span>}
                      </div>

                      <div className="mt-3 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(task)}
                          aria-label="Edit task"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(task.id)}
                          aria-label="Duplicate task"
                          disabled={isPending}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-50"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <DeleteButton id={task.id} action={deleteTask} label="Delete task" className="h-7 w-7" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
