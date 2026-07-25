"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleGoal, deleteGoal } from "@/app/actions/goals";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { cn } from "@/lib/utils";

type Goal = {
  id: string;
  label: string;
  targetValue: number;
  currentValue: number;
  progress: number;
  isActive: boolean;
};

function GoalRow({ goal }: { goal: Goal }) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleGoal(goal.id, !goal.isActive);
      } catch {
        toast.error("Couldn't update that goal.");
      }
    });
  }

  return (
    <li className="py-3">
      <div className="flex items-center justify-between">
        <span className={cn("text-sm font-medium", !goal.isActive && "text-muted")}>{goal.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">
            {goal.currentValue.toFixed(1)} / {goal.targetValue}
          </span>
          <button
            type="button"
            disabled={isPending}
            onClick={handleToggle}
            className="text-xs text-focus hover:underline disabled:opacity-50"
          >
            {goal.isActive ? "Pause" : "Resume"}
          </button>
          <DeleteButton id={goal.id} action={deleteGoal} label="Delete goal" />
        </div>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/5">
        <div
          className={cn("h-full rounded-full transition-all", goal.isActive ? "bg-focus" : "bg-muted")}
          style={{ width: `${Math.round(goal.progress * 100)}%` }}
        />
      </div>
    </li>
  );
}

export function GoalList({ goals }: { goals: Goal[] }) {
  if (goals.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">No goals yet — add one above.</p>;
  }

  return <ul className="divide-y divide-line">{goals.map((goal) => <GoalRow key={goal.id} goal={goal} />)}</ul>;
}
