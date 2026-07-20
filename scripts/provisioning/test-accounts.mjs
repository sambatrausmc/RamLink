import { requireEnvironment } from "./admin-client.mjs";

export const testAccounts = [
  {
    uid: "ramlink-demo-student",
    role: "student",
    displayName: "Avery Morgan",
    emailKey: "RAMLINK_STUDENT_EMAIL",
    passwordKey: "RAMLINK_STUDENT_PASSWORD",
    major: "Computer Programming and Information Systems",
    interests: ["Technology", "Leadership"],
    joinedClubIds: [],
    managedClubIds: [],
  },
  {
    uid: "ramlink-demo-officer",
    role: "clubOfficer",
    displayName: "Casey Reed",
    emailKey: "RAMLINK_OFFICER_EMAIL",
    passwordKey: "RAMLINK_OFFICER_PASSWORD",
    major: "Computer Science",
    interests: ["Technology"],
    joinedClubIds: ["cs-club"],
    managedClubIds: ["cs-club"],
  },
  {
    uid: "ramlink-demo-admin",
    role: "admin",
    displayName: "Morgan Patel",
    emailKey: "RAMLINK_ADMIN_EMAIL",
    passwordKey: "RAMLINK_ADMIN_PASSWORD",
    major: "Technology Management",
    interests: ["Leadership", "Business"],
    joinedClubIds: [],
    managedClubIds: [],
  },
];

export function readAccountCredentials(account) {
  const email = requireEnvironment(account.emailKey).toLowerCase();
  const password = requireEnvironment(account.passwordKey);

  if (!email.endsWith("@farmingdale.edu")) {
    throw new Error(`${account.emailKey} must use @farmingdale.edu.`);
  }
  if (password.length < 12) {
    throw new Error(
      `${account.passwordKey} must contain at least 12 characters.`,
    );
  }

  return { email, password };
}