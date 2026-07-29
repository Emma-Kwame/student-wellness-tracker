"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Pause, Play, RotateCcw } from "lucide-react";
import { createGoal, updateGoal, toggleGoal, deleteGoal } from "@/app/actions/goals";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GOAL_TYPE_META, GOAL_TYPE_TRACKER_HREF, goalStatusBand } from "@/lib/wellness";
import type { DayOutcome } from "@/lib/goal-insights";
import type { GoalType } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

const TYPES: GoalType[] = ["STUDY_HOURS", "WATER_GLASSES", "SLEEP_HOURS", "EXERCISE_MINUTES", "CUSTOM"];

type Goal = {
  id: string;
  type: GoalType;
  label: string;
  unit: string | null;
  targetValue: number;
  currentValue: number;
  progress: number;
  isActive: boolean;
  reminderTime: string | null;
};

type Insight = { streak: number; weekly: { date: Date; outcome: DayOutcome }[]; lifetimeTotal: number } | null;

const RING_SIZE = 88;
const RING_STROKE = 8;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ progress, colorClass }: { progress: number; colorClass: string }) {
  const pct = Math.min(100, Math.round(progress * 100));
  const offset = RING_CIRCUMFERENCE * (1 - pct / 100);
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center">
      <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
        <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS} fill="none" stroke="var(--line)" strokeWidth={RING_STROKE} />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          className={colorClass}
          stroke="currentColor"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
        />
      </svg>
      <span className="absolute font-display text-lg">{pct}%</span>
    </div>
  );
}

const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

function WeeklyRow({ weekly }: { weekly: { date: Date; outcome: DayOutcome }[] }) {
  return (
    <div className="flex gap-1">
      {weekly.map((d, i) => (
        <span
          key={i}
          title={d.date.toLocaleDateString()}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md text-[10px]",
            d.outcome === "met" && "bg-emerald-500 text-white",
            d.outcome === "missed" && "bg-red-500/15 text-red-600 dark:text-red-400",
            d.outcome === "pending" && "bg-ink/5 text-muted",
          )}
        >
          {d.outcome === "met" ? "✓" : d.outcome === "missed" ? "✕" : WEEKDAY_LETTERS[d.date.getDay()]}
        </span>
      ))}
    </div>
  );
}

