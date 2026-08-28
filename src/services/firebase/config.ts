import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, initializeAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// @ts-ignore - getReactNativePersistence is exported via the react-native package condition
import { getReactNativePersistence } from "@firebase/auth";

// NOTE FOR DEVELOPERS:
// Configure your Firebase credentials in the `.env` file at the project root.
// Copy `.env.example` to `.env` and fill in your Firebase Web App values.
const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "EXPO_PUBLIC_FIREBASE_API_KEY",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "EXPO_PUBLIC_FIREBASE_APP_ID",
};

const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const db: Firestore = getFirestore(app);

const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
