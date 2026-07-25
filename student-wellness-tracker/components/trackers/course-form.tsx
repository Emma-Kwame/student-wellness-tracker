"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { courseSchema, type CourseInput } from "@/lib/validations/trackers";
import { createCourse } from "@/app/actions/attendance";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const SWATCHES = ["#4B4FE0", "#46B88B", "#F2A93B", "#E4574C", "#9D6BFF", "#2FA5C9"];

export function CourseForm() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseInput>({ resolver: zodResolver(courseSchema), defaultValues: { color: SWATCHES[0] } });

  const color = watch("color");

  async function onSubmit(values: CourseInput) {
    try {
      await createCourse(values);
      reset({ name: "", code: "", color: SWATCHES[0] });
      toast.success("Course added.");
    } catch {
      toast.error("Couldn't add that course.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3" noValidate>
      <div>
        <Label htmlFor="course-name">Course name</Label>
        <Input id="course-name" invalid={!!errors.name} {...register("name")} className="mt-1.5 w-48" placeholder="Organic Chemistry" />
        <FieldError>{errors.name?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="course-code">Code (optional)</Label>
        <Input id="course-code" {...register("code")} className="mt-1.5 w-28" placeholder="CHEM 201" />
      </div>
      <div className="flex gap-1.5 pb-2.5">
        {SWATCHES.map((swatch) => (
          <button
            key={swatch}
            type="button"
            aria-label={`Color ${swatch}`}
            onClick={() => setValue("color", swatch)}
            className="h-6 w-6 rounded-full ring-offset-2 ring-offset-paper"
            style={{ backgroundColor: swatch, outline: color === swatch ? `2px solid ${swatch}` : "none", outlineOffset: 2 }}
          />
        ))}
      </div>
      <Button type="submit" size="sm" isLoading={isSubmitting}>
        Add course
      </Button>
    </form>
  );
}
