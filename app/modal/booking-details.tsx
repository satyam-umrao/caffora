import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { openDirections } from "../../src/services/deepLinks/directions";
import { makePhoneCall } from "../../src/services/deepLinks/phone";
import {
  cancelBooking,
  getBookingById,
} from "../../src/services/firebase/bookings";
import { getCafeById } from "../../src/services/firebase/cafes";
import type { Booking } from "../../src/types/booking";

export default function BookingDetailsModal() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const insets = useSafeAreaInsets();

  const id =
    typeof bookingId === "string"
      ? bookingId
      : Array.isArray(bookingId)
      ? bookingId[0]
      : "";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cafePhone, setCafePhone] = useState<string>("");
  const [cafeCoords, setCafeCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await getBookingById(id);
        setBooking(data);

        if (data?.cafeId) {
          const cafeData = await getCafeById(data.cafeId);
          if (cafeData) {
            setCafePhone(cafeData.phone || "");
            if (cafeData.latitude && cafeData.longitude) {
              setCafeCoords({ lat: cafeData.latitude, lng: cafeData.longitude });
            }
          }
        }
      } catch (err) {
        console.error("Load booking detail error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleCancel = () => {
    if (!booking) return;

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
              await cancelBooking(booking.id, "Cancelled by user");
              setBooking((prev) => (prev ? { ...prev, status: "cancelled" } : null));
              Alert.alert("Reservation Cancelled", "Your booking has been cancelled.");
            } catch {
              Alert.alert("Error", "Could not cancel booking.");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAF7F3]">
        <ActivityIndicator size="large" color="#B95E2E" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAF7F3] px-6">
        <Text className="text-base font-bold text-[#241C18]">
          Booking not found
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 rounded-xl bg-[#B95E2E] px-6 py-2.5"
        >
          <Text className="font-bold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const isConfirmed = booking.status === "confirmed";

  return (
    <View className="flex-1 bg-[#FAF7F3]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 24),
          paddingHorizontal: 20,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between pb-4">
          <View>
            <Text className="text-xl font-black text-[#241C18]">
              Reservation Pass
            </Text>
            <Text className="text-xs text-[#8A7D75]">
              Show this at the café counter
            </Text>
          </View>

          <Pressable
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full bg-white border border-[#EEE5DE]"
          >
            <Ionicons name="close" size={20} color="#241C18" />
          </Pressable>
        </View>

        {/* Digital Pass Ticket */}
        <View className="mt-3 overflow-hidden rounded-3xl border border-[#EEE5DE] bg-white">
          {/* Top Pass Brand Banner */}
          <View className="bg-[#B95E2E] px-6 py-4 flex-row justify-between items-center">
            <View>
              <Text className="text-[11px] font-extrabold uppercase tracking-widest text-[#FBE9DE]">
                Caffora Table Pass
              </Text>
              <Text className="mt-0.5 text-lg font-black text-white">
                {booking.cafeName}
              </Text>
            </View>

            <View className="rounded-full bg-white/20 px-3 py-1">
              <Text className="text-[10px] font-black uppercase text-white">
                {booking.status}
              </Text>
            </View>
          </View>

          {/* Reference Code Display */}
          <View className="items-center py-5 border-b border-dashed border-[#E5DFDA] bg-[#FAF8F5]">
            <Text className="text-[10px] font-extrabold uppercase tracking-widest text-[#93867E]">
              Confirmation Reference
            </Text>
            <Text className="mt-1 text-3xl font-black tracking-widest text-[#B95E2E]">
              {booking.bookingCode}
            </Text>
          </View>

          {/* Ticket Body Details */}
          <View className="p-5 gap-4">
            <View className="flex-row justify-between">
              <View>
                <Text className="text-[10px] font-bold uppercase tracking-wider text-[#93867E]">
                  Date
                </Text>
                <Text className="mt-0.5 text-sm font-extrabold text-[#241C18]">
                  {booking.date}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-[#93867E]">
                  Time
                </Text>
                <Text className="mt-0.5 text-sm font-extrabold text-[#241C18]">
                  {booking.time}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between border-t border-[#F2ECE7] pt-3">
              <View>
                <Text className="text-[10px] font-bold uppercase tracking-wider text-[#93867E]">
                  Party Size
                </Text>
                <Text className="mt-0.5 text-sm font-extrabold text-[#241C18]">
                  {booking.guests} Guests
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-[#93867E]">
                  Seating
                </Text>
                <Text className="mt-0.5 text-sm font-extrabold text-[#241C18]">
                  {booking.seatingPreference || "Standard"}
                </Text>
              </View>
            </View>

            <View className="border-t border-[#F2ECE7] pt-3">
              <Text className="text-[10px] font-bold uppercase tracking-wider text-[#93867E]">
                Guest Name
              </Text>
              <Text className="mt-0.5 text-sm font-bold text-[#241C18]">
                {booking.userName}
              </Text>
              <Text className="text-xs text-[#8A7D75]">{booking.userEmail}</Text>
            </View>

            {booking.specialRequests ? (
              <View className="border-t border-[#F2ECE7] pt-3">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-[#93867E]">
                  Special Requests
                </Text>
                <Text className="mt-0.5 text-xs text-[#5E514A]">
                  {booking.specialRequests}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Action Shortcuts */}
        <View className="mt-5 flex-row gap-3">
          {cafeCoords && (
            <Pressable
              onPress={() =>
                openDirections(cafeCoords.lat, cafeCoords.lng, booking.cafeName)
              }
              className="flex-1 flex-row items-center justify-center rounded-2xl border border-[#EEE5DE] bg-white py-3.5"
            >
              <Ionicons name="navigate-outline" size={18} color="#B95E2E" />
              <Text className="ml-2 text-xs font-bold text-[#302720]">
                Directions
              </Text>
            </Pressable>
          )}

          {cafePhone ? (
            <Pressable
              onPress={() => makePhoneCall(cafePhone)}
              className="flex-1 flex-row items-center justify-center rounded-2xl border border-[#EEE5DE] bg-white py-3.5"
            >
              <Ionicons name="call-outline" size={18} color="#B95E2E" />
              <Text className="ml-2 text-xs font-bold text-[#302720]">
                Call Café
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* Cancel Action if Confirmed */}
        {isConfirmed && (
          <Pressable
            onPress={handleCancel}
            className="mt-4 items-center justify-center rounded-2xl border border-[#F6D7D5] bg-[#FFF8F7] py-3.5"
          >
            <Text className="text-xs font-bold text-[#D95445]">
              Cancel Reservation
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
