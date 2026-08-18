import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";

import { auth, db } from "./config";
import type {
  UpdateUserProfileInput,
  UserPreferences,
  UserProfile,
} from "../../types/profile";

export const DEFAULT_PREFERENCES: UserPreferences = {
  notifications: true,
  bookingReminders: true,
  promotions: false,
  locationServices: true,
  hapticFeedback: true,
};

/**
 * Get user profile document from Firestore (`users/{uid}`).
 * If it doesn't exist, initializes it from auth user.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    if (!userId) return null;

    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        uid: userId,
        displayName: data.displayName || auth.currentUser?.displayName || "Caffora User",
        email: data.email || auth.currentUser?.email || "",
        phoneNumber: data.phoneNumber || auth.currentUser?.phoneNumber || "",
        photoURL: data.photoURL || auth.currentUser?.photoURL || "",
        bio: data.bio || "",
        city: data.city || "",
        preferences: data.preferences ? { ...DEFAULT_PREFERENCES, ...data.preferences } : DEFAULT_PREFERENCES,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    }

    // Initialize with current auth data if document hasn't been created yet
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === userId) {
      const initialProfile: UserProfile = {
        uid: userId,
        displayName: currentUser.displayName || "Caffora User",
        email: currentUser.email || "",
        phoneNumber: currentUser.phoneNumber || "",
        photoURL: currentUser.photoURL || "",
        bio: "",
        city: "",
        preferences: DEFAULT_PREFERENCES,
        createdAt: serverTimestamp(),
      };

      await setDoc(userRef, initialProfile, { merge: true });
      return initialProfile;
    }

    return null;
  } catch (error) {
    console.error("getUserProfile error:", error);
    throw error;
  }
}

/**
 * Update user profile in Firebase Auth and Firestore (`users/{uid}`).
 */
export async function updateUserProfile(
  userId: string,
  input: UpdateUserProfileInput,
): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error("UNAUTHORIZED");
    }

    // Update Firebase Auth profile if displayName or photoURL changed
    const authUpdates: { displayName?: string; photoURL?: string } = {};
    if (input.displayName !== undefined) {
      authUpdates.displayName = input.displayName.trim();
    }
    if (input.photoURL !== undefined) {
      authUpdates.photoURL = input.photoURL.trim();
    }

    if (Object.keys(authUpdates).length > 0) {
      await updateProfile(currentUser, authUpdates);
    }

    // Update Firestore user document
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        ...input,
        email: currentUser.email,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    console.error("updateUserProfile error:", error);
    throw error;
  }
}

/**
 * Update user notification and app preferences.
 */
export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>,
): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error("UNAUTHORIZED");
    }

    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        preferences,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    console.error("updateUserPreferences error:", error);
    throw error;
  }
}
