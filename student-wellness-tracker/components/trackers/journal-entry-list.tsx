import { deleteJournalEntry } from "@/app/actions/journal";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { formatShortDate } from "@/lib/utils";

type Entry = { id: string; title: string | null; content: string; loggedAt: Date };

export function JournalEntryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">No journal entries yet — write your first above.</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-start gap-3 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{entry.title || "Untitled"}</p>
              <span className="shrink-0 text-xs text-muted">{formatShortDate(entry.loggedAt)}</span>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{entry.content}</p>
          </div>
          <DeleteButton id={entry.id} action={deleteJournalEntry} label="Delete journal entry" />
        </li>
      ))}
    </ul>
  );
}
