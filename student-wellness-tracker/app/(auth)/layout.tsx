import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Link href="/" className="mb-8 font-display text-xl tracking-tight">
        wellness<span className="text-focus">.</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
