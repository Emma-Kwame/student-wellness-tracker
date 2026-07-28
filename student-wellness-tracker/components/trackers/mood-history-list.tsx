import { deleteMoodEntry } from "@/app/actions/mood";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { MOOD_META, MOOD_COLORS } from "@/lib/wellness";
import { formatShortDate, cn } from "@/lib/utils";
import type { Mood } from "@/generated/prisma/client";

type Entry = { id: string; mood: Mood; note: string | null; loggedAt: Date };

export function MoodHistoryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">No mood entries yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {entries.map((entry) => (
        <li key={entry.id} className={cn("flex items-center gap-3 rounded-xl p-3", MOOD_COLORS[entry.mood].bg)}>
          <span className="text-2xl leading-none">{MOOD_META[entry.mood].emoji}</span>
          <div className="flex-1">
            <p className={cn("text-sm font-medium", MOOD_COLORS[entry.mood].text)}>{MOOD_META[entry.mood].label}</p>
            {entry.note && <p className="text-sm text-muted">{entry.note}</p>}
          </div>
          <span className="text-xs text-muted">{formatShortDate(entry.loggedAt)}</span>
          <DeleteButton id={entry.id} action={deleteMoodEntry} label="Delete mood entry" />
        </li>
      ))}
    </ul>
  );
}
