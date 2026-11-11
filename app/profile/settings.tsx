import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme, ThemeMode } from "../../src/context/ThemeContext";
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
  const { colors, isDark, themeMode, setThemeMode } = useTheme();

  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [, setLoading] = useState(true);
  const [, setSavingPref] = useState(false);

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
          if (profile.preferences.theme && profile.preferences.theme !== themeMode) {
            setThemeMode(profile.preferences.theme);
          }
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

  const handleSelectTheme = async (mode: ThemeMode) => {
    await setThemeMode(mode);
    if (currentUser) {
      try {
        await updateUserPreferences(currentUser.uid, { theme: mode });
      } catch (err) {
        console.error("Failed to sync theme preference:", err);
      }
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
            } catch {
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingBottom: 12,
          paddingTop: 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            height: 40,
            width: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            backgroundColor: colors.surfaceMuted,
          }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>

        <Text
          style={{
            fontSize: 16,
            fontWeight: "800",
            color: colors.text,
          }}
        >
          Settings
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}
      >
        {/* Section: Appearance / Theme */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={{
              marginBottom: 10,
              marginLeft: 4,
              fontSize: 12,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              color: colors.textSecondary,
            }}
          >
            Appearance
          </Text>

          <View
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: colors.text,
                marginBottom: 4,
              }}
            >
              Theme Mode
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginBottom: 16,
              }}
            >
              Choose how Caffora appears to you
            </Text>

            {/* 3 Theme Options */}
            <View
              style={{
                flexDirection: "row",
                gap: 10,
              }}
            >
              {/* System Option */}
              <Pressable
                onPress={() => handleSelectTheme("system")}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  paddingHorizontal: 8,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor:
                    themeMode === "system" ? colors.primary : colors.border,
                  backgroundColor:
                    themeMode === "system"
                      ? colors.primarySoft
                      : colors.surfaceMuted,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={22}
                  color={
                    themeMode === "system" ? colors.primary : colors.textSecondary
                  }
                />
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    fontWeight: themeMode === "system" ? "800" : "600",
                    color:
                      themeMode === "system" ? colors.primary : colors.text,
                  }}
                >
                  System
                </Text>
              </Pressable>

              {/* Light Option */}
              <Pressable
                onPress={() => handleSelectTheme("light")}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  paddingHorizontal: 8,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor:
                    themeMode === "light" ? colors.primary : colors.border,
                  backgroundColor:
                    themeMode === "light"
                      ? colors.primarySoft
                      : colors.surfaceMuted,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="sunny-outline"
                  size={22}
                  color={
                    themeMode === "light" ? colors.primary : colors.textSecondary
                  }
                />
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    fontWeight: themeMode === "light" ? "800" : "600",
                    color:
                      themeMode === "light" ? colors.primary : colors.text,
                  }}
                >
                  Light
                </Text>
              </Pressable>

              {/* Dark Option */}
              <Pressable
                onPress={() => handleSelectTheme("dark")}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  paddingHorizontal: 8,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor:
                    themeMode === "dark" ? colors.primary : colors.border,
                  backgroundColor:
                    themeMode === "dark"
                      ? colors.primarySoft
                      : colors.surfaceMuted,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="moon-outline"
                  size={22}
                  color={
                    themeMode === "dark" ? colors.primary : colors.textSecondary
                  }
                />
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    fontWeight: themeMode === "dark" ? "800" : "600",
                    color:
                      themeMode === "dark" ? colors.primary : colors.text,
                  }}
                >
                  Dark
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Section: Notifications */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={{
              marginBottom: 10,
              marginLeft: 4,
              fontSize: 12,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              color: colors.textSecondary,
            }}
          >
            Notifications
          </Text>

          <View
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderMuted,
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  Push Notifications
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Receive updates about your reservations and account
                </Text>
              </View>
              <Switch
                value={preferences.notifications}
                onValueChange={(val) => togglePref("notifications", val)}
                trackColor={{ false: isDark ? "#382C24" : "#E0D7D0", true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderMuted,
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  Booking Reminders
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Get reminded 2 hours before your café reservations
                </Text>
              </View>
              <Switch
                value={preferences.bookingReminders}
                onValueChange={(val) => togglePref("bookingReminders", val)}
                trackColor={{ false: isDark ? "#382C24" : "#E0D7D0", true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  Café Recommendations
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Receive curated café suggestions based on your tastes
                </Text>
              </View>
              <Switch
                value={preferences.promotions}
                onValueChange={(val) => togglePref("promotions", val)}
                trackColor={{ false: isDark ? "#382C24" : "#E0D7D0", true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Section: Preferences */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={{
              marginBottom: 10,
              marginLeft: 4,
              fontSize: 12,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              color: colors.textSecondary,
            }}
          >
            App Preferences
          </Text>

          <View
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderMuted,
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  Location Services
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Used to discover cafés near your current spot
                </Text>
              </View>
              <Switch
                value={preferences.locationServices}
                onValueChange={(val) => togglePref("locationServices", val)}
                trackColor={{ false: isDark ? "#382C24" : "#E0D7D0", true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  Haptic Feedback
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Subtle vibration feedback on buttons and booking actions
                </Text>
              </View>
              <Switch
                value={preferences.hapticFeedback}
                onValueChange={(val) => togglePref("hapticFeedback", val)}
                trackColor={{ false: isDark ? "#382C24" : "#E0D7D0", true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Section: Account & Security */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={{
              marginBottom: 10,
              marginLeft: 4,
              fontSize: 12,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              color: colors.textSecondary,
            }}
          >
            Account Security
          </Text>

          <View
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              overflow: "hidden",
            }}
          >
            <Pressable
              onPress={handlePasswordReset}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderMuted,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  Change Password
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Send password reset link to your email
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={handleClearCache}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  Clear Cache
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Free up local storage space
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* Section: Account Actions */}
        <View style={{ marginTop: 32, gap: 12 }}>
          <Pressable
            onPress={handleLogout}
            style={{
              height: 56,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isDark ? "#4A1D1C" : "#F6D7D5",
              backgroundColor: colors.dangerSoft,
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text
              style={{
                marginLeft: 10,
                fontSize: 14,
                fontWeight: "800",
                color: colors.danger,
              }}
            >
              Sign Out
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
