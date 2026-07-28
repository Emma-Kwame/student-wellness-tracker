"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { logMood } from "@/app/actions/mood";
import { MOOD_META, MOOD_COLORS, ALL_MOODS } from "@/lib/wellness";
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

  const current = justLogged ? { mood: justLogged, note: null as string | null } : todayMood;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s mood</CardTitle>
      </CardHeader>
      <CardContent>
        {current ? (
          <div className="space-y-3">
            <div className={cn("flex items-center gap-3 rounded-xl p-3", MOOD_COLORS[current.mood].bg)}>
              <span className="text-4xl leading-none">{MOOD_META[current.mood].emoji}</span>
              <div>
                <p className={cn("font-medium", MOOD_COLORS[current.mood].text)}>{MOOD_META[current.mood].label}</p>
                {current.note && <p className="text-sm text-muted">{current.note}</p>}
              </div>
            </div>
            {justLogged && (
              <p className="text-sm text-muted">
                {MOOD_META[justLogged].prompt}{" "}
                <Link href="/dashboard/mood" className="text-focus hover:underline">
                  Write more
                </Link>
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {ALL_MOODS.map((mood) => {
              const meta = MOOD_META[mood];
              const colors = MOOD_COLORS[mood];
              return (
                <div key={mood} className="group relative">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handlePick(mood)}
                    title={meta.label}
                    className={cn(
                      "flex w-full flex-col items-center gap-1 rounded-xl border border-line p-2 transition-all hover:scale-105 disabled:opacity-50",
                      colors.bg,
                    )}
                  >
                    <span className="text-2xl leading-none">{meta.emoji}</span>
                    <span className="text-[10px] font-medium text-muted">{meta.label}</span>
                  </button>
                  <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max max-w-[140px] -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-center opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                    <p className="text-xs font-medium text-paper">{meta.label}</p>
                    <p className="text-[11px] text-paper/70">{meta.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
