export type AuthEmailAction = "password-reset" | "verification";

export const AUTH_EMAIL_COOLDOWN_SECONDS = 60;
const storagePrefix = "ramlink:auth-email:";

function getStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function getAuthEmailCooldown(
  action: AuthEmailAction,
  now = Date.now(),
) {
  const value = getStorage()?.getItem(`${storagePrefix}${action}`);
  const availableAt = Number(value);
  if (!Number.isFinite(availableAt) || availableAt <= now) return 0;
  return Math.ceil((availableAt - now) / 1000);
}

export function requireAuthEmailCooldown(action: AuthEmailAction) {
  const remaining = getAuthEmailCooldown(action);
  if (remaining > 0) {
    throw new Error(`Wait ${remaining} seconds before requesting another email.`);
  }
}

export function startAuthEmailCooldown(
  action: AuthEmailAction,
  now = Date.now(),
) {
  getStorage()?.setItem(
    `${storagePrefix}${action}`,
    String(now + AUTH_EMAIL_COOLDOWN_SECONDS * 1000),
  );
}
