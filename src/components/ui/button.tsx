import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-slate-800",
        secondary:
          "bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50 shadow-sm",
        outline: "border-2 border-slate-300 bg-white hover:bg-slate-50",
        ghost: "hover:bg-white/60",
        selected:
          "bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2 border-2 border-slate-900",
      },
      size: {
        default: "min-h-12 px-4 py-2 text-base",
        sm: "min-h-10 rounded-lg px-3 text-sm",
        lg: "min-h-14 rounded-xl px-6 text-lg",
        full: "w-full min-h-14 px-4 py-3 text-base",
        answer:
          "w-full min-h-[4.75rem] h-auto px-5 py-4 text-xl font-semibold leading-snug whitespace-normal text-left justify-start",
        nav: "min-h-14 flex-1 px-4 py-3 text-lg font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";
