"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setIsSubmitting(true);
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe,
    });
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message ?? "Couldn't log you in. Check your email and password.");
      return;
    }

    router.push(searchParams.get("redirectTo") ?? "/dashboard");
    router.refresh();
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

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="/forgot-password" className="text-xs text-focus hover:underline">
            Forgot password?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          invalid={!!errors.password}
          {...register("password")}
          className="mt-1.5"
        />
        <FieldError>{errors.password?.message}</FieldError>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" className="h-4 w-4 rounded border-line" {...register("rememberMe")} />
        Remember me
      </label>

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Log in
      </Button>
    </form>
  );
}
