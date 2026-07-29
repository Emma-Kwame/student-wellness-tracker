"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function AttendanceTrendChart({ data }: { data: { course: string; present: number; absent: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Present vs. Absent</CardTitle>
        <CardDescription>Per course, across all recorded dates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <XAxis dataKey="course" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
              <YAxis hide domain={[0, "auto"]} />
              <Tooltip
                cursor={{ fill: "var(--line)" }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="present" name="Present" fill="var(--vitality)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="absent" name="Absent" fill="var(--danger)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
