"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";
import { sleepLogSchema, type SleepLogInput } from "@/lib/validations/trackers";

export async function logSleep(input: SleepLogInput) {
  const userId = await requireUserId();
  const data = sleepLogSchema.parse(input);

  const bedtime = new Date(data.bedtime);
  const wakeTime = new Date(data.wakeTime);
  const durationMin = Math.round((wakeTime.getTime() - bedtime.getTime()) / 60_000);

  await prisma.sleepLog.create({
    data: { userId, bedtime, wakeTime, durationMin, quality: data.quality, restedness: data.restedness },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/sleep");
}

export async function deleteSleepLog(id: string) {
  const userId = await requireUserId();

  await prisma.sleepLog.updateMany({
    where: { id, userId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/sleep");
}
