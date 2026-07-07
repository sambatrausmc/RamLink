"use client";
import { useEffect, useState } from "react";
import { Bookmark, MessageSquare, PlusCircle } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-provider";
import { createClubInquiry, createJoinRequest, toggleSavedClub } from "@/lib/firebase/student-actions";
import { getStudentProfile } from "@/lib/firebase/user-profile";
import type { Club } from "@/lib/types";

type ClubProfileActionsProps = {
  club: Club;
};

export function ClubProfileActions({ club }: ClubProfileActionsProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<Club["membershipStatus"]>(club.membershipStatus ?? "notJoined");
  const [isSaved, setIsSaved] = useState(Boolean(club.isSaved));
  const [messageVisible, setMessageVisible] = useState(false);
  const [questionSubject, setQuestionSubject] = useState(`Question for ${club.name}`);
  const [questionMessage, setQuestionMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus(club.membershipStatus ?? "notJoined");
     
    setIsSaved(Boolean(club.isSaved));
     
    setQuestionSubject(`Question for ${club.name}`);

    if (!user) return;

    let isActive = true;
    getStudentProfile(user)
      .then((profile) => {
        if (isActive) {
          setIsSaved(profile.savedClubIds.includes(club.id));
          if (profile.joinedClubIds.includes(club.id)) {
            setStatus("approved");
          }
        }
      })
      .catch(() => {
        if (isActive) setFeedback("Unable to load your club status right now.");
      });

    return () => {
      isActive = false;
    };
  }, [club.id, club.isSaved, club.membershipStatus, club.name, user]);

  async function handleSaveClub() {
    if (!user) {
      setFeedback("Sign in to save this club.");
      return;
    }
    const nextValue = !isSaved;
    setIsSaved(nextValue);
    setIsSubmitting(true);
    setFeedback("");

    try {
      await toggleSavedClub(user.uid, club.id, nextValue);
      setFeedback(nextValue ? "Club saved to your profile." : "Club removed from saved clubs.");
    } catch {
      setIsSaved(!nextValue);
      setFeedback("Unable to update saved club status.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleJoinRequest() {
    if (!user) {
      setFeedback("Sign in to request membership.");
      return;
    }
    setIsSubmitting(true);
    setFeedback("");

    try {
      await createJoinRequest({
        userId: user.uid,
        clubId: club.id,
        message: `I would like to join ${club.name}...`,
      });
      setStatus("pending");
      setFeedback("Join request sent to the club officers.");
    } catch {
      setFeedback("Unable to send join request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateInquiry() {
    if (!user) {
      setFeedback("Sign in to ask this club a question.");
      return;
    }
    if (!questionMessage.trim()) {
      setFeedback("Write a question before sending.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      await createClubInquiry({
        userId: user.uid,
        clubId: club.id,
        subject: questionSubject.trim() || `Question for ${club.name}`,
        message: questionMessage.trim(),
      });
      setQuestionMessage("");
      setMessageVisible(false);
      setFeedback("Question sent to the official club inbox.");
    } catch {
      setFeedback("Unable to send your question.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-[18px] border border-brand-mist bg-white p-5 shadow-[0_1px_2px_rgba(7,61,39,0.04),0_10px_28px_rgba(7,61,39,0.06)]">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={status ?? "notJoined"} />
        <span className="text-sm text-brand-muted">Membership status</span>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button disabled={status === "approved" || status === "pending" || isSubmitting} onClick={handleJoinRequest}>
          <PlusCircle className="h-4 w-4" />
          {status === "approved" ? "Already joined" : status === "pending" ? "Request pending" : "Request to join"}
        </Button>
        <Button variant="outline" onClick={handleSaveClub} disabled={isSubmitting}>
          <Bookmark className="h-4 w-4" />
          {isSaved ? "Saved club" : "Save club"}
        </Button>
        <Button variant="outline" onClick={() => setMessageVisible((value) => !value)}>
          <MessageSquare className="h-4 w-4" />
          Ask club a question
        </Button>
      </div>

      {messageVisible ? (
        <div className="mt-5 space-y-3 rounded-[14px] bg-brand-mist p-4">
          <p className="text-sm font-semibold text-brand-forest">Official club inquiry</p>
          <p className="text-sm leading-6 text-brand-muted">
            This sends a message to the official club inbox, not a student-to-student DM.
          </p>
          <label className="block">
            <span className="text-sm font-semibold text-brand-ink">Subject</span>
            <Input className="mt-2 bg-white" value={questionSubject} onChange={(event) => setQuestionSubject(event.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-brand-ink">Question</span>
            <textarea
              className="mt-2 min-h-24 w-full rounded-[11px] border border-brand-mist bg-white px-3 py-2 text-sm text-brand-ink outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
              value={questionMessage}
              onChange={(event) => setQuestionMessage(event.target.value)}
              placeholder="Ask about meetings, membership, events, or requirements..."
            />
          </label>
          <Button size="sm" onClick={handleCreateInquiry} disabled={isSubmitting}>
            Send question
          </Button>
        </div>
      ) : null}

      {feedback ? <p className="mt-4 text-sm font-medium text-brand-forest">{feedback}</p> : null}
    </div>
  );
}
