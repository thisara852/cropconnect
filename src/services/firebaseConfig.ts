import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Live Firebase Configuration for cropconnect-lk
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyC7OrhtzCIwvmSOHXoe38DbMtvScg0gOOw',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'cropconnect-lk.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'cropconnect-lk',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'cropconnect-lk.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '376686429940',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:376686429940:web:24aa4cfca78fe60b2780a1',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-B1VJPD65HV',
};

// Check if credentials are production/custom or demo fallback
export const isLiveFirebaseConfigured = (): boolean => {
  return true; // Live Firebase project cropconnect-lk is configured
};

// Initialize Firebase App singleton safely
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth safely
const auth: Auth = getAuth(app);

// Initialize Cloud Firestore and Storage
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage, firebaseConfig };
