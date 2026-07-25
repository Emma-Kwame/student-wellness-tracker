import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExerciseLogForm } from "@/components/trackers/exercise-log-form";
import { ExerciseHistoryList } from "@/components/trackers/exercise-history-list";

export default async function ExercisePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const entries = await prisma.exerciseLog.findMany({
    where: { userId: session!.user.id, deletedAt: null },
    orderBy: { loggedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Exercise</h1>
        <p className="mt-1 text-muted">Walking, gym, football, cycling, yoga — whatever moved you.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <ExerciseLogForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <ExerciseHistoryList entries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}
