import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "./config";
import type {
  CreateReviewInput,
  RatingBreakdown,
  Review,
} from "../../types/review";

export type { Review, CreateReviewInput, RatingBreakdown };

function mapReview(id: string, data: Record<string, any>): Review {
  return {
    id,
    cafeId: data.cafeId ?? "",
    userId: data.userId ?? "",
    userName: data.userName ?? "Coffee Lover",
    userAvatar: data.userAvatar || "",
    rating: typeof data.rating === "number" ? data.rating : Number(data.rating ?? 5),
    comment: data.comment ?? "",
    images: Array.isArray(data.images) ? data.images : [],
    createdAt: data.createdAt,
  };
}

/**
 * Get all reviews for a specific cafe.
 */
export async function getCafeReviews(cafeId: string): Promise<Review[]> {
  try {
    if (!cafeId) return [];

    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, where("cafeId", "==", cafeId), limit(100));
    const snapshot = await getDocs(q);

    const reviews = snapshot.docs.map((docSnap) =>
      mapReview(docSnap.id, docSnap.data()),
    );

    // Sort newest first client-side (to avoid composite index requirement)
    reviews.sort((a, b) => {
      const timeA = (a.createdAt as any)?.seconds ? (a.createdAt as any).seconds * 1000 : 0;
      const timeB = (b.createdAt as any)?.seconds ? (b.createdAt as any).seconds * 1000 : 0;
      return timeB - timeA;
    });

    return reviews;
  } catch (error: any) {
    console.warn("getCafeReviews warning (check Firestore rules for 'reviews'):", error?.message || error);
    return [];
  }
}

/**
 * Get reviews written by the specified user.
 */
export async function getUserReviews(userId: string): Promise<Review[]> {
  try {
    if (!userId) return [];

    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, where("userId", "==", userId), limit(50));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => mapReview(docSnap.id, docSnap.data()));
  } catch (error: any) {
    console.warn("getUserReviews warning:", error?.message || error);
    return [];
  }
}

/**
 * Check if the user has already reviewed this cafe.
 */
export async function getUserReviewForCafe(
  userId: string,
  cafeId: string,
): Promise<Review | null> {
  try {
    if (!userId || !cafeId) return null;

    const reviewsRef = collection(db, "reviews");
    const q = query(
      reviewsRef,
      where("cafeId", "==", cafeId),
      where("userId", "==", userId),
      limit(1),
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return mapReview(docSnap.id, docSnap.data());
  } catch (error) {
    console.warn("getUserReviewForCafe warning:", error);
    return null;
  }
}

/**
 * Submit a review and update the cafe's aggregate rating & review count.
 */
export async function addReview(input: CreateReviewInput): Promise<Review> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("LOGIN_REQUIRED");
  }

  if (input.rating < 1 || input.rating > 5) {
    throw new Error("INVALID_RATING");
  }

  if (!input.comment.trim()) {
    throw new Error("EMPTY_COMMENT");
  }

  const reviewsRef = collection(db, "reviews");
  const newReviewRef = doc(reviewsRef);

  const userName =
    input.userName || currentUser.displayName || "Coffee Lover";
  const userAvatar = input.userAvatar || currentUser.photoURL || "";

  // 1. Write the review document
  await setDoc(newReviewRef, {
    cafeId: input.cafeId,
    userId: currentUser.uid,
    userName,
    userAvatar,
    rating: input.rating,
    comment: input.comment.trim(),
    images: input.images || [],
    createdAt: serverTimestamp(),
  });

  // 2. Attempt to update the cafe aggregate score in background
  try {
    const cafeRef = doc(db, "cafes", input.cafeId);
    const cafeSnap = await getDoc(cafeRef);

    if (cafeSnap.exists()) {
      const cafeData = cafeSnap.data();
      const oldRating = typeof cafeData.rating === "number" ? cafeData.rating : 0;
      const oldReviewCount =
        typeof cafeData.reviewCount === "number" ? cafeData.reviewCount : 0;

      const newReviewCount = oldReviewCount + 1;
      const newAverageRating = Number(
        ((oldRating * oldReviewCount + input.rating) / newReviewCount).toFixed(1),
      );

      await updateDoc(cafeRef, {
        rating: newAverageRating,
        reviewCount: newReviewCount,
      });
    }
  } catch (updateErr: any) {
    console.warn(
      "Could not update cafe rating aggregate (check 'cafes' update permission):",
      updateErr?.message || updateErr,
    );
  }

  return {
    id: newReviewRef.id,
    cafeId: input.cafeId,
    userId: currentUser.uid,
    userName,
    userAvatar,
    rating: input.rating,
    comment: input.comment.trim(),
    images: input.images || [],
    createdAt: new Date(),
  };
}

/**
 * Calculate distribution breakdown from reviews list.
 */
export function calculateRatingBreakdown(
  reviews: Review[],
  cafeRating: number = 0,
): RatingBreakdown {
  const breakdown: RatingBreakdown = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
    total: reviews.length,
    average: cafeRating,
  };

  if (reviews.length === 0) return breakdown;

  let sum = 0;
  reviews.forEach((rev) => {
    const star = Math.min(5, Math.max(1, Math.round(rev.rating))) as 1 | 2 | 3 | 4 | 5;
    breakdown[star]++;
    sum += rev.rating;
  });

  breakdown.average = Number((sum / reviews.length).toFixed(1));
  return breakdown;
}
