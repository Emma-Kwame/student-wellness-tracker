"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { sleepLogSchema, type SleepLogInput } from "@/lib/validations/trackers";
import { logSleep } from "@/app/actions/sleep";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const QUALITIES = ["POOR", "FAIR", "GOOD", "EXCELLENT"] as const;

export function SleepLogForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SleepLogInput>({ resolver: zodResolver(sleepLogSchema), defaultValues: { quality: "GOOD" } });

  async function onSubmit(values: SleepLogInput) {
    try {
      await logSleep(values);
      reset({ bedtime: "", wakeTime: "", quality: "GOOD" });
      toast.success("Sleep logged.");
    } catch {
      toast.error("Couldn't save that. Try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-3" noValidate>
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
      <div>
        <Label htmlFor="quality">Quality</Label>
        <select
          id="quality"
          {...register("quality")}
          className="mt-1.5 h-10 w-full rounded-md border border-line bg-card px-3 text-sm"
        >
          {QUALITIES.map((q) => (
            <option key={q} value={q}>
              {q.charAt(0) + q.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-3">
        <Button type="submit" isLoading={isSubmitting}>
          Log sleep
        </Button>
      </div>
    </form>
  );
}
