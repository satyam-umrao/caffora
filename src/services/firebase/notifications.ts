import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "./config";
import type { AppNotification, SupportTicket } from "../../types/database";

function mapNotification(id: string, data: Record<string, any>): AppNotification {
  return {
    id,
    userId: data.userId ?? "",
    title: data.title ?? "Notification",
    message: data.message ?? "",
    type: data.type ?? "booking",
    read: data.read === true,
    data: data.data || {},
    createdAt: data.createdAt,
  };
}

/**
 * Fetch all notifications for a user (from root `notifications` collection).
 */
export async function getUserNotifications(
  userId: string,
): Promise<AppNotification[]> {
  try {
    if (!userId) return [];

    const notifsRef = collection(db, "notifications");
    const q = query(notifsRef, where("userId", "==", userId), limit(50));
    const snapshot = await getDocs(q);

    const notifications = snapshot.docs.map((docSnap) =>
      mapNotification(docSnap.id, docSnap.data()),
    );

    // Sort newest first
    notifications.sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
      return timeB - timeA;
    });

    return notifications;
  } catch (error: any) {
    console.warn(
      "getUserNotifications warning (check Firestore rules for 'notifications'):",
      error?.message || error,
    );
    return [];
  }
}

/**
 * Real-time listener for user notifications.
 */
export function subscribeToUserNotifications(
  userId: string,
  onUpdate: (notifications: AppNotification[]) => void,
  onError?: (error: any) => void,
): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const notifsRef = collection(db, "notifications");
  const q = query(notifsRef, where("userId", "==", userId), limit(50));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map((docSnap) =>
        mapNotification(docSnap.id, docSnap.data()),
      );

      // Sort newest first
      notifications.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
        return timeB - timeA;
      });

      onUpdate(notifications);
    },
    (error) => {
      console.warn("subscribeToUserNotifications error:", error?.message || error);
      if (onError) onError(error);
    },
  );

  return unsubscribe;
}

/**
 * Real-time listener for unread notification count.
 * Returns an unsubscribe callback.
 */
export function subscribeToUnreadNotificationCount(
  userId: string,
  onUpdate: (count: number) => void,
): () => void {
  if (!userId) {
    onUpdate(0);
    return () => {};
  }

  const notifsRef = collection(db, "notifications");
  const q = query(
    notifsRef,
    where("userId", "==", userId),
    where("read", "==", false),
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      onUpdate(snapshot.size);
    },
    (error) => {
      console.warn("subscribeToUnreadNotificationCount error:", error?.message || error);
      onUpdate(0);
    },
  );

  return unsubscribe;
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationAsRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  try {
    if (!notificationId) return;

    const notifRef = doc(db, "notifications", notificationId);
    await updateDoc(notifRef, { read: true });
  } catch (error) {
    console.warn("markNotificationAsRead warning:", error);
  }
}

/**
 * Mark all user notifications as read via batch write.
 */
export async function markAllNotificationsAsRead(
  userId: string,
): Promise<void> {
  try {
    if (!userId) return;

    const notifsRef = collection(db, "notifications");
    const q = query(notifsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      if (docSnap.data().read !== true) {
        batch.update(docSnap.ref, { read: true });
      }
    });

    await batch.commit();
  } catch (error) {
    console.warn("markAllNotificationsAsRead warning:", error);
  }
}

/**
 * Delete a single notification by ID.
 */
export async function deleteNotification(
  userId: string,
  notificationId: string,
): Promise<void> {
  try {
    if (!notificationId) return;
    const notifRef = doc(db, "notifications", notificationId);
    await deleteDoc(notifRef);
  } catch (error) {
    console.warn("deleteNotification warning:", error);
    throw error;
  }
}

/**
 * Clear all notifications for a user.
 */
export async function clearAllNotifications(userId: string): Promise<void> {
  try {
    if (!userId) return;
    const notifsRef = collection(db, "notifications");
    const q = query(notifsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
  } catch (error) {
    console.warn("clearAllNotifications warning:", error);
    throw error;
  }
}

/**
 * Helper to dispatch an in-app notification to a user.
 * Supports optional idempotent custom notificationId (e.g. `booking_${id}_${status}`).
 */
export async function createNotification(
  userId: string,
  notification: Omit<AppNotification, "id" | "userId" | "read" | "createdAt">,
  customNotificationId?: string,
): Promise<string> {
  try {
    if (!userId) return "";

    const notifsRef = collection(db, "notifications");
    const targetRef = customNotificationId
      ? doc(db, "notifications", customNotificationId)
      : doc(notifsRef);

    await setDoc(targetRef, {
      ...notification,
      userId,
      read: false,
      createdAt: serverTimestamp(),
    });

    return targetRef.id;
  } catch (error) {
    console.warn("createNotification warning:", error);
    return "";
  }
}

/**
 * Submit a Help & Support ticket to `support_tickets/{ticketId}`.
 */
export async function createSupportTicket(
  ticket: Omit<SupportTicket, "id" | "status" | "createdAt">,
): Promise<string> {
  const ticketsRef = collection(db, "support_tickets");
  const newDocRef = doc(ticketsRef);

  await setDoc(newDocRef, {
    ...ticket,
    status: "open",
    createdAt: serverTimestamp(),
  });

  return newDocRef.id;
}
