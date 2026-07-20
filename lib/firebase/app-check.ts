import type { FirebaseApp } from "firebase/app";
import {
  getToken,
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  type AppCheck,
} from "firebase/app-check";

export const APP_CHECK_HEADER_NAME = "X-Firebase-AppCheck";

let appCheckInstance: AppCheck | null = null;

// Activates App Check bot protection if a valid reCAPTCHA site key exists in the environment
export function initializeFirebaseAppCheck(app: FirebaseApp) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;
  if (appCheckInstance || typeof window === "undefined" || !siteKey) return;

  appCheckInstance = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export async function getAppCheckRequestHeaders(): Promise<Record<string, string>> {
  if (!appCheckInstance) return {};

  const { token } = await getToken(appCheckInstance, false);
  return { [APP_CHECK_HEADER_NAME]: token };
}
