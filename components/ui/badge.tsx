import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "green" | "gold" | "blue" | "red" | "slate";
const tones: Record<BadgeTone, string> = {
  green: "bg-brand-mist text-brand-forest ring-brand-mistDark",
  gold: "bg-amber-50 text-amber-700 ring-amber-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};
type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};
export function Badge({ className, tone = "slate", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
