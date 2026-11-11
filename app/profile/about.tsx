import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,

  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";

export default function AboutScreen() {
  const { colors } = useTheme();
  const showTermsModal = () => {
    Alert.alert(
      "Terms & Conditions",
      "By using Caffora, you agree to discover, reserve, and review cafés responsibly. Caffora provides a discovery and reservation platform and does not own the partner coffee shops. Reservations are subject to café availability.",
      [{ text: "Understood", style: "default" }],
    );
  };

  const showPrivacyPolicy = () => {
    Alert.alert(
      "Privacy Policy Summary",
      "Caffora respects your privacy. We store your account credentials securely through Firebase Authentication and only use your contact information to manage table bookings and notifications. We do not sell your personal data to third parties.",
      [{ text: "Close", style: "default" }],
    );
  };

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
          className="h-10 w-10 items-center justify-center rounded-full"
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>

        <Text
          style={{ color: colors.text }}
          className="text-base font-extrabold"
        >
          About Caffora
        </Text>

        <View className="w-10" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}
      >
        {/* Brand Banner */}
        <View className="items-center py-8">
          <View
            style={{ backgroundColor: colors.primary }}
            className="h-20 w-20 items-center justify-center rounded-3xl"
          >
            <Text className="text-3xl">☕</Text>
          </View>

          <Text
            style={{ color: colors.text }}
            className="mt-4 text-2xl font-black"
          >
            Caffora
          </Text>

          <Text
            style={{ color: colors.primary }}
            className="mt-1 text-xs font-extrabold uppercase tracking-widest"
          >
            Discover • Book • Enjoy
          </Text>

          <View
            style={{
              backgroundColor: colors.chip,
              borderColor: colors.border,
            }}
            className="mt-2.5 rounded-full px-3.5 py-1 border"
          >
            <Text
              style={{ color: colors.muted }}
              className="text-[11px] font-bold"
            >
              Version 1.0.0 (Build 54)
            </Text>
          </View>
        </View>

        {/* Mission / Story */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-2xl border p-5"
        >
          <Text
            style={{ color: colors.text }}
            className="text-sm font-black"
          >
            Our Mission
          </Text>
          <Text
            style={{ color: colors.textSecondary }}
            className="mt-2 text-xs leading-relaxed"
          >
            Caffora was built for coffee lovers, remote creators, and café
            {" enthusiasts. We believe finding the perfect coffee spot shouldn't be"}
            {" a chore—whether you're looking for specialty single-origins, cozy"}
            {" study corners, or lively brunch spots."}
          </Text>
        </View>

        {/* Feature Highlights */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="mt-5 rounded-2xl border p-5 gap-4"
        >
          <View className="flex-row items-center">
            <View
              style={{ backgroundColor: colors.chip }}
              className="h-9 w-9 items-center justify-center rounded-xl"
            >
              <Ionicons name="sparkles" size={18} color={colors.primary} />
            </View>
            <View className="ml-3 flex-1">
              <Text
                style={{ color: colors.text }}
                className="text-xs font-bold"
              >
                Handpicked Cafés
              </Text>
              <Text
                style={{ color: colors.muted }}
                className="text-[11px]"
              >
                Curated atmospheres, specialty roasters & artisan food
              </Text>
            </View>
          </View>

          <View
            style={{ borderTopColor: colors.border }}
            className="flex-row items-center border-t pt-3"
          >
            <View
              style={{ backgroundColor: colors.chip }}
              className="h-9 w-9 items-center justify-center rounded-xl"
            >
              <Ionicons name="calendar" size={18} color={colors.primary} />
            </View>
            <View className="ml-3 flex-1">
              <Text
                style={{ color: colors.text }}
                className="text-xs font-bold"
              >
                Instant Table Reservations
              </Text>
              <Text
                style={{ color: colors.muted }}
                className="text-[11px]"
              >
                Reserve tables effortlessly with zero booking fees
              </Text>
            </View>
          </View>

          <View
            style={{ borderTopColor: colors.border }}
            className="flex-row items-center border-t pt-3"
          >
            <View
              style={{ backgroundColor: colors.chip }}
              className="h-9 w-9 items-center justify-center rounded-xl"
            >
              <Ionicons name="heart" size={18} color={colors.primary} />
            </View>
            <View className="ml-3 flex-1">
              <Text
                style={{ color: colors.text }}
                className="text-xs font-bold"
              >
                Community Reviews
              </Text>
              <Text
                style={{ color: colors.muted }}
                className="text-[11px]"
              >
                Real feedback by coffee lovers for coffee lovers
              </Text>
            </View>
          </View>
        </View>

        {/* Legal & Terms */}
        <View className="mt-6">
          <Text
            style={{ color: colors.muted }}
            className="mb-2.5 ml-1 text-xs font-bold uppercase tracking-wider"
          >
            Legal & Compliance
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-2xl border overflow-hidden"
          >
            <Pressable
              onPress={showTermsModal}
              className="flex-row items-center justify-between p-4"
            >
              <Text
                style={{ color: colors.text }}
                className="text-xs font-bold"
              >
                Terms of Service
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={showPrivacyPolicy}
              style={{ borderTopWidth: 1, borderTopColor: colors.border }}
              className="flex-row items-center justify-between p-4"
            >
              <Text
                style={{ color: colors.text }}
                className="text-xs font-bold"
              >
                Privacy Policy
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert(
                  "Licenses",
                  "Caffora is powered by React Native, Expo, and Firebase. All third-party libraries are used under permissive licenses (MIT / Apache-2.0).",
                )
              }
              style={{ borderTopWidth: 1, borderTopColor: colors.border }}
              className="flex-row items-center justify-between p-4"
            >
              <Text
                style={{ color: colors.text }}
                className="text-xs font-bold"
              >
                Open Source Licenses
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* Footer info */}
        <View className="mt-10 items-center">
          <Text
            style={{ color: colors.muted }}
            className="text-xs font-semibold"
          >
            Made with ❤️ for coffee lovers
          </Text>
          <Text
            style={{ color: colors.muted }}
            className="mt-1 text-[10px]"
          >
            © {new Date().getFullYear()} Caffora Inc. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
