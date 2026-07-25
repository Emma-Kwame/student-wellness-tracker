import { Flame, Droplets, Moon, Trophy, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = { flame: Flame, droplets: Droplets, moon: Moon, trophy: Trophy };

type Achievement = { id: string; key: string; title: string; icon: string };

export function BadgesWidget({
  achievements,
  unlockedIds,
}: {
  achievements: Achievement[];
  unlockedIds: Set<string>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {achievements.map((achievement) => {
            const Icon = ICONS[achievement.icon] ?? Trophy;
            const unlocked = unlockedIds.has(achievement.id);
            return (
              <div
                key={achievement.id}
                title={achievement.title}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border border-line p-3 text-center",
                  unlocked ? "bg-dawn/5" : "opacity-40 grayscale",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    unlocked ? "bg-dawn/15 text-dawn" : "bg-ink/5 text-muted",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-xs leading-tight">{achievement.title}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
