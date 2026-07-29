"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TASK_CATEGORY_META } from "@/lib/wellness";
import { cn } from "@/lib/utils";
import type { TaskCategory } from "@/generated/prisma/client";

type Task = { id: string; title: string; dueDate: Date | null; category: TaskCategory; isCompleted: boolean };

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function TaskCalendar({ tasks }: { tasks: Task[] }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const { year, month } = cursor;
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const today = new Date();

  const tasksByDay = new Map<number, Task[]>();
  for (const t of tasks) {
    if (!t.dueDate) continue;
    if (t.dueDate.getUTCFullYear() === year && t.dueDate.getUTCMonth() === month) {
      const day = t.dueDate.getUTCDate();
      if (!tasksByDay.has(day)) tasksByDay.set(day, []);
      tasksByDay.get(day)!.push(t);
    }
  }

  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}</CardTitle>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCursor(month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 })}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-ink/5"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCursor(month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 })}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-ink/5"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mx-auto grid w-full max-w-sm grid-cols-7 gap-1">
          {WEEKDAYS.map((w, i) => (
            <span key={i} className="text-center text-[9px] uppercase text-muted">
              {w}
            </span>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const dayTasks = tasksByDay.get(day) ?? [];
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            return (
              <div
                key={day}
                title={dayTasks.map((t) => t.title).join(", ") || undefined}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-0.5 rounded text-[11px] leading-none",
                  dayTasks.length > 0 ? "bg-focus/10" : "bg-ink/5 text-muted",
                  isToday && "ring-2 ring-focus",
                )}
              >
                <span>{day}</span>
                {dayTasks.length > 0 && (
                  <span className="text-[8px] leading-none">
                    {dayTasks.slice(0, 3).map((t) => TASK_CATEGORY_META[t.category].emoji).join("")}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
