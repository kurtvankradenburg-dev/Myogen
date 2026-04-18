// Google Analytics via Firebase.
// Activated after the user accepts the cookie notice.
// Requires: `firebase` package installed + VITE_FIREBASE_MEASUREMENT_ID set in .env
// Until then this is a safe no-op — no import errors, no tracking.

let analyticsInitialized = false;

export async function initAnalytics() {
  if (analyticsInitialized) return;
  try {
    // All firebase imports are dynamic so they only run at call-time.
    // If the package isn't installed they throw, which we catch silently.
    const [{ isFirebaseConfigured }] = await Promise.all([
      import('./firebase.js'),
    ]);
    if (!isFirebaseConfigured) return;

    const [{ getApp }, { getAnalytics, isSupported }] = await Promise.all([
      import('firebase/app'),
      import('firebase/analytics'),
    ]);
    if (await isSupported()) {
      getAnalytics(getApp());
      analyticsInitialized = true;
    }
  } catch {
    // firebase package not installed or not configured — skip silently
  }
}
