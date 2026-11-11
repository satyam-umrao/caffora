import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { sendExpoPushNotification } from "./expoPush";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

function getSlotDocId(dateStr: string, timeSlot: string): string {
  const cleanDate = String(dateStr).trim().replace(/[^a-zA-Z0-9]/g, "_");
  const cleanTime = String(timeSlot).trim().replace(/[^a-zA-Z0-9]/g, "_");
  return `${cleanDate}_${cleanTime}`;
}

/**
 * Callable Function: Accept a table booking.
 * Verifies ownership, prevents invalid transitions, and enforces capacity atomically via server transaction.
 */
export const acceptBooking = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required.",
    );
  }

  const { bookingId, note } = data;
  const ownerId = context.auth.uid;

  if (!bookingId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "bookingId is required.",
    );
  }

  const bookingRef = db.collection("bookings").doc(bookingId);
  let acceptedBooking: any = null;

  await db.runTransaction(async (transaction) => {
    const bookingSnap = await transaction.get(bookingRef);
    if (!bookingSnap.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Booking does not exist.",
      );
    }

    const booking = bookingSnap.data()!;
    if (booking.ownerId !== ownerId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You do not own the cafe associated with this reservation.",
      );
    }

    if (booking.status !== "pending" && booking.status !== "on_hold") {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Cannot accept booking with current status "${booking.status}".`,
      );
    }

    const cafeRef = db.collection("cafes").doc(booking.cafeId);
    const cafeSnap = await transaction.get(cafeRef);
    const seatingCapacity = cafeSnap.exists
      ? Number(cafeSnap.data()?.seatingCapacity) || 40
      : 40;

    const bDate = booking.date || booking.bookingDate;
    const bTime = booking.time || booking.timeSlot;
    const requestedGuests = Number(booking.guests || booking.guestCount) || 2;

    const slotDocId = getSlotDocId(bDate, bTime);
    const slotRef = cafeRef.collection("slots").doc(slotDocId);
    const slotSnap = await transaction.get(slotRef);

    const currentConfirmed = slotSnap.exists
      ? Number(slotSnap.data()?.confirmedGuests) || 0
      : 0;

    if (currentConfirmed + requestedGuests > seatingCapacity) {
      const remaining = Math.max(0, seatingCapacity - currentConfirmed);
      throw new functions.https.HttpsError(
        "resource-exhausted",
        `Capacity exceeded. Requested ${requestedGuests} guests, but only ${remaining} seats remain for this slot.`,
      );
    }

    // Atomically increment slot confirmed capacity
    transaction.set(
      slotRef,
      {
        date: bDate,
        timeSlot: bTime,
        confirmedGuests: currentConfirmed + requestedGuests,
        capacity: seatingCapacity,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    // Commit booking status
    transaction.update(bookingRef, {
      status: "confirmed",
      ownerNote: note ? String(note).trim() : booking.ownerNote || "",
      respondedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    acceptedBooking = booking;
  });

  // Idempotent Customer In-App Notification
  if (acceptedBooking) {
    const notifId = `notif_${bookingId}_cust_confirmed`;
    const notifRef = db.collection("notifications").doc(notifId);
    const existingSnap = await notifRef.get();
    if (!existingSnap.exists) {
      await notifRef.set({
        userId: acceptedBooking.userId,
        title: "Reservation Confirmed! 🎉",
        message: `Your table for ${acceptedBooking.guests} at ${acceptedBooking.cafeName} on ${acceptedBooking.date} at ${acceptedBooking.time} is confirmed! Ref: ${acceptedBooking.bookingCode}`,
        type: "booking",
        read: false,
        data: {
          bookingId,
          cafeId: acceptedBooking.cafeId,
          bookingCode: acceptedBooking.bookingCode,
          event: "booking_confirmed",
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  return { success: true, bookingId, status: "confirmed" };
});

/**
 * Callable Function: Reject a table booking.
 */
export const rejectBooking = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required.",
    );
  }

  const { bookingId, reason } = data;
  const ownerId = context.auth.uid;

  if (!bookingId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "bookingId is required.",
    );
  }

  const bookingRef = db.collection("bookings").doc(bookingId);
  const snap = await bookingRef.get();
  if (!snap.exists) {
    throw new functions.https.HttpsError("not-found", "Booking not found.");
  }

  const booking = snap.data()!;
  if (booking.ownerId !== ownerId) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You do not own this cafe.",
    );
  }

  if (booking.status !== "pending" && booking.status !== "on_hold") {
    throw new functions.https.HttpsError(
      "failed-precondition",
      `Cannot reject booking with current status "${booking.status}".`,
    );
  }

  const rejectReason = reason ? String(reason).trim() : "Table unavailable.";

  await bookingRef.update({
    status: "rejected",
    ownerNote: rejectReason,
    respondedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Idempotent Customer Notification
  const notifId = `notif_${bookingId}_cust_rejected`;
  const notifRef = db.collection("notifications").doc(notifId);
  await notifRef.set(
    {
      userId: booking.userId,
      title: "Reservation Request Declined ❌",
      message: `Your table request at ${booking.cafeName} on ${booking.date} at ${booking.time} could not be accommodated: ${rejectReason}`,
      type: "booking",
      read: false,
      data: {
        bookingId,
        cafeId: booking.cafeId,
        bookingCode: booking.bookingCode,
        event: "booking_rejected",
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return { success: true, bookingId, status: "rejected" };
});

/**
 * Callable Function: Place a booking on hold with note.
 */
export const holdBooking = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required.",
    );
  }

  const { bookingId, note } = data;
  const ownerId = context.auth.uid;

  if (!bookingId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "bookingId is required.",
    );
  }

  const bookingRef = db.collection("bookings").doc(bookingId);
  const snap = await bookingRef.get();
  if (!snap.exists) {
    throw new functions.https.HttpsError("not-found", "Booking not found.");
  }

  const booking = snap.data()!;
  if (booking.ownerId !== ownerId) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You do not own this cafe.",
    );
  }

  if (booking.status !== "pending" && booking.status !== "on_hold") {
    throw new functions.https.HttpsError(
      "failed-precondition",
      `Cannot hold booking with status "${booking.status}".`,
    );
  }

  const holdNote = note ? String(note).trim() : "Pending review.";

  await bookingRef.update({
    status: "on_hold",
    ownerNote: holdNote,
    respondedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const notifId = `notif_${bookingId}_cust_hold_${Date.now()}`;
  await db.collection("notifications").doc(notifId).set({
    userId: booking.userId,
    title: "Reservation On Hold ⏳",
    message: `Your booking at ${booking.cafeName} for ${booking.date} at ${booking.time} is on hold: ${holdNote}`,
    type: "booking",
    read: false,
    data: {
      bookingId,
      cafeId: booking.cafeId,
      bookingCode: booking.bookingCode,
      event: "booking_on_hold",
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, bookingId, status: "on_hold" };
});

/**
 * Callable Function: Cancel a booking.
 * Automatically releases slot capacity if the booking was previously confirmed.
 */
export const cancelBooking = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required.",
    );
  }

  const { bookingId, reason } = data;
  const callerUid = context.auth.uid;

  if (!bookingId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "bookingId is required.",
    );
  }

  const bookingRef = db.collection("bookings").doc(bookingId);

  await db.runTransaction(async (transaction) => {
    const bookingSnap = await transaction.get(bookingRef);
    if (!bookingSnap.exists) {
      throw new functions.https.HttpsError("not-found", "Booking not found.");
    }

    const booking = bookingSnap.data()!;
    const isCustomer = booking.userId === callerUid;
    const isOwner = booking.ownerId === callerUid;

    if (!isCustomer && !isOwner) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Not authorized to cancel this booking.",
      );
    }

    if (
      booking.status !== "pending" &&
      booking.status !== "confirmed" &&
      booking.status !== "on_hold"
    ) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Cannot cancel booking with current status "${booking.status}".`,
      );
    }

    // If previously confirmed, atomically release slot capacity
    if (booking.status === "confirmed") {
      const bDate = booking.date || booking.bookingDate;
      const bTime = booking.time || booking.timeSlot;
      const guests = Number(booking.guests || booking.guestCount) || 2;
      const slotDocId = getSlotDocId(bDate, bTime);
      const slotRef = db
        .collection("cafes")
        .doc(booking.cafeId)
        .collection("slots")
        .doc(slotDocId);

      const slotSnap = await transaction.get(slotRef);
      if (slotSnap.exists) {
        const currentConfirmed = Number(slotSnap.data()?.confirmedGuests) || 0;
        transaction.update(slotRef, {
          confirmedGuests: Math.max(0, currentConfirmed - guests),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    transaction.update(bookingRef, {
      status: "cancelled",
      cancellationReason: reason || "Cancelled",
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  return { success: true, bookingId, status: "cancelled" };
});

/**
 * Background Firestore Trigger: When a notification document is created,
 * look up the recipient's push token and dispatch remote push via Expo Push API.
 */
export const onNotificationCreated = functions.firestore
  .document("notifications/{notificationId}")
  .onCreate(async (snap) => {
    const notif = snap.data();
    if (!notif || !notif.userId) return;

    try {
      const userSnap = await db.collection("users").doc(notif.userId).get();
      if (!userSnap.exists) return;

      const pushToken = userSnap.data()?.pushToken;
      if (!pushToken) return;

      await sendExpoPushNotification({
        toToken: pushToken,
        title: notif.title || "Caffora Notification",
        body: notif.message || "",
        data: notif.data || {},
      });
    } catch (err) {
      console.error("[PushTrigger] Notification delivery error:", err);
    }
  });
