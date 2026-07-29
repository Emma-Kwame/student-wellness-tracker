"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { logWater } from "@/app/actions/water";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const QUICK = [
  { ml: 150, emoji: "💧", colors: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20" },
  { ml: 250, emoji: "🥛", colors: "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/20" },
  { ml: 330, emoji: "🧃", colors: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20" },
  { ml: 500, emoji: "🥤", colors: "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/20" },
  { ml: 750, emoji: "🍼", colors: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20" },
] as const;

export function WaterLogForm() {
  const [amount, setAmount] = useState("250");
  const [isPending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState<number | null>(null);

  function add(ml: number) {
    setJustAdded(ml);
    setTimeout(() => setJustAdded((current) => (current === ml ? null : current)), 1200);

    startTransition(async () => {
      try {
        await logWater(ml);
        toast.success(`+${ml} ml logged.`);
      } catch {
        toast.error("Couldn't log that. Try again.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {QUICK.map(({ ml, emoji, colors }) => (
          <button
            key={ml}
            type="button"
            disabled={isPending}
            onClick={() => add(ml)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-50",
              colors,
              justAdded === ml ? "scale-110 ring-2 ring-offset-2 ring-offset-card ring-current" : "hover:scale-105",
            )}
          >
            {justAdded === ml && <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-20" />}
            <span className="text-base leading-none">{emoji}</span>+{ml} ml
          </button>
        ))}
      </div>
      <div className="flex items-end gap-2">
        <div>
          <label htmlFor="custom-amount" className="text-sm text-muted">
            Custom amount (ml)
          </label>
          <Input
            id="custom-amount"
            type="number"
            min={1}
            max={2000}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1.5 w-32"
          />
        </div>
        <Button type="button" disabled={isPending} onClick={() => add(Number(amount))}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  );
}
