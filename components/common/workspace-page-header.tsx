import { type ReactNode } from "react";

type WorkspacePageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};
export function WorkspacePageHeader({ eyebrow, title, description, action }: WorkspacePageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-2 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-5 rounded-full bg-brand-gold" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand-green">{eyebrow}</p>
          </div>
        ) : null}
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-[-0.02em] text-brand-ink md:text-4xl">
          {title}
        </h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-brand-muted md:text-[15px]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
