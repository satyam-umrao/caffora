import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { logout } from "../../src/services/firebase/auth";
import { auth } from "../../src/services/firebase/config";

type ProfileItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
  isLast?: boolean;
};

export default function ProfileScreen() {
  const user = auth.currentUser;

  const name = user?.displayName || "Caffora User";
  const email = user?.email || "No email available";
  const avatar = user?.photoURL || "https://i.pravatar.cc/300?img=12";

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
        contentContainerClassName="pb-[130px]"
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
              className="h-11 w-11 items-center justify-center rounded-full bg-white/15 active:bg-white/25"
            >
              <Ionicons name="settings-outline" size={21} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* User card */}

          <View className="flex-row items-center rounded-[24px] border border-white/15 bg-white/10 p-4">
            <Image
              source={{ uri: avatar }}
              className="h-[76px] w-[76px] rounded-full border-[3px] border-white"
            />

            <View className="ml-4 flex-1">
              <Text
                className="text-[21px] font-extrabold text-white"
                numberOfLines={1}
              >
                {name}
              </Text>

              <Text
                className="mt-1 text-sm font-medium text-[#FBE7DA]"
                numberOfLines={1}
              >
                {email}
              </Text>

              {user?.phoneNumber && (
                <View className="mt-2 flex-row items-center">
                  <Ionicons name="call-outline" size={13} color="#FBE7DA" />

                  <Text className="ml-1.5 text-xs text-[#FBE7DA]">
                    {user.phoneNumber}
                  </Text>
                </View>
              )}
            </View>

            <Pressable
              onPress={() => router.push("/profile/edit")}
              className="ml-2 h-10 w-10 items-center justify-center rounded-full bg-white active:bg-[#FBE7DA]"
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
              onPress={() => router.push("/saved")}
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
              subtitle="Learn more about Caffora"
              onPress={() => router.push("/profile/about")}
            />

            <ProfileItem
              icon="document-text-outline"
              title="Terms & Conditions"
              subtitle="Read our terms and policies"
              onPress={() =>
                Alert.alert(
                  "Terms & Conditions",
                  "Terms & Conditions will be available soon.",
                )
              }
              isLast
            />
          </View>

          {/* ================================================= */}
          {/* LOGOUT */}
          {/* ================================================= */}

          <Pressable
            onPress={handleLogout}
            className="mt-7 h-14 flex-row items-center justify-center rounded-[18px] border border-[#F6D7D5] bg-[#FFF8F7] active:bg-[#FFF0EE]"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-[#FCE9E7]">
              <Ionicons name="log-out-outline" size={19} color="#E0524D" />
            </View>

            <Text className="ml-3 text-[15px] font-bold text-[#E0524D]">
              Logout
            </Text>
          </Pressable>

          {/* Version */}

          <Text className="mt-6 text-center text-xs font-medium text-[#B0A7A0]">
            Caffora
          </Text>

          <Text className="mt-1 text-center text-[10px] text-[#C0B8B1]">
            Your coffee. Your place.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ========================================================= */
/* PROFILE ITEM */
/* ========================================================= */

function ProfileItem({
  icon,
  title,
  subtitle,
  onPress,
  isLast = false,
}: ProfileItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-4 py-4 active:bg-[#FAF7F3] ${
        !isLast ? "border-b border-[#F0EBE6]" : ""
      }`}
    >
      {/* Icon */}

      <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-[#FAF6F2]">
        <Ionicons name={icon} size={21} color="#BB5729" />
      </View>

      {/* Text */}

      <View className="ml-4 flex-1">
        <Text className="text-[15px] font-bold text-[#302A26]">{title}</Text>

        {subtitle && (
          <Text
            className="mt-1 text-xs font-medium text-[#9A918A]"
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* Arrow */}

      <View className="h-8 w-8 items-center justify-center rounded-full bg-[#FAF8F5]">
        <Ionicons name="chevron-forward" size={16} color="#B6ADA6" />
      </View>
    </Pressable>
  );
}
