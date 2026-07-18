"use client";
import { useEffect, useState } from "react";
import { AdminClubCreateForm } from "@/components/admin/admin-club-create-form";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { updateClubStatus } from "@/lib/firebase/admin-workflows";
import { getAllClubsForAdmin } from "@/lib/firebase/public-data";
import type { Club, ClubStatus } from "@/lib/types";

const statuses: ClubStatus[] = ["pending", "active", "suspended", "archived"];

export function AdminClubsClient() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  // Fetches all club records from Firestore regardless of active status
  async function loadClubs() {
    setLoading(true);
    try {
      setClubs(await getAllClubsForAdmin());
    } catch {
      setFeedback("Unable to load club records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAllClubsForAdmin()
      .then(setClubs)
      .catch(() => setFeedback("Unable to load club records."))
      .finally(() => setLoading(false));
  }, []);

  // Updates a club's lifecycle state in real time
  async function handleStatusChange(clubId: string, status: ClubStatus) {
    setFeedback("");
    try {
      await updateClubStatus(clubId, status);
      setClubs((current) => current.map((club) => (club.id === clubId ? { ...club, status } : club)));
      setFeedback("Club status updated.");
    } catch {
      setFeedback("Unable to update this club status.");
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Clubs"
        title="Campus Club Records"
        description="Create club records and control which clubs are visible to students."
      />
      <Card>
        <CardHeader>
          <h2 className="font-display text-xl font-semibold text-brand-ink">Create a club</h2>
        </CardHeader>
        <CardContent>
          <AdminClubCreateForm onCreated={loadClubs} />
        </CardContent>
      </Card>
      {feedback ? <p className="text-sm font-medium text-brand-forest">{feedback}</p> : null}
      {loading ? <p className="text-sm text-brand-muted">Loading clubs...</p> : null}
      {!loading ? (
        <Card>
          <CardContent className="divide-y divide-brand-surface">
            {clubs.map((club) => (
              <div key={club.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display font-semibold text-brand-ink">{club.name}</h2>
                    <Badge tone={club.status === "active" ? "green" : "slate"}>{club.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-brand-muted">{club.category} | {club.contactEmail}</p>
                </div>
                <label className="text-sm font-semibold text-brand-ink">
                  Status
                  <select
                    className="ml-2 h-9 rounded-[10px] border border-brand-mist bg-white px-3 text-sm"
                    value={club.status}
                    onChange={(event) => handleStatusChange(club.id, event.target.value as ClubStatus)}
                  >
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
