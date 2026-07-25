import { Flame, Droplets, Moon, Trophy } from "lucide-react";

const BADGES = [
  { icon: Flame, label: "7-Day Study Streak", color: "text-dawn" },
  { icon: Droplets, label: "Hydration Master", color: "text-vitality" },
  { icon: Moon, label: "Sleep Champion", color: "text-focus" },
  { icon: Trophy, label: "Productivity Pro", color: "text-dawn" },
];

export function GamificationStrip() {
  return (
    <section id="gamification" className="container pb-24">
      <div className="glass-strong rounded-3xl px-6 py-12 sm:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            XP, levels, streaks
          </p>
          <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
            Consistency, not perfection.
          </h2>
          <p className="mt-4 text-muted">
            Every logged habit earns XP. Badges unlock for the patterns that actually matter —
            not for opening the app.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {BADGES.map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-card p-6 text-center"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink/5 ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
