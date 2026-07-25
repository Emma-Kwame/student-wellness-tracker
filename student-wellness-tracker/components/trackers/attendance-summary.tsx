import { AlertTriangle } from "lucide-react";
import { deleteAttendanceRecord } from "@/app/actions/attendance";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { computeAttendanceRate } from "@/lib/wellness";
import { formatShortDate } from "@/lib/utils";
import type { AttendanceStatus } from "@/generated/prisma/client";

type Record = { id: string; status: AttendanceStatus; date: Date };
type CourseWithRecords = { id: string; name: string; color: string; attendanceRecords: Record[] };

export function AttendanceSummary({ courses, threshold }: { courses: CourseWithRecords[]; threshold: number }) {
  if (courses.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">Add a course to start tracking attendance.</p>;
  }

  return (
    <div className="space-y-6">
      {courses.map((course) => {
        const rate = computeAttendanceRate(course.attendanceRecords);
        const belowThreshold = rate !== null && rate < threshold;
        const recent = [...course.attendanceRecords]
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 8);

        return (
          <div key={course.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: course.color }} />
                <p className="font-medium">{course.name}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {belowThreshold && <AlertTriangle className="h-3.5 w-3.5 text-danger" />}
                <span className={belowThreshold ? "text-sm font-medium text-danger" : "text-sm font-medium"}>
                  {rate === null ? "No records" : `${rate}%`}
                </span>
              </div>
            </div>
            {belowThreshold && (
              <p className="mt-1 text-xs text-danger">Below your {threshold}% threshold.</p>
            )}
            <ul className="mt-2 divide-y divide-line">
              {recent.map((record) => (
                <li key={record.id} className="flex items-center gap-3 py-2 text-sm">
                  <span className="flex-1">{record.status.charAt(0) + record.status.slice(1).toLowerCase()}</span>
                  <span className="text-xs text-muted">{formatShortDate(record.date)}</span>
                  <DeleteButton id={record.id} action={deleteAttendanceRecord} label="Delete attendance record" />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
