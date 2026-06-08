import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type StatCardColor = "green" | "gold" | "blue" | "slate";
type StatCardProps = {
  label: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
  color?: StatCardColor;
};
const iconBg: Record<StatCardColor, string> = {
  green: "bg-brand-mist text-brand-forest",
  gold: "bg-amber-50 text-amber-600",
  blue: "bg-sky-50 text-sky-600",
  slate: "bg-slate-100 text-slate-500",
};
const accentBar: Record<StatCardColor, string> = {
  green: "bg-brand-forest",
  gold: "bg-brand-gold",
  blue: "bg-sky-500",
  slate: "bg-slate-400",
};
export function StatCard({ label, value, detail, icon, color = "green" }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      <span className={cn("absolute inset-y-3 left-0 w-1 rounded-r-full", accentBar[color])} aria-hidden="true" />
      <CardContent className="flex items-start gap-4 pl-6">
        <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-[12px]", iconBg[color])}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-brand-muted">{label}</p>
          <p className="mt-0.5 font-display text-2xl font-semibold text-brand-ink">{value}</p>
          <p className="mt-0.5 text-xs text-brand-muted/75">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}
