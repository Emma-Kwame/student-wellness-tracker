import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AttendanceForm } from "@/components/trackers/attendance-form";
import { CourseForm } from "@/components/trackers/course-form";
import { AttendanceSummary } from "@/components/trackers/attendance-summary";

export default async function AttendancePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;

  const [profile, courses] = await Promise.all([
    prisma.userProfile.findUniqueOrThrow({ where: { userId } }),
    prisma.course.findMany({
      where: { userId, deletedAt: null },
      orderBy: { name: "asc" },
      include: { attendanceRecords: { select: { id: true, status: true, date: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Attendance</h1>
        <p className="mt-1 text-muted">
          Per-course attendance, with a heads-up before it drops below {profile.attendanceThreshold}%.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Record attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceForm courses={courses} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>Add the courses you want to track hours and attendance against.</CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By course</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceSummary courses={courses} threshold={profile.attendanceThreshold} />
        </CardContent>
      </Card>
    </div>
  );
}
