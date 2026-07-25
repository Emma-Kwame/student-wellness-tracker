import { CalendarDays } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function CalendarStrip({ dueDates }: { dueDates: Date[] }) {
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - 3 + i);
    return d;
  });

  const dueDaySet = new Set(dueDates.map((d) => new Date(d).toDateString()));

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>This week</CardTitle>
        <CalendarDays className="h-4 w-4 text-muted" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const isToday = day.toDateString() === today.toDateString();
            const hasDue = dueDaySet.has(day.toDateString());
            return (
              <div key={day.toISOString()} className="flex flex-col items-center gap-1">
                <span className="text-[10px] uppercase text-muted">
                  {day.toLocaleDateString("en-US", { weekday: "narrow" })}
                </span>
                <div
                  className={
                    isToday
                      ? "flex h-8 w-8 items-center justify-center rounded-full bg-focus text-sm text-focus-foreground"
                      : "flex h-8 w-8 items-center justify-center rounded-full text-sm"
                  }
                >
                  {day.getDate()}
                </div>
                <span className={`h-1 w-1 rounded-full ${hasDue ? "bg-dawn" : "bg-transparent"}`} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
