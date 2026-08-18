import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { auth, db } from "./config";
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
 * Helper to dispatch an in-app notification to a user.
 */
export async function createNotification(
  userId: string,
  notification: Omit<AppNotification, "id" | "userId" | "read" | "createdAt">,
): Promise<void> {
  try {
    if (!userId) return;

    const notifsRef = collection(db, "notifications");
    const newDocRef = doc(notifsRef);

    await setDoc(newDocRef, {
      ...notification,
      userId,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn("createNotification warning:", error);
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
