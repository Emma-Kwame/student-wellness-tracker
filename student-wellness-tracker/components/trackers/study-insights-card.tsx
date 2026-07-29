import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { computeStudyInsights } from "@/lib/wellness";
import { formatMinutes } from "@/lib/utils";

type Entry = { startedAt: Date; durationMin: number | null };

export function StudyInsightsCard({ sessions }: { sessions: Entry[] }) {
  const insights = computeStudyInsights(sessions);

  if (!insights) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4 text-sm text-muted">
          📊 Log a few more sessions and this card will show when you study best, your average focus time, and your longest session.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Insight</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted">You study best during</p>
          <p className="font-medium">{insights.bestWindowLabel}</p>
        </div>
        <div className="flex gap-8">
          <div>
            <p className="text-xs text-muted">Average focus time</p>
            <p className="font-medium">{formatMinutes(insights.avgMinutes)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Longest session</p>
            <p className="font-medium">{formatMinutes(insights.longestMinutes)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
