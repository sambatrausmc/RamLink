import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};
const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-forest text-white shadow-[0_6px_16px_rgba(11,93,59,0.18)] hover:-translate-y-0.5 hover:bg-brand-forestDark hover:shadow-[0_10px_24px_rgba(11,93,59,0.26)]",
  secondary: "bg-brand-mist text-brand-forest hover:-translate-y-0.5 hover:bg-emerald-100",
  outline: "border border-brand-mist bg-white text-brand-forest hover:-translate-y-0.5 hover:border-brand-greenLight hover:bg-brand-surface",
  ghost: "text-brand-muted hover:bg-brand-surface hover:text-brand-forest",
  danger: "bg-red-600 text-white hover:-translate-y-0.5 hover:bg-red-700",
};
const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "h-10 w-10 p-0",
};
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[11px] font-semibold leading-none transition duration-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
