import { getSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MoodLogForm } from "@/components/trackers/mood-log-form";
import { MoodHistoryList } from "@/components/trackers/mood-history-list";

export default async function MoodPage() {
  const session = await getSession();
  const entries = await prisma.moodEntry.findMany({
    where: { userId: session!.user.id, deletedAt: null },
    orderBy: { loggedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Mood</h1>
        <p className="mt-1 text-muted">How you&apos;re feeling, tracked over time.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log your mood</CardTitle>
        </CardHeader>
        <CardContent>
          <MoodLogForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <MoodHistoryList entries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}
