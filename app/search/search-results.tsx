import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Cafe, searchCafes } from "../../src/services/firebase/cafes";
import {
  getSavedCafeIds,
  toggleCafeSaved,
} from "../../src/services/firebase/favorites";
import { useTheme } from "../../src/context/ThemeContext";

export default function SearchResultsScreen() {
  const { colors, isDark } = useTheme();
  const { query } = useLocalSearchParams<{ query?: string }>();

  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const searchQuery = typeof query === "string" ? query.trim() : "";

  const loadSaved = useCallback(async () => {
    try {
      const ids = await getSavedCafeIds();
      setSavedIds(ids);
    } catch (err) {
      console.error("Load saved error:", err);
    }
  }, []);

  const runSearch = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const results = await searchCafes(searchQuery);
      setCafes(results);
    } catch (err) {
      console.error("Search error:", err);
      setError("We couldn't load search results.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    runSearch();
    loadSaved();
  }, [runSearch, loadSaved]);

  const handleToggleSave = async (cafeId: string) => {
    try {
      const saved = await toggleCafeSaved(cafeId);
      setSavedIds((current) =>
        saved ? [...current, cafeId] : current.filter((id) => id !== cafeId),
      );
    } catch (err: any) {
      if (err?.message === "LOGIN_REQUIRED") {
        router.push("/(auth)/login");
      }
    }
  };

  const openCafe = (cafeId: string) => {
    router.push({
      pathname: "/cafe/[id]",
      params: {
        id: cafeId,
      },
    });
  };

  const renderCafe = ({ item }: { item: Cafe }) => {
    const isSaved = savedIds.includes(item.id);

    return (
      <Pressable
        onPress={() => openCafe(item.id)}
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
        className="mb-4 overflow-hidden rounded-2xl border"
      >
        {/* Cafe Image */}
        <View
          style={{ backgroundColor: colors.cardAlt }}
          className="relative h-[190px] w-full"
        >
          <Image
            source={{
              uri:
                item.image ||
                "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
            }}
            className="h-full w-full"
            resizeMode="cover"
          />

          {/* Featured */}
          {item.featured && (
            <View
              style={{ backgroundColor: colors.primary }}
              className="absolute left-3 top-3 rounded-full px-3 py-1"
            >
              <Text className="text-[11px] font-bold text-white">Featured</Text>
            </View>
          )}

          {/* Rating */}
          <View
            style={{ backgroundColor: isDark ? "rgba(33, 27, 24, 0.9)" : "rgba(255, 255, 255, 0.95)" }}
            className="absolute right-3 top-3 flex-row items-center rounded-full px-2.5 py-1.5 shadow-sm"
          >
            <Ionicons name="star" size={14} color="#F6B94A" />
            <Text
              style={{ color: colors.text }}
              className="ml-1 text-[12px] font-extrabold"
            >
              {item.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Cafe Information */}
        <View className="p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text
                style={{ color: colors.text }}
                className="text-[17px] font-extrabold"
                numberOfLines={1}
              >
                {item.name}
              </Text>

              <Text
                style={{ color: colors.muted }}
                className="mt-1 text-[13px] font-medium"
                numberOfLines={1}
              >
                {item.category} • {item.priceRange}
              </Text>
            </View>

            <Pressable
              onPress={() => handleToggleSave(item.id)}
              style={{ backgroundColor: colors.chip }}
              className="h-9 w-9 items-center justify-center rounded-full"
            >
              <Ionicons
                name={isSaved ? "heart" : "heart-outline"}
                size={19}
                color={isSaved ? "#E0524D" : colors.primary}
              />
            </Pressable>
          </View>

          {/* Location */}
          <View className="mt-3 flex-row items-center">
            <Ionicons name="location-outline" size={16} color={colors.muted} />
            <Text
              style={{ color: colors.textSecondary }}
              className="ml-1.5 flex-1 text-[13px]"
              numberOfLines={1}
            >
              {item.location}, {item.city}
            </Text>
          </View>

          {/* Reviews */}
          <View className="mt-2 flex-row items-center">
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={15}
              color={colors.muted}
            />
            <Text
              style={{ color: colors.muted }}
              className="ml-1.5 text-[12px]"
            >
              {item.reviewCount} reviews
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.background }}
      className="flex-1"
      edges={["top"]}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }}
        className="flex-row items-center px-5 pb-4 pt-3 border-b"
      >
        <Pressable
          onPress={() => router.back()}
          style={{ backgroundColor: colors.cardAlt }}
          className="h-10 w-10 items-center justify-center rounded-full"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>

        <View className="ml-3 flex-1">
          <Text
            style={{ color: colors.muted }}
            className="text-[12px] font-medium"
          >
            Search results
          </Text>

          <Text
            style={{ color: colors.text }}
            className="mt-0.5 text-[18px] font-extrabold"
            numberOfLines={1}
          >
            {searchQuery || "All cafés"}
          </Text>
        </View>
      </View>

      {/* Loading */}
      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={{ color: colors.muted }}
            className="mt-3 text-sm"
          >
            Finding cafés...
          </Text>
        </View>
      )}

      {/* Error */}
      {!loading && error !== "" && (
        <View className="flex-1 items-center justify-center px-8">
          <View
            style={{ backgroundColor: colors.chip }}
            className="h-16 w-16 items-center justify-center rounded-full"
          >
            <Ionicons name="cloud-offline-outline" size={28} color={colors.primary} />
          </View>

          <Text
            style={{ color: colors.text }}
            className="mt-4 text-center text-[17px] font-bold"
          >
            Something went wrong
          </Text>

          <Text
            style={{ color: colors.muted }}
            className="mt-2 text-center text-sm"
          >
            {error}
          </Text>

          <Pressable
            onPress={runSearch}
            style={{ backgroundColor: colors.primary }}
            className="mt-5 rounded-xl px-6 py-3"
          >
            <Text className="font-bold text-white">Try again</Text>
          </Pressable>
        </View>
      )}

      {/* Results */}
      {!loading && error === "" && (
        <FlatList
          data={cafes}
          keyExtractor={(item) => item.id}
          renderItem={renderCafe}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 40,
          }}
          ListHeaderComponent={
            cafes.length > 0 ? (
              <View className="mb-4">
                <Text
                  style={{ color: colors.muted }}
                  className="text-[13px] font-semibold"
                >
                  {cafes.length} {cafes.length === 1 ? "café" : "cafés"} found
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-5 pt-24">
              <View
                style={{ backgroundColor: colors.chip }}
                className="h-20 w-20 items-center justify-center rounded-full"
              >
                <Ionicons name="search-outline" size={34} color={colors.primary} />
              </View>

              <Text
                style={{ color: colors.text }}
                className="mt-5 text-center text-[20px] font-bold"
              >
                No cafés found
              </Text>

              <Text
                style={{ color: colors.muted }}
                className="mt-2 text-center text-sm leading-5"
              >
                {"We couldn't find any cafés matching "}
                <Text style={{ color: colors.text }} className="font-semibold">{`"${searchQuery}"`}</Text>.
              </Text>

              <Pressable
                onPress={() => router.back()}
                style={{ backgroundColor: colors.primary }}
                className="mt-6 rounded-xl px-6 py-3"
              >
                <Text className="font-bold text-white">Try another search</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
