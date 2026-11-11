import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../src/context/ThemeContext";
import { logout } from "../../src/services/firebase/auth";
import { auth } from "../../src/services/firebase/config";
import { getUserProfile } from "../../src/services/firebase/users";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500";

/* ============================================================
   TYPES
============================================================ */

type Profile = {
  name: string;
  email: string;
  avatar: string;
  phoneNumber?: string;
};

type ProfileRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  toggle?: boolean;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  rightText?: string;
  isLast?: boolean;
};

/* ============================================================
   PROFILE SCREEN
============================================================ */

export default function ProfileScreen() {
  const { colors, isDark, themeMode } = useTheme();

  const [profile, setProfile] = useState<Profile>({
    name: auth.currentUser?.displayName || "Caffora User",
    email: auth.currentUser?.email || "No email available",
    avatar: auth.currentUser?.photoURL || DEFAULT_AVATAR,
    phoneNumber: auth.currentUser?.phoneNumber || undefined,
  });

  const [cafeDiscovery, setCafeDiscovery] = useState(false);

  /* ==========================================================
     DYNAMIC THEME TOKENS
  ========================================================== */

  const COLORS = useMemo(
    () => ({
      background: colors.background,
      card: colors.surface,
      cardPressed: colors.surfacePressed,
      primary: colors.primary,
      primaryDark: colors.primaryDark,
      primaryLight: colors.primaryLight,
      text: colors.text,
      secondary: colors.textSecondary,
      muted: colors.textMuted,
      border: colors.border,
      iconBackground: colors.primarySoft,
      toggleOff: isDark ? "#382C24" : "#D8D2CD",
      toggleOn: colors.primary,
      danger: colors.danger,
      dangerBackground: colors.dangerSoft,
      dangerBorder: isDark ? "#4A1D1C" : "#F1D8D5",
    }),
    [colors, isDark],
  );

  /* ==========================================================
     LOAD PROFILE
  ========================================================== */

  const loadProfile = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const data = await getUserProfile(user.uid);
      if (data) {
        setProfile({
          name: data.displayName || "Caffora User",
          email: data.email || user.email || "No email available",
          avatar: data.photoURL || DEFAULT_AVATAR,
          phoneNumber: data.phoneNumber || undefined,
        });
      }
    } catch (e) {
      console.log("Error loading profile:", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout = useCallback(() => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out of your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log out",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/(auth)/login");
            } catch {
              Alert.alert(
                "Logout failed",
                "Something went wrong. Please try again.",
              );
            }
          },
        },
      ],
    );
  }, []);

  /* ==========================================================
     SCREEN
  ========================================================== */

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1"
      style={{
        backgroundColor: COLORS.background,
      }}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        style={{
          backgroundColor: COLORS.background,
        }}
        contentContainerStyle={{
          paddingBottom: 70,
        }}
      >
        {/* ====================================================
            TOP BAR
        ==================================================== */}

        <View
          className="px-4 pt-2"
          style={{
            backgroundColor: COLORS.background,
          }}
        >
          <View className="h-12 flex-row items-center justify-between">
            {/* BACK */}

            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              className="h-11 w-11 items-center justify-center rounded-full active:opacity-60"
              style={{
                backgroundColor: COLORS.card,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <Ionicons name="chevron-back" size={21} color={COLORS.text} />
            </Pressable>

            {/* TITLE */}

            <Text
              className="text-[17px] font-semibold"
              style={{
                color: COLORS.text,
              }}
            >
              Profile
            </Text>

            {/* SETTINGS */}

            <Pressable
              onPress={() => router.push("/profile/settings")}
              hitSlop={8}
              className="h-11 w-11 items-center justify-center rounded-full active:opacity-60"
              style={{
                backgroundColor: COLORS.card,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <Ionicons name="settings-outline" size={20} color={COLORS.text} />
            </Pressable>
          </View>
        </View>

        {/* ====================================================
            PROFILE HEADER
        ==================================================== */}

        <View
          className="items-center px-5 pb-7 pt-6"
          style={{
            backgroundColor: COLORS.background,
          }}
        >
          {/* AVATAR */}

          <View
            className="items-center justify-center rounded-full"
            style={{
              width: 112,
              height: 112,
              backgroundColor: COLORS.card,
              borderWidth: 2,
              borderColor: COLORS.primary,
            }}
          >
            <Image
              source={{
                uri: profile.avatar || DEFAULT_AVATAR,
              }}
              className="h-[104px] w-[104px] rounded-full"
              resizeMode="cover"
            />
          </View>

          {/* PRO BADGE */}

          <View
            className="absolute items-center justify-center rounded-full px-3"
            style={{
              top: 108,
              height: 21,
              backgroundColor: COLORS.primary,
            }}
          >
            <Text
              className="text-[10px] font-black"
              style={{
                color: "#FFFFFF",
              }}
            >
              PRO
            </Text>
          </View>

          {/* NAME */}

          <Text
            numberOfLines={1}
            className="mt-7 max-w-[90%] text-center text-[25px] font-semibold"
            style={{
              color: COLORS.text,
            }}
          >
            {profile.name}
          </Text>

          {/* EMAIL */}

          <Text
            numberOfLines={1}
            className="mt-1.5 max-w-[90%] text-center text-[13px]"
            style={{
              color: COLORS.secondary,
            }}
          >
            {profile.email}
          </Text>

          {/* PHONE */}

          {profile.phoneNumber ? (
            <Text
              numberOfLines={1}
              className="mt-1 text-center text-[12px]"
              style={{
                color: COLORS.muted,
              }}
            >
              {profile.phoneNumber}
            </Text>
          ) : null}

          {/* EDIT PROFILE */}

          <Pressable
            onPress={() => router.push("/profile/edit")}
            className="mt-4 flex-row items-center rounded-full px-4 active:opacity-60"
            style={{
              height: 35,
              backgroundColor: COLORS.card,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Ionicons name="pencil-outline" size={14} color={COLORS.text} />

            <Text
              className="ml-2 text-[12px] font-medium"
              style={{
                color: COLORS.text,
              }}
            >
              Edit Profile
            </Text>
          </Pressable>
        </View>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <View className="px-4">
          {/* ==================================================
              DISCOVERY
          ================================================== */}

          <SectionTitle title="Discovery" />

          <View
            className="overflow-hidden rounded-[21px]"
            style={{
              backgroundColor: COLORS.card,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <ProfileRow
              icon="cafe-outline"
              title="Cafe discovery"
              toggle
              value={cafeDiscovery}
              onToggle={setCafeDiscovery}
            />

            <ProfileRow
              icon="analytics-outline"
              title="Coffee profile"
              subtitle="Your coffee preferences"
              rightText="Personal"
              onPress={() => router.push("/profile/edit")}
              isLast
            />
          </View>

          {/* ==================================================
              SHORTCUTS
          ================================================== */}

          <SectionTitle title="Shortcuts" className="mt-5" />

          <View
            className="overflow-hidden rounded-[21px]"
            style={{
              backgroundColor: COLORS.card,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <ProfileRow
              icon="calendar-outline"
              title="Booking history"
              onPress={() => router.push("/booking/history")}
            />

            <ProfileRow
              icon="heart-outline"
              title="Saved cafes"
              onPress={() => router.push("/(tabs)/saved")}
            />

            <ProfileRow
              icon="chatbox-ellipses-outline"
              title="Contact us"
              onPress={() => router.push("/profile/help")}
              isLast
            />
          </View>

          {/* ==================================================
              ACCOUNT & PREFERENCES
          ================================================== */}

          <SectionTitle title="Account & Preferences" className="mt-5" />

          <View
            className="overflow-hidden rounded-[21px]"
            style={{
              backgroundColor: COLORS.card,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <ProfileRow
              icon={isDark ? "moon-outline" : "sunny-outline"}
              title="Appearance"
              subtitle="Theme mode"
              rightText={
                themeMode === "system"
                  ? "System"
                  : themeMode === "dark"
                    ? "Dark"
                    : "Light"
              }
              onPress={() => router.push("/profile/settings")}
            />

            <ProfileRow
              icon="person-outline"
              title="Edit profile"
              onPress={() => router.push("/profile/edit")}
            />

            <ProfileRow
              icon="notifications-outline"
              title="Notifications"
              onPress={() => router.push("/profile/notifications")}
            />

            <ProfileRow
              icon="shield-outline"
              title="Privacy & security"
              onPress={() => router.push("/profile/privacy")}
            />

            <ProfileRow
              icon="settings-outline"
              title="Settings"
              onPress={() => router.push("/profile/settings")}
              isLast
            />
          </View>

          {/* ==================================================
              LOGOUT
          ================================================== */}

          <Pressable
            onPress={handleLogout}
            className="mt-5 h-[52px] flex-row items-center justify-center rounded-[18px] active:opacity-60"
            style={{
              backgroundColor: COLORS.dangerBackground,
              borderWidth: 1,
              borderColor: COLORS.dangerBorder,
            }}
          >
            <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />

            <Text
              className="ml-2 text-[13px] font-semibold"
              style={{
                color: COLORS.danger,
              }}
            >
              Log out
            </Text>
          </Pressable>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <Text
            className="mt-6 text-center text-[10px]"
            style={{
              color: COLORS.muted,
            }}
          >
            Caffora · Your coffee, your way
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

function SectionTitle({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  const { colors } = useTheme();

  return (
    <Text
      className={`mb-2.5 text-[12px] font-medium ${className}`}
      style={{
        color: colors.textSecondary,
      }}
    >
      {title}
    </Text>
  );
}

/* ============================================================
   PROFILE ROW
============================================================ */

function ProfileRow({
  icon,
  title,
  subtitle,
  onPress,
  toggle = false,
  value = false,
  onToggle,
  rightText,
  isLast = false,
}: ProfileRowProps) {
  const { colors, isDark } = useTheme();

  return (
    <View>
      <Pressable
        onPress={onPress}
        disabled={!onPress && !toggle}
        className="min-h-[53px] flex-row items-center px-4"
        style={({ pressed }) => ({
          backgroundColor:
            pressed && onPress ? colors.surfacePressed : colors.surface,
        })}
      >
        {/* ICON */}

        <View
          className="h-8 w-8 items-center justify-center rounded-[10px]"
          style={{
            marginRight: 9,
            backgroundColor: colors.primarySoft,
          }}
        >
          <Ionicons name={icon} size={17} color={colors.primary} />
        </View>

        {/* TEXT */}

        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="text-[14px] font-medium"
            style={{
              color: colors.text,
            }}
          >
            {title}
          </Text>

          {subtitle ? (
            <Text
              numberOfLines={1}
              className="mt-0.5 text-[10px]"
              style={{
                color: colors.textSecondary,
              }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* ====================================================
            RIGHT SIDE
        ==================================================== */}

        {toggle ? (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{
              false: isDark ? "#382C24" : "#D8D2CD",
              true: colors.primary,
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={isDark ? "#382C24" : "#D8D2CD"}
            style={{
              transform: [
                {
                  scaleX: 0.82,
                },
                {
                  scaleY: 0.82,
                },
              ],
            }}
          />
        ) : (
          <View className="flex-row items-center">
            {rightText ? (
              <Text
                numberOfLines={1}
                className="mr-2 text-[12px]"
                style={{
                  color: colors.textSecondary,
                }}
              >
                {rightText}
              </Text>
            ) : null}

            {onPress ? (
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.muted}
              />
            ) : null}
          </View>
        )}
      </Pressable>

      {!isLast ? (
        <View
          pointerEvents="none"
          style={{
            height: 1,
            marginLeft: 53,
            backgroundColor: colors.border,
          }}
        />
      ) : null}
    </View>
  );
}
