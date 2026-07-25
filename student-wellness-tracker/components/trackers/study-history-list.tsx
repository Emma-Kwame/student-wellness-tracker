import { deleteStudySession } from "@/app/actions/study";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { formatMinutes, formatShortDate } from "@/lib/utils";

type Entry = {
  id: string;
  startedAt: Date;
  durationMin: number | null;
  isPomodoro: boolean;
  notes: string | null;
  course: { name: string; color: string } | null;
};

export function StudyHistoryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">No sessions logged yet.</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-center gap-3 py-3">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.course?.color ?? "var(--muted)" }} />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {entry.course?.name ?? "General study"} · {formatMinutes(entry.durationMin ?? 0)}
              {entry.isPomodoro && <span className="ml-1.5 text-xs text-dawn">Pomodoro</span>}
            </p>
            {entry.notes && <p className="text-xs text-muted">{entry.notes}</p>}
          </div>
          <span className="text-xs text-muted">{formatShortDate(entry.startedAt)}</span>
          <DeleteButton id={entry.id} action={deleteStudySession} label="Delete study session" />
        </li>
      ))}
    </ul>
  );
}
