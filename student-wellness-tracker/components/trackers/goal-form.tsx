"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { goalSchema, type GoalInput } from "@/lib/validations/trackers";
import { createGoal } from "@/app/actions/goals";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const TYPES: { value: GoalInput["type"]; label: string }[] = [
  { value: "STUDY_HOURS", label: "Study hours (per day)" },
  { value: "WATER_GLASSES", label: "Water glasses (per day)" },
  { value: "SLEEP_HOURS", label: "Sleep hours (per day)" },
  { value: "EXERCISE_MINUTES", label: "Exercise minutes (per day)" },
  { value: "CUSTOM", label: "Custom" },
];

export function GoalForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalInput>({ resolver: zodResolver(goalSchema), defaultValues: { type: "STUDY_HOURS" } });

  async function onSubmit(values: GoalInput) {
    try {
      await createGoal(values);
      reset({ type: "STUDY_HOURS", label: "", targetValue: undefined });
      toast.success("Goal added.");
    } catch {
      toast.error("Couldn't add that goal.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-4" noValidate>
      <div>
        <Label htmlFor="type">Type</Label>
        <select id="type" {...register("type")} className="mt-1.5 h-10 w-full rounded-md border border-line bg-card px-3 text-sm">
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="label">Label</Label>
        <Input id="label" invalid={!!errors.label} {...register("label")} className="mt-1.5" placeholder="Study 3 hours daily" />
        <FieldError>{errors.label?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="targetValue">Target</Label>
        <Input id="targetValue" type="number" step="0.1" invalid={!!errors.targetValue} {...register("targetValue")} className="mt-1.5" />
        <FieldError>{errors.targetValue?.message}</FieldError>
      </div>
      <div className="flex items-end">
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Add goal
        </Button>
      </div>
    </form>
  );
}
