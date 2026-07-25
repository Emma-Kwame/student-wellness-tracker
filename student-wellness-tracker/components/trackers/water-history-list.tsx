import { deleteWaterLog } from "@/app/actions/water";
import { DeleteButton } from "@/components/dashboard/delete-button";

type Entry = { id: string; amountMl: number; loggedAt: Date };

export function WaterHistoryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">Nothing logged today.</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-center gap-3 py-2.5">
          <span className="flex-1 text-sm">{entry.amountMl} ml</span>
          <span className="text-xs text-muted">
            {entry.loggedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </span>
          <DeleteButton id={entry.id} action={deleteWaterLog} label="Delete water log" />
        </li>
      ))}
    </ul>
  );
}
