import { deleteWaterLog } from "@/app/actions/water";
import { DeleteButton } from "@/components/dashboard/delete-button";

type Entry = { id: string; amountMl: number; loggedAt: Date };

export function WaterHistoryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="text-4xl">💧</span>
        <p className="font-medium">No water logged yet.</p>
        <p className="max-w-xs text-sm text-muted">Start with your first glass. Your hydration history will appear here.</p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-0 border-l border-line pl-4">
      {entries.map((entry) => (
        <li key={entry.id} className="relative flex items-center gap-3 py-2.5">
          <span className="absolute -left-[21px] h-2.5 w-2.5 rounded-full bg-focus" />
          <span className="w-16 shrink-0 text-xs text-muted">
            {entry.loggedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </span>
          <span className="flex-1 text-sm font-medium">+{entry.amountMl} ml</span>
          <DeleteButton id={entry.id} action={deleteWaterLog} label="Delete water log" />
        </li>
      ))}
    </ol>
  );
}
