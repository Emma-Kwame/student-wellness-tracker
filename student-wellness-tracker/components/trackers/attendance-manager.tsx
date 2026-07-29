"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Download, Printer, RotateCcw } from "lucide-react";
import { recordAttendance, deleteAttendanceRecord } from "@/app/actions/attendance";
import type { AttendanceStatus } from "@/generated/prisma/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDMY, cn } from "@/lib/utils";

type Course = { id: string; name: string; color: string };
type AttendanceEntry = { id: string; courseId: string; status: AttendanceStatus; date: Date };

const STATUSES: AttendanceStatus[] = ["PRESENT", "ABSENT", "EXCUSED", "LATE"];
const STATUS_META: Record<AttendanceStatus, { emoji: string; label: string }> = {
  PRESENT: { emoji: "✅", label: "Present" },
  ABSENT: { emoji: "❌", label: "Absent" },
  EXCUSED: { emoji: "🟡", label: "Excused" },
  LATE: { emoji: "🕒", label: "Late" },
};

function toDateInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** Cumulative attendance % for each course, as of (and including) each record —
 * computed in chronological order so the table's % column tells a real story. */
function computeRunningRates(records: AttendanceEntry[]): Map<string, number> {
  const byCourse = new Map<string, AttendanceEntry[]>();
  for (const r of records) {
    if (!byCourse.has(r.courseId)) byCourse.set(r.courseId, []);
    byCourse.get(r.courseId)!.push(r);
  }
  const rateById = new Map<string, number>();
  for (const recs of byCourse.values()) {
    const sorted = [...recs].sort((a, b) => a.date.getTime() - b.date.getTime());
    let present = 0;
    let counted = 0;
    for (const r of sorted) {
      if (r.status !== "EXCUSED") {
        counted++;
        if (r.status === "PRESENT" || r.status === "LATE") present++;
      }
      rateById.set(r.id, counted === 0 ? 0 : Math.round((present / counted) * 100));
    }
  }
  return rateById;
}

export function AttendanceManager({ courses, records }: { courses: Course[]; records: AttendanceEntry[] }) {
  const today = toDateInput(new Date());
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState<AttendanceStatus>("PRESENT");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);
  const runningRates = useMemo(() => computeRunningRates(records), [records]);

  const filtered = useMemo(() => {
    return records
      .filter((r) => (courseFilter ? r.courseId === courseFilter : true))
      .filter((r) => (statusFilter ? r.status === statusFilter : true))
      .filter((r) => (dateFrom ? toDateInput(r.date) >= dateFrom : true))
      .filter((r) => (dateTo ? toDateInput(r.date) <= dateTo : true))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [records, courseFilter, statusFilter, dateFrom, dateTo]);

  function resetForm() {
    setCourseId(courses[0]?.id ?? "");
    setDate(today);
    setStatus("PRESENT");
    setEditingId(null);
  }

  function startEdit(record: AttendanceEntry) {
    setEditingId(record.id);
    setCourseId(record.courseId);
    setDate(toDateInput(record.date));
    setStatus(record.status);
  }

  function save() {
    if (!courseId) {
      toast.error("Pick a course first.");
      return;
    }
    startTransition(async () => {
      try {
        await recordAttendance({ courseId, date, status });
        toast.success(editingId ? "Attendance updated." : "Attendance recorded.");
        resetForm();
      } catch {
        toast.error("Couldn't save that.");
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      try {
        await deleteAttendanceRecord(id);
        toast.success("Record deleted.");
        if (editingId === id) resetForm();
      } catch {
        toast.error("Couldn't delete that.");
      }
    });
  }

  function exportCsv() {
    const header = ["Date", "Course", "Status", "Attendance %"];
    const rows = filtered.map((r) => [
      formatDMY(r.date),
      courseById.get(r.courseId)?.name ?? "Unknown",
      STATUS_META[r.status].label,
      `${runningRates.get(r.id) ?? 0}%`,
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (courses.length === 0) {
    return <p className="text-sm text-muted">Add a course below before recording attendance.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-end gap-3 rounded-xl border border-line p-4">
        <div>
          <Label htmlFor="att-course">Course</Label>
          <select
            id="att-course"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="mt-1.5 h-10 w-44 rounded-md border border-line bg-card px-3 text-sm"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="att-date">Date</Label>
          <Input id="att-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="att-status">Status</Label>
          <select
            id="att-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
            className="mt-1.5 h-10 rounded-md border border-line bg-card px-3 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].emoji} {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={save} isLoading={isPending}>
          💾 {editingId ? "Update" : "Save"} Attendance
        </Button>
        {editingId && (
          <Button variant="ghost" onClick={resetForm} type="button">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        )}
      </div>

      <div className="no-print flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="filter-course">Course</Label>
          <select
            id="filter-course"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="mt-1.5 h-9 rounded-md border border-line bg-card px-3 text-sm"
          >
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="filter-status">Status</Label>
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AttendanceStatus | "")}
            className="mt-1.5 h-9 rounded-md border border-line bg-card px-3 text-sm"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="filter-from">From</Label>
          <Input id="filter-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="mt-1.5 h-9" />
        </div>
        <div>
          <Label htmlFor="filter-to">To</Label>
          <Input id="filter-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="mt-1.5 h-9" />
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5" /> Print Report
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <span className="text-4xl">📅</span>
          <p className="font-medium">No attendance records yet.</p>
          <p className="max-w-xs text-sm text-muted">Record your first class attendance above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase text-muted">
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2 pr-3 font-medium">Course</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">Attendance %</th>
                <th className="no-print py-2 pr-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((r) => {
                const course = courseById.get(r.courseId);
                return (
                  <tr key={r.id} className={cn(editingId === r.id && "bg-focus/5")}>
                    <td className="py-2.5 pr-3">{formatDMY(r.date)}</td>
                    <td className="py-2.5 pr-3">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: course?.color }} />
                        {course?.name ?? "Unknown"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      {STATUS_META[r.status].emoji} {STATUS_META[r.status].label}
                    </td>
                    <td className="py-2.5 pr-3">{runningRates.get(r.id)}%</td>
                    <td className="no-print py-2.5 pr-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Edit record"
                          onClick={() => startEdit(r)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete record"
                          disabled={isPending}
                          onClick={() => remove(r.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
