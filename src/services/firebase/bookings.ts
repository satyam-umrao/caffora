import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Unsubscribe,
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

/**
 * Helper to parse various booking date and time formats into a JS Date object.
 */
export function parseBookingDateTime(
  dateStr?: string,
  timeStr?: string,
): Date | null {
  if (!dateStr) return null;
  const trimmedDate = String(dateStr).trim();
  const trimmedTime = timeStr ? String(timeStr).trim() : "";

  // 1. Try directly with combined string
  if (trimmedTime) {
    const direct = new Date(`${trimmedDate} ${trimmedTime}`);
    if (!isNaN(direct.getTime())) return direct;

    // 2. Remove leading weekday name: 'Tue, Nov 10, 2026' -> 'Nov 10, 2026'
    const withoutWeekday = trimmedDate.replace(/^[A-Za-z]+,\s*/, "");
    const tryWithoutWeekday = new Date(`${withoutWeekday} ${trimmedTime}`);
    if (!isNaN(tryWithoutWeekday.getTime())) return tryWithoutWeekday;

    // 3. Extract 12-hour AM/PM: e.g. '05:30 PM'
    const timeMatch = trimmedTime.match(/(\d{1,2}):(\d{2})(?:\s*([APap][Mm]))?/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const modifier = timeMatch[3] ? timeMatch[3].toUpperCase() : null;
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      let baseDate = new Date(trimmedDate);
      if (isNaN(baseDate.getTime())) {
        baseDate = new Date(withoutWeekday);
      }
      if (!isNaN(baseDate.getTime())) {
        baseDate.setHours(hours, minutes, 0, 0);
        return baseDate;
      }
    }
  }

  // 4. Fallback: date only (passes when end of day is reached)
  let baseDate = new Date(trimmedDate);
  if (isNaN(baseDate.getTime())) {
    baseDate = new Date(trimmedDate.replace(/^[A-Za-z]+,\s*/, ""));
  }
  if (!isNaN(baseDate.getTime())) {
    baseDate.setHours(23, 59, 59, 999);
    return baseDate;
  }

  return null;
}

/**
 * Checks whether a booking date/time has passed the current moment.
 */
export function isBookingPassed(dateStr?: string, timeStr?: string): boolean {
  const bookingDate = parseBookingDateTime(dateStr, timeStr);
  if (!bookingDate) return false;
  return bookingDate.getTime() < Date.now();
}

/**
 * Computes the real-time effective status of a booking.
 * Preserves pending, on_hold, and rejected states accurately.
 */
export function getEffectiveBookingStatus(booking: Booking): BookingStatus {
  if (booking.status === "cancelled") {
    return "cancelled";
  }
  if (booking.status === "rejected") {
    return "rejected";
  }
  if (booking.status === "pending") {
    return "pending";
  }
  if (booking.status === "on_hold") {
    return "on_hold";
  }
  if (booking.status === "completed") {
    return "completed";
  }
  if (booking.status === "confirmed") {
    if (isBookingPassed(booking.date, booking.time)) {
      return "completed";
    }
    return "confirmed";
  }
  return booking.status;
}

