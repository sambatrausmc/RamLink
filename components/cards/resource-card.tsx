import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Resource } from "@/lib/types";

type ResourceCardProps = {
  resource: Resource;
  showAction?: boolean;
};

export function ResourceCard({
  resource,
  showAction = true,
}: ResourceCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-mist/30 text-brand-ink">
            <FileText className="h-5 w-5" />
          </div>

          <div>
            <Badge tone="blue">{resource.type}</Badge>
            <h3 className="mt-2 font-display text-lg font-semibold text-brand-ink">
              {resource.title}
            </h3>

            <p className="mt-1 max-w-xl text-sm leading-relaxed text-brand-slate">
              {resource.description}
            </p>

            <p className="mt-3 text-xs font-medium text-brand-muted">
              Updated {resource.updatedAt}
            </p>
          </div>
        </div>

        {showAction ? (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-full bg-brand-ink px-5 text-sm font-semibold text-white transition hover:bg-brand-ink/90 sm:shrink-0"
          >
            Open
          </a>
        ) : null}
      </CardContent>
    </Card>
  );
}