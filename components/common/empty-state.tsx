import { type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
};
export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-mist text-brand-forest">
          {icon}
        </div>
        <h2 className="font-display text-base font-semibold text-brand-ink">{title}</h2>
        <p className="mt-1 max-w-md text-sm text-brand-muted">{description}</p>
      </CardContent>
    </Card>
  );
}
