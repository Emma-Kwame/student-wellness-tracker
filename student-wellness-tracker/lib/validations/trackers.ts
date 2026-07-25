import { z } from "zod";

export const moodEntrySchema = z.object({
  mood: z.enum(["HAPPY", "NEUTRAL", "SAD", "STRESSED", "TIRED", "EXCITED", "MOTIVATED"]),
  note: z.string().max(500).optional(),
});
export type MoodEntryInput = z.infer<typeof moodEntrySchema>;

export const sleepLogSchema = z
  .object({
    bedtime: z.string().min(1, "Required"), // datetime-local string
    wakeTime: z.string().min(1, "Required"),
    quality: z.enum(["POOR", "FAIR", "GOOD", "EXCELLENT"]),
  })
  .refine((data) => new Date(data.wakeTime) > new Date(data.bedtime), {
    message: "Wake time must be after bedtime",
    path: ["wakeTime"],
  });
export type SleepLogInput = z.infer<typeof sleepLogSchema>;

export const waterLogSchema = z.object({
  amountMl: z.coerce.number().int().min(1).max(2000),
});
export type WaterLogInput = z.infer<typeof waterLogSchema>;

export const exerciseLogSchema = z.object({
  type: z.enum(["WALKING", "RUNNING", "GYM", "FOOTBALL", "CYCLING", "YOGA", "OTHER"]),
  durationMin: z.coerce.number().int().min(1).max(600),
  calories: z.coerce.number().int().min(0).max(5000).optional(),
  intensity: z.enum(["LOW", "MODERATE", "HIGH"]),
});
export type ExerciseLogInput = z.infer<typeof exerciseLogSchema>;

export const studySessionSchema = z
  .object({
    courseId: z.string().optional(),
    startedAt: z.string().min(1, "Required"),
    endedAt: z.string().min(1, "Required"),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => new Date(data.endedAt) > new Date(data.startedAt), {
    message: "End time must be after start time",
    path: ["endedAt"],
  });
export type StudySessionInput = z.infer<typeof studySessionSchema>;

export const courseSchema = z.object({
  name: z.string().min(1, "Course name is required").max(120),
  code: z.string().max(30).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Pick a valid color"),
});
export type CourseInput = z.infer<typeof courseSchema>;

export const attendanceRecordSchema = z.object({
  courseId: z.string().min(1, "Pick a course"),
  status: z.enum(["PRESENT", "ABSENT", "EXCUSED", "LATE"]),
  date: z.string().min(1, "Required"),
});
export type AttendanceRecordInput = z.infer<typeof attendanceRecordSchema>;

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  category: z.enum(["ACADEMIC", "PERSONAL", "HEALTH", "SOCIAL", "OTHER"]),
});
export type TaskInput = z.infer<typeof taskSchema>;

export const goalSchema = z.object({
  type: z.enum(["STUDY_HOURS", "WATER_GLASSES", "SLEEP_HOURS", "EXERCISE_MINUTES", "CUSTOM"]),
  label: z.string().min(1, "Give it a short label").max(120),
  targetValue: z.coerce.number().positive().max(10000),
});
export type GoalInput = z.infer<typeof goalSchema>;
