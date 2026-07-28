"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutGrid,
  Smile,
  Moon,
  Droplets,
  Dumbbell,
  BookOpen,
  CalendarCheck,
  ListChecks,
  Target,
  NotebookPen,
  BarChart3,
  Plus,
  CircleHelp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/dashboard/mood", label: "Mood", icon: Smile },
  { href: "/dashboard/sleep", label: "Sleep", icon: Moon },
  { href: "/dashboard/water", label: "Hydration", icon: Droplets },
  { href: "/dashboard/exercise", label: "Exercise", icon: Dumbbell },
  { href: "/dashboard/study", label: "Study", icon: BookOpen },
  { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListChecks },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/journal", label: "Journal", icon: NotebookPen },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

const QUICK_LOG_LINKS = [
  { href: "/dashboard/mood", label: "Log mood" },
  { href: "/dashboard/sleep", label: "Log sleep" },
  { href: "/dashboard/water", label: "Log water" },
  { href: "/dashboard/exercise", label: "Log exercise" },
  { href: "/dashboard/study", label: "Log study session" },
  { href: "/dashboard/journal", label: "Write journal entry" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [quickLogOpen, setQuickLogOpen] = useState(false);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-card lg:flex">
      <div className="flex h-16 items-center border-b border-line px-5">
        <Link href="/dashboard">
          <Image src="/logo.png" alt="Student Wellness Tracker" width={904} height={240} className="h-8 w-auto" priority />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                isActive ? "bg-focus/10 font-medium text-focus" : "text-muted hover:bg-ink/5 hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-line p-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setQuickLogOpen((v) => !v)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-focus px-4 py-2.5 text-sm font-medium text-focus-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Log daily entry
          </button>
          {quickLogOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setQuickLogOpen(false)} />
              <div className="absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden rounded-xl border border-line bg-card shadow-glass">
                {QUICK_LOG_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setQuickLogOpen(false)}
                    className="block px-4 py-2.5 text-sm transition-colors hover:bg-ink/5"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="flex items-center gap-2 text-sm text-muted">
            <CircleHelp className="h-4 w-4" />
            Help
          </span>
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
