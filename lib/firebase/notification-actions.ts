import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { NotificationStatus } from "@/lib/types";
async function getDb() {
const { db } = await import("@/lib/firebase/client");
return db;
}
// Notification owners can mark an item read through the deployed Firestore rules.
export async function markNotificationRead(notificationId: string) {
const db = await getDb();
await updateDoc(doc(db, COLLECTIONS.notifications, notificationId), {
status: "read" satisfies NotificationStatus,
updatedAt: serverTimestamp(),
});
}