import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
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

import { logout } from "../../src/services/firebase/auth";
import { auth } from "../../src/services/firebase/config";
import { getUserProfile } from "../../src/services/firebase/users";

/* ============================================================
   CAFFORA LIGHT THEME
============================================================ */

const COLORS = {
  /* Background */
  background: "#F8F5F1",

  /* Cards */
  card: "#FFFFFF",
  cardPressed: "#F7F2ED",

  /* Brand */
  primary: "#BB5729",
  primaryDark: "#99451F",
  primaryLight: "#D97B4E",

  /* Text */
  text: "#28201C",
  secondary: "#81756D",
  muted: "#A79B92",

  /* Lines */
  border: "#EEE7E1",

  /* Icon surface */
  iconBackground: "#F8EEE8",

  /* Toggle */
  toggleOff: "#D8D2CD",
  toggleOn: "#BB5729",

  /* Danger */
  danger: "#D8564E",
  dangerBackground: "#FFF2F1",
  dangerBorder: "#F1D8D5",
};

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
  const [profile, setProfile] = useState<Profile>({
    name: auth.currentUser?.displayName || "Caffora User",
    email: auth.currentUser?.email || "No email available",
    avatar: auth.currentUser?.photoURL || DEFAULT_AVATAR,
    phoneNumber: auth.currentUser?.phoneNumber || undefined,
  });

  const [cafeDiscovery, setCafeDiscovery] = useState(false);

  /* ==========================================================
     LOAD PROFILE
  ========================================================== */

  const loadProfileData = useCallback(async () => {
    const user = auth.currentUser;

    if (!user) {
      return;
    }

    try {
      const userDoc = await getUserProfile(user.uid);

      setProfile({
        name: userDoc?.displayName || user.displayName || "Caffora User",

        email: userDoc?.email || user.email || "No email available",

        avatar: userDoc?.photoURL || user.photoURL || DEFAULT_AVATAR,

        phoneNumber: userDoc?.phoneNumber || user.phoneNumber || undefined,
      });
    } catch (error) {
      console.error("Failed to load profile:", error);

      setProfile({
        name: user.displayName || "Caffora User",

        email: user.email || "No email available",

        avatar: user.photoURL || DEFAULT_AVATAR,

        phoneNumber: user.phoneNumber || undefined,
      });
    }
  }, []);

  /* ==========================================================
     REFRESH PROFILE WHEN SCREEN GETS FOCUS
  ========================================================== */

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData]),
  );

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout = useCallback(() => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out of your Caffora account?",
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
            } catch (error) {
              console.error("Logout error:", error);

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
              borderColor: "#DDD4CC",
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
              ACCOUNT
          ================================================== */}

          <SectionTitle title="Account" className="mt-5" />

          <View
            className="overflow-hidden rounded-[21px]"
            style={{
              backgroundColor: COLORS.card,
            }}
          >
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
  return (
    <Text
      className={`mb-2.5 text-[12px] font-medium ${className}`}
      style={{
        color: COLORS.secondary,
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
  return (
    <View>
      {/* ======================================================
          ROW
      ====================================================== */}

      <Pressable
        onPress={onPress}
        disabled={!onPress && !toggle}
        className="min-h-[53px] flex-row items-center px-4 active:bg-[#F7F2ED]"
      >
        {/* ICON */}

        <View
          className="h-8 w-8 items-center justify-center rounded-[10px]"
          style={{
            marginRight: 9,
            backgroundColor: COLORS.iconBackground,
          }}
        >
          <Ionicons name={icon} size={17} color={COLORS.primary} />
        </View>

        {/* TEXT */}

        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="text-[14px] font-medium"
            style={{
              color: COLORS.text,
            }}
          >
            {title}
          </Text>

          {subtitle ? (
            <Text
              numberOfLines={1}
              className="mt-0.5 text-[10px]"
              style={{
                color: COLORS.muted,
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
              false: COLORS.toggleOff,
              true: COLORS.toggleOn,
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={COLORS.toggleOff}
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
                  color: COLORS.secondary,
                }}
              >
                {rightText}
              </Text>
            ) : null}

            {onPress ? (
              <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
            ) : null}
          </View>
        )}
      </Pressable>

      {/* ======================================================
          STABLE SEPARATOR

          IMPORTANT:
          Do NOT use borderBottomWidth on the Pressable.
          This prevents the border flashing during tab changes.
      ====================================================== */}

      {!isLast ? (
        <View
          pointerEvents="none"
          style={{
            height: 1,
            marginLeft: 53,
            backgroundColor: COLORS.border,
          }}
        />
      ) : null}
    </View>
  );
}
