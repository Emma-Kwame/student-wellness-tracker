"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";
import { moodEntrySchema, type MoodEntryInput } from "@/lib/validations/trackers";

export async function logMood(input: MoodEntryInput) {
  const userId = await requireUserId();
  const data = moodEntrySchema.parse(input);

  await prisma.moodEntry.create({
    data: { userId, mood: data.mood, note: data.note || null },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mood");
}

export async function deleteMoodEntry(id: string) {
  const userId = await requireUserId();

  await prisma.moodEntry.updateMany({
    where: { id, userId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mood");
}
