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

import { auth } from "./config";

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
