import { getSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SleepLogForm } from "@/components/trackers/sleep-log-form";
import { SleepHistoryList } from "@/components/trackers/sleep-history-list";

export default async function SleepPage() {
  const session = await getSession();
  const entries = await prisma.sleepLog.findMany({
    where: { userId: session!.user.id, deletedAt: null },
    orderBy: { bedtime: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Sleep</h1>
        <p className="mt-1 text-muted">Bedtime, wake time, and how rested you actually felt.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log sleep</CardTitle>
        </CardHeader>
        <CardContent>
          <SleepLogForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <SleepHistoryList entries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}
