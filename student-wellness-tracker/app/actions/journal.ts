"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";
import { journalEntrySchema, type JournalEntryInput } from "@/lib/validations/trackers";

export async function createJournalEntry(input: JournalEntryInput) {
  const userId = await requireUserId();
  const data = journalEntrySchema.parse(input);

  await prisma.journalEntry.create({
    data: { userId, title: data.title || null, content: data.content },
  });

  revalidatePath("/dashboard/journal");
  revalidatePath("/dashboard");
}

export async function deleteJournalEntry(id: string) {
  const userId = await requireUserId();

  await prisma.journalEntry.updateMany({
    where: { id, userId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/dashboard/journal");
}
