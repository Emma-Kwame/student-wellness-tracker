"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { logMood } from "@/app/actions/mood";
import { MOOD_META, ALL_MOODS } from "@/lib/wellness";
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
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {ALL_MOODS.map((mood) => (
          <button
            key={mood}
            type="button"
            onClick={() => setSelected(mood)}
            title={MOOD_META[mood].label}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl border p-2 text-2xl transition-colors",
              selected === mood ? "border-focus bg-focus/5" : "border-line hover:bg-ink/5",
            )}
          >
            {MOOD_META[mood].emoji}
          </button>
        ))}
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What's contributing to this? (optional)"
        rows={2}
        className="w-full rounded-md border border-line bg-card px-3 py-2 text-sm placeholder:text-muted"
      />
      <Button onClick={handleSubmit} isLoading={isPending}>
        Log mood
      </Button>
    </div>
  );
}
