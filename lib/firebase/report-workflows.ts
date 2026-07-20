import { protectedApiRequest } from "@/lib/firebase/protected-api";
import type { Report } from "@/lib/types";

// Reporter identity is derived from the authenticated user on the server.
export type SubmitReportInput = Pick<
  Report,
  "contentType" | "contentTitle" | "reason"
>;

// Submits a new content report to Firestore for administrator review
export async function submitContentReport(input: SubmitReportInput) {
  const reportData = {
    contentType: input.contentType,
    contentTitle: input.contentTitle.trim(),
    reason: input.reason.trim(),
  };

  if (!reportData.contentTitle || !reportData.reason) {
    throw new Error("Report fields cannot be empty.");
  }

  const report = await protectedApiRequest<{ id: string }>(
    "/api/student/reports",
    {
      method: "POST",
      body: JSON.stringify(reportData),
    },
  );
  return report.id;
}
