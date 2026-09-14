import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-active disabled:pointer-events-none disabled:bg-secondary disabled:text-primary-light dark:disabled:bg-muted dark:disabled:text-muted-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive-active disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground",
        // 위험 동작 보조 버튼 — 테두리는 글자색(text-destructive)을 따라감
        "outline-destructive":
          "border border-current bg-transparent text-destructive hover:bg-destructive/10 disabled:pointer-events-none disabled:border-border disabled:text-muted-foreground",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted hover:border-primary hover:text-primary active:bg-secondary active:border-primary-active active:text-primary-active disabled:pointer-events-none disabled:bg-transparent disabled:border-border disabled:text-muted-foreground",
        // 브랜드 테두리 버튼 — 흰(카드) 배경 위 보조 CTA. hover는 secondary 틴트 + 전용 글자색(대비 5.49:1 · 다크 8.65:1)
        "outline-primary":
          "border border-primary bg-transparent text-primary hover:bg-secondary hover:text-secondary-foreground active:bg-secondary active:border-primary-active active:text-secondary-foreground disabled:pointer-events-none disabled:bg-transparent disabled:border-border disabled:text-muted-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "bg-transparent text-foreground hover:bg-muted hover:text-primary active:bg-secondary active:text-primary-active disabled:pointer-events-none disabled:bg-transparent disabled:text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 label-base",
        sm: "h-9 px-3 label-sm",
        lg: "h-11 px-8 label-lg",
        icon: "h-10 w-10 label-base",
      },
      rounded: {
        default: "",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
