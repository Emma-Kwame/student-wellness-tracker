import { Quote, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function QuoteCard({ quote }: { quote: string }) {
  return (
    <Card className="glass-strong">
      <CardContent className="flex items-start gap-3 p-5">
        <Quote className="mt-0.5 h-4 w-4 shrink-0 text-focus" />
        <p className="font-display text-base italic leading-snug">{quote}</p>
      </CardContent>
    </Card>
  );
}

export function AiInsightCard() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex items-start gap-3 p-5">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-focus" />
        <div>
          <p className="text-sm font-medium">Your AI insight will appear here</p>
          <p className="mt-0.5 text-xs text-muted">
            Once Phase 4 wires up the assistant, this card will read your week and surface one
            thing worth noticing — not a summary of everything, just the one thing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
