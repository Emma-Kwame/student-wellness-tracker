import { deleteExerciseLog } from "@/app/actions/exercise";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { EXERCISE_TYPE_META, EXERCISE_INTENSITY_META } from "@/lib/wellness";
import { formatMinutes, formatShortDate } from "@/lib/utils";
import type { ExerciseType, ExerciseIntensity } from "@/generated/prisma/client";

type Entry = {
  id: string;
  type: ExerciseType;
  durationMin: number;
  calories: number | null;
  intensity: ExerciseIntensity;
  loggedAt: Date;
};

function relativeDayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return formatShortDate(date);
}

export function ExerciseHistoryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="text-4xl">🏃</span>
        <p className="font-medium">No exercise logged yet.</p>
        <p className="max-w-xs text-sm text-muted">Log your first workout above — your activity history will appear here.</p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {entries.map((entry) => {
        const typeMeta = EXERCISE_TYPE_META[entry.type];
        const intensityMeta = EXERCISE_INTENSITY_META[entry.intensity];
        return (
          <li key={entry.id} className="relative rounded-xl border border-line p-4">
            <DeleteButton id={entry.id} action={deleteExerciseLog} label="Delete exercise log" className="absolute right-2 top-2" />
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <span className="text-lg leading-none">{typeMeta.emoji}</span> {typeMeta.label}
            </p>
            <p className="mt-1 font-display text-2xl">{formatMinutes(entry.durationMin)}</p>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1">
                {intensityMeta.emoji} {intensityMeta.label}
              </span>
              {entry.calories !== null && <span>~{entry.calories} kcal</span>}
            </div>
            <p className="mt-1.5 text-xs text-muted">
              {relativeDayLabel(entry.loggedAt)} · {entry.loggedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
