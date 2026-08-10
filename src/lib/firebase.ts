import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

if (
  firebaseConfig.apiKey === 'YOUR_API_KEY' ||
  !import.meta.env.VITE_FIREBASE_API_KEY
) {
  console.error(
    "[Firebase] ERROR: VITE_FIREBASE_API_KEY is missing or placeholder. Restart Vite after editing .env"
  );
} else {
  console.log('[Firebase] Initializing with projectId:', firebaseConfig.projectId, '| apiKey prefix:', firebaseConfig.apiKey.substring(0, 8) + '...');
}

let app: FirebaseApp;
let _auth: Auth | null = null;
let db: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} else {
  app = getApps()[0];
  db = getFirestore(app);
}

// Lazy initialize Auth only when explicitly requested
export const getFirebaseAuth = (): Auth => {
  if (!_auth) {
    console.log('[Firebase] Lazy initializing Auth on explicit request');
    _auth = getAuth(app);
  }
  return _auth;
};

export { app, db };
