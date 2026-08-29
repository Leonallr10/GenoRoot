import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex min-h-[4.5rem] w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-4 text-2xl font-semibold text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";
