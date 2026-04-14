import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';

const cfg = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured =
  Object.values(cfg).every(v => v && v !== 'undefined' && !v.includes('xxxx'));

let auth = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  const app = initializeApp(cfg);
  auth = getAuth(app);

  // Persist auth across browser sessions
  setPersistence(auth, browserLocalPersistence).catch(() => {});

  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
  // Always show the account picker, even for single accounts
  googleProvider.setCustomParameters({
    prompt: 'select_account',
  });
}

export { auth, googleProvider };
