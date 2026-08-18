import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./config";

/**
 * Helper to convert a local file URI to a Blob for Firebase Storage upload in React Native.
 */
async function uriToBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      reject(new TypeError("Network request failed while creating image blob"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
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

    const snapshot = await uploadBytes(storageRef, blob);
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

    const snapshot = await uploadBytes(storageRef, blob);
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
