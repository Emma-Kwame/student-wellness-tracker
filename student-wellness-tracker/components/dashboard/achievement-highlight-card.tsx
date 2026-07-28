"use client";

import { useState } from "react";
import { Trophy, Flame, Droplets, Moon, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = { flame: Flame, droplets: Droplets, moon: Moon, trophy: Trophy };

type Achievement = { id: string; key: string; title: string; description: string; icon: string };

export function AchievementHighlightCard({
  achievements,
  unlockedIds,
}: {
  achievements: Achievement[];
  unlockedIds: Set<string>;
}) {
  const [expanded, setExpanded] = useState(false);
  const unlocked = achievements.filter((a) => unlockedIds.has(a.id));
  const featured = unlocked[unlocked.length - 1];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Academic Achievement</CardTitle>
        <Trophy className="h-4 w-4 text-dawn" />
      </CardHeader>
      <CardContent>
        {featured ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dawn/10 text-dawn">
              {(() => {
                const Icon = ICONS[featured.icon] ?? Trophy;
                return <Icon className="h-7 w-7" />;
              })()}
            </div>
            <div>
              <p className="font-display text-base">{featured.title}</p>
              <p className="mt-1 text-sm text-muted">{featured.description}</p>
            </div>
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted">No badges unlocked yet — keep logging to earn your first.</p>
        )}

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 w-full rounded-lg border border-line px-4 py-2 text-sm font-medium transition-colors hover:bg-ink/5"
        >
          {expanded ? "Hide medals" : "View all medals"}
        </button>

        {expanded && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {achievements.map((achievement) => {
              const Icon = ICONS[achievement.icon] ?? Trophy;
              const isUnlocked = unlockedIds.has(achievement.id);
              return (
                <div
                  key={achievement.id}
                  title={achievement.title}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border border-line p-3 text-center",
                    isUnlocked ? "bg-dawn/5" : "opacity-40 grayscale",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full",
                      isUnlocked ? "bg-dawn/15 text-dawn" : "bg-ink/5 text-muted",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-xs leading-tight">{achievement.title}</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
