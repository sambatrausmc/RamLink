import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { Report } from "@/lib/types";

// Pick only the fields provided by the student, plus the reporter's unique user ID
export type SubmitReportInput = Pick<
  Report,
  "reporterName" | "contentType" | "contentTitle" | "reason"
> & {
  reporterId: string;
};

// Submits a new content report to Firestore for administrator review
export async function submitContentReport(input: SubmitReportInput) {
  const { db } = await import("@/lib/firebase/client");

  const report = await addDoc(collection(db, COLLECTIONS.reports), {
    ...input,
    status: "new",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return report.id;
}
