import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <Card className="glass-strong">
      <CardHeader className="text-center">
        <CardTitle>Forgot your password?</CardTitle>
        <CardDescription>We&apos;ll email you a link to reset it.</CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/login" className="text-focus hover:underline">
            Back to log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