export function GoalsManager({
  goals,
  insights,
  suggestedDefaults,
  recommendations,
}: {
  goals: Goal[];
  insights: Record<string, Insight>;
  suggestedDefaults: Record<string, { target: number; unit: string }>;
  recommendations: { type: GoalType; suggestedTarget: number }[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<GoalType>("STUDY_HOURS");
  const [label, setLabel] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [isPending, startTransition] = useTransition();

  function applyTypeSuggestion(t: GoalType) {
    setType(t);
    if (t === "CUSTOM") {
      setUnit("");
      return;
    }
    const suggestion = suggestedDefaults[t];
    const meta = GOAL_TYPE_META[t];
    setUnit(meta.unit);
    if (!editingId) {
      setTargetValue(suggestion ? String(suggestion.target) : "");
      setLabel(`${meta.label} — ${suggestion ? suggestion.target : ""} ${meta.unit}`.trim());
    }
  }

  function resetForm() {
    setEditingId(null);
    setType("STUDY_HOURS");
    setLabel("");
    setTargetValue("");
    setUnit(GOAL_TYPE_META.STUDY_HOURS.unit);
    setReminderTime("");
  }

  function startEdit(goal: Goal) {
    setEditingId(goal.id);
    setType(goal.type);
    setLabel(goal.label);
    setTargetValue(String(goal.targetValue));
    setUnit(goal.unit ?? GOAL_TYPE_META[goal.type].unit);
    setReminderTime(goal.reminderTime ?? "");
  }

  function applyRecommendation(rec: { type: GoalType; suggestedTarget: number }) {
    setEditingId(null);
    const meta = GOAL_TYPE_META[rec.type];
    setType(rec.type);
    setUnit(meta.unit);
    setTargetValue(String(rec.suggestedTarget));
    setLabel(`${meta.label} — ${rec.suggestedTarget} ${meta.unit}`.trim());
  }

  function save() {
    if (!label.trim()) {
      toast.error("Give your goal a short label.");
      return;
    }
    const target = Number(targetValue);
    if (!Number.isFinite(target) || target <= 0) {
      toast.error("Enter a valid target.");
      return;
    }
    startTransition(async () => {
      try {
        const input = { type, label: label.trim(), targetValue: target, unit: unit || undefined, reminderTime: reminderTime || undefined };
        if (editingId) {
          await updateGoal(editingId, input);
          toast.success("Goal updated.");
        } else {
          const result = await createGoal(input);
          toast.success("Goal added.");
          if (result.unlockedAchievement) toast(`🏆 Achievement unlocked: ${result.unlockedAchievement.title}`);
        }
        resetForm();
      } catch {
        toast.error("Couldn't save that goal.");
      }
    });
  }

  function handleToggle(goal: Goal) {
    startTransition(async () => {
      try {
        await toggleGoal(goal.id, !goal.isActive);
      } catch {
        toast.error("Couldn't update that goal.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-line p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="goal-type">Goal Type</Label>
            <select
              id="goal-type"
              value={type}
              onChange={(e) => applyTypeSuggestion(e.target.value as GoalType)}
              className="mt-1.5 h-10 w-full rounded-md border border-line bg-card px-3 text-sm"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {GOAL_TYPE_META[t].emoji} {GOAL_TYPE_META[t].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="goal-label">Goal Name</Label>
            <Input id="goal-label" value={label} onChange={(e) => setLabel(e.target.value)} className="mt-1.5" placeholder="Study 3 hours daily" />
          </div>
          <div>
            <Label htmlFor="goal-target">Target</Label>
            <Input
              id="goal-target"
              type="number"
              step="0.1"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="goal-unit">Unit</Label>
            <Input
              id="goal-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              disabled={type !== "CUSTOM"}
              className="mt-1.5"
              placeholder="pages, workouts…"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="goal-reminder">Reminder (saved, not yet sent)</Label>
            <Input id="goal-reminder" type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="mt-1.5 w-36" />
          </div>
          <Button onClick={save} isLoading={isPending}>
            {editingId ? "Update Goal" : "Add Goal"}
          </Button>
          {editingId && (
            <Button variant="ghost" onClick={resetForm} type="button">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          )}
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <span className="text-4xl">🎯</span>
          <p className="font-medium">You haven&apos;t created any goals.</p>
          <p className="max-w-xs text-sm text-muted">Start with one small goal and build healthy habits.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {goals.map((goal) => {
            const meta = GOAL_TYPE_META[goal.type];
            const band = goalStatusBand(goal.progress);
            const insight = insights[goal.id];
            const trackerHref = GOAL_TYPE_TRACKER_HREF[goal.type];
            const milestoneStep = goal.type === "EXERCISE_MINUTES" ? 300 : goal.type === "WATER_GLASSES" ? 50 : 25;
            const nextMilestone = insight ? Math.ceil((insight.lifetimeTotal + 0.01) / milestoneStep) * milestoneStep : null;

            return (
              <Card key={goal.id} className={cn(!goal.isActive && "opacity-60")}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-1.5 font-medium">
                        {meta.emoji} {goal.label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        Target: {goal.targetValue} {goal.unit || meta.unit}
                      </p>
                    </div>
                    <ProgressRing progress={goal.progress} colorClass={band.text} />
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/5">
                    <div className={cn("h-full rounded-full transition-all", band.dot)} style={{ width: `${Math.min(100, goal.progress * 100)}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {goal.currentValue.toFixed(1)} / {goal.targetValue} {goal.unit || meta.unit}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <span className={cn("text-xs font-medium", band.text)}>
                      {band.emoji} {band.label}
                    </span>
                    {insight && insight.streak > 0 && <span className="text-xs text-dawn">🔥 {insight.streak}-day streak</span>}
                  </div>

                  {insight && (
                    <div className="mt-3">
                      <WeeklyRow weekly={insight.weekly} />
                    </div>
                  )}

                  {nextMilestone !== null && insight && (
                    <p className="mt-3 text-xs text-muted">
                      Lifetime: {Math.round(insight.lifetimeTotal)} {goal.unit || meta.unit} · Next milestone: {nextMilestone}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(goal)}
                        aria-label="Edit goal"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(goal)}
                        disabled={isPending}
                        aria-label={goal.isActive ? "Pause goal" : "Resume goal"}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-50"
                      >
                        {goal.isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </button>
                      <DeleteButton id={goal.id} action={deleteGoal} label="Delete goal" />
                    </div>
                    {trackerHref && (
                      <a href={trackerHref} className="text-xs text-focus hover:underline">
                        📈 View Progress
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
