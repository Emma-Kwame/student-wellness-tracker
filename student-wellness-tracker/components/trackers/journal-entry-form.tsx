"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { journalEntrySchema, type JournalEntryInput } from "@/lib/validations/trackers";
import { createJournalEntry } from "@/app/actions/journal";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function JournalEntryForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JournalEntryInput>({ resolver: zodResolver(journalEntrySchema) });

  async function onSubmit(values: JournalEntryInput) {
    try {
      await createJournalEntry(values);
      reset({ title: "", content: "" });
      toast.success("Entry saved.");
    } catch {
      toast.error("Couldn't save that entry.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="title">Title (optional)</Label>
        <Input id="title" {...register("title")} className="mt-1.5" placeholder="How today went" />
      </div>
      <div>
        <Label htmlFor="content">What&apos;s on your mind?</Label>
        <textarea
          id="content"
          rows={5}
          {...register("content")}
          placeholder="How are you feeling right now?"
          className="mt-1.5 w-full rounded-md border border-line bg-card px-3 py-2 text-sm placeholder:text-muted"
        />
        <FieldError>{errors.content?.message}</FieldError>
      </div>
      <Button type="submit" isLoading={isSubmitting}>
        Save entry
      </Button>
    </form>
  );
}
