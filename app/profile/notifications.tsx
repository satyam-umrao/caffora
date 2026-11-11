import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth } from "../../src/services/firebase/config";
import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../src/services/firebase/notifications";
import type { AppNotification } from "../../src/types/database";
import { useTheme } from "../../src/context/ThemeContext";

export default function NotificationsScreen() {
  const { colors, isDark } = useTheme();
  const currentUser = auth.currentUser;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const list = await getUserNotifications(currentUser.uid);
      setNotifications(list);
    } catch (err) {
      console.error("Load notifications error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    await markAllNotificationsAsRead(currentUser.uid);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationPress = async (item: AppNotification) => {
    if (!currentUser) return;

    if (!item.read) {
      await markNotificationAsRead(currentUser.uid, item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
      );
    }

    if (item.type === "booking") {
      router.push("/booking/history");
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

    return (
      <Pressable
        onPress={() => handleNotificationPress(item)}
        style={{
          backgroundColor: item.read ? colors.surface : colors.cardAlt,
          borderColor: item.read ? colors.border : colors.primary,
        }}
        className="mb-3 flex-row items-start rounded-2xl border p-4"
      >
        {/* Icon based on notification type */}
        <View
          style={{
            backgroundColor:
              item.type === "booking"
                ? isDark ? "#17341E" : "#EBF7EE"
                : item.type === "promo"
                ? colors.chip
                : isDark ? "#2A1B3D" : "#F3EEFA",
          }}
          className="h-11 w-11 items-center justify-center rounded-xl"
        >
          <Ionicons
            name={
              item.type === "booking"
                ? "calendar"
                : item.type === "promo"
                ? "sparkles"
                : "notifications"
            }
            size={20}
            color={
              item.type === "booking"
                ? "#2E7A3A"
                : item.type === "promo"
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
            >
              {item.title}
            </Text>
            {!item.read && (
              <View
                style={{ backgroundColor: colors.primary }}
                className="h-2 w-2 rounded-full"
              />
            )}
          </View>

          <Text
            style={{ color: colors.textSecondary }}
            className="mt-1 text-xs leading-relaxed"
          >
            {item.message}
          </Text>

          <Text
            style={{ color: colors.muted }}
            className="mt-2 text-[10px]"
          >
            {formattedDate}
          </Text>
        </View>
      </Pressable>
    );
  };

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

        <Text
          style={{ color: colors.text }}
          className="text-base font-extrabold"
        >
          Notifications
        </Text>

        {notifications.some((n) => !n.read) ? (
          <Pressable onPress={handleMarkAllRead}>
            <Text
              style={{ color: colors.primary }}
              className="text-xs font-bold"
            >
              Mark all read
            </Text>
          </Pressable>
        ) : (
          <View className="w-10" />
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
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
                <Ionicons name="notifications-outline" size={32} color={colors.primary} />
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
                Booking updates, reminders, and recommendations will appear here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
