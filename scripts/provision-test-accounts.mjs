import {
  adminAuth,
  adminDb,
  FieldValue,
} from "./provisioning/admin-client.mjs";
import {
  readAccountCredentials,
  testAccounts,
} from "./provisioning/test-accounts.mjs";
import { upsertAuthUser } from "./provisioning/auth-users.mjs";

async function provisionAccount(account) {
  const { email, password } = readAccountCredentials(account);
  const user = await upsertAuthUser(adminAuth, account, email, password);

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
