"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Timer, Flame as FlameIcon, Check } from "lucide-react";
import { exerciseLogSchema, type ExerciseLogInput } from "@/lib/validations/trackers";
import { logExercise } from "@/app/actions/exercise";
import {
  ALL_EXERCISE_TYPES,
  ALL_EXERCISE_INTENSITIES,
  EXERCISE_TYPE_META,
  EXERCISE_INTENSITY_META,
  estimateExerciseCalories,
  exerciseMotivationMessage,
} from "@/lib/wellness";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ExerciseLogForm({
  weeklyMinutesSoFar,
  weeklyGoalMin,
}: {
  weeklyMinutesSoFar: number;
  weeklyGoalMin: number;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseLogInput>({
    resolver: zodResolver(exerciseLogSchema),
    defaultValues: { type: "WALKING", intensity: "MODERATE" },
  });

  const [caloriesTouched, setCaloriesTouched] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const type = watch("type");
  const intensity = watch("intensity");
  const durationMin = watch("durationMin");

  // Auto-fill the calorie estimate whenever the inputs it depends on change —
  // unless the student has already typed their own number.
  useEffect(() => {
    if (caloriesTouched) return;
    const minutes = Number(durationMin);
    if (!minutes || minutes <= 0) return;
    setValue("calories", estimateExerciseCalories(type, intensity, minutes));
  }, [type, intensity, durationMin, caloriesTouched, setValue]);

  async function onSubmit(values: ExerciseLogInput) {
    try {
      const result = await logExercise(values);

      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);

      toast.success(exerciseMotivationMessage(values.durationMin, weeklyMinutesSoFar + values.durationMin, weeklyGoalMin));
      if (result.unlockedAchievement) {
        toast(`🏆 Achievement unlocked: ${result.unlockedAchievement.title}`);
      }

      reset({ type: "WALKING", intensity: "MODERATE", durationMin: undefined, calories: undefined });
      setCaloriesTouched(false);
    } catch {
      toast.error("Couldn't save that. Try again.");
    }
  }

  const estimatedCalories = durationMin ? estimateExerciseCalories(type, intensity, Number(durationMin)) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <Label>What did you do?</Label>
        <div className="mt-1.5 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {ALL_EXERCISE_TYPES.map((t) => {
            const meta = EXERCISE_TYPE_META[t];
            const isSelected = type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setValue("type", t)}
                title={meta.label}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border p-2.5 transition-all duration-200",
                  isSelected ? "border-focus bg-focus/10 text-focus shadow-lg scale-105" : "border-line hover:bg-ink/5",
                )}
              >
                <span className="text-2xl leading-none">{meta.emoji}</span>
                <span className="text-[11px] font-medium">{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="durationMin" className="flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5" /> Duration (min)
          </Label>
          <Input
            id="durationMin"
            type="number"
            placeholder="e.g. 45"
            invalid={!!errors.durationMin}
            {...register("durationMin")}
            className="mt-1.5"
          />
          <FieldError>{errors.durationMin?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="calories" className="flex items-center gap-1.5">
            <FlameIcon className="h-3.5 w-3.5" /> Calories {!caloriesTouched && estimatedCalories !== null && "(estimated)"}
          </Label>
          <Input
            id="calories"
            type="number"
            placeholder={estimatedCalories !== null ? `≈ ${estimatedCalories}` : "e.g. 250"}
            {...register("calories", { onChange: () => setCaloriesTouched(true) })}
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label>Intensity</Label>
        <div className="mt-1.5 flex gap-2">
          {ALL_EXERCISE_INTENSITIES.map((i) => {
            const meta = EXERCISE_INTENSITY_META[i];
            const isSelected = intensity === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setValue("intensity", i)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-xl border p-2.5 text-sm font-medium transition-all",
                  isSelected ? "border-focus bg-focus/10 text-focus" : "border-line text-muted hover:bg-ink/5",
                )}
              >
                <span>{meta.emoji}</span>
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full sm:w-auto">
        {justSaved ? <Check className="h-4 w-4" /> : null}
        {justSaved ? "Logged!" : "Log exercise"}
      </Button>
    </form>
  );
}
