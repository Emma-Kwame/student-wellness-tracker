"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function WaterWeeklyChart({ data, goalL }: { data: { date: string; liters: number }[]; goalL: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Intake</CardTitle>
        <CardDescription>Liters per day · dashed line is your {goalL.toFixed(1)}L goal</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <ReferenceLine y={goalL} stroke="var(--dawn)" strokeDasharray="4 4" />
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
                formatter={(value: number) => [`${value.toFixed(1)} L`, "Water"]}
              />
              <Bar dataKey="liters" fill="var(--focus)" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