function mapBooking(id: string, data: Record<string, any>): Booking {
  const rawStatus = (data.status as BookingStatus) || "pending";
  const date = data.date || data.bookingDate || "";
  const time = data.time || data.timeSlot || "";
  const guests =
    typeof data.guests === "number"
      ? data.guests
      : typeof data.guestCount === "number"
      ? data.guestCount
      : Number(data.guests ?? data.guestCount ?? 2);

  let status: BookingStatus = rawStatus;
  if (rawStatus === "confirmed" && isBookingPassed(date, time)) {
    status = "completed";
  }

  return {
    id,
    bookingCode: data.bookingCode ?? `CF-${id.slice(0, 5).toUpperCase()}`,
    cafeId: data.cafeId ?? "",
    ownerId: data.ownerId || undefined,
    cafeName: data.cafeName ?? "Cafe Reservation",
    cafeImage: data.cafeImage || "",
    cafeLocation: data.cafeLocation || "",
    cafeCity: data.cafeCity || "",
    userId: data.userId || data.customerId || "",
    customerId: data.customerId || data.userId || "",
    userName: data.userName ?? "Guest",
    userEmail: data.userEmail ?? "",
    userPhone: data.userPhone || "",
    date,
    bookingDate: date,
    time,
    timeSlot: time,
    guests,
    guestCount: guests,
    seatingPreference: data.seatingPreference || "No Preference",
    specialRequests: data.specialRequests || "",
    status,
    ownerNote: data.ownerNote,
    cancellationReason: data.cancellationReason,
    cancelledAt: data.cancelledAt,
    respondedAt: data.respondedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/**
 * Generate a clean 5-digit confirmation reference: e.g. CF-49182
 */
function generateBookingCode(): string {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `CF-${randomDigits}`;
}

/**
 * Create a new customer table reservation request in Firestore (`bookings/{bookingId}`).
 * Initial status is strictly "pending".
 * Enforces backend validations:
 * - Date/time cannot be in the past
 * - Cafe must be active and not manually marked closed
 * - Trusted ownerId resolution from cafe document (anti-impersonation)
 * - Anti-duplicate booking protection for same slot
 * - Seating capacity validation
 * - Automatic owner and customer notifications
 */
export async function createBooking(
  input: CreateBookingInput,
): Promise<Booking> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("LOGIN_REQUIRED: Please sign in to create a booking.");
  }

  const cafeId = input.cafeId?.trim();
  const bookingDate = (input.bookingDate || input.date || "").trim();
  const timeSlot = (input.timeSlot || input.time || "").trim();
  const guestCount = Number(input.guestCount ?? input.guests ?? 2);

  if (!cafeId) throw new Error("MISSING_CAFE_ID: A valid café must be selected.");
  if (!bookingDate) throw new Error("MISSING_DATE: Please select a booking date.");
  if (!timeSlot) throw new Error("MISSING_TIME: Please select a time slot.");
  if (isNaN(guestCount) || guestCount < 1)
    throw new Error("INVALID_GUEST_COUNT: Party size must be at least 1.");

  // 1. Prevent booking in the past
  if (isBookingPassed(bookingDate, timeSlot)) {
    throw new Error(
      "PAST_DATETIME: Cannot book a table in the past. Please select an upcoming date and time.",
    );
  }

  // 2. Fetch trusted Café details from Firestore
  const cafeRef = doc(db, "cafes", cafeId);
  const cafeDoc = await getDoc(cafeRef);
  if (!cafeDoc.exists()) {
    throw new Error("CAFE_NOT_FOUND: The requested café does not exist.");
  }

  const cafeData = cafeDoc.data();

  // Validate café active listing
  if (cafeData.isActive === false) {
    throw new Error(
      "CAFE_INACTIVE: This café is currently unlisted and not accepting reservations.",
    );
  }

  // Validate café open status
  if (cafeData.isOpen === false) {
    throw new Error(
      "CAFE_CLOSED: This café is temporarily marked closed by the owner.",
    );
  }

  // Trusted ownerId resolution directly from the cafe document
  const cafeOwnerId = cafeData.ownerId || null;
  const seatingCapacity = Number(cafeData.seatingCapacity) || 40;

  // 3. Prevent duplicate active requests from same customer for same cafe, date & time
  const bookingsRef = collection(db, "bookings");
  const userBookingsQ = query(
    bookingsRef,
    where("userId", "==", currentUser.uid),
    where("cafeId", "==", cafeId),
    where("date", "==", bookingDate),
  );
  const userExistingSnap = await getDocs(userBookingsQ);
  const hasDuplicate = userExistingSnap.docs.some((d) => {
    const data = d.data();
    const isSameTime = data.time === timeSlot || data.timeSlot === timeSlot;
    const isStillActive =
      data.status === "pending" ||
      data.status === "confirmed" ||
      data.status === "on_hold";
    return isSameTime && isStillActive;
  });

  if (hasDuplicate) {
    throw new Error(
      `DUPLICATE_BOOKING: You already have an active reservation request for this café on ${bookingDate} at ${timeSlot}.`,
    );
  }

  // 4. Trusted Capacity Check
  const slotBookingsQ = query(
    bookingsRef,
    where("cafeId", "==", cafeId),
    where("date", "==", bookingDate),
  );
  const slotSnap = await getDocs(slotBookingsQ);

  const currentlyReserved = slotSnap.docs
    .map((d) => d.data())
    .filter((d) => {
      const slotMatch = d.time === timeSlot || d.timeSlot === timeSlot;
      const statusActive =
        d.status === "confirmed" ||
        d.status === "pending" ||
        d.status === "on_hold";
      return slotMatch && statusActive;
    })
    .reduce(
      (sum, d) => sum + (Number(d.guests || d.guestCount) || 0),
      0,
    );

  if (currentlyReserved + guestCount > seatingCapacity) {
    const seatsLeft = Math.max(0, seatingCapacity - currentlyReserved);
    throw new Error(
      `CAPACITY_EXCEEDED: Requested seats (${guestCount}) exceed remaining capacity for ${timeSlot}. Only ${seatsLeft} seats remaining.`,
    );
  }

  // 5. Create new booking document with initial status "pending"
  const newDocRef = doc(bookingsRef);
  const bookingCode = generateBookingCode();

  const bookingData = {
    bookingCode,
    cafeId,
    ownerId: cafeOwnerId,
    cafeName: cafeData.name || input.cafeName || "Café Reservation",
    cafeImage:
      (cafeData.images && cafeData.images[0]) ||
      cafeData.image ||
      input.cafeImage ||
      "",
    cafeLocation: cafeData.location || input.cafeLocation || "",
    cafeCity: cafeData.city || input.cafeCity || "",
    userId: currentUser.uid,
    customerId: currentUser.uid,
    userName: input.userName || currentUser.displayName || "Guest",
    userEmail: input.userEmail || currentUser.email || "",
    userPhone: input.userPhone || currentUser.phoneNumber || "",
    date: bookingDate,
    bookingDate,
    time: timeSlot,
    timeSlot,
    guests: guestCount,
    guestCount,
    seatingPreference: input.seatingPreference || "No Preference",
    specialRequests: input.specialRequests || "",
    status: "pending" as BookingStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(newDocRef, bookingData);

  // 6. Notify Owner Automatically
  if (cafeOwnerId) {
    try {
      await createNotification(cafeOwnerId, {
        title: "New Booking Request 🛎️",
        message: `${bookingData.userName} requested a table for ${guestCount} guests on ${bookingDate} at ${timeSlot}. Ref: ${bookingCode}`,
        type: "booking",
        data: {
          bookingId: newDocRef.id,
          cafeId,
          bookingCode,
        },
      });
    } catch (notifErr) {
      console.warn("Could not create owner notification:", notifErr);
    }
  }

  // 7. Notify Customer that request is pending
  try {
    await createNotification(currentUser.uid, {
      title: "Booking Request Submitted ⏳",
      message: `Your table request for ${guestCount} at ${bookingData.cafeName} on ${bookingDate} at ${timeSlot} is pending confirmation from the café owner. Ref: ${bookingCode}`,
      type: "booking",
      data: {
        bookingId: newDocRef.id,
        cafeId,
        bookingCode,
      },
    });
  } catch (notifErr) {
    console.warn("Could not create customer notification:", notifErr);
  }

  return {
    id: newDocRef.id,
    ...bookingData,
    createdAt: new Date(),
    updatedAt: new Date(),
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

    const bookings = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const booking = mapBooking(docSnap.id, data);
      if (data.status === "confirmed" && booking.status === "completed") {
        updateDoc(docSnap.ref, { status: "completed" }).catch(() => {});
      }
      return booking;
    });

    bookings.sort((a, b) => {
      const timeA = (a.createdAt as any)?.seconds
        ? (a.createdAt as any).seconds * 1000
        : 0;
      const timeB = (b.createdAt as any)?.seconds
        ? (b.createdAt as any).seconds * 1000
        : 0;
      return timeB - timeA;
    });

    return bookings;
  } catch (error: any) {
    console.warn("getUserBookings warning:", error?.message || error);
    return [];
  }
}

