import type { Metadata } from "next";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Reset your password" };

export default function ResetPasswordPage() {
  return (
    <Card className="glass-strong">
      <CardHeader className="text-center">
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>Make it something you haven&apos;t used here before.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
