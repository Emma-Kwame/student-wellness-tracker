"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/generated/prisma/client";

type Record = { status: AttendanceStatus; date: Date };

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function dayStatus(records: Record[]): "present" | "absent" | "excused" | null {
  if (records.length === 0) return null;
  if (records.some((r) => r.status === "ABSENT")) return "absent";
  if (records.some((r) => r.status === "PRESENT" || r.status === "LATE")) return "present";
  return "excused";
}

const STATUS_STYLE: Record<"present" | "absent" | "excused", string> = {
  present: "bg-emerald-500 text-white",
  absent: "bg-red-500 text-white",
  excused: "bg-amber-400 text-white",
};

export function AttendanceCalendar({ records }: { records: Record[] }) {
  // Attendance dates are stored as UTC midnight (see app/actions/attendance.ts),
  // so all calendar math here stays in UTC too — mixing in local-time Date
  // getters would misattribute boundary days for users behind UTC.
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const { year, month } = cursor;
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const today = new Date();

  const recordsByDay = new Map<number, Record[]>();
  for (const r of records) {
    if (r.date.getUTCFullYear() === year && r.date.getUTCMonth() === month) {
      const day = r.date.getUTCDate();
      if (!recordsByDay.has(day)) recordsByDay.set(day, []);
      recordsByDay.get(day)!.push(r);
    }
  }

  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>
          {cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </CardTitle>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-ink/5"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-ink/5"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((w, i) => (
            <span key={i} className="text-center text-[10px] uppercase text-muted">
              {w}
            </span>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const status = dayStatus(recordsByDay.get(day) ?? []);
            const isToday =
              today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            return (
              <div
                key={day}
                title={status ? `${status.charAt(0).toUpperCase() + status.slice(1)}` : undefined}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-md text-xs",
                  status ? STATUS_STYLE[status] : "bg-ink/5 text-muted",
                  isToday && !status && "ring-2 ring-focus",
                  isToday && status && "ring-2 ring-offset-1 ring-focus",
                )}
              >
                {day}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Present
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Absent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Excused
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
