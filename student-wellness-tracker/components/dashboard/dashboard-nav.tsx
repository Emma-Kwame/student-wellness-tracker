"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Smile,
  BookOpen,
  Moon,
  Droplets,
  Dumbbell,
  CalendarCheck,
  ListChecks,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/mood", label: "Mood", icon: Smile },
  { href: "/dashboard/study", label: "Study", icon: BookOpen },
  { href: "/dashboard/sleep", label: "Sleep", icon: Moon },
  { href: "/dashboard/water", label: "Water", icon: Droplets },
  { href: "/dashboard/exercise", label: "Exercise", icon: Dumbbell },
  { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListChecks },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-line">
      <div className="container flex gap-1 overflow-x-auto py-2">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors",
                isActive ? "bg-focus text-focus-foreground" : "text-muted hover:bg-ink/5 hover:text-ink",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
