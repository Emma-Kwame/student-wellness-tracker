import { Card, CardContent } from "@/components/ui/card";
import { SLEEP_QUALITY_META, SLEEP_QUALITY_COLORS, computeSleepScore, sleepScoreBand, formatSleepDuration } from "@/lib/wellness";
import { cn } from "@/lib/utils";
import type { SleepQuality } from "@/generated/prisma/client";

type LastNight = { bedtime: Date; wakeTime: Date; durationMin: number; quality: SleepQuality };

export function SleepSummaryCard({ log }: { log: LastNight }) {
  const meta = SLEEP_QUALITY_META[log.quality];
  const colors = SLEEP_QUALITY_COLORS[log.quality];
  const score = computeSleepScore(log.durationMin, log.quality);
  const band = sleepScoreBand(score);
  const timeFmt = (d: Date) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <Card className={cn("border-none", colors.bg)}>
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="text-5xl leading-none">🌙</span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Last Night</p>
            <p className="mt-0.5 font-display text-3xl">{formatSleepDuration(log.durationMin)}</p>
            <p className={cn("mt-0.5 text-sm font-medium", colors.text)}>
              {meta.emoji} {meta.label} sleep
            </p>
            <p className="mt-1 text-xs text-muted">
              Bed: {timeFmt(log.bedtime)} · Wake: {timeFmt(log.wakeTime)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-soft">
          <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", band.dot)} />
          <div>
            <p className="text-xs text-muted">Sleep Score</p>
            <p className="font-display text-2xl leading-tight">
              {score}
              <span className="text-sm text-muted">/100</span>
            </p>
            <p className={cn("text-xs font-medium", band.text)}>{band.label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
