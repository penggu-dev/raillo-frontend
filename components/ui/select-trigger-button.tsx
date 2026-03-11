import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectTriggerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  value?: string;
  label?: string;
}

const SelectTriggerButton = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerButtonProps
>(({ className, icon, value, label, id, ...props }, ref) => {
  const generatedId = React.useId();
  const buttonId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={buttonId} className="label-sm text-primary-foreground">
          {label}
        </label>
      )}
      <button
        id={buttonId}
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-md border bg-background px-3 py-2",
          "body-sm text-foreground text-left outline-none transition-colors",
          "border-border",
          "hover:bg-muted hover:border-primary",
          "active:bg-secondary active:border-primary-active",
          "disabled:pointer-events-none disabled:bg-transparent disabled:border-border disabled:text-muted-foreground",
          className,
        )}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span
          className={cn("flex-1 truncate", !value && "text-muted-foreground")}
        >
          {value}
        </span>
      </button>
    </div>
  );
});
SelectTriggerButton.displayName = "SelectTriggerButton";

export { SelectTriggerButton };
