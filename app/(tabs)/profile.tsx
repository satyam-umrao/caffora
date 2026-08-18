import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { logout } from "../../src/services/firebase/auth";
import { auth } from "../../src/services/firebase/config";
import { getUserProfile } from "../../src/services/firebase/users";

type ProfileItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
  isLast?: boolean;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    avatar: string;
    phoneNumber?: string;
  }>({
    name: auth.currentUser?.displayName || "Caffora User",
    email: auth.currentUser?.email || "No email available",
    avatar:
      auth.currentUser?.photoURL ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    phoneNumber: auth.currentUser?.phoneNumber || undefined,
  });

  const loadProfileData = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDoc = await getUserProfile(user.uid);
      setProfile({
        name: userDoc?.displayName || user.displayName || "Caffora User",
        email: userDoc?.email || user.email || "No email available",
        avatar:
          userDoc?.photoURL ||
          user.photoURL ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
        phoneNumber: userDoc?.phoneNumber || user.phoneNumber || undefined,
      });
    } catch {
      setProfile({
        name: user.displayName || "Caffora User",
        email: user.email || "No email available",
        avatar:
          user.photoURL ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
        phoneNumber: user.phoneNumber || undefined,
      });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData]),
  );

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/(auth)/login");
          } catch (error) {
            console.error(error);
            Alert.alert("Logout failed", "Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F3]" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <View className="bg-[#BB5729] px-6 pb-10 pt-7">
          {/* Top title */}

          <View className="mb-7 flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-medium text-[#FBE7DA]">
                Welcome back
              </Text>

              <Text className="mt-1 text-3xl font-extrabold tracking-tight text-white">
                Profile
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/profile/settings")}
              className="h-11 w-11 items-center justify-center rounded-full bg-white/15"
            >
              <Ionicons name="settings-outline" size={21} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* User card */}

          <View className="flex-row items-center rounded-[24px] border border-white/15 bg-white/10 p-4">
            <Image
              source={{ uri: profile.avatar }}
              className="h-[76px] w-[76px] rounded-full border-[3px] border-white bg-[#EADFD7]"
            />

            <View className="ml-4 flex-1">
              <Text
                className="text-[21px] font-extrabold text-white"
                numberOfLines={1}
              >
                {profile.name}
              </Text>

              <Text
                className="mt-1 text-sm font-medium text-[#FBE7DA]"
                numberOfLines={1}
              >
                {profile.email}
              </Text>

              {profile.phoneNumber ? (
                <View className="mt-2 flex-row items-center">
                  <Ionicons name="call-outline" size={13} color="#FBE7DA" />
                  <Text className="ml-1.5 text-xs text-[#FBE7DA]">
                    {profile.phoneNumber}
                  </Text>
                </View>
              ) : null}
            </View>

            <Pressable
              onPress={() => router.push("/profile/edit")}
              className="ml-2 h-10 w-10 items-center justify-center rounded-full bg-white"
            >
              <Ionicons name="create-outline" size={19} color="#BB5729" />
            </Pressable>
          </View>
        </View>

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <View className="-mt-5 rounded-t-[28px] bg-[#FAF7F3] px-5 pt-6">
          {/* Account */}

          <Text className="mb-3 ml-1 text-xs font-bold uppercase tracking-[1.5px] text-[#958A82]">
            Account
          </Text>

          <View className="overflow-hidden rounded-[22px] border border-[#EEE8E2] bg-white">
            <ProfileItem
              icon="create-outline"
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => router.push("/profile/edit")}
            />

            <ProfileItem
              icon="calendar-outline"
              title="Booking History"
              subtitle="View your past and upcoming bookings"
              onPress={() => router.push("/booking/history")}
            />

            <ProfileItem
              icon="heart-outline"
              title="Saved Cafes"
              subtitle="Your favorite cafes"
              onPress={() => router.push("/(tabs)/saved")}
              isLast
            />
          </View>

          {/* Preferences */}

          <Text className="mb-3 ml-1 mt-7 text-xs font-bold uppercase tracking-[1.5px] text-[#958A82]">
            Preferences
          </Text>

          <View className="overflow-hidden rounded-[22px] border border-[#EEE8E2] bg-white">
            <ProfileItem
              icon="settings-outline"
              title="Settings"
              subtitle="App preferences and account settings"
              onPress={() => router.push("/profile/settings")}
            />

            <ProfileItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Manage your notification preferences"
              onPress={() => router.push("/profile/notifications")}
            />

            <ProfileItem
              icon="shield-checkmark-outline"
              title="Privacy"
              subtitle="Privacy and security"
              onPress={() => router.push("/profile/privacy")}
              isLast
            />
          </View>

          {/* Support */}

          <Text className="mb-3 ml-1 mt-7 text-xs font-bold uppercase tracking-[1.5px] text-[#958A82]">
            Support
          </Text>

          <View className="overflow-hidden rounded-[22px] border border-[#EEE8E2] bg-white">
            <ProfileItem
              icon="help-circle-outline"
              title="Help & Support"
              subtitle="Need help? We're here for you"
              onPress={() => router.push("/profile/help")}
            />

            <ProfileItem
              icon="information-circle-outline"
              title="About Caffora"
              subtitle="Learn more about Caffora & Policies"
              onPress={() => router.push("/profile/about")}
            />

            <ProfileItem
              icon="document-text-outline"
              title="Terms & Conditions"
              subtitle="Read our terms and policies"
              onPress={() => router.push("/profile/about")}
              isLast
            />
          </View>

          {/* ================================================= */}
          {/* LOGOUT */}
          {/* ================================================= */}

          <Pressable
            onPress={handleLogout}
            className="mt-7 h-14 flex-row items-center justify-center rounded-[18px] border border-[#F6D7D5] bg-[#FFF8F7]"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-[#FCE9E7]">
              <Ionicons name="log-out-outline" size={19} color="#E0524D" />
            </View>

            <Text className="ml-3 text-[15px] font-bold text-[#E0524D]">
              Logout
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ========================================================= */
/* ITEM COMPONENT */
/* ========================================================= */

function ProfileItem({
  icon,
  title,
  subtitle,
  onPress,
  danger,
  isLast,
}: ProfileItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-between p-4 ${
        !isLast ? "border-b border-[#F4EFEB]" : ""
      }`}
    >
      <View className="flex-row items-center flex-1 pr-3">
        <View
          className={`h-11 w-11 items-center justify-center rounded-[14px] ${
            danger ? "bg-[#FDEAE8]" : "bg-[#FAF3EE]"
          }`}
        >
          <Ionicons
            name={icon}
            size={21}
            color={danger ? "#E0524D" : "#BB5729"}
          />
        </View>

        <View className="ml-3.5 flex-1">
          <Text
            className={`text-[15px] font-bold ${
              danger ? "text-[#E0524D]" : "text-[#2B211C]"
            }`}
          >
            {title}
          </Text>

          {subtitle ? (
            <Text className="mt-0.5 text-xs text-[#8A7D75]">{subtitle}</Text>
          ) : null}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#C4B8AF" />
    </Pressable>
  );
}
