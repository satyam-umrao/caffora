import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    type User,
    type UserCredential,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "./config";
import { DEFAULT_PREFERENCES } from "./users";

export async function signUp(
  name: string,
  email: string,
  password: string,
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password,
  );

  await updateProfile(credential.user, {
    displayName: name.trim(),
  });

  // Persist user profile with customer role
  const userRef = doc(db, "users", credential.user.uid);
  await setDoc(
    userRef,
    {
      uid: credential.user.uid,
      displayName: name.trim(),
      email: email.trim().toLowerCase(),
      role: "customer",
      preferences: DEFAULT_PREFERENCES,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await sendEmailVerification(credential.user);

  return credential;
}

export async function signUpOwner(
  name: string,
  businessName: string,
  email: string,
  phone: string,
  password: string,
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password,
  );

  await updateProfile(credential.user, {
    displayName: name.trim(),
  });

  // Persist user profile with cafe_owner role
  const userRef = doc(db, "users", credential.user.uid);
  await setDoc(
    userRef,
    {
      uid: credential.user.uid,
      displayName: name.trim(),
      businessName: businessName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phone.trim(),
      role: "cafe_owner",
      preferences: DEFAULT_PREFERENCES,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await sendEmailVerification(credential.user);

  return credential;
}

export async function signIn(
  email: string,
  password: string,
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
}

export async function resendVerificationEmail(): Promise<void> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No authenticated user found.");
  }

  await sendEmailVerification(user);
}

export async function checkEmailVerification(): Promise<boolean> {
  const user = auth.currentUser;

  if (!user) {
    return false;
  }

  await user.reload();

  return auth.currentUser?.emailVerified === true;
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}
