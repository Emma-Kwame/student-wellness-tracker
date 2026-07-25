"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function DeleteButton({
  id,
  action,
  label = "Delete entry",
  className,
}: {
  id: string;
  action: (id: string) => Promise<void>;
  label?: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={label}
      disabled={isPending}
      onClick={() => startTransition(() => action(id))}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50",
        className,
      )}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}
