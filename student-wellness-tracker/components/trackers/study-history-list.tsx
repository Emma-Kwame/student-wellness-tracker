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

function relativeDayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return formatShortDate(date);
}

export function StudyHistoryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="text-4xl">📚</span>
        <p className="font-medium">Ready to study?</p>
        <p className="max-w-xs text-sm text-muted">Choose a course and begin your next session — it&apos;ll show up here.</p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {entries.map((entry) => (
        <li key={entry.id} className="relative rounded-xl border border-line p-4">
          <DeleteButton id={entry.id} action={deleteStudySession} label="Delete study session" className="absolute right-2 top-2" />
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.course?.color ?? "var(--muted)" }} />
            {entry.course?.name ?? "General study"}
          </p>
          <p className="mt-1 font-display text-2xl">{formatMinutes(entry.durationMin ?? 0)}</p>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted">
            {entry.isPomodoro && <span>🍅 Pomodoro</span>}
            <span>
              {relativeDayLabel(entry.startedAt)} · {entry.startedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </span>
          </div>
          {entry.notes && <p className="mt-1.5 text-xs text-muted">📝 {entry.notes}</p>}
        </li>
      ))}
    </ul>
  );
}
