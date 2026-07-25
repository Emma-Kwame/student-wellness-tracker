import { deleteSleepLog } from "@/app/actions/sleep";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { formatMinutes, formatShortDate } from "@/lib/utils";
import type { SleepQuality } from "@/generated/prisma/client";

type Entry = { id: string; bedtime: Date; wakeTime: Date; durationMin: number; quality: SleepQuality };

export function SleepHistoryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">No sleep logs yet.</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-center gap-3 py-3">
          <div className="flex-1">
            <p className="text-sm font-medium">{formatMinutes(entry.durationMin)}</p>
            <p className="text-xs text-muted">
              {entry.bedtime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} →{" "}
              {entry.wakeTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} ·{" "}
              {entry.quality.charAt(0) + entry.quality.slice(1).toLowerCase()}
            </p>
          </div>
          <span className="text-xs text-muted">{formatShortDate(entry.bedtime)}</span>
          <DeleteButton id={entry.id} action={deleteSleepLog} label="Delete sleep log" />
        </li>
      ))}
    </ul>
  );
}
