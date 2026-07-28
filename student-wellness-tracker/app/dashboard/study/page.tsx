import { getSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StudySessionForm } from "@/components/trackers/study-session-form";
import { CourseForm } from "@/components/trackers/course-form";
import { StudyHistoryList } from "@/components/trackers/study-history-list";

export default async function StudyPage() {
  const session = await getSession();
  const userId = session!.user.id;

  const [courses, entries] = await Promise.all([
    prisma.course.findMany({ where: { userId, deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.studySession.findMany({
      where: { userId, deletedAt: null },
      orderBy: { startedAt: "desc" },
      take: 50,
      include: { course: { select: { name: true, color: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Study</h1>
        <p className="mt-1 text-muted">Start a session, or log time you already put in.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent>
          <StudySessionForm courses={courses} />
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
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <StudyHistoryList entries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}
