"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendExpoPushNotification = sendExpoPushNotification;
const expo_server_sdk_1 = require("expo-server-sdk");
const expo = new expo_server_sdk_1.Expo();
/**
 * Dispatch an Expo push notification to a device token.
 */
async function sendExpoPushNotification(payload) {
    if (!expo_server_sdk_1.Expo.isExpoPushToken(payload.toToken)) {
        console.warn(`[Push] Invalid Expo push token: ${payload.toToken}`);
        return null;
    }
    const message = {
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
    }
    catch (error) {
        console.error("[Push] Error dispatching push notification:", error);
    }
    return null;
}
//# sourceMappingURL=expoPush.js.map