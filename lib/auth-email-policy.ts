const FARMINGDALE_EMAIL_DOMAIN = "farmingdale.edu";

export function normalizeSchoolEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isFarmingdaleEmail(email: string) {
  const normalizedEmail = normalizeSchoolEmail(email);
  const emailParts = normalizedEmail.split("@");

  if (emailParts.length !== 2) {
    return false;
  }

  const [username, domain] = emailParts;
  return Boolean(
    username &&
      !/\s/.test(username) &&
      domain === FARMINGDALE_EMAIL_DOMAIN,
  );
}

export function requireFarmingdaleEmail(email: string) {
  const normalizedEmail = normalizeSchoolEmail(email);

  if (!isFarmingdaleEmail(normalizedEmail)) {
    throw new Error("Use a valid @farmingdale.edu email address.");
  }

  return normalizedEmail;
}
