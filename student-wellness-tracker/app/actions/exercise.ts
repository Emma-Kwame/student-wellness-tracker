"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";
import { exerciseLogSchema, type ExerciseLogInput } from "@/lib/validations/trackers";

export async function logExercise(input: ExerciseLogInput) {
  const userId = await requireUserId();
  const data = exerciseLogSchema.parse(input);

  await prisma.exerciseLog.create({
    data: {
      userId,
      type: data.type,
      durationMin: data.durationMin,
      calories: data.calories ?? null,
      intensity: data.intensity,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/exercise");
}

export async function deleteExerciseLog(id: string) {
  const userId = await requireUserId();

  await prisma.exerciseLog.updateMany({
    where: { id, userId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/exercise");
}
