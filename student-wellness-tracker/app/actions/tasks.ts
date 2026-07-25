"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";
import { taskSchema, type TaskInput } from "@/lib/validations/trackers";

export async function createTask(input: TaskInput) {
  const userId = await requireUserId();
  const data = taskSchema.parse(input);

  await prisma.task.create({
    data: {
      userId,
      title: data.title,
      description: data.description || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      priority: data.priority,
      category: data.category,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
}

export async function toggleTask(id: string, isCompleted: boolean) {
  const userId = await requireUserId();

  await prisma.task.updateMany({
    where: { id, userId },
    data: { isCompleted, completedAt: isCompleted ? new Date() : null },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
}

export async function deleteTask(id: string) {
  const userId = await requireUserId();

  await prisma.task.updateMany({
    where: { id, userId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
}
