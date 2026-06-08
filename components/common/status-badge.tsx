import { Badge } from "@/components/ui/badge";
import type { InquiryStatus, ReportStatus, RequestStatus } from "@/lib/types";

type StatusBadgeProps = {
  status: RequestStatus | InquiryStatus | ReportStatus | "notJoined" | "saved" | "rsvped";
};
export function StatusBadge({ status }: StatusBadgeProps) {
  const labelMap: Record<StatusBadgeProps["status"], string> = {
    approved: "Approved",
    pending: "Pending",
    rejected: "Rejected",
    notJoined: "Not joined",
    open: "Open",
    resolved: "Resolved",
    new: "New",
    reviewing: "Reviewing",
    dismissed: "Dismissed",
    removed: "Removed",
    saved: "Saved",
    rsvped: "RSVP'd",
  };
  const tone =
    status === "approved" || status === "resolved" || status === "saved" || status === "rsvped"
      ? "green"
      : status === "pending" || status === "reviewing"
        ? "gold"
        : status === "rejected" || status === "removed"
          ? "red"
          : "slate";
  return <Badge tone={tone}>{labelMap[status]}</Badge>;
}
