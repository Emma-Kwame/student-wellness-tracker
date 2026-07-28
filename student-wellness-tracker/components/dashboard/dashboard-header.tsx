import { Search, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

type HeaderUser = {
  name: string;
  email: string;
  image?: string | null;
};

export function DashboardHeader({ user, major }: { user: HeaderUser; major?: string | null }) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-16 items-center gap-4 border-b border-line bg-card/70 px-6 backdrop-blur-md">
      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Search insights, tasks, or mood logs..."
          className="w-full rounded-full border border-line bg-paper py-2 pl-9 pr-3 text-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-ink/5"
        >
          <Bell className="h-4 w-4" />
        </button>
        <ThemeToggle />
        <div className="flex items-center gap-3">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-focus/10 text-xs font-medium text-focus">
              {initials}
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            {major && <p className="mt-0.5 text-xs text-muted">{major}</p>}
          </div>
        </div>
      </div>
    </header>
  );
}
