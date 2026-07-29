import { CalendarCheck, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { getSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { computeAttendanceRate } from "@/lib/wellness";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { AttendanceManager } from "@/components/trackers/attendance-manager";
import { CourseForm } from "@/components/trackers/course-form";
import { CourseStatsList } from "@/components/trackers/course-stats-list";
import { AttendanceTrendChart } from "@/components/trackers/attendance-trend-chart";
import { AttendanceCalendar } from "@/components/trackers/attendance-calendar";
import { AttendanceWarningBanner } from "@/components/trackers/attendance-warning-banner";

const SUMMARY_THRESHOLD = 75;

export default async function AttendancePage() {
  const session = await getSession();
  const userId = session!.user.id;

  const [profile, courses] = await Promise.all([
    prisma.userProfile.findUniqueOrThrow({ where: { userId } }),
    prisma.course.findMany({
      where: { userId, deletedAt: null },
      orderBy: { name: "asc" },
      include: { attendanceRecords: { select: { id: true, courseId: true, status: true, date: true } } },
    }),
  ]);

  const allRecords = courses.flatMap((c) => c.attendanceRecords);
  const overallRate = computeAttendanceRate(allRecords);
  const counted = allRecords.filter((r) => r.status !== "EXCUSED");
  const presentCount = counted.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
  const absentCount = counted.filter((r) => r.status === "ABSENT").length;
  const coursesBelowThreshold = courses.filter((c) => {
    const rate = computeAttendanceRate(c.attendanceRecords);
    return rate !== null && rate < SUMMARY_THRESHOLD;
  }).length;

  const trendData = courses.map((c) => {
    const cCounted = c.attendanceRecords.filter((r) => r.status !== "EXCUSED");
    return {
      course: c.name,
      present: cCounted.filter((r) => r.status === "PRESENT" || r.status === "LATE").length,
      absent: cCounted.filter((r) => r.status === "ABSENT").length,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Attendance</h1>
        <p className="mt-1 text-muted">
          Per-course attendance, with a heads-up before it drops below {profile.attendanceThreshold}%.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile icon={CalendarCheck} label="Overall Rate" value={overallRate === null ? "—" : `${overallRate}%`} accent="text-focus" />
        <StatTile icon={CheckCircle2} label="Present" value={String(presentCount)} accent="text-vitality" />
        <StatTile icon={XCircle} label="Absent" value={String(absentCount)} accent="text-danger" />
        <StatTile
          icon={AlertTriangle}
          label={`Courses Below ${SUMMARY_THRESHOLD}%`}
          value={String(coursesBelowThreshold)}
          accent="text-dawn"
        />
      </div>

      <AttendanceWarningBanner courses={courses} threshold={profile.attendanceThreshold} />

      <Card>
        <CardHeader>
          <CardTitle>Record Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceManager
            courses={courses.map((c) => ({ id: c.id, name: c.name, color: c.color }))}
            records={allRecords}
          />
        </CardContent>
      </Card>

      <div>
        <h2 className="font-display text-lg tracking-tight">Course Statistics</h2>
        <div className="mt-3">
          <CourseStatsList courses={courses} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AttendanceTrendChart data={trendData} />
        <AttendanceCalendar records={allRecords} />
      </div>

      <Card id="courses-section">
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>Add the courses you want to track hours and attendance against.</CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm />
        </CardContent>
      </Card>
    </div>
  );
}
