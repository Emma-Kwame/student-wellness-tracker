import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Middleware already blocks unauthenticated requests by cookie presence;
  // this is the real check, since the middleware's is intentionally cheap.
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { major: true },
  });

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader user={session.user} major={profile?.major} />
        <main className="flex-1 p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
