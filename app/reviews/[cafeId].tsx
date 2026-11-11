import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Cafe, getCafeById } from "../../src/services/firebase/cafes";
import {
  calculateRatingBreakdown,
  getCafeReviews,
  Review,
} from "../../src/services/firebase/reviews";
import { useTheme } from "../../src/context/ThemeContext";

export default function CafeReviewsScreen() {
  const { colors, isDark } = useTheme();
  const { cafeId } = useLocalSearchParams<{ cafeId: string }>();

  const id = typeof cafeId === "string" ? cafeId : Array.isArray(cafeId) ? cafeId[0] : "";

  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!id) {
      setError("Invalid cafe ID.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const [cafeData, reviewsList] = await Promise.all([
        getCafeById(id),
        getCafeReviews(id),
      ]);

      setCafe(cafeData);
      setReviews(reviewsList);
    } catch (err) {
      console.error("Load reviews error:", err);
      setError("Unable to load reviews.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const breakdown = useMemo(() => {
    return calculateRatingBreakdown(reviews, cafe?.rating || 0);
  }, [reviews, cafe]);

  const filteredReviews = useMemo(() => {
    if (filterRating === null) return reviews;
    return reviews.filter((r) => Math.round(r.rating) === filterRating);
  }, [reviews, filterRating]);

  const renderReviewItem = ({ item }: { item: Review }) => {
    const formattedDate = (item.createdAt as any)?.seconds
      ? new Date((item.createdAt as any).seconds * 1000).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          },
        )
      : "Recently";

    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
        className="mb-3.5 rounded-2xl border p-4 shadow-sm"
      >
        {/* User header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            {item.userAvatar ? (
              <Image
                source={{ uri: item.userAvatar }}
                style={{ backgroundColor: colors.cardAlt }}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <View
                style={{ backgroundColor: colors.chip }}
                className="h-10 w-10 items-center justify-center rounded-full"
              >
                <Text
                  style={{ color: colors.primary }}
                  className="text-sm font-extrabold"
                >
                  {(item.userName || "U").charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <View className="ml-3">
              <Text
                style={{ color: colors.text }}
                className="text-sm font-bold"
              >
                {item.userName}
              </Text>
              <Text style={{ color: colors.muted }} className="text-[11px]">{formattedDate}</Text>
            </View>
          </View>

          {/* Rating badge */}
          <View
            style={{ backgroundColor: isDark ? "#2A1E14" : "#FFF5E4" }}
            className="flex-row items-center rounded-lg px-2 py-1"
          >
            <Ionicons name="star" size={12} color="#F6B94A" />
            <Text
              style={{ color: isDark ? "#F6B94A" : "#77532D" }}
              className="ml-1 text-xs font-black"
            >
              {item.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Comment */}
        <Text
          style={{ color: colors.text }}
          className="mt-3 text-sm leading-relaxed"
        >
          {item.comment}
        </Text>

        {/* Review Images */}
        {item.images && item.images.length > 0 && (
          <View className="mt-3 flex-row gap-2">
            {item.images.map((imgUrl: string, idx: number) => (
              <Image
                key={`rev-img-${idx}`}
                source={{ uri: imgUrl }}
                style={{ backgroundColor: colors.cardAlt }}
                className="h-16 w-16 rounded-xl"
                resizeMode="cover"
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ backgroundColor: colors.background }}
        className="flex-1 items-center justify-center"
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={{ color: colors.muted }}
          className="mt-3 text-sm font-semibold"
        >
          Loading reviews...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.background }}
      className="flex-1"
      edges={["top"]}
    >
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <Pressable
          onPress={() => router.back()}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="h-10 w-10 items-center justify-center rounded-full border"
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>

        <View className="flex-1 items-center px-3">
          <Text
            style={{ color: colors.text }}
            className="text-base font-extrabold"
            numberOfLines={1}
          >
            {cafe?.name || "Reviews"}
          </Text>
          <Text style={{ color: colors.muted }} className="text-[11px] font-medium">
            Customer Reviews ({reviews.length})
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/modal/write-review",
              params: { cafeId: id, cafeName: cafe?.name || "" },
            })
          }
          style={{
            backgroundColor: colors.chip,
            borderColor: colors.border,
          }}
          className="h-10 items-center justify-center rounded-full px-3.5 border"
        >
          <Text
            style={{ color: colors.primary }}
            className="text-xs font-extrabold"
          >
            + Write
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredReviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReviewItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            {/* Rating Breakdown Card */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="mb-4 mt-2 rounded-2xl border p-5 shadow-sm"
            >
              <View className="flex-row items-center">
                {/* Score Column */}
                <View
                  style={{ borderRightColor: colors.border }}
                  className="items-center pr-6 border-r"
                >
                  <Text
                    style={{ color: colors.text }}
                    className="text-4xl font-black"
                  >
                    {(cafe?.rating || breakdown.average).toFixed(1)}
                  </Text>
                  <View className="flex-row mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons
                        key={s}
                        name={
                          s <= Math.round(cafe?.rating || breakdown.average)
                            ? "star"
                            : "star-outline"
                        }
                        size={13}
                        color="#F6B94A"
                      />
                    ))}
                  </View>
                  <Text style={{ color: colors.muted }} className="mt-1 text-xs">
                    {breakdown.total} {breakdown.total === 1 ? "review" : "reviews"}
                  </Text>
                </View>

                {/* Progress Bars */}
                <View className="ml-5 flex-1 gap-1.5">
                  {([5, 4, 3, 2, 1] as const).map((star) => {
                    const count = breakdown[star];
                    const percent =
                      breakdown.total > 0 ? (count / breakdown.total) * 100 : 0;

                    return (
                      <View
                        key={`bar-${star}`}
                        className="flex-row items-center"
                      >
                        <Text
                          style={{ color: colors.muted }}
                          className="w-3 text-[10px] font-bold"
                        >
                          {star}
                        </Text>
                        <Ionicons
                          name="star"
                          size={10}
                          color="#F6B94A"
                          style={{ marginHorizontal: 3 }}
                        />
                        <View
                          style={{ backgroundColor: colors.chip }}
                          className="h-2 flex-1 rounded-full overflow-hidden"
                        >
                          <View
                            style={{
                              width: `${percent}%`,
                              backgroundColor: colors.primary,
                            }}
                            className="h-full rounded-full"
                          />
                        </View>
                        <Text
                          style={{ color: colors.muted }}
                          className="w-6 text-right text-[10px]"
                        >
                          {count}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Filter Chips */}
            <View className="mb-4 flex-row items-center gap-2">
              <Pressable
                onPress={() => setFilterRating(null)}
                style={{
                  backgroundColor:
                    filterRating === null ? colors.primary : colors.surface,
                  borderColor:
                    filterRating === null ? colors.primary : colors.border,
                }}
                className="rounded-full border px-4 py-2"
              >
                <Text
                  style={{
                    color: filterRating === null ? "#FFFFFF" : colors.muted,
                  }}
                  className="text-xs font-bold"
                >
                  All ({reviews.length})
                </Text>
              </Pressable>

              {[5, 4, 3, 2, 1].map((star) => {
                const active = filterRating === star;
                return (
                  <Pressable
                    key={`filter-${star}`}
                    onPress={() => setFilterRating(active ? null : star)}
                    style={{
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                    }}
                    className="flex-row items-center rounded-full border px-3 py-2"
                  >
                    <Ionicons
                      name="star"
                      size={11}
                      color={active ? "#FFFFFF" : "#F6B94A"}
                    />
                    <Text
                      style={{
                        color: active ? "#FFFFFF" : colors.muted,
                      }}
                      className="ml-1 text-xs font-bold"
                    >
                      {star}★
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        }
        ListEmptyComponent={
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="items-center rounded-2xl border p-8 mt-4"
          >
            <View
              style={{ backgroundColor: colors.chip }}
              className="h-14 w-14 items-center justify-center rounded-full"
            >
              <Ionicons name="chatbubbles-outline" size={26} color={colors.primary} />
            </View>
            <Text
              style={{ color: colors.text }}
              className="mt-3 text-base font-extrabold"
            >
              {filterRating ? `No ${filterRating}-star reviews` : "No reviews yet"}
            </Text>
            <Text
              style={{ color: colors.muted }}
              className="mt-1 text-center text-xs"
            >
              Be the first to share your experience with this café!
            </Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/modal/write-review",
                  params: { cafeId: id, cafeName: cafe?.name || "" },
                })
              }
              style={{ backgroundColor: colors.primary }}
              className="mt-4 rounded-xl px-5 py-2.5"
            >
              <Text className="text-xs font-extrabold text-white">
                Write a Review
              </Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}
