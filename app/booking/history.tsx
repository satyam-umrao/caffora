import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth } from "../../src/services/firebase/config";
import {
  cancelBooking,
  getEffectiveBookingStatus,
  getUserBookings,
  subscribeToUserBookings,
} from "../../src/services/firebase/bookings";
import type { Booking, BookingStatus } from "../../src/types/booking";
import { useTheme } from "../../src/context/ThemeContext";

type TabType = "upcoming" | "completed" | "cancelled";

export default function BookingHistoryScreen() {
  const { colors, isDark } = useTheme();
  const currentUser = auth.currentUser;

  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!currentUser) {
        setBookings([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const unsubscribe = subscribeToUserBookings(
        currentUser.uid,
        (list) => {
          setBookings(list);
          setLoading(false);
          setRefreshing(false);
        },
        (err) => {
          console.error("subscribeToUserBookings error:", err);
          setLoading(false);
          setRefreshing(false);
        },
      );

      return () => {
        unsubscribe();
      };
    }, [currentUser]),
  );

  const onRefresh = async () => {
    if (!currentUser) return;
    setRefreshing(true);
    try {
      const list = await getUserBookings(currentUser.uid);
      setBookings(list);
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      "Cancel Reservation?",
      "Are you sure you want to cancel this booking request?",
      [
        { text: "No, Keep", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelBooking(bookingId, "Cancelled by user");
              Alert.alert("Reservation Cancelled", "Your booking request has been cancelled.");
            } catch {
              Alert.alert("Error", "Could not cancel booking. Please try again.");
            }
          },
        },
      ],
    );
  };

  const filteredBookings = bookings.filter((b) => {
    const effectiveStatus = getEffectiveBookingStatus(b);
    if (activeTab === "upcoming") {
      return (
        effectiveStatus === "confirmed" ||
        effectiveStatus === "pending" ||
        effectiveStatus === "on_hold"
      );
    }
    if (activeTab === "completed") return effectiveStatus === "completed";
    if (activeTab === "cancelled") {
      return (
        effectiveStatus === "cancelled" || effectiveStatus === "rejected"
      );
    }
    return true;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          bgColor: isDark ? "#382C18" : "#FEF3D6",
          textColor: isDark ? "#F8C162" : "#B45309",
          dotColor: "#D97706",
        };
      case "on_hold":
        return {
          label: "On Hold",
          bgColor: isDark ? "#281E38" : "#F4EEFD",
          textColor: isDark ? "#C084FC" : "#7C3AED",
          dotColor: "#A855F7",
        };
      case "rejected":
        return {
          label: "Rejected",
          bgColor: isDark ? "#381816" : "#FDEAE8",
          textColor: isDark ? "#F87171" : "#D95445",
          dotColor: "#E0524D",
        };
      case "confirmed":
        return {
          label: "Confirmed",
          bgColor: isDark ? "#17341E" : "#EBF7EE",
          textColor: isDark ? "#4ADE80" : "#2E7A3A",
          dotColor: "#3FB950",
        };
      case "completed":
        return {
          label: "Completed",
          bgColor: isDark ? "#2A1B3D" : "#F3EEFA",
          textColor: isDark ? "#C084FC" : "#654388",
          dotColor: "#8E5EC2",
        };
      case "cancelled":
      default:
        return {
          label: "Cancelled",
          bgColor: isDark ? "#381816" : "#FDEAE8",
          textColor: isDark ? "#F87171" : "#D95445",
          dotColor: "#E0524D",
        };
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const effectiveStatus = getEffectiveBookingStatus(item);
    const badge = getStatusBadge(effectiveStatus);

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/modal/booking-details",
            params: { bookingId: item.id },
          })
        }
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
        className="mb-4 overflow-hidden rounded-2xl border p-4"
      >
        {/* Top Header */}
        <View
          style={{ borderBottomColor: colors.border }}
          className="flex-row items-center justify-between pb-3 border-b"
        >
          <View
            style={{ backgroundColor: badge.bgColor }}
            className="flex-row items-center rounded-md px-2 py-0.5"
          >
            <View
              style={{ backgroundColor: badge.dotColor }}
              className="h-2 w-2 rounded-full"
            />
            <Text
              style={{ color: badge.textColor }}
              className="ml-1.5 text-[11px] font-extrabold uppercase tracking-wide"
            >
              {badge.label}
            </Text>
          </View>

          <View
            style={{ backgroundColor: colors.chip }}
            className="rounded-lg px-2.5 py-1"
          >
            <Text
              style={{ color: colors.primary }}
              className="text-[11px] font-black tracking-widest"
            >
              {item.bookingCode}
            </Text>
          </View>
        </View>

        {/* Cafe Information */}
        <View className="mt-3 flex-row items-center">
          <Image
            source={{
              uri:
                item.cafeImage ||
                "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
            }}
            style={{ backgroundColor: colors.cardAlt }}
            className="h-16 w-16 rounded-xl"
            resizeMode="cover"
          />

          <View className="ml-3 flex-1">
            <Text
              style={{ color: colors.text }}
              className="text-base font-extrabold"
              numberOfLines={1}
            >
              {item.cafeName}
            </Text>

            <View className="mt-1 flex-row items-center">
              <Ionicons name="calendar-outline" size={13} color={colors.muted} />
              <Text
                style={{ color: colors.textSecondary }}
                className="ml-1 text-xs font-semibold"
              >
                {item.date} • {item.time}
              </Text>
            </View>

            <View className="mt-1 flex-row items-center">
              <Ionicons name="people-outline" size={13} color={colors.muted} />
              <Text style={{ color: colors.muted }} className="ml-1 text-xs">
                {item.guests} Guests ({item.seatingPreference})
              </Text>
            </View>
          </View>
        </View>

        {/* Owner Note / Explanation Banner */}
        {item.ownerNote ? (
          <View
            style={{
              backgroundColor: isDark ? "#281E38" : "#F8F4FD",
              borderColor: isDark ? "#4A3568" : "#E2D3FD",
            }}
            className="mt-3 rounded-xl border p-2.5 flex-row items-center gap-2"
          >
            <Ionicons name="chatbubble-ellipses-outline" size={14} color={isDark ? "#C084FC" : "#7C3AED"} />
            <Text
              style={{ color: isDark ? "#E9D5FF" : "#581C87" }}
              className="flex-1 text-[11px] leading-tight"
            >
              <Text className="font-bold">Café Note: </Text>
              {item.ownerNote}
            </Text>
          </View>
        ) : null}

        {/* Bottom Actions for Active (Pending, On Hold, Confirmed) */}
        {(effectiveStatus === "confirmed" ||
          effectiveStatus === "pending" ||
          effectiveStatus === "on_hold") && (
          <View
            style={{ borderTopColor: colors.border }}
            className="mt-3 flex-row items-center justify-between border-t pt-3"
          >
            <Pressable
              onPress={() => handleCancelBooking(item.id)}
              className="rounded-lg px-3 py-1.5"
            >
              <Text className="text-xs font-bold text-[#D95445]">
                {effectiveStatus === "pending" ? "Cancel Request" : "Cancel Booking"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/modal/booking-details",
                  params: { bookingId: item.id },
                })
              }
              style={{ backgroundColor: colors.chip }}
              className="flex-row items-center rounded-lg px-3.5 py-1.5"
            >
              <Text
                style={{ color: colors.primary }}
                className="text-xs font-extrabold"
              >
                {effectiveStatus === "confirmed" ? "View Pass →" : "View Details →"}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Bottom Actions for Completed */}
        {effectiveStatus === "completed" && (
          <View
            style={{ borderTopColor: colors.border }}
            className="mt-3 flex-row items-center justify-between border-t pt-3"
          >
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/modal/write-review",
                  params: { cafeId: item.cafeId },
                })
              }
              style={{ backgroundColor: colors.chip }}
              className="flex-row items-center rounded-lg px-3 py-1.5"
            >
              <Ionicons name="star-outline" size={13} color={colors.primary} />
              <Text
                style={{ color: colors.primary }}
                className="ml-1 text-xs font-extrabold"
              >
                Rate & Review
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/modal/booking-details",
                  params: { bookingId: item.id },
                })
              }
              style={{ backgroundColor: colors.chip }}
              className="flex-row items-center rounded-lg px-3.5 py-1.5"
            >
              <Text
                style={{ color: colors.primary }}
                className="text-xs font-extrabold"
              >
                View Summary →
              </Text>
            </Pressable>
          </View>
        )}

        {/* Bottom Actions for Cancelled */}
        {effectiveStatus === "cancelled" && (
          <View
            style={{ borderTopColor: colors.border }}
            className="mt-3 flex-row items-center justify-between border-t pt-3"
          >
            <View className="flex-row items-center flex-1 pr-2">
              <Ionicons name="close-circle-outline" size={13} color="#D95445" />
              <Text style={{ color: colors.muted }} className="ml-1 text-xs" numberOfLines={1}>
                {item.cancellationReason || "Cancelled"}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/booking/[cafeId]",
                  params: { cafeId: item.cafeId },
                })
              }
              style={{ backgroundColor: colors.chip }}
              className="flex-row items-center rounded-lg px-3.5 py-1.5"
            >
              <Text
                style={{ color: colors.primary }}
                className="text-xs font-extrabold"
              >
                Book Again →
              </Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.background }}
      className="flex-1"
      edges={["top"]}
    >
      {/* Top Header */}
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
          My Reservations
        </Text>

        <View className="w-10" />
      </View>

      {/* Segmented Tabs */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }}
        className="flex-row px-5 py-3.5 border-b"
      >
        {(["upcoming", "completed", "cancelled"] as const).map((tab) => {
          const isActive = activeTab === tab;
          const count = bookings.filter((b) => {
            const s = getEffectiveBookingStatus(b);
            if (tab === "upcoming") {
              return s === "confirmed" || s === "pending" || s === "on_hold";
            }
            if (tab === "completed") return s === "completed";
            if (tab === "cancelled") {
              return s === "cancelled" || s === "rejected";
            }
            return false;
          }).length;
          const label =
            tab === "upcoming"
              ? "Upcoming"
              : tab === "completed"
              ? "Completed"
              : "Cancelled";

          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                backgroundColor: isActive ? colors.primary : "transparent",
              }}
              className="flex-1 items-center justify-center py-2.5 rounded-xl flex-row"
            >
              <Text
                style={{
                  color: isActive ? "#FFFFFF" : colors.muted,
                }}
                className="text-xs font-extrabold"
              >
                {label}
              </Text>
              {count > 0 && (
                <View
                  style={{
                    backgroundColor: isActive
                      ? "rgba(255, 255, 255, 0.28)"
                      : colors.chip,
                  }}
                  className="ml-1.5 rounded-full px-1.5 py-0.5"
                >
                  <Text
                    style={{
                      color: isActive ? "#FFFFFF" : colors.primary,
                      fontSize: 10,
                      fontWeight: "800",
                    }}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Bookings List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 40,
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
                <Ionicons name="calendar-outline" size={32} color={colors.primary} />
              </View>

              <Text
                style={{ color: colors.text }}
                className="mt-4 text-lg font-black"
              >
                No {activeTab} bookings
              </Text>

              <Text
                style={{ color: colors.muted }}
                className="mt-1 text-center text-xs leading-relaxed"
              >
                {activeTab === "upcoming"
                  ? "You don't have any upcoming café table reservations."
                  : activeTab === "completed"
                  ? "Your past completed visits will show up here."
                  : "You haven't cancelled any bookings."}
              </Text>

              {activeTab === "upcoming" && (
                <Pressable
                  onPress={() => router.push("/(tabs)")}
                  style={{ backgroundColor: colors.primary }}
                  className="mt-6 rounded-2xl px-6 py-3.5"
                >
                  <Text className="text-xs font-extrabold text-white">
                    Explore Cafés
                  </Text>
                </Pressable>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
