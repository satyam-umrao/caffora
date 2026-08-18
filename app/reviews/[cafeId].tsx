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

export default function CafeReviewsScreen() {
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
      <View className="mb-3.5 rounded-2xl border border-[#EEE5DE] bg-white p-4 shadow-sm">
        {/* User header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            {item.userAvatar ? (
              <Image
                source={{ uri: item.userAvatar }}
                className="h-10 w-10 rounded-full bg-[#EADFD7]"
              />
            ) : (
              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F5E6DC]">
                <Text className="text-sm font-extrabold text-[#B95E2E]">
                  {(item.userName || "U").charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <View className="ml-3">
              <Text className="text-sm font-bold text-[#241C18]">
                {item.userName}
              </Text>
              <Text className="text-[11px] text-[#93867E]">{formattedDate}</Text>
            </View>
          </View>

          {/* Rating badge */}
          <View className="flex-row items-center rounded-lg bg-[#FFF5E4] px-2 py-1">
            <Ionicons name="star" size={12} color="#F6B94A" />
            <Text className="ml-1 text-xs font-black text-[#77532D]">
              {item.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Comment */}
        <Text className="mt-3 text-sm leading-relaxed text-[#5E514A]">
          {item.comment}
        </Text>

        {/* Review Images */}
        {item.images && item.images.length > 0 && (
          <View className="mt-3 flex-row gap-2">
            {item.images.map((imgUrl: string, idx: number) => (
              <Image
                key={`rev-img-${idx}`}
                source={{ uri: imgUrl }}
                className="h-16 w-16 rounded-xl bg-[#EADFD7]"
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
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF7F3]">
        <ActivityIndicator size="large" color="#B95E2E" />
        <Text className="mt-3 text-sm font-semibold text-[#8A7D75]">
          Loading reviews...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F3]" edges={["top"]}>
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white border border-[#EEE5DE]"
        >
          <Ionicons name="arrow-back" size={20} color="#241C18" />
        </Pressable>

        <View className="flex-1 items-center px-3">
          <Text
            className="text-base font-extrabold text-[#241C18]"
            numberOfLines={1}
          >
            {cafe?.name || "Reviews"}
          </Text>
          <Text className="text-[11px] font-medium text-[#8A7D75]">
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
          className="h-10 items-center justify-center rounded-full bg-[#FAF3EE] px-3.5 border border-[#F2D7CA]"
        >
          <Text className="text-xs font-extrabold text-[#B95E2E]">
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
            tintColor="#B95E2E"
          />
        }
        ListHeaderComponent={
          <>
            {/* Rating Breakdown Card */}
            <View className="mb-4 mt-2 rounded-2xl border border-[#EEE5DE] bg-white p-5 shadow-sm">
              <View className="flex-row items-center">
                {/* Score Column */}
                <View className="items-center pr-6 border-r border-[#F0EAE4]">
                  <Text className="text-4xl font-black text-[#241C18]">
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
                  <Text className="mt-1 text-xs text-[#93867E]">
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
                        <Text className="w-3 text-[10px] font-bold text-[#8A7D75]">
                          {star}
                        </Text>
                        <Ionicons
                          name="star"
                          size={10}
                          color="#F6B94A"
                          style={{ marginHorizontal: 3 }}
                        />
                        <View className="h-2 flex-1 rounded-full bg-[#F4EFEA] overflow-hidden">
                          <View
                            style={{ width: `${percent}%` }}
                            className="h-full rounded-full bg-[#B95E2E]"
                          />
                        </View>
                        <Text className="w-6 text-right text-[10px] text-[#93867E]">
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
                className={`rounded-full px-4 py-2 ${
                  filterRating === null
                    ? "bg-[#B95E2E]"
                    : "border border-[#EEE5DE] bg-white"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    filterRating === null ? "text-white" : "text-[#786B63]"
                  }`}
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
                    className={`flex-row items-center rounded-full px-3 py-2 ${
                      active
                        ? "bg-[#B95E2E]"
                        : "border border-[#EEE5DE] bg-white"
                    }`}
                  >
                    <Ionicons
                      name="star"
                      size={11}
                      color={active ? "#FFFFFF" : "#F6B94A"}
                    />
                    <Text
                      className={`ml-1 text-xs font-bold ${
                        active ? "text-white" : "text-[#786B63]"
                      }`}
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
          <View className="items-center rounded-2xl border border-[#EEE5DE] bg-white p-8 mt-4">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-[#FAF3EE]">
              <Ionicons name="chatbubbles-outline" size={26} color="#B95E2E" />
            </View>
            <Text className="mt-3 text-base font-extrabold text-[#241C18]">
              {filterRating ? `No ${filterRating}-star reviews` : "No reviews yet"}
            </Text>
            <Text className="mt-1 text-center text-xs text-[#8A7D75]">
              Be the first to share your experience with this café!
            </Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/modal/write-review",
                  params: { cafeId: id, cafeName: cafe?.name || "" },
                })
              }
              className="mt-4 rounded-xl bg-[#B95E2E] px-5 py-2.5"
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
