import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";

const expo = new Expo();

export interface PushPayload {
  toToken: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: "default" | null;
  badge?: number;
}

/**
 * Dispatch an Expo push notification to a device token.
 */
export async function sendExpoPushNotification(
  payload: PushPayload,
): Promise<ExpoPushTicket | null> {
  if (!Expo.isExpoPushToken(payload.toToken)) {
    console.warn(`[Push] Invalid Expo push token: ${payload.toToken}`);
    return null;
  }

  const message: ExpoPushMessage = {
    to: payload.toToken,
    sound: payload.sound || "default",
    title: payload.title,
    body: payload.body,
    data: payload.data || {},
    badge: payload.badge,
    channelId: "caffora_bookings",
  };

  try {
    const chunks = expo.chunkPushNotifications([message]);
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      return ticketChunk[0] || null;
    }
  } catch (error) {
    console.error("[Push] Error dispatching push notification:", error);
  }

  return null;
}
