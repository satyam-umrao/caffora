import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth } from "../../src/services/firebase/config";
import {
  clearAllNotifications,
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToUserNotifications,
} from "../../src/services/firebase/notifications";
import { getUserProfile } from "../../src/services/firebase/users";
import type { AppNotification } from "../../src/types/database";
import { useTheme } from "../../src/context/ThemeContext";

export default function NotificationsScreen() {
  const { colors, isDark } = useTheme();
  const currentUser = auth.currentUser;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(Boolean(currentUser));
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState<string>("customer");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!currentUser) return;

    // Load role to handle smart routing
    getUserProfile(currentUser.uid)
      .then((profile) => {
        if (profile?.role) {
          setUserRole(profile.role);
        }
      })
      .catch(() => {});

    const unsubscribe = subscribeToUserNotifications(
      currentUser.uid,
      (list) => {
        setNotifications(list);
        setLoading(false);
        setRefreshing(false);
      },
      (err) => {
        console.error("Notifications listener error:", err);
        setErrorMsg("Failed to load live notifications.");
        setLoading(false);
        setRefreshing(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const onRefresh = () => {
    setRefreshing(true);
    // Realtime listener handles updates; this simulates manual pull feedback
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    try {
      await markAllNotificationsAsRead(currentUser.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      Alert.alert("Error", "Could not mark notifications as read.");
    }
  };

  const handleClearAll = () => {
    if (!currentUser || notifications.length === 0) return;

    Alert.alert(
      "Clear All Notifications?",
      "Are you sure you want to delete all notifications? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllNotifications(currentUser.uid);
              setNotifications([]);
            } catch {
              Alert.alert("Error", "Could not clear notifications.");
            }
          },
        },
      ],
    );
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (!currentUser) return;

    Alert.alert(
      "Delete Notification",
      "Remove this notification from your list?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteNotification(currentUser.uid, notificationId);
              setNotifications((prev) =>
                prev.filter((n) => n.id !== notificationId),
              );
            } catch {
              Alert.alert("Error", "Could not delete notification.");
            }
          },
        },
      ],
    );
  };

  const handleNotificationPress = async (item: AppNotification) => {
    if (!currentUser) return;

    // Mark as read immediately
    if (!item.read) {
      await markNotificationAsRead(currentUser.uid, item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
      );
    }

    const bookingId = item.data?.bookingId;
    const cafeId = item.data?.cafeId;

    if (bookingId) {
      if (userRole === "cafe_owner") {
        router.push("/(owner)/bookings");
      } else {
        router.push({
          pathname: "/modal/booking-details",
          params: { bookingId },
        });
      }
    } else if (cafeId) {
      router.push(`/cafe/${cafeId}` as any);
    } else if (item.type === "booking") {
      if (userRole === "cafe_owner") {
        router.push("/(owner)/bookings");
      } else {
        router.push("/booking/history");
      }
    }
  };

  const renderNotificationItem = ({ item }: { item: AppNotification }) => {
    const formattedDate = item.createdAt?.seconds
      ? new Date(item.createdAt.seconds * 1000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Recently";

    const isBooking = item.type === "booking";
    const isPromo = item.type === "promo";

    return (
      <Pressable
        onPress={() => handleNotificationPress(item)}
        style={{
          backgroundColor: item.read ? colors.surface : colors.cardAlt,
          borderColor: item.read ? colors.border : colors.primary,
        }}
        className="mb-3 flex-row items-start rounded-2xl border p-4 shadow-sm"
      >
        {/* Icon based on notification type */}
        <View
          style={{
            backgroundColor: isBooking
              ? isDark ? "#17341E" : "#EBF7EE"
              : isPromo
              ? colors.chip
              : isDark ? "#2A1B3D" : "#F3EEFA",
          }}
          className="h-11 w-11 items-center justify-center rounded-xl"
        >
          <Ionicons
            name={
              isBooking
                ? "calendar"
                : isPromo
                ? "sparkles"
                : "notifications"
            }
            size={20}
            color={
              isBooking
                ? "#2E7A3A"
                : isPromo
                ? colors.primary
                : "#7B519D"
            }
          />
        </View>

        {/* Content */}
        <View className="ml-3.5 flex-1">
          <View className="flex-row items-center justify-between">
            <Text
              style={{
                color: item.read ? colors.text : colors.primary,
              }}
              className={`text-sm ${
                item.read ? "font-bold" : "font-extrabold"
              }`}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {!item.read && (
              <View
                style={{ backgroundColor: colors.primary }}
                className="h-2 w-2 rounded-full ml-1"
              />
            )}
          </View>

          <Text
            style={{ color: colors.textSecondary }}
            className="mt-1 text-xs leading-relaxed"
          >
            {item.message}
          </Text>

          <View className="mt-2.5 flex-row items-center justify-between">
            <Text
              style={{ color: colors.muted }}
              className="text-[10px]"
            >
              {formattedDate}
            </Text>

            <Pressable
              onPress={() => handleDeleteNotification(item.id)}
              hitSlop={8}
              className="p-1"
            >
              <Ionicons
                name="trash-outline"
                size={14}
                color={colors.muted}
              />
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.background }}
      className="flex-1"
      edges={["top"]}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }}
        className="flex-row items-center justify-between px-5 pb-3 pt-2 border-b"
      >
        <Pressable
          onPress={() => router.back()}
          style={{ backgroundColor: colors.cardAlt }}
          className="h-10 w-10 items-center justify-center rounded-full"
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>

        <View className="items-center">
          <Text
            style={{ color: colors.text }}
            className="text-base font-extrabold"
          >
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Text
              style={{ color: colors.primary }}
              className="text-[10px] font-bold"
            >
              {unreadCount} unread
            </Text>
          )}
        </View>

        <View className="flex-row items-center gap-2">
          {unreadCount > 0 && (
            <Pressable onPress={handleMarkAllRead}>
              <Text
                style={{ color: colors.primary }}
                className="text-xs font-bold"
              >
                Mark all read
              </Text>
            </Pressable>
          )}

          {notifications.length > 0 && (
            <Pressable
              onPress={handleClearAll}
              style={{ backgroundColor: colors.cardAlt }}
              className="h-8 w-8 items-center justify-center rounded-full ml-1"
              hitSlop={6}
            >
              <Ionicons name="trash-outline" size={16} color={colors.muted} />
            </Pressable>
          )}

          {notifications.length === 0 && <View className="w-10" />}
        </View>
      </View>

      {/* Body */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : errorMsg ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={44} color="#D95445" />
          <Text
            style={{ color: colors.text }}
            className="mt-3 text-base font-bold text-center"
          >
            {errorMsg}
          </Text>
          <Pressable
            onPress={onRefresh}
            style={{ backgroundColor: colors.primary }}
            className="mt-4 rounded-xl px-5 py-2.5"
          >
            <Text className="text-white font-bold text-xs">Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
            paddingTop: 16,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="items-center rounded-3xl border p-8 mt-6"
            >
              <View
                style={{ backgroundColor: colors.chip }}
                className="h-16 w-16 items-center justify-center rounded-2xl"
              >
                <Ionicons
                  name="notifications-outline"
                  size={32}
                  color={colors.primary}
                />
              </View>

              <Text
                style={{ color: colors.text }}
                className="mt-4 text-lg font-black"
              >
                {"You're all caught up!"}
              </Text>

              <Text
                style={{ color: colors.muted }}
                className="mt-1 text-center text-xs leading-relaxed"
              >
                Booking updates, confirmations, table passes, and owner messages will appear here in real time.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
