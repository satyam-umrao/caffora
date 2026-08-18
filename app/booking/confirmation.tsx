import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { auth } from "../../src/services/firebase/config";
import { createBooking } from "../../src/services/firebase/bookings";
import type { Booking } from "../../src/types/booking";

export default function BookingConfirmationModal() {
  const params = useLocalSearchParams<{
    cafeId: string;
    cafeName: string;
    cafeImage?: string;
    cafeLocation?: string;
    cafeCity?: string;
    date: string;
    time: string;
    guests: string;
    seating?: string;
    specialRequests?: string;
  }>();

  const insets = useSafeAreaInsets();
  const currentUser = auth.currentUser;

  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const guestsCount = Number(params.guests || 2);

  const handleConfirm = async () => {
    if (!currentUser) {
      Alert.alert("Sign In Required", "Please sign in to confirm your booking.");
      return;
    }

    try {
      setLoading(true);

      const booking = await createBooking({
        cafeId: params.cafeId,
        cafeName: params.cafeName,
        cafeImage: params.cafeImage,
        cafeLocation: params.cafeLocation,
        cafeCity: params.cafeCity,
        date: params.date,
        time: params.time,
        guests: guestsCount,
        seatingPreference: params.seating || "No Preference",
        specialRequests: params.specialRequests || "",
        userName: currentUser.displayName || "Guest",
        userEmail: currentUser.email || "",
        userPhone: currentUser.phoneNumber || "",
      });

      setConfirmedBooking(booking);
    } catch (err: any) {
      console.error("Booking creation error:", err);
      Alert.alert(
        "Booking Failed",
        "We could not complete your reservation. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN
  if (confirmedBooking) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAF7F3] px-6 justify-center items-center">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-[#EBF7EE]">
          <Ionicons name="checkmark-circle" size={54} color="#3FB950" />
        </View>

        <Text className="mt-5 text-2xl font-black text-[#241C18]">
          Reservation Confirmed! 🎉
        </Text>

        <Text className="mt-2 text-center text-sm text-[#786B63]">
          Your table has been reserved at{" "}
          <Text className="font-bold text-[#241C18]">{params.cafeName}</Text>.
        </Text>

        {/* Confirmation Code Card */}
        <View className="mt-6 w-full rounded-2xl border border-[#EEE5DE] bg-white p-5 items-center">
          <Text className="text-[11px] font-bold uppercase tracking-widest text-[#93867E]">
            Booking Reference Code
          </Text>
          <Text className="mt-1 text-2xl font-black tracking-widest text-[#B95E2E]">
            {confirmedBooking.bookingCode}
          </Text>

          <View className="mt-4 w-full border-t border-[#F2ECE7] pt-4 gap-2">
            <View className="flex-row justify-between">
              <Text className="text-xs text-[#8A7D75]">Date & Time</Text>
              <Text className="text-xs font-bold text-[#241C18]">
                {confirmedBooking.date} • {confirmedBooking.time}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-[#8A7D75]">Guests</Text>
              <Text className="text-xs font-bold text-[#241C18]">
                {confirmedBooking.guests} People ({confirmedBooking.seatingPreference})
              </Text>
            </View>
          </View>
        </View>

        {/* Navigation CTAs */}
        <View className="mt-8 w-full gap-3">
          <Pressable
            onPress={() => router.replace("/booking/history")}
            className="h-14 items-center justify-center rounded-2xl bg-[#B95E2E]"
          >
            <Text className="text-sm font-extrabold text-white">
              View in Bookings
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/(tabs)")}
            className="h-12 items-center justify-center rounded-2xl bg-[#FAF3EE] border border-[#F2D7CA]"
          >
            <Text className="text-xs font-bold text-[#B95E2E]">
              Back to Home
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // SUMMARY & REVIEW SCREEN
  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F3]" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2 border-b border-[#EEE5DE] bg-white">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-[#FAF7F3]"
        >
          <Ionicons name="close" size={20} color="#241C18" />
        </Pressable>

        <Text className="text-base font-extrabold text-[#241C18]">
          Review & Confirm
        </Text>

        <View className="w-9" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
      >
        {/* Cafe Card */}
        <View className="mt-4 flex-row items-center rounded-2xl border border-[#EEE5DE] bg-white p-3.5">
          {params.cafeImage ? (
            <Image
              source={{ uri: params.cafeImage }}
              className="h-16 w-16 rounded-xl bg-[#EADFD7]"
              resizeMode="cover"
            />
          ) : null}
          <View className="ml-3 flex-1">
            <Text
              className="text-base font-extrabold text-[#241C18]"
              numberOfLines={1}
            >
              {params.cafeName}
            </Text>
            <Text className="text-xs text-[#8A7D75]">
              {params.cafeLocation}, {params.cafeCity}
            </Text>
          </View>
        </View>

        {/* Reservation Details Ticket */}
        <View className="mt-4 rounded-2xl border border-[#EEE5DE] bg-white p-5">
          <Text className="text-xs font-extrabold uppercase tracking-wider text-[#93867E]">
            Reservation Details
          </Text>

          <View className="mt-4 gap-3.5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={18} color="#B95E2E" />
                <Text className="ml-2.5 text-xs font-medium text-[#786B63]">
                  Date
                </Text>
              </View>
              <Text className="text-xs font-bold text-[#241C18]">
                {params.date}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={18} color="#B95E2E" />
                <Text className="ml-2.5 text-xs font-medium text-[#786B63]">
                  Time Slot
                </Text>
              </View>
              <Text className="text-xs font-bold text-[#241C18]">
                {params.time}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="people-outline" size={18} color="#B95E2E" />
                <Text className="ml-2.5 text-xs font-medium text-[#786B63]">
                  Number of Guests
                </Text>
              </View>
              <Text className="text-xs font-bold text-[#241C18]">
                {guestsCount} Guests
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="grid-outline" size={18} color="#B95E2E" />
                <Text className="ml-2.5 text-xs font-medium text-[#786B63]">
                  Seating
                </Text>
              </View>
              <Text className="text-xs font-bold text-[#241C18]">
                {params.seating || "No Preference"}
              </Text>
            </View>

            {params.specialRequests ? (
              <View className="border-t border-[#F2ECE7] pt-3">
                <Text className="text-[11px] font-bold text-[#8A7D75]">
                  Special Requests:
                </Text>
                <Text className="mt-1 text-xs text-[#5E514A]">
                  {params.specialRequests}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Guest Details */}
        <View className="mt-4 rounded-2xl border border-[#EEE5DE] bg-white p-4">
          <Text className="text-xs font-extrabold uppercase tracking-wider text-[#93867E]">
            Contact Info
          </Text>
          <View className="mt-3 gap-1.5">
            <Text className="text-xs font-bold text-[#241C18]">
              {currentUser?.displayName || "Guest"}
            </Text>
            <Text className="text-xs text-[#786B63]">
              {currentUser?.email || "No email"}
            </Text>
            {currentUser?.phoneNumber ? (
              <Text className="text-xs text-[#786B63]">
                {currentUser.phoneNumber}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Policy Box */}
        <View className="mt-4 flex-row rounded-xl bg-[#FAF5EE] p-3.5 border border-[#F2E5D5]">
          <Ionicons name="shield-checkmark" size={18} color="#B95E2E" />
          <Text className="ml-2.5 flex-1 text-[11px] leading-relaxed text-[#7A6A5E]">
            Free reservation. You can easily modify or cancel your booking anytime
            from your profile.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Confirm CTA */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        className="absolute inset-x-0 bottom-0 border-t border-[#EEE5DE] bg-white px-5 pt-3"
      >
        <Pressable
          onPress={handleConfirm}
          disabled={loading}
          className={`h-14 items-center justify-center rounded-2xl bg-[#B95E2E] ${
            loading ? "opacity-70" : ""
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-base font-extrabold text-white">
              Confirm Reservation ✨
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
