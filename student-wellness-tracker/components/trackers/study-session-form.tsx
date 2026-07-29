"use client";

import { useEffect, useMemo, useRef, useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { Play, Pause, Square, Plus, Maximize2, Minimize2 } from "lucide-react";
import { logStudySession } from "@/app/actions/study";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Course = { id: string; name: string; color: string };

const POMODORO_PRESETS = {
  "25/5": { work: 25 * 60, break: 5 * 60, label: "25 / 5" },
  "50/10": { work: 50 * 60, break: 10 * 60, label: "50 / 10" },
} as const;
type PomodoroMode = "off" | keyof typeof POMODORO_PRESETS | "custom";

const RING_SIZE = 200;
const RING_STROKE = 12;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function fmt(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function StudySessionForm({
  courses,
  todayMinutesSoFar,
  dailyGoalMin,
}: {
  courses: Course[];
  todayMinutesSoFar: number;
  dailyGoalMin: number;
}) {
  const [courseId, setCourseId] = useState("");
  const [notes, setNotes] = useState("");
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>("off");
  const [customWorkMin, setCustomWorkMin] = useState(45);
  const [customBreakMin, setCustomBreakMin] = useState(15);

  const [phase, setPhase] = useState<"idle" | "working" | "break">("idle");
  const [isRunning, setIsRunning] = useState(false);
  const [workElapsedSec, setWorkElapsedSec] = useState(0);
  const [breakElapsedSec, setBreakElapsedSec] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [isPending, startTransition] = useTransition();

  const notesRef = useRef<HTMLInputElement>(null);

  const isPomodoro = pomodoroMode !== "off";
  const preset = useMemo(
    () =>
      pomodoroMode === "custom"
        ? { work: customWorkMin * 60, break: customBreakMin * 60 }
        : pomodoroMode === "off"
          ? null
          : POMODORO_PRESETS[pomodoroMode],
    [pomodoroMode, customWorkMin, customBreakMin],
  );

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      if (phase === "working") {
        setWorkElapsedSec((s) => {
          const next = s + 1;
          if (preset && next >= preset.work) {
            setPhase("break");
            setBreakElapsedSec(0);
            toast.success("🍅 Pomodoro complete — break time.");
          }
          return next;
        });
      } else if (phase === "break") {
        setBreakElapsedSec((s) => {
          const next = s + 1;
          if (preset && next >= preset.break) {
            setPhase("working");
            toast("⏳ Break's over — back to it!");
          }
          return next;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, phase, preset]);

  const start = useCallback(() => {
    setPhase("working");
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setFocusMode(false);
    if (workElapsedSec < 60) {
      setPhase("idle");
      setWorkElapsedSec(0);
      setBreakElapsedSec(0);
      return;
    }
    const endedAt = new Date();
    const startedAt = new Date(endedAt.getTime() - workElapsedSec * 1000);
    startTransition(async () => {
      try {
        const result = await logStudySession(
          { courseId: courseId || undefined, startedAt: startedAt.toISOString(), endedAt: endedAt.toISOString(), notes: notes || undefined },
          isPomodoro,
        );
        toast.success(`Session saved — ${fmt(result.durationMin * 60)} of focus.`);
        if (result.unlockedAchievement) toast(`🏆 Achievement unlocked: ${result.unlockedAchievement.title}`);
        setNotes("");
      } catch {
        toast.error("Couldn't save that session.");
      }
    });
    setPhase("idle");
    setWorkElapsedSec(0);
    setBreakElapsedSec(0);
  }, [workElapsedSec, courseId, notes, isPomodoro]);

  const newSession = useCallback(() => {
    setPhase("idle");
    setIsRunning(false);
    setWorkElapsedSec(0);
    setBreakElapsedSec(0);
    notesRef.current?.focus();
  }, []);

  // Space = start/pause, S = stop, N = new session — ignored while typing.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.code === "Space") {
        e.preventDefault();
        if (phase === "idle") start();
        else if (isRunning) pause();
        else resume();
      } else if (e.key.toLowerCase() === "s" && phase !== "idle") {
        stop();
      } else if (e.key.toLowerCase() === "n" && phase === "idle") {
        newSession();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, isRunning, start, pause, resume, stop, newSession]);

  const selectedCourse = courses.find((c) => c.id === courseId);

  // Ring shows Pomodoro-interval progress while in a Pomodoro phase; otherwise
  // it tracks progress toward today's study goal so it's never just empty.
  let ringPct: number;
  let ringColor: string;
  if (isPomodoro && phase !== "idle") {
    const target = phase === "working" ? preset!.work : preset!.break;
    const current = phase === "working" ? workElapsedSec : breakElapsedSec;
    ringPct = Math.min(100, (current / target) * 100);
    ringColor = phase === "working" ? "var(--focus)" : "var(--vitality)";
  } else {
    const combinedMin = todayMinutesSoFar + workElapsedSec / 60;
    ringPct = dailyGoalMin > 0 ? Math.min(100, (combinedMin / dailyGoalMin) * 100) : 0;
    ringColor = "var(--focus)";
  }
  const ringOffset = RING_CIRCUMFERENCE * (1 - ringPct / 100);
  const displaySec = phase === "break" ? breakElapsedSec : workElapsedSec;

  return (
    <div className={cn(focusMode && "fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-paper")}>
      {!focusMode && (
        <div className="flex flex-wrap items-center gap-2">
          {courses.map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={phase !== "idle"}
              onClick={() => setCourseId(c.id === courseId ? "" : c.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all disabled:opacity-50",
                courseId === c.id ? "border-transparent text-white shadow-soft" : "border-line hover:bg-ink/5",
              )}
              style={courseId === c.id ? { backgroundColor: c.color } : undefined}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
              {c.name}
            </button>
          ))}
          <a
            href="#courses-section"
            className="flex items-center gap-1 rounded-full border border-dashed border-line px-3 py-1.5 text-sm text-muted transition-colors hover:bg-ink/5"
          >
            <Plus className="h-3.5 w-3.5" /> New Course
          </a>
        </div>
      )}

      {!focusMode && (
        <div>
          <Label>Pomodoro</Label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {(["off", "25/5", "50/10", "custom"] as PomodoroMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                disabled={phase !== "idle"}
                onClick={() => setPomodoroMode(mode)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
                  pomodoroMode === mode ? "border-focus bg-focus/10 text-focus" : "border-line text-muted hover:bg-ink/5",
                )}
              >
                {mode === "off" ? "Off" : mode === "custom" ? "Custom" : POMODORO_PRESETS[mode].label}
              </button>
            ))}
            {pomodoroMode === "custom" && (
              <div className="flex items-center gap-2 text-sm">
                <Input
                  type="number"
                  value={customWorkMin}
                  disabled={phase !== "idle"}
                  onChange={(e) => setCustomWorkMin(Number(e.target.value) || 1)}
                  className="h-9 w-16"
                />
                <span className="text-muted">work /</span>
                <Input
                  type="number"
                  value={customBreakMin}
                  disabled={phase !== "idle"}
                  onChange={(e) => setCustomBreakMin(Number(e.target.value) || 1)}
                  className="h-9 w-16"
                />
                <span className="text-muted">break (min)</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-4 py-2">
        {focusMode && selectedCourse && <p className="text-sm text-muted">{selectedCourse.name}</p>}
        {phase === "break" && <p className="text-sm font-medium text-vitality">☕ Break</p>}

        <div className="relative inline-flex items-center justify-center">
          <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
            <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS} fill="none" stroke="var(--line)" strokeWidth={RING_STROKE} />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
              style={{ transition: "stroke-dashoffset 0.5s linear" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-mono text-4xl tabular-nums">{fmt(displaySec)}</span>
            {!isPomodoro && phase === "idle" && <span className="mt-1 text-xs text-muted">today&apos;s goal</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {phase === "idle" ? (
            <Button size="lg" onClick={start}>
              <Play className="h-4 w-4" /> Start
            </Button>
          ) : (
            <>
              {isRunning ? (
                <Button size="lg" variant="outline" onClick={pause}>
                  <Pause className="h-4 w-4" /> Pause
                </Button>
              ) : (
                <Button size="lg" onClick={resume}>
                  <Play className="h-4 w-4" /> Resume
                </Button>
              )}
              <Button size="lg" variant="destructive" onClick={stop} disabled={isPending}>
                <Square className="h-4 w-4" /> Stop
              </Button>
            </>
          )}
          {phase !== "idle" && (
            <Button size="icon" variant="ghost" onClick={() => setFocusMode((v) => !v)} title="Focus mode">
              {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}
        </div>
        {!focusMode && <p className="text-xs text-muted">Space: start/pause · S: stop · N: new session</p>}
      </div>

      {!focusMode && (
        <div className="w-full max-w-sm">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Input
            id="notes"
            ref={notesRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1.5"
            placeholder="What did you work on?"
          />
        </div>
      )}
    </div>
  );
}
