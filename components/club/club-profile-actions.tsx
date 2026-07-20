"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Bookmark, MessageSquare, PlusCircle, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  cancelJoinRequest,
  createClubInquiry,
  createJoinRequest,
  getStudentJoinRequests,
  toggleSavedClub,
} from "@/lib/firebase/student-actions";
import type { Club } from "@/lib/types";

type ClubProfileActionsProps = {
  club: Club;
};

export function ClubProfileActions({ club }: ClubProfileActionsProps) {
  const { profile, user } = useAuth();
  const [status, setStatus] = useState<Club["membershipStatus"]>(
    club.membershipStatus ?? "notJoined",
  );
  const [joinRequestId, setJoinRequestId] = useState<string | null>(null);
  const [messageVisible, setMessageVisible] = useState(false);
  const [joinMessage, setJoinMessage] = useState(
    `I would like to join ${club.name}.`,
  );
  const [question, setQuestion] = useState("");
  const [savedOverride, setSavedOverride] = useState<boolean | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingQuestion, setIsSendingQuestion] = useState(false);
  const [feedback, setFeedback] = useState("");

  const profileSaved =
    profile?.savedClubIds.includes(club.id) ?? club.isSaved ?? false;
  const isSaved = savedOverride ?? profileSaved;

  // Check if the student already has a pending or approved request for this club
  useEffect(() => {
    if (!user) return;
    getStudentJoinRequests(user.uid)
      .then((requests) => {
        const existingRequest = requests.find(
          (request) => request.clubId === club.id,
        );
        if (existingRequest) {
          setStatus(existingRequest.status);
          setJoinRequestId(existingRequest.id);
        }
      })
      .catch(() => undefined);
  }, [club.id, user]);

  async function handleJoinRequest() {
    if (!user) {
      setFeedback("Sign in to request membership.");
      return;
    }
    setIsJoining(true);
    setFeedback("");
    try {
      const request = await createJoinRequest({
        userId: user.uid,
        clubId: club.id,
        clubName: club.name,
        studentName: profile?.displayName,
        message: joinMessage.trim() || `I would like to join ${club.name}.`,
      });
      setStatus(request.status);
      setJoinRequestId(request.id);
      setFeedback("Join request sent to the club officers.");
    } catch {
      setFeedback("Unable to send join request right now.");
    } finally {
      setIsJoining(false);
    }
  }

  async function handleCancelRequest() {
    if (!user || !joinRequestId) return;
    setIsJoining(true);
    setFeedback("");
    try {
      await cancelJoinRequest(user.uid, joinRequestId);
      setStatus("notJoined");
      setJoinRequestId(null);
      setFeedback("Join request cancelled.");
    } catch {
      setFeedback("Unable to cancel the join request right now.");
    } finally {
      setIsJoining(false);
    }
  }

  async function handleSaveClub() {
    if (!user) {
      setFeedback("Sign in to save this club.");
      return;
    }
    setIsSaving(true);
    setFeedback("");
    try {
      const nextSaved = await toggleSavedClub(user.uid, club.id, isSaved);
      setSavedOverride(nextSaved);
      setFeedback(nextSaved ? "Club saved." : "Club removed from saved items.");
    } catch {
      setFeedback("Unable to update saved club right now.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleQuestionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      setFeedback("Sign in to ask the club a question.");
      return;
    }
    setIsSendingQuestion(true);
    setFeedback("");
    try {
      await createClubInquiry({
        userId: user.uid,
        clubId: club.id,
        clubName: club.name,
        studentName: profile?.displayName,
        subject: `Question for ${club.name}`,
        message: question.trim(),
      });
      setQuestion("");
      setFeedback("Question sent to the official club inbox.");
    } catch {
      setFeedback("Unable to send question right now.");
    } finally {
      setIsSendingQuestion(false);
    }
  }

  return (
    <div
      className={
        "rounded-[18px] border border-brand-mist bg-white p-5 shadow-[0_1px_2px_rgba(7,61,39,0.04),0_10px_28px_rgba(7,61,39,0.06)]"
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={status ?? "notJoined"} />
        <span className="text-sm text-brand-muted">Membership status</span>
      </div>
      <label className="mt-5 block">
        <span className="text-sm font-semibold text-brand-ink">
          Join request note
        </span>
        <textarea
          className={
            "mt-2 min-h-24 w-full rounded-[12px] border border-brand-mist bg-white px-3.5 py-3 text-sm text-brand-ink outline-none transition placeholder:text-brand-muted/70 focus:border-brand-green focus:ring-2 focus:ring-brand-green/15"
          }
          value={joinMessage}
          onChange={(event) => setJoinMessage(event.target.value)}
        />
      </label>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button
          disabled={status === "approved" || isJoining}
          onClick={status === "pending" ? handleCancelRequest : handleJoinRequest}
        >
          {status === "pending" ? (
            <XCircle className="h-4 w-4" />
          ) : (
            <PlusCircle className="h-4 w-4" />
          )}
          {isJoining
            ? "Sending..."
            : status === "approved"
              ? "Already joined"
              : status === "pending"
                ? "Cancel request"
                : "Request to join"}
        </Button>
        <Button variant="outline" onClick={handleSaveClub} disabled={isSaving}>
          <Bookmark className="h-4 w-4" />
          {isSaving ? "Saving..." : isSaved ? "Saved" : "Save club"}
        </Button>
        <Button
          variant="outline"
          onClick={() => setMessageVisible((value) => !value)}
        >
          <MessageSquare className="h-4 w-4" />
          Ask club a question
        </Button>
      </div>
      {messageVisible ? (
        <form
          className="mt-5 rounded-[14px] bg-brand-mist p-4"
          onSubmit={handleQuestionSubmit}
        >
          <p className="text-sm font-semibold text-brand-forest">
            Official club inquiry
          </p>
          <p className="mt-1 text-sm leading-6 text-brand-muted">
            This sends a question to the official club inbox, not a
            student-to-student direct message.
          </p>
          <textarea
            className={
              "mt-3 min-h-24 w-full rounded-[12px] border border-brand-mist bg-white px-3.5 py-3 text-sm text-brand-ink outline-none transition placeholder:text-brand-muted/70 focus:border-brand-green focus:ring-2 focus:ring-brand-green/15"
            }
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Write your question for the club officers."
            required
          />
          <Button
            className="mt-3"
            size="sm"
            type="submit"
            disabled={isSendingQuestion || !question.trim()}
          >
            {isSendingQuestion ? "Sending..." : "Send question"}
          </Button>
        </form>
      ) : null}
      {feedback ? (
        <p className="mt-4 text-sm font-medium text-brand-forest">{feedback}</p>
      ) : null}
    </div>
  );
}
