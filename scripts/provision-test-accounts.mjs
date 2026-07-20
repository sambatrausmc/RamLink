import {
  adminAuth,
  adminDb,
  FieldValue,
} from "./provisioning/admin-client.mjs";
import {
  readAccountCredentials,
  testAccounts,
} from "./provisioning/test-accounts.mjs";

async function upsertAuthUser(account, email, password) {
  try {
    const existingUser = await adminAuth.getUserByEmail(email);
    return adminAuth.updateUser(existingUser.uid, {
      displayName: account.displayName,
      emailVerified: true,
      password,
      disabled: false,
    });
  } catch (error) {
    if (error?.code !== "auth/user-not-found") {
      throw error;
    }
    return adminAuth.createUser({
      uid: account.uid,
      email,
      password,
      displayName: account.displayName,
      emailVerified: true,
    });
  }
}

async function provisionAccount(account) {
  const { email, password } = readAccountCredentials(account);
  const user = await upsertAuthUser(account, email, password);

  await adminDb.collection("users").doc(user.uid).set({
    id: user.uid,
    role: account.role,
    displayName: account.displayName,
    email,
    major: account.major,
    classYear: "Test Account",
    interests: account.interests,
    joinedClubIds: account.joinedClubIds,
    savedClubIds: [],
    savedEventIds: [],
    rsvpedEventIds: [],
    managedClubIds: account.managedClubIds,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log(`${account.role} account ready: ${user.uid}`);
}

async function provisionAccounts() {
  const emails = testAccounts.map(
    (account) => readAccountCredentials(account).email,
  );
  if (new Set(emails).size !== emails.length) {
    throw new Error("Each test role must use a different email address.");
  }
  for (const account of testAccounts) {
    await provisionAccount(account);
  }
}

provisionAccounts().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});