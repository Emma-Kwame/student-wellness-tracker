import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Static placeholder copy — wiring this to real generated insights needs
// ANTHROPIC_API_KEY configured (see .env.example); that's a separate step.
export function AiInsightCard({ firstName }: { firstName: string }) {
  return (
    <Card className="border-none bg-focus text-focus-foreground">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-focus-foreground/70">
          <Sparkles className="h-3.5 w-3.5" />
          AI Insight
        </div>
        <p className="mt-3 font-display text-lg">Keep it up, {firstName}!</p>
        <p className="mt-2 text-sm leading-relaxed text-focus-foreground/85">
          Once your Anthropic API key is configured, this card will read your week and surface one
          thing worth noticing — a pattern in your study times, sleep, or mood — instead of a
          summary of everything.
        </p>
        <Link
          href="/dashboard/goals"
          className="mt-4 inline-flex rounded-lg bg-focus-foreground/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-focus-foreground/25"
        >
          Personalize schedule
        </Link>
      </CardContent>
    </Card>
  );
}
