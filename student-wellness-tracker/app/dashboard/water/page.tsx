import { getSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "@/lib/wellness";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WaterLogForm } from "@/components/trackers/water-log-form";
import { WaterHistoryList } from "@/components/trackers/water-history-list";

export default async function WaterPage() {
  const session = await getSession();
  const entries = await prisma.waterLog.findMany({
    where: { userId: session!.user.id, loggedAt: { gte: startOfDay(), lte: endOfDay() } },
    orderBy: { loggedAt: "desc" },
  });
  const total = entries.reduce((sum, e) => sum + e.amountMl, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Hydration</h1>
        <p className="mt-1 text-muted">{(total / 1000).toFixed(2)}L logged today.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add water</CardTitle>
        </CardHeader>
        <CardContent>
          <WaterLogForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today</CardTitle>
        </CardHeader>
        <CardContent>
          <WaterHistoryList entries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}
