import { getSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { JournalEntryForm } from "@/components/trackers/journal-entry-form";
import { JournalEntryList } from "@/components/trackers/journal-entry-list";

export default async function JournalPage() {
  const session = await getSession();
  const entries = await prisma.journalEntry.findMany({
    where: { userId: session!.user.id, deletedAt: null },
    orderBy: { loggedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Journal</h1>
        <p className="mt-1 text-muted">A private space to reflect — only you can see this.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New entry</CardTitle>
        </CardHeader>
        <CardContent>
          <JournalEntryForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past entries</CardTitle>
        </CardHeader>
        <CardContent>
          <JournalEntryList entries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}