/**
 * Subscribe to real-time updates for a user's bookings.
 */
export function subscribeToUserBookings(
  userId: string,
  onUpdate: (bookings: Booking[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const bookingsRef = collection(db, "bookings");
  const q = query(bookingsRef, where("userId", "==", userId), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const bookings = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const booking = mapBooking(docSnap.id, data);
        if (data.status === "confirmed" && booking.status === "completed") {
          updateDoc(docSnap.ref, { status: "completed" }).catch(() => {});
        }
        return booking;
      });

      bookings.sort((a, b) => {
        const timeA = (a.createdAt as any)?.seconds
          ? (a.createdAt as any).seconds * 1000
          : 0;
        const timeB = (b.createdAt as any)?.seconds
          ? (b.createdAt as any).seconds * 1000
          : 0;
        return timeB - timeA;
      });

      onUpdate(bookings);
    },
    (err) => {
      console.warn("subscribeToUserBookings error:", err);
      if (onError) onError(err);
    },
  );
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

    const data = snapshot.data();
    const booking = mapBooking(snapshot.id, data);
    if (data.status === "confirmed" && booking.status === "completed") {
      updateDoc(bookingRef, { status: "completed" }).catch(() => {});
    }
    return booking;
  } catch (error) {
    console.warn("getBookingById warning:", error);
    return null;
  }
}

