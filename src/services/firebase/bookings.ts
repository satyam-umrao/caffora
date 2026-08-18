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
import { createNotification } from "./notifications";
import type {
  Booking,
  BookingStatus,
  CreateBookingInput,
} from "../../types/booking";

function mapBooking(id: string, data: Record<string, any>): Booking {
  return {
    id,
    bookingCode: data.bookingCode ?? `CF-${id.slice(0, 5).toUpperCase()}`,
    cafeId: data.cafeId ?? "",
    cafeName: data.cafeName ?? "Cafe Reservation",
    cafeImage: data.cafeImage || "",
    cafeLocation: data.cafeLocation || "",
    cafeCity: data.cafeCity || "",
    userId: data.userId ?? "",
    userName: data.userName ?? "Guest",
    userEmail: data.userEmail ?? "",
    userPhone: data.userPhone || "",
    date: data.date ?? "",
    time: data.time ?? "",
    guests: typeof data.guests === "number" ? data.guests : Number(data.guests ?? 2),
    seatingPreference: data.seatingPreference || "No Preference",
    specialRequests: data.specialRequests || "",
    status: (data.status as BookingStatus) || "confirmed",
    cancellationReason: data.cancellationReason,
    cancelledAt: data.cancelledAt,
    createdAt: data.createdAt,
  };
}

/**
 * Generate a clean 6-digit confirmation code: e.g. CF-49182
 */
function generateBookingCode(): string {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `CF-${randomDigits}`;
}

/**
 * Create a new table reservation in Firestore (`bookings/{bookingId}`).
 */
export async function createBooking(
  input: CreateBookingInput,
): Promise<Booking> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("LOGIN_REQUIRED");
  }

  if (!input.cafeId) throw new Error("MISSING_CAFE_ID");
  if (!input.date) throw new Error("MISSING_DATE");
  if (!input.time) throw new Error("MISSING_TIME");
  if (!input.guests || input.guests < 1) throw new Error("INVALID_GUEST_COUNT");

  const bookingsRef = collection(db, "bookings");
  const newDocRef = doc(bookingsRef);
  const bookingCode = generateBookingCode();

  const bookingData = {
    bookingCode,
    cafeId: input.cafeId,
    cafeName: input.cafeName,
    cafeImage: input.cafeImage || "",
    cafeLocation: input.cafeLocation || "",
    cafeCity: input.cafeCity || "",
    userId: currentUser.uid,
    userName: input.userName || currentUser.displayName || "Guest",
    userEmail: input.userEmail || currentUser.email || "",
    userPhone: input.userPhone || currentUser.phoneNumber || "",
    date: input.date,
    time: input.time,
    guests: input.guests,
    seatingPreference: input.seatingPreference || "No Preference",
    specialRequests: input.specialRequests || "",
    status: "confirmed" as BookingStatus,
    createdAt: serverTimestamp(),
  };

  await setDoc(newDocRef, bookingData);

  // Send an in-app notification to the user
  try {
    await createNotification(currentUser.uid, {
      title: "Booking Confirmed! 🎉",
      message: `Your table for ${input.guests} at ${input.cafeName} on ${input.date} at ${input.time} is confirmed. Ref: ${bookingCode}`,
      type: "booking",
      data: {
        bookingId: newDocRef.id,
        cafeId: input.cafeId,
        bookingCode,
      },
    });
  } catch (notifErr) {
    console.warn("Could not create booking notification:", notifErr);
  }

  return {
    id: newDocRef.id,
    ...bookingData,
    createdAt: new Date(),
  };
}

/**
 * Fetch all bookings for a user.
 */
export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    if (!userId) return [];

    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("userId", "==", userId), limit(100));
    const snapshot = await getDocs(q);

    const bookings = snapshot.docs.map((docSnap) =>
      mapBooking(docSnap.id, docSnap.data()),
    );

    // Sort newest bookings first
    bookings.sort((a, b) => {
      const timeA = (a.createdAt as any)?.seconds ? (a.createdAt as any).seconds * 1000 : 0;
      const timeB = (b.createdAt as any)?.seconds ? (b.createdAt as any).seconds * 1000 : 0;
      return timeB - timeA;
    });

    return bookings;
  } catch (error: any) {
    console.warn(
      "getUserBookings warning (check Firestore rules for 'bookings'):",
      error?.message || error,
    );
    return [];
  }
}

/**
 * Fetch a single booking by ID.
 */
export async function getBookingById(
  bookingId: string,
): Promise<Booking | null> {
  try {
    if (!bookingId) return null;

    const bookingRef = doc(db, "bookings", bookingId);
    const snapshot = await getDoc(bookingRef);

    if (!snapshot.exists()) return null;

    return mapBooking(snapshot.id, snapshot.data());
  } catch (error) {
    console.warn("getBookingById warning:", error);
    return null;
  }
}

/**
 * Cancel a user's booking.
 */
export async function cancelBooking(
  bookingId: string,
  reason: string = "Cancelled by user",
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("LOGIN_REQUIRED");
  }

  const bookingRef = doc(db, "bookings", bookingId);
  const snapshot = await getDoc(bookingRef);

  if (!snapshot.exists()) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  const bookingData = snapshot.data();
  if (bookingData.userId !== currentUser.uid) {
    throw new Error("UNAUTHORIZED");
  }

  await updateDoc(bookingRef, {
    status: "cancelled",
    cancellationReason: reason,
    cancelledAt: serverTimestamp(),
  });

  // Create cancellation notification
  try {
    await createNotification(currentUser.uid, {
      title: "Booking Cancelled",
      message: `Your reservation at ${bookingData.cafeName} for ${bookingData.date} has been cancelled.`,
      type: "booking",
      data: {
        bookingId,
        cafeId: bookingData.cafeId,
      },
    });
  } catch (notifErr) {
    console.warn("Could not create cancel notification:", notifErr);
  }
}
