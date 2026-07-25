import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <p className="font-display text-sm">
          wellness<span className="text-focus">.</span>
        </p>
        <p className="text-xs text-muted">
          Built for students, one habit at a time. Not affiliated with any university.
        </p>
        <div className="flex gap-5 text-xs text-muted">
          <Link href="/login" className="hover:text-ink">
            Log in
          </Link>
          <Link href="/register" className="hover:text-ink">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
