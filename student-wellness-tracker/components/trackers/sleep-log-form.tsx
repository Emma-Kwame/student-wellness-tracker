"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { sleepLogSchema, type SleepLogInput } from "@/lib/validations/trackers";
import { logSleep } from "@/app/actions/sleep";
import {
  ALL_SLEEP_QUALITIES,
  ALL_RESTEDNESS,
  SLEEP_QUALITY_META,
  SLEEP_QUALITY_COLORS,
  RESTEDNESS_META,
  formatSleepDuration,
  sleepRecommendation,
} from "@/lib/wellness";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseDurationMin(bedtime: string, wakeTime: string): number | null {
  if (!bedtime || !wakeTime) return null;
  const b = new Date(bedtime);
  const w = new Date(wakeTime);
  if (Number.isNaN(b.getTime()) || Number.isNaN(w.getTime())) return null;
  const diff = Math.round((w.getTime() - b.getTime()) / 60_000);
  return diff > 0 ? diff : null;
}

export function SleepLogForm() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SleepLogInput>({ resolver: zodResolver(sleepLogSchema), defaultValues: { quality: "GOOD" } });

  const bedtime = watch("bedtime");
  const wakeTime = watch("wakeTime");
  const quality = watch("quality");
  const restedness = watch("restedness");

  const durationMin = parseDurationMin(bedtime, wakeTime);
  const recommendation = durationMin !== null ? sleepRecommendation(durationMin) : null;

  async function onSubmit(values: SleepLogInput) {
    try {
      await logSleep(values);
      reset({ bedtime: "", wakeTime: "", quality: "GOOD", restedness: undefined });
      toast.success("Sleep logged.");
    } catch {
      toast.error("Couldn't save that. Try again.");
    }
  }

  function applyLastNightPreset() {
    const wake = new Date();
    wake.setHours(7, 0, 0, 0);
    const bed = new Date(wake);
    bed.setDate(bed.getDate() - 1);
    bed.setHours(23, 0, 0, 0);
    setValue("bedtime", toDatetimeLocal(bed));
    setValue("wakeTime", toDatetimeLocal(wake));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <button
        type="button"
        onClick={applyLastNightPreset}
        className="rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-ink/5 hover:text-ink"
      >
        Use last night (11 PM → 7 AM)
      </button>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="bedtime">Bedtime</Label>
          <Input id="bedtime" type="datetime-local" invalid={!!errors.bedtime} {...register("bedtime")} className="mt-1.5" />
          <FieldError>{errors.bedtime?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="wakeTime">Wake time</Label>
          <Input id="wakeTime" type="datetime-local" invalid={!!errors.wakeTime} {...register("wakeTime")} className="mt-1.5" />
          <FieldError>{errors.wakeTime?.message}</FieldError>
        </div>
      </div>

      {durationMin !== null && (
        <div className="rounded-xl border border-line bg-focus/5 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">🌙 Sleep Duration</p>
          <p className="mt-0.5 font-display text-2xl">{formatSleepDuration(durationMin)}</p>
          {recommendation && (
            <p className={cn("mt-1.5 text-sm", recommendation.isGood ? "text-vitality" : "text-dawn")}>
              {recommendation.message}
            </p>
          )}
        </div>
      )}

      <div>
        <Label>Quality</Label>
        <div className="mt-1.5 grid grid-cols-5 gap-2">
          {ALL_SLEEP_QUALITIES.map((q) => {
            const meta = SLEEP_QUALITY_META[q];
            const colors = SLEEP_QUALITY_COLORS[q];
            const isSelected = quality === q;
            return (
              <button
                key={q}
                type="button"
                onClick={() => setValue("quality", q)}
                title={meta.label}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border p-2.5 transition-all duration-200",
                  isSelected
                    ? cn(colors.selectedBg, colors.ring, "border-transparent shadow-lg ring-2 ring-offset-2 ring-offset-card")
                    : cn(colors.bg, "border-line hover:scale-105"),
                )}
              >
                <span className="text-2xl leading-none">{meta.emoji}</span>
                <span className={cn("text-[11px] font-medium", isSelected ? colors.text : "text-muted")}>{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label>How rested do you feel today? (optional)</Label>
        <div className="mt-1.5 flex gap-2">
          {ALL_RESTEDNESS.map((r) => {
            const meta = RESTEDNESS_META[r];
            const isSelected = restedness === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setValue("restedness", isSelected ? undefined : r)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl border p-2.5 transition-all",
                  isSelected ? "border-focus bg-focus/10 text-focus" : "border-line text-muted hover:bg-ink/5",
                )}
              >
                <span className="text-xl leading-none">{meta.emoji}</span>
                <span className="text-[11px] font-medium">{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Button type="submit" isLoading={isSubmitting}>
        Log sleep
      </Button>
    </form>
  );
}
