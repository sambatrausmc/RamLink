import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-[12px] border border-brand-mist bg-white px-3.5 text-sm text-brand-ink outline-none transition placeholder:text-brand-muted/70 focus:border-brand-green focus:ring-2 focus:ring-brand-green/15",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
