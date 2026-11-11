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

import { useTheme } from "../../src/context/ThemeContext";
import { openDirections } from "../../src/services/deepLinks/directions";
import { makePhoneCall } from "../../src/services/deepLinks/phone";
import {
  cancelBooking,
  getEffectiveBookingStatus,
  subscribeToBooking,
} from "../../src/services/firebase/bookings";
import { getCafeById } from "../../src/services/firebase/cafes";
import type { Booking, BookingStatus } from "../../src/types/booking";

export default function BookingDetailsModal() {
  const { colors, isDark } = useTheme();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const insets = useSafeAreaInsets();

  const id =
    typeof bookingId === "string"
      ? bookingId
      : Array.isArray(bookingId)
      ? bookingId[0]
      : "";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [cafePhone, setCafePhone] = useState<string>("");
  const [cafeCoords, setCafeCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = subscribeToBooking(
      id,
      async (data) => {
        setBooking(data);
        setLoading(false);

        if (data?.cafeId) {
          try {
            const cafeData = await getCafeById(data.cafeId);
            if (cafeData) {
              setCafePhone(cafeData.phone || "");
              if (cafeData.latitude && cafeData.longitude) {
                setCafeCoords({
                  lat: cafeData.latitude,
                  lng: cafeData.longitude,
                });
              }
            }
          } catch {
            // Ignore optional cafe detail lookup failure
          }
        }
      },
      (err) => {
        console.error("subscribeToBooking error:", err);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [id]);

  const handleCancel = () => {
    if (!booking) return;

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
              await cancelBooking(booking.id, "Cancelled by user");
              Alert.alert(
                "Reservation Cancelled",
                "Your booking request has been cancelled.",
              );
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
      <View
        style={{ backgroundColor: colors.background }}
        className="flex-1 items-center justify-center"
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View
        style={{ backgroundColor: colors.background }}
        className="flex-1 items-center justify-center px-6"
      >
        <Text style={{ color: colors.text }} className="text-base font-bold">
          Booking not found
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{ backgroundColor: colors.primary }}
          className="mt-4 rounded-xl px-6 py-2.5"
        >
          <Text className="font-bold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const effectiveStatus = getEffectiveBookingStatus(booking);
  const canCancel =
    effectiveStatus === "confirmed" ||
    effectiveStatus === "pending" ||
    effectiveStatus === "on_hold";

  const getStatusBadgeMeta = (status: BookingStatus) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending Owner Confirmation",
          bgColor: isDark ? "#382C18" : "#FEF3D6",
          textColor: isDark ? "#F8C162" : "#B45309",
          dotColor: "#D97706",
          icon: "time-outline",
        };
      case "on_hold":
        return {
          label: "On Hold by Café",
          bgColor: isDark ? "#281E38" : "#F4EEFD",
          textColor: isDark ? "#C084FC" : "#7C3AED",
          dotColor: "#A855F7",
          icon: "hourglass-outline",
        };
      case "confirmed":
        return {
          label: "Table Confirmed",
          bgColor: isDark ? "#17341E" : "#EBF7EE",
          textColor: isDark ? "#4ADE80" : "#2E7A3A",
          dotColor: "#3FB950",
          icon: "checkmark-circle",
        };
      case "rejected":
        return {
          label: "Request Declined",
          bgColor: isDark ? "#381816" : "#FDEAE8",
          textColor: isDark ? "#F87171" : "#D95445",
          dotColor: "#E0524D",
          icon: "close-circle",
        };
      case "completed":
        return {
          label: "Visit Completed",
          bgColor: isDark ? "#2A1B3D" : "#F3EEFA",
          textColor: isDark ? "#C084FC" : "#654388",
          dotColor: "#8E5EC2",
          icon: "checkmark-done-circle",
        };
      case "cancelled":
      default:
        return {
          label: "Cancelled",
          bgColor: isDark ? "#381816" : "#FDEAE8",
          textColor: isDark ? "#F87171" : "#D95445",
          dotColor: "#E0524D",
          icon: "close-circle",
        };
    }
  };

  const statusMeta = getStatusBadgeMeta(effectiveStatus);

  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1">
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
            <Text style={{ color: colors.text }} className="text-xl font-black">
              Reservation Details
            </Text>
            <Text style={{ color: colors.muted }} className="text-xs">
              Live status from café owner
            </Text>
          </View>

          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="h-9 w-9 items-center justify-center rounded-full border"
          >
            <Ionicons name="close" size={20} color={colors.text} />
          </Pressable>
        </View>

        {/* Live Status Pill */}
        <View
          style={{
            backgroundColor: statusMeta.bgColor,
            borderColor: colors.border,
          }}
          className="flex-row items-center rounded-2xl border px-4 py-3 gap-3 mb-3"
        >
          <Ionicons
            name={statusMeta.icon as any}
            size={22}
            color={statusMeta.textColor}
          />
          <View className="flex-1">
            <Text
              style={{ color: statusMeta.textColor }}
              className="text-xs font-black uppercase tracking-wider"
            >
              {statusMeta.label}
            </Text>
            <Text
              style={{ color: statusMeta.textColor }}
              className="text-[11px] leading-tight mt-0.5"
            >
              {effectiveStatus === "pending"
                ? "The café owner has received your request and is checking available seats."
                : effectiveStatus === "on_hold"
                ? "The café owner placed your request on hold while managing table turnover."
                : effectiveStatus === "confirmed"
                ? "Your table is guaranteed. Present your reference code upon arrival."
                : effectiveStatus === "rejected"
                ? "The café was unable to accept this request at the selected time."
                : effectiveStatus === "completed"
                ? "Thank you for visiting! We hope you enjoyed your time."
                : "This reservation request has been cancelled."}
            </Text>
          </View>
        </View>

        {/* Note from Café Owner if provided */}
        {booking.ownerNote ? (
          <View
            style={{
              backgroundColor: isDark ? "#281E38" : "#F4EEFD",
              borderColor: isDark ? "#4A3568" : "#E2D3FD",
            }}
            className="rounded-2xl border p-4 mb-3 flex-row items-start gap-3"
          >
            <Ionicons
              name="chatbubble-ellipses"
              size={20}
              color={isDark ? "#C084FC" : "#7C3AED"}
            />
            <View className="flex-1">
              <Text
                style={{ color: isDark ? "#C084FC" : "#7C3AED" }}
                className="text-xs font-extrabold uppercase tracking-wide"
              >
                Message from Café Owner
              </Text>
              <Text
                style={{ color: isDark ? "#E9D5FF" : "#3B0764" }}
                className="mt-1 text-xs leading-relaxed"
              >
                {`"${booking.ownerNote}"`}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Digital Pass Ticket */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="overflow-hidden rounded-3xl border"
        >
          {/* Top Pass Brand Banner */}
          <View
            style={{ backgroundColor: colors.primary }}
            className="px-6 py-4 flex-row justify-between items-center"
          >
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
                {effectiveStatus}
              </Text>
            </View>
          </View>

          {/* Reference Code Display */}
          <View
            style={{
              backgroundColor: colors.cardAlt,
              borderBottomColor: colors.border,
            }}
            className="items-center py-5 border-b border-dashed"
          >
            <Text
              style={{ color: colors.muted }}
              className="text-[10px] font-extrabold uppercase tracking-widest"
            >
              Confirmation Reference
            </Text>
            <Text
              style={{ color: colors.primary }}
              className="mt-1 text-3xl font-black tracking-widest"
            >
              {booking.bookingCode}
            </Text>
          </View>

          {/* Ticket Body Details */}
          <View className="p-5 gap-4">
            <View className="flex-row justify-between">
              <View>
                <Text
                  style={{ color: colors.muted }}
                  className="text-[10px] font-bold uppercase tracking-wider"
                >
                  Date
                </Text>
                <Text
                  style={{ color: colors.text }}
                  className="mt-0.5 text-sm font-extrabold"
                >
                  {booking.date}
                </Text>
              </View>

              <View className="items-end">
                <Text
                  style={{ color: colors.muted }}
                  className="text-[10px] font-bold uppercase tracking-wider"
                >
                  Time Slot
                </Text>
                <Text
                  style={{ color: colors.text }}
                  className="mt-0.5 text-sm font-extrabold"
                >
                  {booking.time}
                </Text>
              </View>
            </View>

            <View
              style={{ borderTopColor: colors.border }}
              className="flex-row justify-between border-t pt-3"
            >
              <View>
                <Text
                  style={{ color: colors.muted }}
                  className="text-[10px] font-bold uppercase tracking-wider"
                >
                  Party Size
                </Text>
                <Text
                  style={{ color: colors.text }}
                  className="mt-0.5 text-sm font-extrabold"
                >
                  {booking.guests} Guests
                </Text>
              </View>

              <View className="items-end">
                <Text
                  style={{ color: colors.muted }}
                  className="text-[10px] font-bold uppercase tracking-wider"
                >
                  Seating Area
                </Text>
                <Text
                  style={{ color: colors.text }}
                  className="mt-0.5 text-sm font-extrabold"
                >
                  {booking.seatingPreference || "Standard"}
                </Text>
              </View>
            </View>

            <View
              style={{ borderTopColor: colors.border }}
              className="border-t pt-3"
            >
              <Text
                style={{ color: colors.muted }}
                className="text-[10px] font-bold uppercase tracking-wider"
              >
                Guest Contact
              </Text>
              <Text
                style={{ color: colors.text }}
                className="mt-0.5 text-sm font-bold"
              >
                {booking.userName}
              </Text>
              <Text style={{ color: colors.muted }} className="text-xs">
                {booking.userEmail}
              </Text>
              {booking.userPhone ? (
                <Text style={{ color: colors.muted }} className="text-xs mt-0.5">
                  {booking.userPhone}
                </Text>
              ) : null}
            </View>

            {booking.specialRequests ? (
              <View
                style={{ borderTopColor: colors.border }}
                className="border-t pt-3"
              >
                <Text
                  style={{ color: colors.muted }}
                  className="text-[10px] font-bold uppercase tracking-wider"
                >
                  Special Requests
                </Text>
                <Text
                  style={{ color: colors.textSecondary }}
                  className="mt-0.5 text-xs italic"
                >
                  {`"${booking.specialRequests}"`}
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
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="flex-1 flex-row items-center justify-center rounded-2xl border py-3.5"
            >
              <Ionicons
                name="navigate-outline"
                size={18}
                color={colors.primary}
              />
              <Text
                style={{ color: colors.text }}
                className="ml-2 text-xs font-bold"
              >
                Directions
              </Text>
            </Pressable>
          )}

          {cafePhone ? (
            <Pressable
              onPress={() => makePhoneCall(cafePhone)}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="flex-1 flex-row items-center justify-center rounded-2xl border py-3.5"
            >
              <Ionicons name="call-outline" size={18} color={colors.primary} />
              <Text
                style={{ color: colors.text }}
                className="ml-2 text-xs font-bold"
              >
                Call Café
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* Cancel Action */}
        {canCancel && (
          <Pressable
            onPress={handleCancel}
            style={{
              backgroundColor: isDark ? "#381816" : "#FFF8F7",
              borderColor: isDark ? "#5C2622" : "#F6D7D5",
            }}
            className="mt-4 items-center justify-center rounded-2xl border py-3.5"
          >
            <Text className="text-xs font-bold text-[#D95445]">
              {effectiveStatus === "pending"
                ? "Cancel Booking Request"
                : "Cancel Reservation"}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
