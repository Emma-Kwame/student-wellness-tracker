"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { exerciseLogSchema, type ExerciseLogInput } from "@/lib/validations/trackers";
import { logExercise } from "@/app/actions/exercise";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const TYPES = ["WALKING", "RUNNING", "GYM", "FOOTBALL", "CYCLING", "YOGA", "OTHER"] as const;
const INTENSITIES = ["LOW", "MODERATE", "HIGH"] as const;

export function ExerciseLogForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseLogInput>({
    resolver: zodResolver(exerciseLogSchema),
    defaultValues: { type: "WALKING", intensity: "MODERATE" },
  });

  async function onSubmit(values: ExerciseLogInput) {
    try {
      await logExercise(values);
      reset({ type: "WALKING", intensity: "MODERATE", durationMin: undefined, calories: undefined });
      toast.success("Exercise logged.");
    } catch {
      toast.error("Couldn't save that. Try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-4" noValidate>
      <div>
        <Label htmlFor="type">Activity</Label>
        <select id="type" {...register("type")} className="mt-1.5 h-10 w-full rounded-md border border-line bg-card px-3 text-sm">
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="durationMin">Duration (min)</Label>
        <Input id="durationMin" type="number" invalid={!!errors.durationMin} {...register("durationMin")} className="mt-1.5" />
        <FieldError>{errors.durationMin?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="calories">Calories (optional)</Label>
        <Input id="calories" type="number" {...register("calories")} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="intensity">Intensity</Label>
        <select
          id="intensity"
          {...register("intensity")}
          className="mt-1.5 h-10 w-full rounded-md border border-line bg-card px-3 text-sm"
        >
          {INTENSITIES.map((i) => (
            <option key={i} value={i}>
              {i.charAt(0) + i.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-4">
        <Button type="submit" isLoading={isSubmitting}>
          Log exercise
        </Button>
      </div>
    </form>
  );
}