/**
 * Subscribe to real-time updates for a single booking.
 */
export function subscribeToBooking(
  bookingId: string,
  onUpdate: (booking: Booking | null) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!bookingId) {
    onUpdate(null);
    return () => {};
  }

  const bookingRef = doc(db, "bookings", bookingId);

  return onSnapshot(
    bookingRef,
    (docSnap) => {
      if (!docSnap.exists()) {
        onUpdate(null);
        return;
      }
      const data = docSnap.data();
      const booking = mapBooking(docSnap.id, data);
      if (data.status === "confirmed" && booking.status === "completed") {
        updateDoc(bookingRef, { status: "completed" }).catch(() => {});
      }
      onUpdate(booking);
    },
    (err) => {
      console.warn("subscribeToBooking error:", err);
      if (onError) onError(err);
    },
  );
}

/**
 * Cancel a user's booking (pending, on_hold, or confirmed).
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
  if (bookingData.userId !== currentUser.uid && bookingData.customerId !== currentUser.uid) {
    throw new Error("UNAUTHORIZED");
  }

  await updateDoc(bookingRef, {
    status: "cancelled",
    cancellationReason: reason,
    cancelledAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Notify customer
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

  // Notify owner if present
  if (bookingData.ownerId) {
    try {
      await createNotification(bookingData.ownerId, {
        title: "Reservation Cancelled by Guest",
        message: `${bookingData.userName} cancelled their reservation at ${bookingData.cafeName} for ${bookingData.date} at ${bookingData.time}.`,
        type: "booking",
        data: {
          bookingId,
          cafeId: bookingData.cafeId,
        },
      });
    } catch (notifErr) {
      console.warn("Could not notify owner of cancellation:", notifErr);
    }
  }
}

/**
 * Fetch all reservations for cafes owned by the authenticated owner.
 */
export async function getOwnerBookings(ownerId: string): Promise<Booking[]> {
  try {
    if (!ownerId) return [];

    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("ownerId", "==", ownerId), limit(150));
    const snapshot = await getDocs(q);

    const bookings = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const booking = mapBooking(docSnap.id, data);
      if (data.status === "confirmed" && booking.status === "completed") {
        updateDoc(docSnap.ref, { status: "completed" }).catch(() => {});
      }
      return booking;
    });

    bookings.sort((a, b) => {
      const timeA = (a.createdAt as any)?.seconds
        ? (a.createdAt as any).seconds * 1000
        : 0;
      const timeB = (b.createdAt as any)?.seconds
        ? (b.createdAt as any).seconds * 1000
        : 0;
      return timeB - timeA;
    });

    return bookings;
  } catch (error: any) {
    console.warn("getOwnerBookings warning:", error?.message || error);
    return [];
  }
}

/**
 * Subscribe in real time to all bookings for cafes owned by the authenticated owner.
 */
export function subscribeToOwnerBookings(
  ownerId: string,
  onUpdate: (bookings: Booking[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!ownerId) {
    onUpdate([]);
    return () => {};
  }

  const bookingsRef = collection(db, "bookings");
  const q = query(bookingsRef, where("ownerId", "==", ownerId), limit(150));

  return onSnapshot(
    q,
    (snapshot) => {
      const bookings = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const booking = mapBooking(docSnap.id, data);
        if (data.status === "confirmed" && booking.status === "completed") {
          updateDoc(docSnap.ref, { status: "completed" }).catch(() => {});
        }
        return booking;
      });

      bookings.sort((a, b) => {
        const timeA = (a.createdAt as any)?.seconds
          ? (a.createdAt as any).seconds * 1000
          : 0;
        const timeB = (b.createdAt as any)?.seconds
          ? (b.createdAt as any).seconds * 1000
          : 0;
        return timeB - timeA;
      });

      onUpdate(bookings);
    },
    (err) => {
      console.warn("subscribeToOwnerBookings error:", err);
      if (onError) onError(err);
    },
  );
}

