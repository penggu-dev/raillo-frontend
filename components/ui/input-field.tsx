import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputFieldProps extends React.ComponentProps<"input"> {
  label?: string;
  helperText?: string;
  error?: boolean;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className, label, helperText, error, disabled, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "label-sm text-foreground",
              error && "text-destructive",
            )}
          >
            {label}
          </label>
        )}

        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={cn(
            // base
            "flex h-10 w-full rounded-md border bg-background px-3 py-2",
            "body-sm text-foreground placeholder:text-muted-foreground",
            "outline-none transition-colors",
            // default
            "border-border",
            // focus
            "focus:border-primary-light",
            // error
            error && "border-destructive focus:border-destructive",
            // disabled
            "disabled:bg-muted disabled:border-border disabled:text-muted-foreground disabled:placeholder:text-muted-foreground disabled:cursor-not-allowed",
            className,
          )}
          {...props}
        />

        {helperText && (
          <p
            className={cn(
              "caption-base text-muted-foreground",
              error && "text-destructive",
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
InputField.displayName = "InputField";

export { InputField };
