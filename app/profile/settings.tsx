import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { logout, resetPassword } from "../../src/services/firebase/auth";
import { auth } from "../../src/services/firebase/config";
import {
  DEFAULT_PREFERENCES,
  getUserProfile,
  updateUserPreferences,
} from "../../src/services/firebase/users";
import type { UserPreferences } from "../../src/types/profile";

export default function SettingsScreen() {
  const currentUser = auth.currentUser;

  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [savingPref, setSavingPref] = useState(false);

  useEffect(() => {
    async function load() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(currentUser.uid);
        if (profile?.preferences) {
          setPreferences(profile.preferences);
        }
      } catch (err) {
        console.error("Load settings error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  const togglePref = async (key: keyof UserPreferences, value: boolean) => {
    if (!currentUser) return;

    const updated = { ...preferences, [key]: value };
    setPreferences(updated);

    try {
      setSavingPref(true);
      await updateUserPreferences(currentUser.uid, { [key]: value });
    } catch (err) {
      console.error("Update pref error:", err);
    } finally {
      setSavingPref(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;

    Alert.alert(
      "Reset Password",
      `Send a password reset email to ${currentUser.email}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Email",
          onPress: async () => {
            try {
              await resetPassword(currentUser.email!);
              Alert.alert(
                "Email Sent",
                "Please check your inbox for instructions to reset your password.",
              );
            } catch (err) {
              Alert.alert("Error", "Could not send password reset email.");
            }
          },
        },
      ],
    );
  };

  const handleClearCache = () => {
    Alert.alert("Clear Local Cache", "Cached images and temporary data cleared successfully.");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F3]" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2 border-b border-[#EEE5DE] bg-white">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-[#FAF7F3]"
        >
          <Ionicons name="chevron-back" size={22} color="#241C18" />
        </Pressable>

        <Text className="text-base font-extrabold text-[#241C18]">Settings</Text>

        <View className="w-10" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}
      >
        {/* Section: Notifications */}
        <View className="mt-6">
          <Text className="mb-2.5 ml-1 text-xs font-bold uppercase tracking-wider text-[#93867E]">
            Notifications
          </Text>

          <View className="rounded-2xl border border-[#EEE5DE] bg-white divide-y divide-[#F2ECE7] overflow-hidden">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1 pr-3">
                <Text className="text-sm font-bold text-[#241C18]">
                  Push Notifications
                </Text>
                <Text className="text-xs text-[#8A7D75]">
                  Receive updates about your reservations and account
                </Text>
              </View>
              <Switch
                value={preferences.notifications}
                onValueChange={(val) => togglePref("notifications", val)}
                trackColor={{ false: "#E0D7D0", true: "#B95E2E" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1 pr-3">
                <Text className="text-sm font-bold text-[#241C18]">
                  Booking Reminders
                </Text>
                <Text className="text-xs text-[#8A7D75]">
                  Get reminded 2 hours before your café reservations
                </Text>
              </View>
              <Switch
                value={preferences.bookingReminders}
                onValueChange={(val) => togglePref("bookingReminders", val)}
                trackColor={{ false: "#E0D7D0", true: "#B95E2E" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1 pr-3">
                <Text className="text-sm font-bold text-[#241C18]">
                  Café Recommendations
                </Text>
                <Text className="text-xs text-[#8A7D75]">
                  Receive curated café suggestions based on your tastes
                </Text>
              </View>
              <Switch
                value={preferences.promotions}
                onValueChange={(val) => togglePref("promotions", val)}
                trackColor={{ false: "#E0D7D0", true: "#B95E2E" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Section: Preferences */}
        <View className="mt-6">
          <Text className="mb-2.5 ml-1 text-xs font-bold uppercase tracking-wider text-[#93867E]">
            App Preferences
          </Text>

          <View className="rounded-2xl border border-[#EEE5DE] bg-white divide-y divide-[#F2ECE7] overflow-hidden">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1 pr-3">
                <Text className="text-sm font-bold text-[#241C18]">
                  Location Services
                </Text>
                <Text className="text-xs text-[#8A7D75]">
                  Used to discover cafés near your current spot
                </Text>
              </View>
              <Switch
                value={preferences.locationServices}
                onValueChange={(val) => togglePref("locationServices", val)}
                trackColor={{ false: "#E0D7D0", true: "#B95E2E" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1 pr-3">
                <Text className="text-sm font-bold text-[#241C18]">
                  Haptic Feedback
                </Text>
                <Text className="text-xs text-[#8A7D75]">
                  Subtle vibration feedback on buttons and booking actions
                </Text>
              </View>
              <Switch
                value={preferences.hapticFeedback}
                onValueChange={(val) => togglePref("hapticFeedback", val)}
                trackColor={{ false: "#E0D7D0", true: "#B95E2E" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Section: Account & Security */}
        <View className="mt-6">
          <Text className="mb-2.5 ml-1 text-xs font-bold uppercase tracking-wider text-[#93867E]">
            Account Security
          </Text>

          <View className="rounded-2xl border border-[#EEE5DE] bg-white divide-y divide-[#F2ECE7] overflow-hidden">
            <Pressable
              onPress={handlePasswordReset}
              className="flex-row items-center justify-between p-4"
            >
              <View>
                <Text className="text-sm font-bold text-[#241C18]">
                  Change Password
                </Text>
                <Text className="text-xs text-[#8A7D75]">
                  Send password reset link to your email
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#B7ABA3" />
            </Pressable>

            <Pressable
              onPress={handleClearCache}
              className="flex-row items-center justify-between p-4"
            >
              <View>
                <Text className="text-sm font-bold text-[#241C18]">
                  Clear Cache
                </Text>
                <Text className="text-xs text-[#8A7D75]">
                  Free up local storage space
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#B7ABA3" />
            </Pressable>
          </View>
        </View>

        {/* Section: Account Actions */}
        <View className="mt-8 gap-3">
          <Pressable
            onPress={handleLogout}
            className="h-14 flex-row items-center justify-center rounded-2xl border border-[#F6D7D5] bg-[#FFF8F7]"
          >
            <Ionicons name="log-out-outline" size={20} color="#E0524D" />
            <Text className="ml-2.5 text-sm font-extrabold text-[#E0524D]">
              Sign Out
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
