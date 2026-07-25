import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Middleware already blocks unauthenticated requests by cookie presence;
  // this is the real check, since the middleware's is intentionally cheap.
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-paper">
      <DashboardHeader user={session.user} />
      <DashboardNav />
      <main className="container py-8">{children}</main>
    </div>
  );
}
