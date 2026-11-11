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

import { useTheme } from "../../src/context/ThemeContext";
import { createBooking } from "../../src/services/firebase/bookings";
import { auth } from "../../src/services/firebase/config";
import type { Booking } from "../../src/types/booking";

export default function BookingConfirmationModal() {
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{
    cafeId: string;
    ownerId?: string;
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
        ownerId: params.ownerId || undefined,
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
      const cleanMessage =
        err?.message?.replace(/^[A-Z_]+:\s*/, "") ||
        "We could not complete your reservation request. Please try again.";
      Alert.alert("Reservation Request Issue", cleanMessage);
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS / PENDING CONFIRMATION SCREEN
  if (confirmedBooking) {
    return (
      <SafeAreaView
        style={{ backgroundColor: colors.background }}
        className="flex-1 px-6 justify-center items-center"
      >
        <View
          style={{
            backgroundColor: isDark ? "#382C18" : "#FEF3D6",
          }}
          className="h-20 w-20 items-center justify-center rounded-full"
        >
          <Ionicons
            name="time"
            size={50}
            color={isDark ? "#F8C162" : "#D97706"}
          />
        </View>

        <Text
          style={{ color: colors.text }}
          className="mt-5 text-2xl font-black text-center"
        >
          Booking Request Sent! ⏳
        </Text>

        <Text
          style={{ color: colors.muted }}
          className="mt-2 text-center text-sm"
        >
          Your reservation request has been submitted to{" "}
          <Text style={{ color: colors.text }} className="font-bold">
            {params.cafeName}
          </Text>
          .
        </Text>

        {/* Confirmation Code Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="mt-6 w-full rounded-2xl border p-5 items-center"
        >
          <View
            style={{
              backgroundColor: isDark ? "#382C18" : "#FEF3D6",
            }}
            className="flex-row items-center rounded-md px-2.5 py-1 mb-2"
          >
            <View
              style={{ backgroundColor: "#D97706" }}
              className="h-2 w-2 rounded-full mr-1.5"
            />
            <Text
              style={{ color: isDark ? "#F8C162" : "#B45309" }}
              className="text-[11px] font-extrabold uppercase tracking-wide"
            >
              Pending Owner Confirmation
            </Text>
          </View>

          <Text
            style={{ color: colors.muted }}
            className="text-[11px] font-bold uppercase tracking-widest mt-1"
          >
            Booking Reference Code
          </Text>
          <Text
            style={{ color: colors.primary }}
            className="mt-1 text-2xl font-black tracking-widest"
          >
            {confirmedBooking.bookingCode}
          </Text>

          <View
            style={{ borderTopColor: colors.border }}
            className="mt-4 w-full border-t pt-4 gap-2"
          >
            <View className="flex-row justify-between">
              <Text style={{ color: colors.muted }} className="text-xs">
                Date & Time
              </Text>
              <Text
                style={{ color: colors.text }}
                className="text-xs font-bold"
              >
                {confirmedBooking.date} • {confirmedBooking.time}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text style={{ color: colors.muted }} className="text-xs">
                Party Size
              </Text>
              <Text
                style={{ color: colors.text }}
                className="text-xs font-bold"
              >
                {confirmedBooking.guests} Guests ({confirmedBooking.seatingPreference})
              </Text>
            </View>
          </View>
        </View>

        {/* Informative Note */}
        <View
          style={{
            backgroundColor: colors.chip,
            borderColor: colors.border,
          }}
          className="mt-4 w-full rounded-xl p-3.5 border flex-row items-center gap-2.5"
        >
          <Ionicons name="information-circle" size={18} color={colors.primary} />
          <Text
            style={{ color: colors.textSecondary }}
            className="flex-1 text-[11px] leading-relaxed"
          >
            The café owner will review your requested party size. You will receive an in-app notification as soon as your booking is accepted.
          </Text>
        </View>

        {/* Navigation CTAs */}
        <View className="mt-6 w-full gap-3">
          <Pressable
            onPress={() => router.replace("/booking/history")}
            style={{ backgroundColor: colors.primary }}
            className="h-14 items-center justify-center rounded-2xl"
          >
            <Text className="text-sm font-extrabold text-white">
              View in Bookings
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/(tabs)")}
            style={{
              backgroundColor: colors.chip,
              borderColor: colors.border,
            }}
            className="h-12 items-center justify-center rounded-2xl border"
          >
            <Text style={{ color: colors.primary }} className="text-xs font-bold">
              Back to Home
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // SUMMARY & REVIEW SCREEN
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
          className="h-9 w-9 items-center justify-center rounded-full"
        >
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>

        <Text
          style={{ color: colors.text }}
          className="text-base font-extrabold"
        >
          Review & Request
        </Text>

        <View className="w-9" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
      >
        {/* Cafe Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="mt-4 flex-row items-center rounded-2xl border p-3.5"
        >
          {params.cafeImage ? (
            <Image
              source={{ uri: params.cafeImage }}
              style={{ backgroundColor: colors.cardAlt }}
              className="h-16 w-16 rounded-xl"
              resizeMode="cover"
            />
          ) : null}
          <View className="ml-3 flex-1">
            <Text
              style={{ color: colors.text }}
              className="text-base font-extrabold"
              numberOfLines={1}
            >
              {params.cafeName}
            </Text>
            <Text style={{ color: colors.muted }} className="text-xs">
              {params.cafeLocation}, {params.cafeCity}
            </Text>
          </View>
        </View>

        {/* Reservation Details Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="mt-4 rounded-2xl border p-4 gap-3.5"
        >
          <Text
            style={{ color: colors.text }}
            className="text-xs font-black uppercase tracking-wider"
          >
            Reservation Summary
          </Text>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: colors.chip }}
                className="h-8 w-8 items-center justify-center rounded-lg"
              >
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              </View>
              <Text style={{ color: colors.muted }} className="ml-3 text-xs">
                Date
              </Text>
            </View>
            <Text
              style={{ color: colors.text }}
              className="text-xs font-bold"
            >
              {params.date}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: colors.chip }}
                className="h-8 w-8 items-center justify-center rounded-lg"
              >
                <Ionicons name="time-outline" size={16} color={colors.primary} />
              </View>
              <Text style={{ color: colors.muted }} className="ml-3 text-xs">
                Time Slot
              </Text>
            </View>
            <Text
              style={{ color: colors.text }}
              className="text-xs font-bold"
            >
              {params.time}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: colors.chip }}
                className="h-8 w-8 items-center justify-center rounded-lg"
              >
                <Ionicons name="people-outline" size={16} color={colors.primary} />
              </View>
              <Text style={{ color: colors.muted }} className="ml-3 text-xs">
                Party Size
              </Text>
            </View>
            <Text
              style={{ color: colors.text }}
              className="text-xs font-bold"
            >
              {guestsCount} {guestsCount === 1 ? "Person" : "People"}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: colors.chip }}
                className="h-8 w-8 items-center justify-center rounded-lg"
              >
                <Ionicons name="cube-outline" size={16} color={colors.primary} />
              </View>
              <Text style={{ color: colors.muted }} className="ml-3 text-xs">
                Seating Area
              </Text>
            </View>
            <Text
              style={{ color: colors.text }}
              className="text-xs font-bold"
            >
              {params.seating || "No Preference"}
            </Text>
          </View>

          {params.specialRequests ? (
            <View
              style={{ borderTopColor: colors.border }}
              className="border-t pt-3"
            >
              <Text style={{ color: colors.muted }} className="text-xs">
                Special Requests:
              </Text>
              <Text
                style={{ color: colors.textSecondary }}
                className="mt-1 text-xs italic"
              >
                {`"${params.specialRequests}"`}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Guest Details */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="mt-4 rounded-2xl border p-4"
        >
          <Text
            style={{ color: colors.text }}
            className="text-xs font-black uppercase tracking-wider"
          >
            Guest Contact Information
          </Text>
          <View className="mt-3 gap-1">
            <Text
              style={{ color: colors.text }}
              className="text-sm font-bold"
            >
              {currentUser?.displayName || "Guest"}
            </Text>
            <Text style={{ color: colors.muted }} className="text-xs">
              {currentUser?.email || "No email"}
            </Text>
            {currentUser?.phoneNumber ? (
              <Text style={{ color: colors.muted }} className="text-xs">
                {currentUser.phoneNumber}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Two-Sided Marketplace Policy Box */}
        <View
          style={{
            backgroundColor: colors.chip,
            borderColor: colors.border,
          }}
          className="mt-4 flex-row rounded-xl p-3.5 border"
        >
          <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
          <Text
            style={{ color: colors.textSecondary }}
            className="ml-2.5 flex-1 text-[11px] leading-relaxed"
          >
            Two-Sided Reservation: Your request will be sent to the café owner with initial status Pending. You can cancel your request anytime without penalties.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Confirm CTA */}
      <View
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.3 : 0.05,
          shadowRadius: 10,
          elevation: 8,
        }}
        className="absolute inset-x-0 bottom-0 border-t px-5 pt-3"
      >
        <Pressable
          onPress={handleConfirm}
          disabled={loading}
          style={{ backgroundColor: colors.primary }}
          className={`h-14 items-center justify-center rounded-2xl ${
            loading ? "opacity-70" : ""
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-base font-extrabold text-white">
              Submit Booking Request 🛎️
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
