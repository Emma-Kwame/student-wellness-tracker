import { deleteSleepLog } from "@/app/actions/sleep";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { SLEEP_QUALITY_META, SLEEP_QUALITY_COLORS, formatSleepDuration } from "@/lib/wellness";
import { formatShortDate, cn } from "@/lib/utils";
import type { SleepQuality } from "@/generated/prisma/client";

type Entry = { id: string; bedtime: Date; wakeTime: Date; durationMin: number; quality: SleepQuality };

function relativeDayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return formatShortDate(date);
}

export function SleepHistoryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="text-4xl">🌙</span>
        <p className="font-medium">No sleep records yet.</p>
        <p className="max-w-xs text-sm text-muted">
          Start tracking your sleep today. Your trends and insights will appear here.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {entries.map((entry) => {
        const meta = SLEEP_QUALITY_META[entry.quality];
        const colors = SLEEP_QUALITY_COLORS[entry.quality];
        return (
          <li key={entry.id} className={cn("relative rounded-xl p-4", colors.bg)}>
            <DeleteButton id={entry.id} action={deleteSleepLog} label="Delete sleep log" className="absolute right-2 top-2" />
            <p className="text-xs font-medium text-muted">
              {meta.emoji} {relativeDayLabel(entry.bedtime)}
            </p>
            <p className="mt-1 font-display text-2xl">{formatSleepDuration(entry.durationMin)}</p>
            <p className={cn("mt-0.5 text-sm font-medium", colors.text)}>{meta.label}</p>
            <p className="mt-1.5 text-xs text-muted">
              {entry.bedtime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} →{" "}
              {entry.wakeTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
