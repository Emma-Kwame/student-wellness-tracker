import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatTile({
  icon: Icon,
  label,
  value,
  sublabel,
  href,
  accent = "text-focus",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel?: string;
  href?: string;
  accent?: string;
}) {
  const content = (
    <Card className={cn("h-full", href && "transition-shadow hover:shadow-glass")}>
      <CardContent className="p-5">
        <div className={cn("mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-ink/5", accent)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-0.5 font-display text-2xl leading-tight">{value}</p>
        {sublabel && <p className="mt-0.5 text-xs text-muted">{sublabel}</p>}
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
