import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Platform } from "react-native";
import { router } from "expo-router";

import { db } from "../firebase/config";

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register device for push notifications and get the Expo push token.
 */
export async function registerForPushNotificationsAsync(
  userId?: string,
): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === "web") {
    // Web notifications handled differently in standard browsers
    return null;
  }

  try {
    // 1. Android notification channel configuration (use default system sound)
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("caffora_bookings", {
        name: "Caffora Bookings & Updates",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#B95E2E",
        enableVibrate: true,
      });
    }

    // 2. Check and request notification permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    // 3. Obtain the Expo push token
    // Validate UUID format so invalid placeholder strings don't cause 400 errors
    const rawProjectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    const isUuid = (val?: string): boolean =>
      typeof val === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());

    const projectId = isUuid(rawProjectId) ? rawProjectId.trim() : undefined;

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined,
      );
      token = tokenData?.data || null;
    } catch {
      // In development or when projectId is not linked, continue gracefully without breaking app
      token = null;
    }

    // 4. Save token to user profile if user is authenticated
    if (token && userId) {
      await savePushTokenToProfile(userId, token);
    }
  } catch (error: any) {
    // Graceful fallback (e.g. simulator without APNs or Expo Go constraints)
    console.warn("registerForPushNotifications warning:", error?.message || error);
  }

  return token;
}

/**
 * Save user's Expo push token to their Firestore user document.
 */
export async function savePushTokenToProfile(
  userId: string,
  token: string,
): Promise<void> {
  try {
    if (!userId || !token) return;

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      pushToken: token,
      pushTokenUpdatedAt: serverTimestamp(),
      platform: Platform.OS,
    });
  } catch (error) {
    console.warn("savePushTokenToProfile warning:", error);
  }
}

/**
 * Schedule or display a local notification immediately (useful for in-app status alerts).
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
): Promise<string | null> {
  try {
    if (Platform.OS === "web") return null;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null, // triggers immediately
    });
  } catch (error) {
    console.warn("sendLocalNotification warning:", error);
    return null;
  }
}

/**
 * Attach notification response listener to handle tapping on incoming notifications.
 * Routes directly to the relevant booking or notification screen.
 */
export function setupNotificationResponseListener(): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      try {
        const data = response.notification.request.content.data;
        const bId = data && typeof data.bookingId === "string" ? data.bookingId : null;
        if (bId) {
          router.push({
            pathname: "/modal/booking-details",
            params: { bookingId: bId },
          });
        } else {
          router.push("/profile/notifications");
        }
      } catch (err) {
        console.warn("Notification response handling error:", err);
      }
    },
  );

  return () => {
    subscription.remove();
  };
}
