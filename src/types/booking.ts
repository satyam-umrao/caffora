export type BookingStatus = "confirmed" | "completed" | "cancelled";

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
  cafeName: string;
  cafeImage?: string;
  cafeLocation?: string;
  cafeCity?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  date: string;
  time: string;
  guests: number;
  seatingPreference?: SeatingPreference | string;
  specialRequests?: string;
  status: BookingStatus;
  cancellationReason?: string;
  cancelledAt?: unknown;
  createdAt?: unknown;
};

export type CreateBookingInput = {
  cafeId: string;
  cafeName: string;
  cafeImage?: string;
  cafeLocation?: string;
  cafeCity?: string;
  date: string;
  time: string;
  guests: number;
  seatingPreference?: string;
  specialRequests?: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
};
