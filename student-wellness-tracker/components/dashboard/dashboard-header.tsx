import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

type HeaderUser = {
  name: string;
  email: string;
  image?: string | null;
};

export function DashboardHeader({ user }: { user: HeaderUser }) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="border-b border-line bg-card/70 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <p className="font-display text-lg tracking-tight">
          wellness<span className="text-focus">.</span>
        </p>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-3">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-focus/10 text-xs font-medium text-focus">
                {initials}
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="mt-0.5 text-xs text-muted">{user.email}</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
