import type { FirebaseApp } from "firebase/app";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "firebase/app-check";

let initialized = false;

// Activates App Check bot protection if a valid reCAPTCHA site key exists in the environment
export function initializeFirebaseAppCheck(app: FirebaseApp) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;
  if (initialized || typeof window === "undefined" || !siteKey) return;

  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });

  initialized = true;
}
