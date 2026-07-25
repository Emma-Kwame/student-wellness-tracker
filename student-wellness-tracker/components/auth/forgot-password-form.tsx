"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordInput) {
    setIsSubmitting(true);
    const { error } = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: "/reset-password",
    });
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message ?? "Something went wrong. Try again.");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <p className="text-center text-sm text-muted">
        If an account exists for that email, a reset link is on its way. Check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          invalid={!!errors.email}
          {...register("email")}
          className="mt-1.5"
        />
        <FieldError>{errors.email?.message}</FieldError>
      </div>

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Send reset link
      </Button>
    </form>
  );
}
