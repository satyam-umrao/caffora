export type UserPreferences = {
  notifications: boolean;
  bookingReminders: boolean;
  promotions: boolean;
  locationServices: boolean;
  hapticFeedback: boolean;
};

export type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
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
  photoURL?: string;
  bio?: string;
  city?: string;
};
