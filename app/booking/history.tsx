import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
  getUserBookings,
} from "../../src/services/firebase/bookings";
import type { Booking, BookingStatus } from "../../src/types/booking";

type TabType = "upcoming" | "completed" | "cancelled";

export default function BookingHistoryScreen() {
  const currentUser = auth.currentUser;

  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = useCallback(async () => {
    if (!currentUser) {
      setBookings([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const list = await getUserBookings(currentUser.uid);
      setBookings(list);
    } catch (err) {
      console.error("Load bookings error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      "Cancel Reservation?",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No, Keep", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelBooking(bookingId, "Cancelled by user");
              setBookings((prev) =>
                prev.map((b) =>
                  b.id === bookingId ? { ...b, status: "cancelled" } : b,
                ),
              );
              Alert.alert("Reservation Cancelled", "Your booking has been cancelled.");
            } catch (err) {
              Alert.alert("Error", "Could not cancel booking. Please try again.");
            }
          },
        },
      ],
    );
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "upcoming") return b.status === "confirmed";
    if (activeTab === "completed") return b.status === "completed";
    if (activeTab === "cancelled") return b.status === "cancelled";
    return true;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return {
          label: "Confirmed",
          bgColor: "bg-[#EBF7EE]",
          textColor: "text-[#2E7A3A]",
          dotColor: "bg-[#3FB950]",
        };
      case "completed":
        return {
          label: "Completed",
          bgColor: "bg-[#F3EEFA]",
          textColor: "text-[#654388]",
          dotColor: "bg-[#8E5EC2]",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          bgColor: "bg-[#FDEAE8]",
          textColor: "text-[#D95445]",
          dotColor: "bg-[#E0524D]",
        };
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const badge = getStatusBadge(item.status);

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/modal/booking-details",
            params: { bookingId: item.id },
          })
        }
        className="mb-4 overflow-hidden rounded-2xl border border-[#EEE5DE] bg-white p-4"
      >
        {/* Top Header */}
        <View className="flex-row items-center justify-between pb-3 border-b border-[#F2ECE7]">
          <View className="flex-row items-center">
            <View className={`h-2 w-2 rounded-full ${badge.dotColor}`} />
            <Text
              className={`ml-1.5 text-[11px] font-extrabold uppercase tracking-wide ${badge.textColor}`}
            >
              {badge.label}
            </Text>
          </View>

          <View className="rounded-lg bg-[#FAF3EE] px-2.5 py-1">
            <Text className="text-[11px] font-black tracking-widest text-[#B95E2E]">
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
            className="h-16 w-16 rounded-xl bg-[#EADFD7]"
            resizeMode="cover"
          />

          <View className="ml-3 flex-1">
            <Text
              className="text-base font-extrabold text-[#241C18]"
              numberOfLines={1}
            >
              {item.cafeName}
            </Text>

            <View className="mt-1 flex-row items-center">
              <Ionicons name="calendar-outline" size={13} color="#8A7D75" />
              <Text className="ml-1 text-xs font-semibold text-[#5E514A]">
                {item.date} • {item.time}
              </Text>
            </View>

            <View className="mt-1 flex-row items-center">
              <Ionicons name="people-outline" size={13} color="#8A7D75" />
              <Text className="ml-1 text-xs text-[#8A7D75]">
                {item.guests} Guests ({item.seatingPreference})
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Actions for Upcoming */}
        {item.status === "confirmed" && (
          <View className="mt-3 flex-row items-center justify-between border-t border-[#F2ECE7] pt-3">
            <Pressable
              onPress={() => handleCancelBooking(item.id)}
              className="rounded-lg px-3 py-1.5"
            >
              <Text className="text-xs font-bold text-[#D95445]">
                Cancel Booking
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/modal/booking-details",
                  params: { bookingId: item.id },
                })
              }
              className="flex-row items-center rounded-lg bg-[#FAF3EE] px-3.5 py-1.5"
            >
              <Text className="text-xs font-extrabold text-[#B95E2E]">
                View Pass →
              </Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F3]" edges={["top"]}>
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2 border-b border-[#EEE5DE] bg-white">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-[#FAF7F3]"
        >
          <Ionicons name="chevron-back" size={22} color="#241C18" />
        </Pressable>

        <Text className="text-base font-extrabold text-[#241C18]">
          My Reservations
        </Text>

        <View className="w-10" />
      </View>

      {/* Segmented Tabs */}
      <View className="flex-row px-5 py-3.5 bg-white border-b border-[#EEE5DE]">
        {(["upcoming", "completed", "cancelled"] as const).map((tab) => {
          const isActive = activeTab === tab;
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
              className={`flex-1 items-center py-2.5 rounded-xl ${
                isActive ? "bg-[#B95E2E]" : ""
              }`}
            >
              <Text
                className={`text-xs font-extrabold ${
                  isActive ? "text-white" : "text-[#786B63]"
                }`}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Bookings List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#B95E2E" />
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
              tintColor="#B95E2E"
            />
          }
          ListEmptyComponent={
            <View className="items-center rounded-3xl border border-[#EEE5DE] bg-white p-8 mt-6">
              <View className="h-16 w-16 items-center justify-center rounded-2xl bg-[#FAF3EE]">
                <Ionicons name="calendar-outline" size={32} color="#B95E2E" />
              </View>

              <Text className="mt-4 text-lg font-black text-[#241C18]">
                No {activeTab} bookings
              </Text>

              <Text className="mt-1 text-center text-xs leading-relaxed text-[#8A7D75]">
                {activeTab === "upcoming"
                  ? "You don't have any upcoming café table reservations."
                  : activeTab === "completed"
                  ? "Your past completed visits will show up here."
                  : "You haven't cancelled any bookings."}
              </Text>

              {activeTab === "upcoming" && (
                <Pressable
                  onPress={() => router.push("/(tabs)")}
                  className="mt-6 rounded-2xl bg-[#B95E2E] px-6 py-3.5"
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
