import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";

// 1. DEFINE THE ROLES
// These match the exact roles we set up in the Firestore security rules during Branch 1.
export type UserRole = "student" | "clubOfficer" | "admin";

// 2. THE MAIN FETCH FUNCTION
// We pass in a Firebase Auth User ID, and this digs into the 'users' collection to find out what their role is.
export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const userDocRef = doc(db, COLLECTIONS.users, userId);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      // If the user exists, return whatever is saved in their 'role' field
      return userSnapshot.data().role as UserRole;
    }
    
    // If we can't find a profile for them, return null for safety
    return null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}

// 3. QUICK CHECK: IS ADMIN?
// A simple true/false helper so we don't have to write the full fetch logic every time.
export async function isAdmin(userId: string) {
  const role = await getUserRole(userId);
  return role === "admin";
}

// 4. QUICK CHECK: IS OFFICER OR ADMIN?
// Since Admins can usually do everything a Club Officer can do, we check for both here.
export async function isOfficerOrAdmin(userId: string) {
  const role = await getUserRole(userId);
  return role === "clubOfficer" || role === "admin";
}
