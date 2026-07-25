"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(values: ResetPasswordInput) {
    if (!token) {
      toast.error("This reset link is invalid or has expired.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message ?? "Couldn't reset your password. Request a new link.");
      return;
    }

    toast.success("Password updated. Log in with your new password.");
    router.push("/login");
  }

  if (!token) {
    return (
      <p className="text-center text-sm text-muted">
        This reset link is invalid or has expired.{" "}
        <a href="/forgot-password" className="text-focus hover:underline">
          Request a new one
        </a>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          invalid={!!errors.password}
          {...register("password")}
          className="mt-1.5"
        />
        <FieldError>{errors.password?.message}</FieldError>
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          invalid={!!errors.confirmPassword}
          {...register("confirmPassword")}
          className="mt-1.5"
        />
        <FieldError>{errors.confirmPassword?.message}</FieldError>
      </div>

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Reset password
      </Button>
    </form>
  );
}