/**
 * Helper to compute live seating utilization for an owner's café at a specific date and time slot.
 */
export async function getSlotCapacityInfo(
  cafeId: string,
  date: string,
  timeSlot: string,
  seatingCapacity: number,
): Promise<{ confirmedSeats: number; pendingSeats: number; remainingSeats: number }> {
  try {
    const bookingsRef = collection(db, "bookings");
    const q = query(
      bookingsRef,
      where("cafeId", "==", cafeId),
      where("date", "==", date),
    );
    const snap = await getDocs(q);

    let confirmedSeats = 0;
    let pendingSeats = 0;

    snap.docs.forEach((d) => {
      const data = d.data();
      const isSlot = data.time === timeSlot || data.timeSlot === timeSlot;
      if (isSlot) {
        const guests = Number(data.guests || data.guestCount) || 0;
        if (data.status === "confirmed") {
          confirmedSeats += guests;
        } else if (data.status === "pending" || data.status === "on_hold") {
          pendingSeats += guests;
        }
      }
    });

    const remainingSeats = Math.max(0, seatingCapacity - confirmedSeats);
    return { confirmedSeats, pendingSeats, remainingSeats };
  } catch (err) {
    console.warn("getSlotCapacityInfo error:", err);
    return { confirmedSeats: 0, pendingSeats: 0, remainingSeats: seatingCapacity };
  }
}

/**
 * Café Owner Action: Accept booking request.
 * Runs an atomic Firestore transaction to:
 * - Verify owner authorization
 * - Validate valid transition (pending/on_hold -> confirmed)
 * - Check exact slot capacity against café's seating capacity
 * - Commit status change to confirmed
 * - Automatically notify customer
 */
