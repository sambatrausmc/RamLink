import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Resource } from "@/lib/types";

type ResourceCardProps = {
  resource: Resource;
  showAction?: boolean;
};
export function ResourceCard({ resource, showAction = true }: ResourceCardProps) {
  return (
    <Card className="transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      <CardContent className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-brand-mist text-brand-forest">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <Badge tone="slate">{resource.type}</Badge>
            <h2 className="mt-2 font-display text-base font-semibold text-brand-ink">{resource.title}</h2>
            <p className="mt-2 text-sm leading-6 text-brand-muted">{resource.description}</p>
            <p className="mt-3 text-xs font-medium text-brand-muted/70">Updated {resource.updatedAt}</p>
          </div>
        </div>
        {showAction ? (
          <Button size="sm" variant="outline">
            Open
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
