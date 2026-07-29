import { AlertTriangle } from "lucide-react";
import { computeAttendanceRate, classesToReachThreshold } from "@/lib/wellness";
import type { AttendanceStatus } from "@/generated/prisma/client";

type Record = { status: AttendanceStatus };
type CourseWithRecords = { id: string; name: string; attendanceRecords: Record[] };

export function AttendanceWarningBanner({ courses, threshold }: { courses: CourseWithRecords[]; threshold: number }) {
  const belowThreshold = courses
    .map((course) => {
      const rate = computeAttendanceRate(course.attendanceRecords);
      const counted = course.attendanceRecords.filter((r) => r.status !== "EXCUSED");
      const present = counted.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
      return { course, rate, present, counted: counted.length };
    })
    .filter((c): c is typeof c & { rate: number } => c.rate !== null && c.rate < threshold);

  if (belowThreshold.length === 0) return null;

  return (
    <div className="space-y-2">
      {belowThreshold.map(({ course, rate, present, counted }) => {
        const classesNeeded = classesToReachThreshold(present, counted, threshold);
        return (
          <div key={course.id} className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <div>
              <p className="text-sm font-medium text-danger">Warning</p>
              <p className="mt-0.5 text-sm">
                {course.name} attendance is {rate}%.{" "}
                {Number.isFinite(classesNeeded) && classesNeeded > 0
                  ? `Attend the next ${classesNeeded} class${classesNeeded === 1 ? "" : "es"} in a row to reach ${threshold}%.`
                  : `Below your ${threshold}% requirement.`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