export async function acceptBooking(
  bookingId: string,
  ownerId: string,
  note?: string,
): Promise<void> {
  if (!bookingId || !ownerId) {
    throw new Error("UNAUTHORIZED: Missing booking or owner verification.");
  }

  const bookingRef = doc(db, "bookings", bookingId);
  let acceptedBookingData: any = null;

  await runTransaction(db, async (transaction) => {
    const bookingSnap = await transaction.get(bookingRef);
    if (!bookingSnap.exists()) {
      throw new Error("BOOKING_NOT_FOUND: The requested reservation could not be found.");
    }

    const bookingData = bookingSnap.data();

    // 1. Verify owner authorization
    if (bookingData.ownerId !== ownerId) {
      throw new Error("FORBIDDEN: You do not have permission to manage this booking.");
    }

    // 2. Validate valid transition
    if (bookingData.status !== "pending" && bookingData.status !== "on_hold") {
      throw new Error(
        `INVALID_TRANSITION: Cannot accept reservation currently marked "${bookingData.status}".`,
      );
    }

    // 3. Read café document
    const cafeRef = doc(db, "cafes", bookingData.cafeId);
    const cafeSnap = await transaction.get(cafeRef);
    const seatingCapacity = cafeSnap.exists()
      ? Number(cafeSnap.data().seatingCapacity) || 40
      : 40;

    // 4. Query slot capacity for already confirmed bookings
    const bookingDate = bookingData.date || bookingData.bookingDate;
    const timeSlot = bookingData.time || bookingData.timeSlot;
    const requestedGuests = Number(bookingData.guests || bookingData.guestCount) || 2;

    const bookingsRef = collection(db, "bookings");
    const confirmedQ = query(
      bookingsRef,
      where("cafeId", "==", bookingData.cafeId),
      where("date", "==", bookingDate),
    );
    const slotSnap = await getDocs(confirmedQ);

    const alreadyConfirmedSeats = slotSnap.docs
      .filter((d) => d.id !== bookingId)
      .map((d) => d.data())
      .filter((d) => {
        const isSlot = d.time === timeSlot || d.timeSlot === timeSlot;
        return isSlot && d.status === "confirmed";
      })
      .reduce((sum, d) => sum + (Number(d.guests || d.guestCount) || 0), 0);

    if (alreadyConfirmedSeats + requestedGuests > seatingCapacity) {
      const remaining = Math.max(0, seatingCapacity - alreadyConfirmedSeats);
      throw new Error(
        `CAPACITY_EXCEEDED: Cannot accept booking. Party size of ${requestedGuests} exceeds available capacity (${remaining} seats remaining of ${seatingCapacity} total).`,
      );
    }

    // 5. Commit status update
    transaction.update(bookingRef, {
      status: "confirmed",
      ownerNote: note ? note.trim() : bookingData.ownerNote || "",
      respondedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    acceptedBookingData = bookingData;
  });

  // 6. Notify Customer
  if (acceptedBookingData) {
    try {
      await createNotification(acceptedBookingData.userId, {
        title: "Reservation Confirmed! 🎉",
        message: `Your table for ${acceptedBookingData.guests} at ${acceptedBookingData.cafeName} on ${acceptedBookingData.date} at ${acceptedBookingData.time} is confirmed! Ref: ${acceptedBookingData.bookingCode}`,
        type: "booking",
        data: {
          bookingId,
          cafeId: acceptedBookingData.cafeId,
          bookingCode: acceptedBookingData.bookingCode,
        },
      });
    } catch (notifErr) {
      console.warn("Could not notify customer of acceptance:", notifErr);
    }
  }
}

/**
 * Café Owner Action: Hold booking request.
 * Allows café owner to temporarily place booking on hold with an explanation.
 */
export async function holdBooking(
  bookingId: string,
  ownerId: string,
  note?: string,
): Promise<void> {
  if (!bookingId || !ownerId) {
    throw new Error("UNAUTHORIZED");
  }

  const bookingRef = doc(db, "bookings", bookingId);
  const snap = await getDoc(bookingRef);
  if (!snap.exists()) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  const data = snap.data();
  if (data.ownerId !== ownerId) {
    throw new Error("FORBIDDEN: You do not have permission to manage this booking.");
  }

  if (data.status !== "pending" && data.status !== "on_hold") {
    throw new Error(
      `INVALID_TRANSITION: Cannot place reservation on hold from current status "${data.status}".`,
    );
  }

  const holdNote = note
    ? note.trim()
    : "The café owner placed your request on hold while managing table capacity.";

  await updateDoc(bookingRef, {
    status: "on_hold",
    ownerNote: holdNote,
    respondedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Notify Customer
  try {
    await createNotification(data.userId, {
      title: "Reservation On Hold ⏳",
      message: `Your booking at ${data.cafeName} for ${data.date} at ${data.time} is on hold: ${holdNote}`,
      type: "booking",
      data: {
        bookingId,
        cafeId: data.cafeId,
        bookingCode: data.bookingCode,
      },
    });
  } catch (notifErr) {
    console.warn("Could not notify customer of hold status:", notifErr);
  }
}

/**
 * Café Owner Action: Reject booking request.
 * Sets status to rejected with reason and notifies customer.
 */
export async function rejectBooking(
  bookingId: string,
  ownerId: string,
  reason?: string,
): Promise<void> {
  if (!bookingId || !ownerId) {
    throw new Error("UNAUTHORIZED");
  }

  const bookingRef = doc(db, "bookings", bookingId);
  const snap = await getDoc(bookingRef);
  if (!snap.exists()) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  const data = snap.data();
  if (data.ownerId !== ownerId) {
    throw new Error("FORBIDDEN: You do not have permission to manage this booking.");
  }

  if (data.status !== "pending" && data.status !== "on_hold") {
    throw new Error(
      `INVALID_TRANSITION: Cannot reject reservation with current status "${data.status}".`,
    );
  }

  const rejectReason = reason
    ? reason.trim()
    : "Table unavailable for the requested slot.";

  await updateDoc(bookingRef, {
    status: "rejected",
    ownerNote: rejectReason,
    respondedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Notify Customer
  try {
    await createNotification(data.userId, {
      title: "Reservation Request Declined ❌",
      message: `Your table request at ${data.cafeName} on ${data.date} at ${data.time} could not be accommodated: ${rejectReason}`,
      type: "booking",
      data: {
        bookingId,
        cafeId: data.cafeId,
        bookingCode: data.bookingCode,
      },
    });
  } catch (notifErr) {
    console.warn("Could not notify customer of rejection:", notifErr);
  }
}
