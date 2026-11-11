import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./config";

/**
 * Helper to convert a local file URI to a Blob for Firebase Storage upload in React Native.
 * Uses fetch() first with fallback to XMLHttpRequest.
 */
async function uriToBlob(uri: string): Promise<Blob> {
  try {
    const res = await fetch(uri);
    return await res.blob();
  } catch {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new TypeError("Network request failed while creating image blob"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
  }
}

/**
 * Upload a profile avatar image to Firebase Storage.
 * Path: users/{userId}/avatar_{timestamp}.jpg
 */
export async function uploadProfileImage(
  userId: string,
  localUri: string,
): Promise<string> {
  try {
    if (!userId || !localUri) {
      throw new Error("Missing userId or image URI");
    }

    const blob = await uriToBlob(localUri);
    const filename = `avatar_${Date.now()}.jpg`;
    const storageRef = ref(storage, `users/${userId}/${filename}`);

    const metadata = {
      contentType: "image/jpeg",
      cacheControl: "public,max-age=31536000",
    };

    const snapshot = await uploadBytes(storageRef, blob, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    // Clean up blob if possible
    if ("close" in blob && typeof (blob as any).close === "function") {
      (blob as any).close();
    }

    return downloadUrl;
  } catch (error) {
    console.error("uploadProfileImage error:", error);
    throw error;
  }
}

/**
 * Upload a review image to Firebase Storage.
 * Path: reviews/{userId}/{cafeId}_{timestamp}.jpg
 */
export async function uploadReviewImage(
  userId: string,
  cafeId: string,
  localUri: string,
): Promise<string> {
  try {
    const blob = await uriToBlob(localUri);
    const filename = `${cafeId}_${Date.now()}.jpg`;
    const storageRef = ref(storage, `reviews/${userId}/${filename}`);

    const metadata = {
      contentType: "image/jpeg",
      cacheControl: "public,max-age=31536000",
    };

    const snapshot = await uploadBytes(storageRef, blob, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    if ("close" in blob && typeof (blob as any).close === "function") {
      (blob as any).close();
    }

    return downloadUrl;
  } catch (error) {
    console.error("uploadReviewImage error:", error);
    throw error;
  }
}

/**
 * Upload a cafe image to Firebase Storage.
 * Path: cafes/{ownerId}/{timestamp}_{index}.jpg
 */
export async function uploadCafeImage(
  ownerId: string,
  localUri: string,
  index: number = 0,
): Promise<string> {
  try {
    if (!ownerId || !localUri) {
      throw new Error("Missing ownerId or image URI");
    }

    const blob = await uriToBlob(localUri);
    const filename = `cafe_${Date.now()}_${index}.jpg`;
    const storageRef = ref(storage, `cafes/${ownerId}/${filename}`);

    const metadata = {
      contentType: "image/jpeg",
      cacheControl: "public,max-age=31536000",
    };

    const snapshot = await uploadBytes(storageRef, blob, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    if ("close" in blob && typeof (blob as any).close === "function") {
      (blob as any).close();
    }

    return downloadUrl;
  } catch (error) {
    console.error("uploadCafeImage error:", error);
    throw error;
  }
}
