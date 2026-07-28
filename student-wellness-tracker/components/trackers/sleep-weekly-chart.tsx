"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceArea } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { IDEAL_SLEEP_HOURS } from "@/lib/wellness";

export function SleepWeeklyChart({ data }: { data: { date: string; hours: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>This week</CardTitle>
        <CardDescription>Hours slept per day · shaded band is the 7–9h recommended range</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <ReferenceArea y1={IDEAL_SLEEP_HOURS.min} y2={IDEAL_SLEEP_HOURS.max} fill="var(--vitality)" fillOpacity={0.08} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
              <YAxis hide domain={[0, "auto"]} />
              <Tooltip
                cursor={{ fill: "var(--line)" }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number) => [`${value}h`, "Sleep"]}
              />
              <Bar dataKey="hours" fill="var(--focus)" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
