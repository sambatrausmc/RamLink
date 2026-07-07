import type { Announcement, Club, EventItem, Interest, Resource } from "@/lib/types";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { getAdminDb } from "@/lib/firebase/admin";

function withId<T>(id: string, data: FirebaseFirestore.DocumentData) {
  return { id, ...data } as T;
}

export async function getClubsFromFirestore() {
  const snapshot = await getAdminDb().collection(COLLECTIONS.clubs).get();
  return snapshot.docs.map((doc) => withId<Club>(doc.id, doc.data()));
}

export async function getClubByIdFromFirestore(clubId: string) {
  const snapshot = await getAdminDb().collection(COLLECTIONS.clubs).doc(clubId).get();
  if (!snapshot.exists) {
    return null;
  }
  return withId<Club>(snapshot.id, snapshot.data() ?? {});
}

export async function getEventsForClubFromFirestore(clubId: string) {
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.events)
    .where("clubId", "==", clubId)
    .orderBy("date", "asc")
    .get();
  return snapshot.docs.map((doc) => withId<EventItem>(doc.id, doc.data()));
}

export async function getAnnouncementsForClubFromFirestore(clubId: string) {
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.announcements)
    .where("clubId", "==", clubId)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => withId<Announcement>(doc.id, doc.data()));
}

export async function getResourcesForClubFromFirestore(clubId: string) {
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.resources)
    .where("clubId", "==", clubId)
    .get();
  return snapshot.docs.map((doc) => withId<Resource>(doc.id, doc.data()));
}

export async function getInterestsFromFirestore() {
  const snapshot = await getAdminDb().collection(COLLECTIONS.interests).get();
  return snapshot.docs.map((doc) => withId<Interest>(doc.id, doc.data()));
}
