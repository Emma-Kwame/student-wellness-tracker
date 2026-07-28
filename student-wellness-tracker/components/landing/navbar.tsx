import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="container mt-4">
        <nav className="glass flex items-center justify-between rounded-2xl px-4 py-3">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Student Wellness Tracker" width={904} height={240} className="h-9 w-auto" priority />
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#rhythm" className="text-sm text-muted transition-colors hover:text-ink">
              How it works
            </Link>
            <Link href="#features" className="text-sm text-muted transition-colors hover:text-ink">
              Trackers
            </Link>
            <Link href="#gamification" className="text-sm text-muted transition-colors hover:text-ink">
              Streaks &amp; badges
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost", size: "sm", className: "hidden sm:inline-flex" })}
            >
              Log in
            </Link>
            <Link href="/register" className={buttonVariants({ size: "sm" })}>
              Get started
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
