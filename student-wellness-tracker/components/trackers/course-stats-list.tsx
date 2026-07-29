import { Card, CardContent } from "@/components/ui/card";
import { computeAttendanceRate, attendanceBand } from "@/lib/wellness";
import { formatShortDate, cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/generated/prisma/client";

type Record = { status: AttendanceStatus; date: Date };
type CourseWithRecords = { id: string; name: string; color: string; attendanceRecords: Record[] };

export function CourseStatsList({ courses }: { courses: CourseWithRecords[] }) {
  if (courses.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">Add a course to start tracking attendance.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {courses.map((course) => {
        const rate = computeAttendanceRate(course.attendanceRecords);
        const counted = course.attendanceRecords.filter((r) => r.status !== "EXCUSED");
        const present = counted.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
        const absent = counted.filter((r) => r.status === "ABSENT").length;
        const band = rate !== null ? attendanceBand(rate) : null;
        const lastUpdated = course.attendanceRecords.length
          ? course.attendanceRecords.reduce((latest, r) => (r.date > latest ? r.date : latest), course.attendanceRecords[0]!.date)
          : null;

        return (
          <Card key={course.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: course.color }} />
                  {course.name}
                </span>
                {band && <span className={cn("text-sm font-semibold", band.text)}>{rate}%</span>}
              </div>

              {course.attendanceRecords.length === 0 ? (
                <p className="mt-3 text-sm text-muted">No records yet.</p>
              ) : (
                <>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/5">
                    <div
                      className={cn("h-full rounded-full transition-all", band?.bar ?? "bg-focus")}
                      style={{ width: `${rate ?? 0}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted">
                    <span>
                      {present} Present · {absent} Absent
                      {band && <span className={cn("ml-1.5", band.text)}>· {band.label}</span>}
                    </span>
                  </div>
                  {lastUpdated && <p className="mt-2 text-xs text-muted">Last updated: {formatShortDate(lastUpdated)}</p>}
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
