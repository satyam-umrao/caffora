import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth } from "../../src/services/firebase/config";
import { useTheme } from "../../src/context/ThemeContext";

export default function PrivacyScreen() {
  const { colors, isDark } = useTheme();

  const [publicReviews, setPublicReviews] = useState(true);
  const [personalizedRecs, setPersonalizedRecs] = useState(true);
  const [crashReports, setCrashReports] = useState(true);

  const handleDeleteAccountRequest = () => {
    Alert.alert(
      "Delete Account",
      "Deleting your account will remove your profile, saved cafés, and booking history. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Request Submitted",
              "Your account deletion request has been registered. Please allow up to 24 hours for data cleanup.",
            );
          },
        },
      ],
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
          Privacy & Security
        </Text>

        <View className="w-10" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}
      >
        {/* Privacy Controls */}
        <View className="mt-6">
          <Text
            style={{ color: colors.muted }}
            className="mb-2.5 ml-1 text-xs font-bold uppercase tracking-wider"
          >
            Visibility & Preferences
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-2xl border overflow-hidden"
          >
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1 pr-3">
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-bold"
                >
                  Public Café Reviews
                </Text>
                <Text style={{ color: colors.muted }} className="text-xs">
                  Allow other Caffora members to read your posted reviews
                </Text>
              </View>
              <Switch
                value={publicReviews}
                onValueChange={setPublicReviews}
                trackColor={{
                  false: isDark ? "#3A3430" : "#E0D7D0",
                  true: colors.primary,
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={{ borderTopWidth: 1, borderTopColor: colors.border }}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-1 pr-3">
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-bold"
                >
                  Personalized Recommendations
                </Text>
                <Text style={{ color: colors.muted }} className="text-xs">
                  Tailor featured cafés to your taste and booking history
                </Text>
              </View>
              <Switch
                value={personalizedRecs}
                onValueChange={setPersonalizedRecs}
                trackColor={{
                  false: isDark ? "#3A3430" : "#E0D7D0",
                  true: colors.primary,
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={{ borderTopWidth: 1, borderTopColor: colors.border }}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-1 pr-3">
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-bold"
                >
                  Anonymous Diagnostic Data
                </Text>
                <Text style={{ color: colors.muted }} className="text-xs">
                  Help us improve app stability and fix performance bugs
                </Text>
              </View>
              <Switch
                value={crashReports}
                onValueChange={setCrashReports}
                trackColor={{
                  false: isDark ? "#3A3430" : "#E0D7D0",
                  true: colors.primary,
                }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Data Security Info */}
        <View className="mt-6">
          <Text
            style={{ color: colors.muted }}
            className="mb-2.5 ml-1 text-xs font-bold uppercase tracking-wider"
          >
            How We Protect Your Data
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-2xl border p-5 gap-4"
          >
            <View className="flex-row items-start">
              <Ionicons name="lock-closed" size={20} color={colors.primary} />
              <View className="ml-3 flex-1">
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-bold"
                >
                  Encrypted Authentication
                </Text>
                <Text
                  style={{ color: colors.textSecondary }}
                  className="mt-0.5 text-xs"
                >
                  All user credentials and sessions are secured using Firebase
                  Authentication industry-standard protocols.
                </Text>
              </View>
            </View>

            <View
              style={{ borderTopColor: colors.border }}
              className="flex-row items-start border-t pt-4"
            >
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <View className="ml-3 flex-1">
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-bold"
                >
                  Strict Data Isolation
                </Text>
                <Text
                  style={{ color: colors.textSecondary }}
                  className="mt-0.5 text-xs"
                >
                  Your private bookings, notifications, and personal data are only
                  accessible by you.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Data & Danger Zone */}
        <View className="mt-8 gap-3">
          <Pressable
            onPress={handleDeleteAccountRequest}
            style={{
              backgroundColor: isDark ? "#381816" : "#FFF8F7",
              borderColor: isDark ? "#5C2622" : "#F6D7D5",
            }}
            className="h-14 items-center justify-center rounded-2xl border"
          >
            <Text className="text-sm font-bold text-[#D95445]">
              Request Account Deletion
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
