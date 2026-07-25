import {
  Smile,
  BookOpen,
  Moon,
  Droplets,
  Dumbbell,
  CalendarCheck,
  NotebookPen,
  ListChecks,
  Target,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const TRACKERS = [
  {
    icon: Smile,
    accent: "text-focus",
    title: "Mood",
    description: "Log how you're feeling in one tap and watch patterns emerge across weeks.",
  },
  {
    icon: BookOpen,
    accent: "text-focus",
    title: "Study",
    description: "Pomodoro timer, manual entries, and per-course hours that roll up automatically.",
  },
  {
    icon: Moon,
    accent: "text-focus",
    title: "Sleep",
    description: "Bedtime, wake time, and quality — the single biggest lever most students ignore.",
  },
  {
    icon: Droplets,
    accent: "text-vitality",
    title: "Hydration",
    description: "One-tap glasses toward a daily goal, with a progress ring that never nags.",
  },
  {
    icon: Dumbbell,
    accent: "text-vitality",
    title: "Exercise",
    description: "Walking, gym, football, cycling, yoga — duration, intensity, and rough calories.",
  },
  {
    icon: CalendarCheck,
    accent: "text-dawn",
    title: "Attendance",
    description: "Per-course attendance percentage, with an early warning before it becomes a problem.",
  },
  {
    icon: NotebookPen,
    accent: "text-dawn",
    title: "Journal",
    description: "A private, searchable place for daily reflection — separate from the data.",
  },
  {
    icon: ListChecks,
    accent: "text-dawn",
    title: "Tasks",
    description: "Due dates, priority, and category, without turning your life into a Gantt chart.",
  },
  {
    icon: Target,
    accent: "text-focus",
    title: "Goals",
    description: "Study 3 hours a day. Sleep 8. Drink 8 glasses. Set it once, see it every day.",
  },
];

export function Features() {
  return (
    <section id="features" className="container py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Trackers</p>
        <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
          Nine habits. One picture.
        </h2>
        <p className="mt-4 text-muted">
          Each tracker takes seconds on its own. Together, they explain your semester.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TRACKERS.map(({ icon: Icon, accent, title, description }) => (
          <Card key={title} className="transition-shadow hover:shadow-glass">
            <CardHeader>
              <div className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink/5 ${accent}`}>
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
