"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { logMood } from "@/app/actions/mood";
import { MOOD_META, MOOD_COLORS, ALL_MOODS } from "@/lib/wellness";
import type { Mood } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MoodLogForm() {
  const [selected, setSelected] = useState<Mood | null>(null);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!selected) {
      toast.error("Pick a mood first.");
      return;
    }
    startTransition(async () => {
      try {
        await logMood({ mood: selected, note: note || undefined });
        setSelected(null);
        setNote("");
        toast.success("Logged.");
      } catch {
        toast.error("Couldn't save that. Try again.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
        {ALL_MOODS.map((mood) => {
          const meta = MOOD_META[mood];
          const colors = MOOD_COLORS[mood];
          const isSelected = selected === mood;
          return (
            <div key={mood} className="group relative">
              <button
                type="button"
                onClick={() => setSelected(mood)}
                title={meta.label}
                className={cn(
                  "flex w-full flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-all duration-200",
                  isSelected
                    ? cn(colors.selectedBg, colors.ring, "border-transparent shadow-lg ring-2 ring-offset-2 ring-offset-card")
                    : cn(colors.bg, "border-line hover:scale-105"),
                )}
              >
                <span
                  className="leading-none transition-[font-size] duration-200"
                  style={{ fontSize: isSelected ? 42 : 30 }}
                >
                  {meta.emoji}
                </span>
                <span className={cn("text-[11px] font-medium leading-tight", isSelected ? colors.text : "text-muted")}>
                  {meta.label}
                </span>
              </button>

              <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max max-w-[150px] -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-center opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                <p className="text-xs font-medium text-paper">{meta.label}</p>
                <p className="text-[11px] text-paper/70">{meta.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className={cn("rounded-lg border border-transparent px-4 py-3 text-sm", MOOD_COLORS[selected].bg, MOOD_COLORS[selected].text)}>
          {MOOD_META[selected].prompt}
        </div>
      )}

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What's making you feel this way today? (optional)"
        rows={2}
        className="w-full rounded-md border border-line bg-card px-3 py-2 text-sm placeholder:text-muted"
      />
      <Button onClick={handleSubmit} isLoading={isPending}>
        Log mood
      </Button>
    </div>
  );
}
