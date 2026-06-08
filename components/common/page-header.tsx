import { type ReactNode } from "react";
import { WorkspacePageHeader } from "@/components/common/workspace-page-header";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};
export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return <WorkspacePageHeader eyebrow={eyebrow} title={title} description={description} action={action} />;
}
