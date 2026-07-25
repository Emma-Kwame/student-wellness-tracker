import { Flame } from "lucide-react";
import { deleteExerciseLog } from "@/app/actions/exercise";
import { DeleteButton } from "@/components/dashboard/delete-button";
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

export function ExerciseHistoryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">No exercise logged yet.</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-center gap-3 py-3">
          <Flame className="h-4 w-4 shrink-0 text-vitality" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {entry.type.charAt(0) + entry.type.slice(1).toLowerCase()} · {formatMinutes(entry.durationMin)}
            </p>
            <p className="text-xs text-muted">
              {entry.intensity.charAt(0) + entry.intensity.slice(1).toLowerCase()} intensity
              {entry.calories ? ` · ~${entry.calories} cal` : ""}
            </p>
          </div>
          <span className="text-xs text-muted">{formatShortDate(entry.loggedAt)}</span>
          <DeleteButton id={entry.id} action={deleteExerciseLog} label="Delete exercise log" />
        </li>
      ))}
    </ul>
  );
}
