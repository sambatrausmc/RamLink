"use client";
import { type FormEvent, useState } from "react";
import { Flag } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { submitContentReport } from "@/lib/firebase/report-workflows";
import type { Report } from "@/lib/types";

type ContentType = Report["contentType"];

export function ReportContentForm() {
  const { profile, user } = useAuth();
  const [contentType, setContentType] = useState<ContentType>("Announcement");
  const [contentTitle, setContentTitle] = useState("");
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Handles submitting the form data to the Firestore reporting workflow
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setFeedback("");
    try {
      await submitContentReport({
        reporterId: user.uid,
        reporterName: profile?.displayName || user.displayName || "RamLink user",
        contentType,
        contentTitle: contentTitle.trim(),
        reason: reason.trim(),
      });
      setContentTitle("");
      setReason("");
      setFeedback("Your report was sent to the RamLink administrators.");
    } catch {
      setFeedback("Unable to submit this report right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Safety"
        title="Report Content"
        description="Send a private content report to the RamLink administrators."
      />
      <Card className="max-w-2xl">
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-brand-ink">
              Content type
              <select
                className="mt-2 h-11 w-full rounded-[12px] border border-brand-mist bg-white px-3.5 text-sm"
                value={contentType}
                onChange={(event) => setContentType(event.target.value as ContentType)}
              >
                <option>Announcement</option>
                <option>Event</option>
                <option>Resource</option>
                <option>Club Profile</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-brand-ink">
              Content title
              <Input
                className="mt-2"
                value={contentTitle}
                onChange={(event) => setContentTitle(event.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-semibold text-brand-ink">
              Reason for report
              <textarea
                className="mt-2 min-h-32 w-full rounded-[12px] border border-brand-mist bg-white p-3.5 text-sm outline-none focus:border-brand-green"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                required
              />
            </label>
            {feedback ? <p className="text-sm font-medium text-brand-forest">{feedback}</p> : null}
            <Button type="submit" disabled={!user || submitting}>
              <Flag className="h-4 w-4" />
              {submitting ? "Sending..." : "Submit report"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
