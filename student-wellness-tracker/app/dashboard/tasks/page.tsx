import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TaskForm } from "@/components/trackers/task-form";
import { TaskList } from "@/components/trackers/task-list";

export default async function TasksPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const tasks = await prisma.task.findMany({
    where: { userId: session!.user.id, deletedAt: null },
    orderBy: [{ isCompleted: "asc" }, { dueDate: { sort: "asc", nulls: "last" } }, { priority: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Tasks</h1>
        <p className="mt-1 text-muted">Due dates, priority, and category — without the Gantt chart.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add task</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskList tasks={tasks} />
        </CardContent>
      </Card>
    </div>
  );
}
