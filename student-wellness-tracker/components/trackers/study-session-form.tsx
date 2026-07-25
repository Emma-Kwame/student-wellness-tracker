"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Play, Square } from "lucide-react";
import { logStudySession } from "@/app/actions/study";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const POMODORO_SECONDS = 25 * 60;

type Course = { id: string; name: string; color: string };

function CourseSelect({ courses, value, onChange }: { courses: Course[]; value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-md border border-line bg-card px-3 text-sm"
    >
      <option value="">No course</option>
      {courses.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

export function StudySessionForm({ courses }: { courses: Course[] }) {
  const [courseId, setCourseId] = useState("");
  const [notes, setNotes] = useState("");
  const [isPomodoro, setIsPomodoro] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isPending, startTransition] = useTransition();
  const startedAtRef = useRef<Date | null>(null);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setElapsedSec((s) => {
        const next = s + 1;
        if (isPomodoro && next >= POMODORO_SECONDS) {
          stop();
          toast.success("Pomodoro complete — nice focus block.");
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isPomodoro]);

  function start() {
    startedAtRef.current = new Date();
    setElapsedSec(0);
    setIsRunning(true);
  }

  function stop() {
    setIsRunning(false);
    const startedAt = startedAtRef.current;
    if (!startedAt) return;
    const endedAt = new Date();
    startTransition(async () => {
      try {
        await logStudySession(
          { courseId: courseId || undefined, startedAt: startedAt.toISOString(), endedAt: endedAt.toISOString(), notes: notes || undefined },
          isPomodoro,
        );
        toast.success("Session saved.");
        setNotes("");
      } catch {
        toast.error("Couldn't save that session.");
      }
    });
  }

  const remaining = isPomodoro ? Math.max(0, POMODORO_SECONDS - elapsedSec) : elapsedSec;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <CourseSelect courses={courses} value={courseId} onChange={setCourseId} />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={isPomodoro} disabled={isRunning} onChange={(e) => setIsPomodoro(e.target.checked)} />
          Pomodoro (25 min)
        </label>
      </div>

      <div className="flex items-center gap-6">
        <span className="font-mono text-4xl tabular-nums">
          {mm}:{ss}
        </span>
        {isRunning ? (
          <Button variant="destructive" onClick={stop} disabled={isPending}>
            <Square className="h-4 w-4" /> Stop
          </Button>
        ) : (
          <Button onClick={start}>
            <Play className="h-4 w-4" /> Start session
          </Button>
        )}
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1.5" placeholder="What did you work on?" />
      </div>
    </div>
  );
}
