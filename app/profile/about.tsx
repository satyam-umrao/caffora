import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutScreen() {
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
          <View className="h-20 w-20 items-center justify-center rounded-3xl bg-[#B95E2E]">
            <Text className="text-3xl">☕</Text>
          </View>

          <Text className="mt-4 text-2xl font-black text-[#241C18]">
            Caffora
          </Text>

          <Text className="mt-1 text-xs font-extrabold uppercase tracking-widest text-[#B95E2E]">
            Discover • Book • Enjoy
          </Text>

          <View className="mt-2.5 rounded-full bg-[#FAF3EE] px-3.5 py-1 border border-[#F2D7CA]">
            <Text className="text-[11px] font-bold text-[#8A7D75]">
              Version 1.0.0 (Build 54)
            </Text>
          </View>
        </View>

        {/* Mission / Story */}
        <View className="rounded-2xl border border-[#EEE5DE] bg-white p-5">
          <Text className="text-sm font-black text-[#241C18]">Our Mission</Text>
          <Text className="mt-2 text-xs leading-relaxed text-[#5E514A]">
            Caffora was built for coffee lovers, remote creators, and café
            enthusiasts. We believe finding the perfect coffee spot shouldn't be
            a chore—whether you're looking for specialty single-origins, cozy
            study corners, or lively brunch spots.
          </Text>
        </View>

        {/* Feature Highlights */}
        <View className="mt-5 rounded-2xl border border-[#EEE5DE] bg-white p-5 gap-4">
          <View className="flex-row items-center">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#FAF3EE]">
              <Ionicons name="sparkles" size={18} color="#B95E2E" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs font-bold text-[#241C18]">
                Handpicked Cafés
              </Text>
              <Text className="text-[11px] text-[#8A7D75]">
                Curated atmospheres, specialty roasters & artisan food
              </Text>
            </View>
          </View>

          <View className="flex-row items-center border-t border-[#F2ECE7] pt-3">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#FAF3EE]">
              <Ionicons name="calendar" size={18} color="#B95E2E" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs font-bold text-[#241C18]">
                Instant Table Reservations
              </Text>
              <Text className="text-[11px] text-[#8A7D75]">
                Reserve tables effortlessly with zero booking fees
              </Text>
            </View>
          </View>

          <View className="flex-row items-center border-t border-[#F2ECE7] pt-3">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#FAF3EE]">
              <Ionicons name="heart" size={18} color="#B95E2E" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs font-bold text-[#241C18]">
                Community Reviews
              </Text>
              <Text className="text-[11px] text-[#8A7D75]">
                Real feedback by coffee lovers for coffee lovers
              </Text>
            </View>
          </View>
        </View>

        {/* Legal & Terms */}
        <View className="mt-6">
          <Text className="mb-2.5 ml-1 text-xs font-bold uppercase tracking-wider text-[#93867E]">
            Legal & Compliance
          </Text>

          <View className="rounded-2xl border border-[#EEE5DE] bg-white divide-y divide-[#F2ECE7] overflow-hidden">
            <Pressable
              onPress={showTermsModal}
              className="flex-row items-center justify-between p-4"
            >
              <Text className="text-xs font-bold text-[#241C18]">
                Terms of Service
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#B7ABA3" />
            </Pressable>

            <Pressable
              onPress={showPrivacyPolicy}
              className="flex-row items-center justify-between p-4"
            >
              <Text className="text-xs font-bold text-[#241C18]">
                Privacy Policy
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#B7ABA3" />
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert(
                  "Licenses",
                  "Caffora is powered by React Native, Expo, and Firebase. All third-party libraries are used under permissive licenses (MIT / Apache-2.0).",
                )
              }
              className="flex-row items-center justify-between p-4"
            >
              <Text className="text-xs font-bold text-[#241C18]">
                Open Source Licenses
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#B7ABA3" />
            </Pressable>
          </View>
        </View>

        {/* Footer info */}
        <View className="mt-10 items-center">
          <Text className="text-xs font-semibold text-[#8A7D75]">
            Made with ❤️ for coffee lovers
          </Text>
          <Text className="mt-1 text-[10px] text-[#A99D95]">
            © {new Date().getFullYear()} Caffora Inc. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
