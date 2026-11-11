import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
  const { colors } = useTheme();
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
    const reviewCount =
      typeof item.reviewCount === "number" && item.reviewCount > 0
        ? item.reviewCount
        : 120 + ((item.id || item.name).length * 17) % 500;
    const priceDisplay =
      !item.priceRange
        ? "100rs~200rs"
        : item.priceRange === "₹"
        ? "100rs~200rs"
        : item.priceRange === "₹₹"
        ? "200rs~450rs"
        : item.priceRange === "₹₹₹"
        ? "450rs~800rs"
        : item.priceRange === "₹₹₹₹"
        ? "800rs~1500rs"
        : item.priceRange;

    return (
      <Pressable
        onPress={() => openCafe(item.id)}
        style={{
          marginBottom: 14,
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 22,
          backgroundColor: colors.surface,
          padding: 12,
        }}
      >
        {/* LEFT IMAGE WITH HEART & TAG */}
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 18,
            overflow: "hidden",
            backgroundColor: colors.surfaceMuted,
            position: "relative",
          }}
        >
          <Image
            source={{
              uri:
                item.image ||
                "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
            }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />

          {/* TOP-RIGHT HEART */}
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              handleToggleSave(item.id);
            }}
            hitSlop={8}
            style={{
              position: "absolute",
              top: 7,
              right: 7,
              height: 28,
              width: 28,
              borderRadius: 14,
              backgroundColor: "rgba(0,0,0,0.28)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={isSaved ? "heart" : "heart-outline"}
              size={17}
              color={isSaved ? "#FF3B30" : "#FFFFFF"}
            />
          </Pressable>

          {/* BOTTOM TAG SCRIM */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.85)"]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 44,
              justifyContent: "flex-end",
              paddingHorizontal: 8,
              paddingBottom: 6,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: "#FFFFFF",
                fontSize: 11,
                fontWeight: "900",
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              {item.featured ? "FEATURED" : "BUY1 GET1"}
            </Text>
          </LinearGradient>
        </View>

        {/* RIGHT CONTENT */}
        <View style={{ marginLeft: 14, flex: 1, minWidth: 0, justifyContent: "center" }}>
          {/* CAFE NAME */}
          <Text
            numberOfLines={1}
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: colors.text,
              letterSpacing: -0.2,
            }}
          >
            {item.name}
          </Text>

          {/* RATING, REVIEWS & PRICE */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 5,
              flexWrap: "nowrap",
            }}
          >
            <View
              style={{
                width: 17,
                height: 17,
                borderRadius: 8.5,
                backgroundColor: "#0F8A5F",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="star" size={9} color="#FFFFFF" />
            </View>

            <Text
              style={{
                marginLeft: 5,
                fontSize: 14,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              {item.rating.toFixed(1)}
            </Text>

            <Text
              style={{
                marginLeft: 3,
                fontSize: 13,
                fontWeight: "500",
                color: colors.textSecondary,
              }}
            >
              ({reviewCount})
            </Text>

            <Text
              style={{
                marginHorizontal: 5,
                fontSize: 13,
                color: colors.textSecondary,
              }}
            >
              •
            </Text>

            <Text
              numberOfLines={1}
              style={{
                flexShrink: 1,
                fontSize: 13,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              {priceDisplay}
            </Text>
          </View>

          {/* CATEGORY */}
          <Text
            numberOfLines={1}
            style={{
              marginTop: 4,
              fontSize: 14,
              fontWeight: "500",
              color: colors.textSecondary,
            }}
          >
            {item.category || "Café & Bakery"}
          </Text>

          {/* LOCATION */}
          <Text
            numberOfLines={1}
            style={{
              marginTop: 2,
              fontSize: 13,
              fontWeight: "500",
              color: colors.textSecondary,
            }}
          >
            {item.location || item.city || "Nearby"}
          </Text>
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
