import Link from "next/link";
import { SquarePen } from "lucide-react";

export function QuickReflectionCard() {
  return (
    <Link
      href="/dashboard/journal"
      className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-focus/40 bg-focus/5 p-6 text-center transition-colors hover:bg-focus/10"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-focus shadow-soft">
        <SquarePen className="h-4 w-4" />
      </span>
      <p className="font-display text-base">Quick Reflection</p>
      <p className="text-sm text-muted">How are you feeling right now?</p>
    </Link>
  );
}
