"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { taskSchema, type TaskInput } from "@/lib/validations/trackers";
import { createTask } from "@/app/actions/tasks";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const CATEGORIES = ["ACADEMIC", "PERSONAL", "HEALTH", "SOCIAL", "OTHER"] as const;

export function TaskForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskInput>({ resolver: zodResolver(taskSchema), defaultValues: { priority: "MEDIUM", category: "ACADEMIC" } });

  async function onSubmit(values: TaskInput) {
    try {
      await createTask(values);
      reset({ title: "", description: "", dueDate: "", priority: "MEDIUM", category: "ACADEMIC" });
      toast.success("Task added.");
    } catch {
      toast.error("Couldn't add that task.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" invalid={!!errors.title} {...register("title")} className="mt-1.5" placeholder="Finish problem set 4" />
        <FieldError>{errors.title?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Input id="description" {...register("description")} className="mt-1.5" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="dueDate">Due date</Label>
          <Input id="dueDate" type="date" {...register("dueDate")} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <select id="priority" {...register("priority")} className="mt-1.5 h-10 w-full rounded-md border border-line bg-card px-3 text-sm">
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <select id="category" {...register("category")} className="mt-1.5 h-10 w-full rounded-md border border-line bg-card px-3 text-sm">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0) + c.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Button type="submit" isLoading={isSubmitting}>
        Add task
      </Button>
    </form>
  );
}
