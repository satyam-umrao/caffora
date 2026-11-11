import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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

import { useTheme } from "../../src/context/ThemeContext";
import { auth } from "../../src/services/firebase/config";
import {
  getUserProfile,
  updateUserProfile,
} from "../../src/services/firebase/users";

const AVATAR_PRESETS = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHcv98VeXj-6bUz4lgXW7eSKDfdrZjlcgmj4Hb9COBtA&s=10",
  "https://latestpfp.com/wp-content/uploads/2026/10/cartoon-boy-heart-pfp-sweater-patch.webp",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKNqaGSqUcqzv3YTREJy6AmFEVqp0ulvOzq2zacDP8NA&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2O2ndqEbsll4DGQdD4BgLrNnOKpjD3JpOHXKRL4wB-w&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiaK61I3GqHNoOYp1lhOcPlxL-9wWyTVykGQHSTIJ-nQ&s=10  ",
];

export default function EditProfileScreen() {
  const { colors, isDark } = useTheme();
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
      <SafeAreaView
        style={{ backgroundColor: colors.background }}
        className="flex-1 items-center justify-center"
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.background }}
      className="flex-1"
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
            Edit Profile
          </Text>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={{
              backgroundColor: colors.chip,
              borderColor: colors.border,
            }}
            className="h-10 items-center justify-center rounded-full px-4 border"
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text
                style={{ color: colors.primary }}
                className="text-xs font-extrabold"
              >
                Save
              </Text>
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
                style={{
                  borderColor: colors.primary,
                  backgroundColor: colors.cardAlt,
                }}
                className="h-24 w-24 rounded-full border-2"
              />
              <View
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.surface,
                }}
                className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2"
              >
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
              </View>
            </View>

            <Text
              style={{ color: colors.muted }}
              className="mt-3 text-xs font-bold"
            >
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
              <Text
                style={{ color: colors.text }}
                className="mb-1.5 text-xs font-bold"
              >
                Full Name
              </Text>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
                className="h-14 rounded-2xl border px-4 justify-center"
              >
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Your full name"
                  placeholderTextColor={colors.muted}
                  style={{ color: colors.text }}
                  className="text-sm font-semibold"
                />
              </View>
            </View>

            {/* Email (Read Only) */}
            <View>
              <View className="flex-row justify-between items-center mb-1.5">
                <Text
                  style={{ color: colors.text }}
                  className="text-xs font-bold"
                >
                  Email Address
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={12} color="#3FB950" />
                  <Text
                    style={{ color: isDark ? "#4ADE80" : "#2E7A3A" }}
                    className="ml-1 text-[10px] font-bold"
                  >
                    Verified
                  </Text>
                </View>
              </View>
              <View
                style={{
                  backgroundColor: colors.cardAlt,
                  borderColor: colors.border,
                }}
                className="h-14 rounded-2xl border px-4 justify-center"
              >
                <Text
                  style={{ color: colors.muted }}
                  className="text-sm font-medium"
                >
                  {currentUser?.email || "No email"}
                </Text>
              </View>
            </View>

            {/* Phone */}
            <View>
              <Text
                style={{ color: colors.text }}
                className="mb-1.5 text-xs font-bold"
              >
                Phone Number
              </Text>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
                className="h-14 rounded-2xl border px-4 justify-center"
              >
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                  style={{ color: colors.text }}
                  className="text-sm font-semibold"
                />
              </View>
            </View>

            {/* City */}
            <View>
              <Text
                style={{ color: colors.text }}
                className="mb-1.5 text-xs font-bold"
              >
                City / Location
              </Text>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
                className="h-14 rounded-2xl border px-4 justify-center"
              >
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="E.g. New Delhi, South Extension"
                  placeholderTextColor={colors.muted}
                  style={{ color: colors.text }}
                  className="text-sm font-semibold"
                />
              </View>
            </View>

            {/* Bio / Favorite Coffee */}
            <View>
              <Text
                style={{ color: colors.text }}
                className="mb-1.5 text-xs font-bold"
              >
                About You / Coffee Vibe
              </Text>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
                className="rounded-2xl border p-3.5"
              >
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="I love specialty pour-overs, cozy aesthetics, and quiet cafes for work..."
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={3}
                  style={{ color: colors.text }}
                  className="text-xs"
                />
              </View>
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <View
              style={{
                backgroundColor: isDark ? "#381816" : "#FDEAE8",
                borderColor: isDark ? "#5C2622" : "#F8C8C4",
              }}
              className="mt-4 rounded-xl p-3 border"
            >
              <Text className="text-xs font-bold text-[#D95445] text-center">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={{ backgroundColor: colors.primary }}
            className={`mt-8 h-14 items-center justify-center rounded-2xl ${
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
