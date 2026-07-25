import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border bg-card px-3 py-2 text-sm text-ink transition-colors placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50",
          invalid ? "border-danger" : "border-line",
          className,
        )}
        ref={ref}
        aria-invalid={invalid}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
