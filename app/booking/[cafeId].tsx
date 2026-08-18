import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { auth } from "../../src/services/firebase/config";
import { Cafe, getCafeById } from "../../src/services/firebase/cafes";

const TIME_SLOTS = [
  { group: "Morning", slots: ["08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM"] },
  { group: "Afternoon", slots: ["12:30 PM", "01:30 PM", "02:30 PM", "03:30 PM", "04:30 PM"] },
  { group: "Evening", slots: ["05:30 PM", "06:30 PM", "07:30 PM", "08:30 PM", "09:30 PM"] },
];

const SEATING_OPTIONS = [
  "No Preference",
  "Indoor",
  "Outdoor / Patio",
  "Window View",
  "Quiet Corner",
];

export default function BookCafeScreen() {
  const { cafeId } = useLocalSearchParams<{ cafeId: string }>();
  const insets = useSafeAreaInsets();

  const id = typeof cafeId === "string" ? cafeId : Array.isArray(cafeId) ? cafeId[0] : "";

  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState("05:30 PM");
  const [guests, setGuests] = useState(2);
  const [seating, setSeating] = useState("No Preference");
  const [specialRequests, setSpecialRequests] = useState("");

  // Generate next 14 days
  const availableDates = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);

      const dayName =
        i === 0
          ? "Today"
          : i === 1
          ? "Tomorrow"
          : date.toLocaleDateString("en-US", { weekday: "short" });

      const dayNumber = date.getDate();
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      const fullDateString = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      list.push({
        dayName,
        dayNumber,
        monthName,
        fullDateString,
      });
    }
    return list;
  }, []);

  useEffect(() => {
    async function loadCafe() {
      if (!id) return;
      try {
        const data = await getCafeById(id);
        setCafe(data);
      } catch (err) {
        console.error("Load cafe error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCafe();
  }, [id]);

  const handleProceed = () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Sign In Required", "Please sign in to complete your reservation.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/(auth)/login") },
      ]);
      return;
    }

    const chosenDate = availableDates[selectedDateIndex].fullDateString;

    router.push({
      pathname: "/booking/confirmation",
      params: {
        cafeId: id,
        cafeName: cafe?.name || "Cafe",
        cafeImage: cafe?.image || "",
        cafeLocation: cafe?.location || "",
        cafeCity: cafe?.city || "",
        date: chosenDate,
        time: selectedTime,
        guests: String(guests),
        seating,
        specialRequests,
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF7F3]">
        <ActivityIndicator size="large" color="#B95E2E" />
        <Text className="mt-3 text-sm font-semibold text-[#8A7D75]">
          Preparing booking details...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F3]" edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pb-3 pt-2 border-b border-[#EEE5DE] bg-white">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-[#FAF7F3]"
          >
            <Ionicons name="chevron-back" size={22} color="#241C18" />
          </Pressable>

          <View className="flex-1 items-center px-2">
            <Text className="text-base font-extrabold text-[#241C18]">
              Reserve a Table
            </Text>
            <Text
              className="text-xs font-semibold text-[#B95E2E]"
              numberOfLines={1}
            >
              {cafe?.name}
            </Text>
          </View>

          <View className="w-10" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}
        >
          {/* Cafe Snippet Card */}
          {cafe && (
            <View className="mt-4 flex-row items-center rounded-2xl border border-[#EEE5DE] bg-white p-3">
              <Image
                source={{
                  uri:
                    cafe.image ||
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
                  {cafe.name}
                </Text>
                <Text className="text-xs text-[#8A7D75]">
                  {cafe.location}, {cafe.city}
                </Text>
                <View className="mt-1 flex-row items-center">
                  <Ionicons name="star" size={12} color="#F6B94A" />
                  <Text className="ml-1 text-xs font-bold text-[#77532D]">
                    {cafe.rating.toFixed(1)}
                  </Text>
                  <Text className="ml-2 text-xs font-semibold text-[#B95E2E]">
                    {cafe.priceRange}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Step 1: Date Selection */}
          <View className="mt-5">
            <Text className="text-sm font-extrabold text-[#241C18]">
              1. Select Date
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3 flex-row"
              contentContainerStyle={{ gap: 10 }}
            >
              {availableDates.map((item, index) => {
                const isSelected = selectedDateIndex === index;
                return (
                  <Pressable
                    key={`date-${index}`}
                    onPress={() => setSelectedDateIndex(index)}
                    style={{ minWidth: 70 }}
                    className={`items-center justify-center rounded-2xl p-3 ${
                      isSelected
                        ? "bg-[#B95E2E]"
                        : "border border-[#EEE5DE] bg-white"
                    }`}
                  >
                    <Text
                      className={`text-[11px] font-bold ${
                        isSelected ? "text-white" : "text-[#93867E]"
                      }`}
                    >
                      {item.dayName}
                    </Text>
                    <Text
                      className={`my-0.5 text-lg font-black ${
                        isSelected ? "text-white" : "text-[#241C18]"
                      }`}
                    >
                      {item.dayNumber}
                    </Text>
                    <Text
                      className={`text-[10px] font-semibold ${
                        isSelected ? "text-white" : "text-[#93867E]"
                      }`}
                    >
                      {item.monthName}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Step 2: Time Selection */}
          <View className="mt-6">
            <Text className="text-sm font-extrabold text-[#241C18]">
              2. Select Time Slot
            </Text>
            <View className="mt-3 gap-3">
              {TIME_SLOTS.map((group) => (
                <View key={group.group}>
                  <Text className="mb-1.5 text-xs font-bold text-[#8A7D75]">
                    {group.group}
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {group.slots.map((slot) => {
                      const isSelected = selectedTime === slot;
                      return (
                        <Pressable
                          key={slot}
                          onPress={() => setSelectedTime(slot)}
                          className={`rounded-xl px-3.5 py-2.5 ${
                            isSelected
                              ? "bg-[#B95E2E]"
                              : "border border-[#EEE5DE] bg-white"
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold ${
                              isSelected ? "text-white" : "text-[#302720]"
                            }`}
                          >
                            {slot}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Step 3: Guests Counter */}
          <View className="mt-6 rounded-2xl border border-[#EEE5DE] bg-white p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-extrabold text-[#241C18]">
                  3. Number of Guests
                </Text>
                <Text className="mt-0.5 text-xs text-[#8A7D75]">
                  Table reservation for your party
                </Text>
              </View>

              <View className="flex-row items-center gap-3">
                <Pressable
                  onPress={() => setGuests((g) => Math.max(1, g - 1))}
                  className="h-10 w-10 items-center justify-center rounded-xl bg-[#FAF3EE]"
                >
                  <Ionicons name="remove" size={20} color="#B95E2E" />
                </Pressable>

                <Text className="w-8 text-center text-lg font-black text-[#241C18]">
                  {guests}
                </Text>

                <Pressable
                  onPress={() => setGuests((g) => Math.min(12, g + 1))}
                  className="h-10 w-10 items-center justify-center rounded-xl bg-[#FAF3EE]"
                >
                  <Ionicons name="add" size={20} color="#B95E2E" />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Step 4: Seating Preference */}
          <View className="mt-5">
            <Text className="text-sm font-extrabold text-[#241C18]">
              4. Seating Preference
            </Text>
            <View className="mt-2.5 flex-row flex-wrap gap-2">
              {SEATING_OPTIONS.map((opt) => {
                const isSelected = seating === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => setSeating(opt)}
                    className={`rounded-full px-4 py-2 ${
                      isSelected
                        ? "bg-[#B95E2E]"
                        : "border border-[#EEE5DE] bg-white"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? "text-white" : "text-[#5E514A]"
                      }`}
                    >
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Step 5: Special Requests */}
          <View className="mt-5">
            <Text className="text-sm font-extrabold text-[#241C18]">
              5. Special Requests (Optional)
            </Text>
            <View className="mt-2 rounded-2xl border border-[#EEE5DE] bg-white p-3">
              <TextInput
                value={specialRequests}
                onChangeText={setSpecialRequests}
                placeholder="E.g. Celebrating a birthday, high chair needed, quiet workspace..."
                placeholderTextColor="#9E928A"
                multiline
                numberOfLines={3}
                className="text-xs text-[#241C18]"
              />
            </View>
          </View>
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          className="absolute inset-x-0 bottom-0 border-t border-[#EEE5DE] bg-white px-5 pt-3"
        >
          <Pressable
            onPress={handleProceed}
            className="h-14 items-center justify-center rounded-2xl bg-[#B95E2E]"
          >
            <Text className="text-base font-extrabold text-white">
              Review Reservation →
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
