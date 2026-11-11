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
import { useTheme } from "../../src/context/ThemeContext";

const RATING_LABELS: Record<number, string> = {
  1: "Poor experience 😞",
  2: "Fair, could be better 😐",
  3: "Good, enjoyed it 🙂",
  4: "Very good, loved it! 😊",
  5: "Exceptional experience! ☕✨",
};

export default function WriteReviewModal() {
  const { colors, isDark } = useTheme();
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
      style={{ flex: 1, backgroundColor: colors.background }}
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
            <Text
              style={{ color: colors.text }}
              className="text-xl font-black"
            >
              Write a Review
            </Text>
            <Text style={{ color: colors.muted }} className="text-xs">
              {targetCafeName}
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

        {/* Rating Stars Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="mt-3 items-center rounded-2xl border p-6"
        >
          <Text
            style={{ color: colors.muted }}
            className="text-xs font-extrabold uppercase tracking-wider"
          >
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
                  color={star <= rating ? "#F6B94A" : isDark ? "#4B423C" : "#D0C4BC"}
                />
              </Pressable>
            ))}
          </View>

          <Text
            style={{ color: colors.primary }}
            className="text-xs font-bold"
          >
            {RATING_LABELS[rating] || "Select your rating"}
          </Text>
        </View>

        {/* Comment Box */}
        <View className="mt-5">
          <Text
            style={{ color: colors.text }}
            className="mb-2 text-xs font-bold"
          >
            Your Experience
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-2xl border p-3.5"
          >
            <TextInput
              value={comment}
              onChangeText={(text) => {
                setComment(text);
                if (error) setError("");
              }}
              placeholder="What made your visit special? Mention coffee quality, seating, vibe, food, or service..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
              style={{ color: colors.text }}
              className="h-36 text-sm leading-relaxed"
            />

            <View
              style={{ borderTopColor: colors.border }}
              className="flex-row justify-between items-center border-t pt-2"
            >
              <Text
                style={{ color: colors.muted }}
                className="text-[10px]"
              >
                Help other coffee lovers
              </Text>
              <Text
                style={{ color: colors.muted }}
                className="text-[10px] font-bold"
              >
                {comment.length}/500
              </Text>
            </View>
          </View>
        </View>

        {/* Error */}
        {error ? (
          <View
            style={{
              backgroundColor: isDark ? "#381816" : "#FDEAE8",
              borderColor: isDark ? "#5C2622" : "#F8C8C4",
            }}
            className="mt-3 rounded-xl p-3 border"
          >
            <Text className="text-xs font-bold text-[#D95445] text-center">
              {error}
            </Text>
          </View>
        ) : null}

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={{ backgroundColor: colors.primary }}
          className={`mt-6 h-14 items-center justify-center rounded-2xl ${
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
