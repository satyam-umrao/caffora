import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { auth } from "../../src/services/firebase/config";
import {
  addReview,
  getUserReviewForCafe,
} from "../../src/services/firebase/reviews";

const RATING_LABELS: Record<number, string> = {
  1: "Poor experience 😞",
  2: "Fair, could be better 😐",
  3: "Good, enjoyed it 🙂",
  4: "Very good, loved it! 😊",
  5: "Exceptional experience! ☕✨",
};

export default function WriteReviewModal() {
  const { cafeId, cafeName } = useLocalSearchParams<{
    cafeId: string;
    cafeName?: string;
  }>();

  const insets = useSafeAreaInsets();

  const targetCafeId =
    typeof cafeId === "string" ? cafeId : Array.isArray(cafeId) ? cafeId[0] : "";
  const targetCafeName =
    typeof cafeName === "string" ? cafeName : "this Café";

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Sign In Required", "Please sign in to post a review.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/(auth)/login") },
      ]);
      return;
    }

    if (!rating || rating < 1) {
      setError("Please select a star rating.");
      return;
    }

    if (!comment.trim() || comment.trim().length < 5) {
      setError("Please write at least a few words about your experience.");
      return;
    }

    try {
      setSubmitting(true);

      // Check if user already reviewed
      const existing = await getUserReviewForCafe(currentUser.uid, targetCafeId);
      if (existing) {
        Alert.alert(
          "Review Already Submitted",
          "You have already shared a review for this café. Thank you for your feedback!",
          [{ text: "OK", onPress: () => router.back() }],
        );
        return;
      }

      await addReview({
        cafeId: targetCafeId,
        rating,
        comment: comment.trim(),
        userName: currentUser.displayName || "Coffee Lover",
        userAvatar: currentUser.photoURL || "",
      });

      Alert.alert(
        "Review Posted! 🎉",
        "Thank you for sharing your experience with the Caffora community.",
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (err: any) {
      console.error("Submit review error:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FAF7F3" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 24),
          paddingHorizontal: 20,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Modal Header */}
        <View className="flex-row items-center justify-between pb-4">
          <View>
            <Text className="text-xl font-black text-[#241C18]">
              Write a Review
            </Text>
            <Text className="text-xs text-[#8A7D75]">{targetCafeName}</Text>
          </View>

          <Pressable
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full bg-white border border-[#EEE5DE]"
          >
            <Ionicons name="close" size={20} color="#241C18" />
          </Pressable>
        </View>

        {/* Rating Stars Card */}
        <View className="mt-3 items-center rounded-2xl border border-[#EEE5DE] bg-white p-6">
          <Text className="text-xs font-extrabold uppercase tracking-wider text-[#93867E]">
            Tap to Rate
          </Text>

          {/* Interactive Stars */}
          <View className="my-3 flex-row gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={`star-${star}`}
                onPress={() => setRating(star)}
                hitSlop={8}
                className="p-1"
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={36}
                  color={star <= rating ? "#F6B94A" : "#D0C4BC"}
                />
              </Pressable>
            ))}
          </View>

          <Text className="text-xs font-bold text-[#B95E2E]">
            {RATING_LABELS[rating] || "Select your rating"}
          </Text>
        </View>

        {/* Comment Box */}
        <View className="mt-5">
          <Text className="mb-2 text-xs font-bold text-[#302720]">
            Your Experience
          </Text>

          <View className="rounded-2xl border border-[#EEE5DE] bg-white p-3.5">
            <TextInput
              value={comment}
              onChangeText={(text) => {
                setComment(text);
                if (error) setError("");
              }}
              placeholder="What made your visit special? Mention coffee quality, seating, vibe, food, or service..."
              placeholderTextColor="#9E928A"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
              className="h-36 text-sm text-[#241C18] leading-relaxed"
            />

            <View className="flex-row justify-between items-center border-t border-[#F2ECE7] pt-2">
              <Text className="text-[10px] text-[#93867E]">
                Help other coffee lovers
              </Text>
              <Text className="text-[10px] font-bold text-[#93867E]">
                {comment.length}/500
              </Text>
            </View>
          </View>
        </View>

        {/* Error */}
        {error ? (
          <View className="mt-3 rounded-xl bg-[#FDEAE8] p-3 border border-[#F8C8C4]">
            <Text className="text-xs font-bold text-[#D95445] text-center">
              {error}
            </Text>
          </View>
        ) : null}

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          className={`mt-6 h-14 items-center justify-center rounded-2xl bg-[#B95E2E] ${
            submitting ? "opacity-70" : ""
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-base font-extrabold text-white">
              Submit Review
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
