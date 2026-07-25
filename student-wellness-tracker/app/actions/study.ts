"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";
import { studySessionSchema, type StudySessionInput } from "@/lib/validations/trackers";

export async function logStudySession(input: StudySessionInput, isPomodoro = false) {
  const userId = await requireUserId();
  const data = studySessionSchema.parse(input);

  const startedAt = new Date(data.startedAt);
  const endedAt = new Date(data.endedAt);
  const durationMin = Math.round((endedAt.getTime() - startedAt.getTime()) / 60_000);

  // courseId is optional and user-supplied — verify ownership rather than
  // trusting it, so a stale or spoofed id can't attach a session to
  // someone else's course.
  const courseId = data.courseId
    ? (await prisma.course.findFirst({ where: { id: data.courseId, userId }, select: { id: true } }))?.id ?? null
    : null;

  await prisma.studySession.create({
    data: { userId, courseId, startedAt, endedAt, durationMin, isPomodoro, notes: data.notes || null },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/study");
}

export async function deleteStudySession(id: string) {
  const userId = await requireUserId();

  await prisma.studySession.updateMany({
    where: { id, userId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/study");
}
