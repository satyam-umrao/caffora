import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    serverTimestamp,
    setDoc
} from "firebase/firestore";

import { auth, db } from "./config";

function requireUser() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("LOGIN_REQUIRED");
  }

  return user;
}

/**
 * Save a cafe for the currently logged-in user.
 *
 * Firestore:
 *
 * users/{userId}/favorites/{cafeId}
 */
export async function saveCafe(cafeId: string): Promise<void> {
  const user = requireUser();

  const favoriteRef = doc(db, "users", user.uid, "favorites", cafeId);

  await setDoc(favoriteRef, {
    cafeId,
    userId: user.uid,
    createdAt: serverTimestamp(),
  });
}

/**
 * Remove a saved cafe.
 */
export async function removeSavedCafe(cafeId: string): Promise<void> {
  const user = requireUser();

  const favoriteRef = doc(db, "users", user.uid, "favorites", cafeId);

  await deleteDoc(favoriteRef);
}

/**
 * Check whether a cafe is saved.
 */
export async function isCafeSaved(cafeId: string): Promise<boolean> {
  const user = auth.currentUser;

  if (!user) {
    return false;
  }

  const favoriteRef = doc(db, "users", user.uid, "favorites", cafeId);

  const snapshot = await import("firebase/firestore").then(({ getDoc }) =>
    getDoc(favoriteRef),
  );

  return snapshot.exists();
}

/**
 * Toggle saved state.
 *
 * Returns:
 * true  = cafe is now saved
 * false = cafe is now removed
 */
export async function toggleCafeSaved(cafeId: string): Promise<boolean> {
  const saved = await isCafeSaved(cafeId);

  if (saved) {
    await removeSavedCafe(cafeId);
    return false;
  }

  await saveCafe(cafeId);
  return true;
}

/**
 * Get all saved cafe IDs for
 * the currently logged-in user.
 */
export async function getSavedCafeIds(): Promise<string[]> {
  const user = auth.currentUser;

  if (!user) {
    return [];
  }

  const favoritesRef = collection(db, "users", user.uid, "favorites");

  const snapshot = await getDocs(favoritesRef);

  return snapshot.docs.map((item) => item.id).filter(Boolean);
}
