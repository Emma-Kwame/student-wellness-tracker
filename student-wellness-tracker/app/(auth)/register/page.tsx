import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create your account" };

export default function RegisterPage() {
  return (
    <Card className="glass-strong">
      <CardHeader className="text-center">
        <CardTitle>Start tracking</CardTitle>
        <CardDescription>Free — takes about a minute.</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-focus hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
