export type BookingStatus =
  | "pending"
  | "confirmed"
  | "on_hold"
  | "rejected"
  | "completed"
  | "cancelled";

export type SeatingPreference =
  | "Indoor"
  | "Outdoor"
  | "Window"
  | "Quiet Corner"
  | "No Preference";

export type Booking = {
  id: string;
  bookingCode: string;
  cafeId: string;
  ownerId?: string | null;
  cafeName: string;
  cafeImage?: string;
  cafeLocation?: string;
  cafeCity?: string;
  userId: string;
  customerId?: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  date: string;
  bookingDate?: string;
  time: string;
  timeSlot?: string;
  guests: number;
  guestCount?: number;
  seatingPreference?: SeatingPreference | string;
  specialRequests?: string;
  status: BookingStatus;
  ownerNote?: string;
  cancellationReason?: string;
  cancelledAt?: unknown;
  respondedAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type CreateBookingInput = {
  cafeId: string;
  ownerId?: string | null;
  cafeName: string;
  cafeImage?: string;
  cafeLocation?: string;
  cafeCity?: string;
  date: string;
  bookingDate?: string;
  time: string;
  timeSlot?: string;
  guests: number;
  guestCount?: number;
  seatingPreference?: string;
  specialRequests?: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
};
