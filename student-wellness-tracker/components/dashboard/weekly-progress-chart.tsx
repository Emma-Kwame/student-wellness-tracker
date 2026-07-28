"use client";

import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { WeeklyPoint } from "@/lib/dashboard-data";
import { cn, formatMinutes } from "@/lib/utils";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "study", label: "Study" },
  { key: "sleep", label: "Sleep" },
  { key: "mood", label: "Mood" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const TAB_CONFIG: Record<TabKey, { unit: string; format: (v: number) => string; domain: [number, number | "auto"] }> = {
  overview: { unit: "wellness score", format: (v) => `${v}`, domain: [0, 100] },
  study: { unit: "study time", format: (v) => formatMinutes(v), domain: [0, "auto"] },
  sleep: { unit: "hours slept", format: (v) => `${v}h`, domain: [0, 12] },
  mood: { unit: "avg mood (1–5)", format: (v) => v.toFixed(1), domain: [1, 5] },
};

export function WeeklyProgressChart({ data }: { data: WeeklyPoint[] }) {
  const [tab, setTab] = useState<TabKey>("overview");
  const config = TAB_CONFIG[tab];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Your Weekly Progress</CardTitle>
        <div className="flex gap-1 rounded-full bg-ink/5 p-1">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                tab === key ? "bg-card text-ink shadow-soft" : "text-muted hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="weeklyProgressFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--focus)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--focus)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
              <YAxis hide domain={config.domain} />
              <Tooltip
                cursor={{ stroke: "var(--line)" }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number) => [value === null ? "No log" : config.format(value), config.unit]}
              />
              <Area
                type="monotone"
                dataKey={tab}
                stroke="var(--focus)"
                strokeWidth={2.5}
                fill="url(#weeklyProgressFill)"
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
