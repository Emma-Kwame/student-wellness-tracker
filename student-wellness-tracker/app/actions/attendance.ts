"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";
import { courseSchema, attendanceRecordSchema, type CourseInput, type AttendanceRecordInput } from "@/lib/validations/trackers";

export async function createCourse(input: CourseInput) {
  const userId = await requireUserId();
  const data = courseSchema.parse(input);

  await prisma.course.create({
    data: { userId, name: data.name, code: data.code || null, color: data.color },
  });

  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/study");
}

export async function deleteCourse(id: string) {
  const userId = await requireUserId();

  await prisma.course.updateMany({
    where: { id, userId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/study");
}

/** Upsert on the (courseId, date) unique constraint — marking today PRESENT
 * twice should correct the record, not create a duplicate. */
export async function recordAttendance(input: AttendanceRecordInput) {
  const userId = await requireUserId();
  const data = attendanceRecordSchema.parse(input);

  const course = await prisma.course.findFirst({
    where: { id: data.courseId, userId },
    select: { id: true },
  });
  if (!course) throw new Error("Course not found");

  // Parsing "YYYY-MM-DD" via `new Date(str)` gives UTC midnight; calling
  // .setHours() on it then reinterprets that instant in local time, which
  // silently shifts the date backward a day west of UTC. Building the UTC
  // date directly from the parts avoids that.
  const [year, month, day] = data.date.split("-").map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day!));

  await prisma.attendanceRecord.upsert({
    where: { courseId_date: { courseId: data.courseId, date } },
    update: { status: data.status },
    create: { userId, courseId: data.courseId, status: data.status, date },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/attendance");
}

export async function deleteAttendanceRecord(id: string) {
  const userId = await requireUserId();
  await prisma.attendanceRecord.deleteMany({ where: { id, userId } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/attendance");
}
