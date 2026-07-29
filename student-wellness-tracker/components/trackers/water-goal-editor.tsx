"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { updateWaterGoal } from "@/app/actions/water";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function WaterGoalEditor({ goalMl }: { goalMl: number }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(goalMl));
  const [isPending, startTransition] = useTransition();

  function save() {
    const goal = Number(value);
    if (!Number.isFinite(goal) || goal < 250) {
      toast.error("Enter a valid goal (at least 250 ml).");
      return;
    }
    startTransition(async () => {
      try {
        await updateWaterGoal(goal);
        toast.success("Goal updated.");
        setEditing(false);
      } catch {
        toast.error("Couldn't update your goal.");
      }
    });
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <Pencil className="h-3.5 w-3.5" />
        Change goal
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={250}
        step={50}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-28"
        autoFocus
      />
      <span className="text-sm text-muted">ml</span>
      <Button size="sm" onClick={save} isLoading={isPending}>
        Save
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={isPending}>
        Cancel
      </Button>
    </div>
  );
}
