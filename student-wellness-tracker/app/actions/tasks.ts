"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";
import { taskSchema, type TaskInput } from "@/lib/validations/trackers";
import type { TaskStatus, TaskRecurrence } from "@/generated/prisma/client";

export async function createTask(input: TaskInput) {
  const userId = await requireUserId();
  const data = taskSchema.parse(input);

  await prisma.task.create({
    data: {
      userId,
      title: data.title,
      description: data.description || null,
      link: data.link || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      priority: data.priority,
      category: data.category,
      recurrence: data.recurrence ?? "NONE",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
}

export async function updateTask(id: string, input: TaskInput) {
  const userId = await requireUserId();
  const data = taskSchema.parse(input);

  await prisma.task.updateMany({
    where: { id, userId },
    data: {
      title: data.title,
      description: data.description || null,
      link: data.link || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      priority: data.priority,
      category: data.category,
      recurrence: data.recurrence ?? "NONE",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
}

function nextDueDate(current: Date | null, recurrence: TaskRecurrence): Date {
  const base = current ?? new Date();
  const next = new Date(base);
  if (recurrence === "DAILY") next.setDate(next.getDate() + 1);
  if (recurrence === "WEEKLY") next.setDate(next.getDate() + 7);
  if (recurrence === "MONTHLY") next.setMonth(next.getMonth() + 1);
  return next;
}

/** Marking a task complete also flips `status`; if it's a recurring task, the
 * next occurrence is created immediately — there's no background scheduler
 * in this app, so "recurring" only works triggered off the user's own action. */
export async function toggleTask(id: string, isCompleted: boolean) {
  const userId = await requireUserId();

  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) return;

  await prisma.task.updateMany({
    where: { id, userId },
    data: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
      status: isCompleted ? "COMPLETED" : "NOT_STARTED",
    },
  });

  if (isCompleted && task.recurrence !== "NONE") {
    await prisma.task.create({
      data: {
        userId,
        title: task.title,
        description: task.description,
        link: task.link,
        dueDate: nextDueDate(task.dueDate, task.recurrence),
        priority: task.priority,
        category: task.category,
        recurrence: task.recurrence,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
}

export async function setTaskStatus(id: string, status: TaskStatus) {
  const userId = await requireUserId();

  await prisma.task.updateMany({
    where: { id, userId },
    data: {
      status,
      isCompleted: status === "COMPLETED",
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
}

export async function duplicateTask(id: string) {
  const userId = await requireUserId();

  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) return;

  await prisma.task.create({
    data: {
      userId,
      title: `${task.title} (copy)`,
      description: task.description,
      link: task.link,
      dueDate: task.dueDate,
      priority: task.priority,
      category: task.category,
      recurrence: task.recurrence,
    },
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
