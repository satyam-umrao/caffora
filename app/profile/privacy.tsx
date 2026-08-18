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

export default function PrivacyScreen() {
  const currentUser = auth.currentUser;

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
    <SafeAreaView className="flex-1 bg-[#FAF7F3]" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2 border-b border-[#EEE5DE] bg-white">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-[#FAF7F3]"
        >
          <Ionicons name="chevron-back" size={22} color="#241C18" />
        </Pressable>

        <Text className="text-base font-extrabold text-[#241C18]">
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
          <Text className="mb-2.5 ml-1 text-xs font-bold uppercase tracking-wider text-[#93867E]">
            Visibility & Preferences
          </Text>

          <View className="rounded-2xl border border-[#EEE5DE] bg-white divide-y divide-[#F2ECE7] overflow-hidden">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1 pr-3">
                <Text className="text-sm font-bold text-[#241C18]">
                  Public Café Reviews
                </Text>
                <Text className="text-xs text-[#8A7D75]">
                  Allow other Caffora members to read your posted reviews
                </Text>
              </View>
              <Switch
                value={publicReviews}
                onValueChange={setPublicReviews}
                trackColor={{ false: "#E0D7D0", true: "#B95E2E" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1 pr-3">
                <Text className="text-sm font-bold text-[#241C18]">
                  Personalized Recommendations
                </Text>
                <Text className="text-xs text-[#8A7D75]">
                  Tailor featured cafés to your taste and booking history
                </Text>
              </View>
              <Switch
                value={personalizedRecs}
                onValueChange={setPersonalizedRecs}
                trackColor={{ false: "#E0D7D0", true: "#B95E2E" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1 pr-3">
                <Text className="text-sm font-bold text-[#241C18]">
                  Anonymous Diagnostic Data
                </Text>
                <Text className="text-xs text-[#8A7D75]">
                  Help us improve app stability and fix performance bugs
                </Text>
              </View>
              <Switch
                value={crashReports}
                onValueChange={setCrashReports}
                trackColor={{ false: "#E0D7D0", true: "#B95E2E" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Data Security Info */}
        <View className="mt-6">
          <Text className="mb-2.5 ml-1 text-xs font-bold uppercase tracking-wider text-[#93867E]">
            How We Protect Your Data
          </Text>

          <View className="rounded-2xl border border-[#EEE5DE] bg-white p-5 gap-4">
            <View className="flex-row items-start">
              <Ionicons name="lock-closed" size={20} color="#B95E2E" />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-[#241C18]">
                  Encrypted Authentication
                </Text>
                <Text className="mt-0.5 text-xs text-[#786B63]">
                  All user credentials and sessions are secured using Firebase
                  Authentication industry-standard protocols.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start border-t border-[#F2ECE7] pt-4">
              <Ionicons name="shield-checkmark" size={20} color="#B95E2E" />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-[#241C18]">
                  Strict Data Isolation
                </Text>
                <Text className="mt-0.5 text-xs text-[#786B63]">
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
            className="h-14 items-center justify-center rounded-2xl border border-[#F6D7D5] bg-[#FFF8F7]"
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
