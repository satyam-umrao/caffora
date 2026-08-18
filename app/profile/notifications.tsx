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

export default function NotificationsScreen() {
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
        className={`mb-3 flex-row items-start rounded-2xl border p-4 ${
          item.read
            ? "border-[#EEE5DE] bg-white"
            : "border-[#F5D0BC] bg-[#FFFBF8]"
        }`}
      >
        {/* Icon based on notification type */}
        <View
          className={`h-11 w-11 items-center justify-center rounded-xl ${
            item.type === "booking"
              ? "bg-[#EBF7EE]"
              : item.type === "promo"
              ? "bg-[#FAF3EE]"
              : "bg-[#F3EEFA]"
          }`}
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
                ? "#B95E2E"
                : "#7B519D"
            }
          />
        </View>

        {/* Content */}
        <View className="ml-3.5 flex-1">
          <View className="flex-row items-center justify-between">
            <Text
              className={`text-sm ${
                item.read
                  ? "font-bold text-[#241C18]"
                  : "font-extrabold text-[#B95E2E]"
              }`}
            >
              {item.title}
            </Text>
            {!item.read && (
              <View className="h-2 w-2 rounded-full bg-[#B95E2E]" />
            )}
          </View>

          <Text className="mt-1 text-xs leading-relaxed text-[#5E514A]">
            {item.message}
          </Text>

          <Text className="mt-2 text-[10px] text-[#A0948D]">
            {formattedDate}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F3]" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2 border-b border-[#EEE5DE] bg-white">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-[#FAF7F3]"
        >
          <Ionicons name="chevron-back" size={22} color="#241C18" />
        </Pressable>

        <Text className="text-base font-extrabold text-[#241C18]">
          Notifications
        </Text>

        {notifications.some((n) => !n.read) ? (
          <Pressable onPress={handleMarkAllRead}>
            <Text className="text-xs font-bold text-[#B95E2E]">
              Mark all read
            </Text>
          </Pressable>
        ) : (
          <View className="w-10" />
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#B95E2E" />
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
              tintColor="#B95E2E"
            />
          }
          ListEmptyComponent={
            <View className="items-center rounded-3xl border border-[#EEE5DE] bg-white p-8 mt-6">
              <View className="h-16 w-16 items-center justify-center rounded-2xl bg-[#FAF3EE]">
                <Ionicons name="notifications-outline" size={32} color="#B95E2E" />
              </View>

              <Text className="mt-4 text-lg font-black text-[#241C18]">
                You're all caught up!
              </Text>

              <Text className="mt-1 text-center text-xs leading-relaxed text-[#8A7D75]">
                Booking updates, reminders, and recommendations will appear here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
