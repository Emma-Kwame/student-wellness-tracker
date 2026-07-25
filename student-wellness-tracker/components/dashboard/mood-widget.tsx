"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { logMood } from "@/app/actions/mood";
import { MOOD_META, ALL_MOODS } from "@/lib/wellness";
import type { Mood } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

export function MoodWidget({ todayMood }: { todayMood: { mood: Mood; note: string | null } | null }) {
  const [isPending, startTransition] = useTransition();
  const [justLogged, setJustLogged] = useState<Mood | null>(null);

  function handlePick(mood: Mood) {
    startTransition(async () => {
      try {
        await logMood({ mood });
        setJustLogged(mood);
      } catch {
        toast.error("Couldn't save your mood. Try again.");
      }
    });
  }

  const current = justLogged ? { mood: justLogged, note: null } : todayMood;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s mood</CardTitle>
      </CardHeader>
      <CardContent>
        {current ? (
          <div className="flex items-center gap-3">
            <span className="text-4xl">{MOOD_META[current.mood].emoji}</span>
            <div>
              <p className="font-medium">{MOOD_META[current.mood].label}</p>
              {current.note && <p className="text-sm text-muted">{current.note}</p>}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {ALL_MOODS.map((mood) => (
              <button
                key={mood}
                type="button"
                disabled={isPending}
                onClick={() => handlePick(mood)}
                title={MOOD_META[mood].label}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border border-line p-2 text-2xl transition-colors hover:bg-ink/5 disabled:opacity-50",
                )}
              >
                {MOOD_META[mood].emoji}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
