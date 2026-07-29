"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Droplets } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logWater } from "@/app/actions/water";

const PRESETS = [
  { label: "+1 glass", ml: 250 },
  { label: "+1 bottle", ml: 500 },
];

export function WaterWidget({ todayMl, goalMl }: { todayMl: number; goalMl: number }) {
  const [isPending, startTransition] = useTransition();
  const pct = Math.min(100, Math.round((todayMl / goalMl) * 100));

  function handleAdd(ml: number) {
    startTransition(async () => {
      try {
        await logWater(ml);
      } catch {
        toast.error("Couldn't log that. Try again.");
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Hydration</CardTitle>
        <Droplets className="h-4 w-4 text-vitality" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between gap-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl">{(todayMl / 1000).toFixed(1)}L</span>
            <span className="text-sm text-muted">of {(goalMl / 1000).toFixed(1)}L</span>
          </div>
          <span className="text-sm font-medium text-vitality">{pct}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/5">
          <div className="h-full rounded-full bg-vitality transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-muted">
          {todayMl >= goalMl ? "🎉 Goal reached!" : `${goalMl - todayMl} ml remaining`}
        </p>
        <div className="mt-4 flex gap-2">
          {PRESETS.map((p) => (
            <Button key={p.ml} size="sm" variant="outline" disabled={isPending} onClick={() => handleAdd(p.ml)}>
              {p.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
