import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth } from "../../src/services/firebase/config";
import {
  getUserProfile,
  updateUserProfile,
} from "../../src/services/firebase/users";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300",
];

export default function EditProfileScreen() {
  const currentUser = auth.currentUser;

  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setDisplayName(currentUser.displayName || "");
        setPhotoURL(currentUser.photoURL || AVATAR_PRESETS[0]);
        setPhoneNumber(currentUser.phoneNumber || "");

        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          if (profile.displayName) setDisplayName(profile.displayName);
          if (profile.phoneNumber) setPhoneNumber(profile.phoneNumber);
          if (profile.photoURL) setPhotoURL(profile.photoURL);
          if (profile.bio) setBio(profile.bio);
          if (profile.city) setCity(profile.city);
        }
      } catch (err) {
        console.error("Load user profile error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) {
      Alert.alert("Error", "Please sign in to update your profile.");
      return;
    }

    if (!displayName.trim()) {
      setError("Please enter your name.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateUserProfile(currentUser.uid, {
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        photoURL: photoURL.trim(),
        bio: bio.trim(),
        city: city.trim(),
      });

      Alert.alert("Profile Updated", "Your profile changes have been saved!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error("Update profile error:", err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF7F3]">
        <ActivityIndicator size="large" color="#B95E2E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F3]" edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pb-3 pt-2 border-b border-[#EEE5DE] bg-white">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-[#FAF7F3]"
          >
            <Ionicons name="chevron-back" size={22} color="#241C18" />
          </Pressable>

          <Text className="text-base font-extrabold text-[#241C18]">
            Edit Profile
          </Text>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            className="h-10 items-center justify-center rounded-full bg-[#FAF3EE] px-4 border border-[#F2D7CA]"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#B95E2E" />
            ) : (
              <Text className="text-xs font-extrabold text-[#B95E2E]">Save</Text>
            )}
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <View className="items-center py-6">
            <View className="relative">
              <Image
                source={{
                  uri:
                    photoURL ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
                }}
                className="h-24 w-24 rounded-full border-2 border-[#B95E2E] bg-[#EADFD7]"
              />
              <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-[#B95E2E] border-2 border-white">
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
              </View>
            </View>

            <Text className="mt-3 text-xs font-bold text-[#8A7D75]">
              Select an Avatar
            </Text>

            {/* Presets */}
            <View className="mt-3 flex-row gap-3">
              {AVATAR_PRESETS.map((preset, idx) => (
                <Pressable
                  key={`preset-${idx}`}
                  onPress={() => setPhotoURL(preset)}
                  className={`rounded-full p-0.5 ${
                    photoURL === preset
                      ? "border-2 border-[#B95E2E]"
                      : "opacity-60"
                  }`}
                >
                  <Image
                    source={{ uri: preset }}
                    className="h-10 w-10 rounded-full"
                  />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Form Fields */}
          <View className="gap-4">
            {/* Full Name */}
            <View>
              <Text className="mb-1.5 text-xs font-bold text-[#302720]">
                Full Name
              </Text>
              <View className="h-14 rounded-2xl border border-[#EEE5DE] bg-white px-4 justify-center">
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Your full name"
                  placeholderTextColor="#9E928A"
                  className="text-sm font-semibold text-[#241C18]"
                />
              </View>
            </View>

            {/* Email (Read Only) */}
            <View>
              <View className="flex-row justify-between items-center mb-1.5">
                <Text className="text-xs font-bold text-[#302720]">
                  Email Address
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={12} color="#3FB950" />
                  <Text className="ml-1 text-[10px] font-bold text-[#2E7A3A]">
                    Verified
                  </Text>
                </View>
              </View>
              <View className="h-14 rounded-2xl border border-[#EBE4DC] bg-[#F7F2ED] px-4 justify-center">
                <Text className="text-sm font-medium text-[#786B63]">
                  {currentUser?.email || "No email"}
                </Text>
              </View>
            </View>

            {/* Phone */}
            <View>
              <Text className="mb-1.5 text-xs font-bold text-[#302720]">
                Phone Number
              </Text>
              <View className="h-14 rounded-2xl border border-[#EEE5DE] bg-white px-4 justify-center">
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#9E928A"
                  keyboardType="phone-pad"
                  className="text-sm font-semibold text-[#241C18]"
                />
              </View>
            </View>

            {/* City */}
            <View>
              <Text className="mb-1.5 text-xs font-bold text-[#302720]">
                City / Location
              </Text>
              <View className="h-14 rounded-2xl border border-[#EEE5DE] bg-white px-4 justify-center">
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="E.g. New Delhi, South Extension"
                  placeholderTextColor="#9E928A"
                  className="text-sm font-semibold text-[#241C18]"
                />
              </View>
            </View>

            {/* Bio / Favorite Coffee */}
            <View>
              <Text className="mb-1.5 text-xs font-bold text-[#302720]">
                About You / Coffee Vibe
              </Text>
              <View className="rounded-2xl border border-[#EEE5DE] bg-white p-3.5">
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="I love specialty pour-overs, cozy aesthetics, and quiet cafes for work..."
                  placeholderTextColor="#9E928A"
                  multiline
                  numberOfLines={3}
                  className="text-xs text-[#241C18]"
                />
              </View>
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="mt-4 rounded-xl bg-[#FDEAE8] p-3 border border-[#F8C8C4]">
              <Text className="text-xs font-bold text-[#D95445] text-center">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={saving}
            className={`mt-8 h-14 items-center justify-center rounded-2xl bg-[#B95E2E] ${
              saving ? "opacity-70" : ""
            }`}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-base font-extrabold text-white">
                Save Changes
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
