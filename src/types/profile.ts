export type ThemeMode = "light" | "dark" | "system";

export type UserRole = "customer" | "cafe_owner";

export type UserPreferences = {
  notifications: boolean;
  bookingReminders: boolean;
  promotions: boolean;
  locationServices: boolean;
  hapticFeedback: boolean;
  theme?: ThemeMode;
};

export type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  businessName?: string;
  photoURL?: string;
  bio?: string;
  city?: string;
  preferences?: UserPreferences;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type UpdateUserProfileInput = {
  displayName?: string;
  phoneNumber?: string;
  businessName?: string;
  photoURL?: string;
  bio?: string;
  city?: string;
};
