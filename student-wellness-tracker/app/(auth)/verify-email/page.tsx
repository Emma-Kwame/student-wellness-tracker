import type { Metadata } from "next";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = { title: "Verify your email" };

export default function VerifyEmailPage() {
  return (
    <Card className="glass-strong text-center">
      <CardHeader className="items-center">
        <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-focus/10 text-focus">
          <MailCheck className="h-6 w-6" />
        </div>
        <CardTitle>Check your inbox</CardTitle>
        <CardDescription>
          We sent a verification link to your email. Click it to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted">
          Wrong address, or the email hasn&apos;t shown up?{" "}
          <Link href="/register" className="text-focus hover:underline">
            Try again
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
