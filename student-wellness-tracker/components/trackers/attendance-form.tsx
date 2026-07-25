"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { attendanceRecordSchema, type AttendanceRecordInput } from "@/lib/validations/trackers";
import { recordAttendance } from "@/app/actions/attendance";
import { Label, FieldError } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Course = { id: string; name: string };
const STATUSES = ["PRESENT", "ABSENT", "EXCUSED", "LATE"] as const;

export function AttendanceForm({ courses }: { courses: Course[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AttendanceRecordInput>({
    resolver: zodResolver(attendanceRecordSchema),
    defaultValues: { status: "PRESENT", date: today },
  });

  async function onSubmit(values: AttendanceRecordInput) {
    try {
      await recordAttendance(values);
      toast.success("Attendance recorded.");
    } catch {
      toast.error("Couldn't save that. Add a course first if you haven't.");
    }
  }

  if (courses.length === 0) {
    return <p className="text-sm text-muted">Add a course below before recording attendance.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3" noValidate>
      <div>
        <Label htmlFor="courseId">Course</Label>
        <select id="courseId" {...register("courseId")} className="mt-1.5 h-10 w-44 rounded-md border border-line bg-card px-3 text-sm">
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <FieldError>{errors.courseId?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register("date")} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <select id="status" {...register("status")} className="mt-1.5 h-10 rounded-md border border-line bg-card px-3 text-sm">
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" isLoading={isSubmitting}>
        Save
      </Button>
    </form>
  );
}
