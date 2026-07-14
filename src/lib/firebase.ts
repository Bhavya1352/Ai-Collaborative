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

// Diagnostic logs to help debug firebase key/config loading issues
if (
  firebaseConfig.apiKey === 'YOUR_API_KEY' || 
  !import.meta.env.VITE_FIREBASE_API_KEY
) {
  console.error(
    "⚠️ Firebase configuration error: VITE_FIREBASE_API_KEY is not defined or is using the default placeholder 'YOUR_API_KEY'.\n" +
    "If you just created or edited your '.env' file, please RESTART your Vite development server (press Ctrl+C and run 'npm run dev' again) so the new environment variables can be loaded."
  );
} else {
  console.log("Firebase initialized with API key: ", firebaseConfig.apiKey.substring(0, 8) + "...");
}

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };
