import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { openDirections } from "../../src/services/deepLinks/directions";
import { makePhoneCall } from "../../src/services/deepLinks/phone";
import { openWebsite } from "../../src/services/deepLinks/website";
import { openWhatsApp } from "../../src/services/deepLinks/whatsapp";
import { Cafe, getCafeById } from "../../src/services/firebase/cafes";
import {
  isCafeSaved,
  toggleCafeSaved,
} from "../../src/services/firebase/favorites";
import { getCafeReviews, Review } from "../../src/services/firebase/reviews";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export default function CafeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const cafeId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";

  const loadData = useCallback(async () => {
    if (!cafeId) {
      setError("Invalid cafe ID.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const [cafeData, reviewList, savedStatus] = await Promise.all([
        getCafeById(cafeId),
        getCafeReviews(cafeId).catch(() => []),
        isCafeSaved(cafeId).catch(() => false),
      ]);

      if (!cafeData) {
        setError("Café not found.");
      } else {
        setCafe(cafeData);
        setReviews(reviewList);
        setIsSaved(savedStatus);
      }
    } catch (err) {
      console.error("Load cafe detail error:", err);
      setError("Failed to load café details. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cafeId]);

  // Reload the café and reviews whenever this screen becomes active again.
  // This is important after returning from the Write Review screen, because
  // the newly-created review is in Firestore but this screen may still have
  // the previous reviews array in memory.
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleToggleSave = async () => {
    if (!cafeId) return;
    try {
      const nextSaved = await toggleCafeSaved(cafeId);
      setIsSaved(nextSaved);
    } catch (err: any) {
      if (err?.message === "LOGIN_REQUIRED") {
        Alert.alert("Sign In Required", "Please sign in to save this cafe.", [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push("/(auth)/login") },
        ]);
        return;
      }
      Alert.alert("Error", "Could not update saved status.");
    }
  };

  const handleShare = async () => {
    if (!cafe) return;
    try {
      await Share.share({
        title: cafe.name,
        message: `Check out ${cafe.name} on Caffora! ${cafe.location}, ${cafe.city}. Rating: ${cafe.rating}★`,
      });
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  const currentDayIndex = new Date().getDay();
  const currentDayKey = DAYS[currentDayIndex];

  const galleryImages = useMemo(() => {
    if (!cafe) return [];
    if (cafe.images && cafe.images.length > 0) return cafe.images;
    if (cafe.image) return [cafe.image];
    return ["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb"];
  }, [cafe]);

  const onScrollGallery = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(
      event.nativeEvent.contentOffset.x /
        event.nativeEvent.layoutMeasurement.width,
    );
    if (slide !== activeImageIndex) {
      setActiveImageIndex(slide);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAF7F3]">
        <ActivityIndicator size="large" color="#B95E2E" />
        <Text className="mt-3 text-sm font-semibold text-[#8A7D75]">
          Loading café details...
        </Text>
      </View>
    );
  }

  if (error || !cafe) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAF7F3] px-6">
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-[#F9E8DE]">
          <Ionicons name="cafe-outline" size={32} color="#B95E2E" />
        </View>
        <Text className="mt-4 text-center text-lg font-bold text-[#241C18]">
          {error || "Café Not Found"}
        </Text>
        <Text className="mt-2 text-center text-sm text-[#8A7D75]">
          We couldn't load this café. It may have been moved or removed.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 rounded-xl bg-[#B95E2E] px-6 py-3"
        >
          <Text className="font-bold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const cafeWebsite = (cafe as any).website;

  return (
    <View className="flex-1 bg-[#FAF7F3]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#B95E2E"
          />
        }
        contentContainerStyle={{ paddingBottom: 65 }}
      >
        {/* ================================================= */}
        {/* HERO IMAGE CAROUSEL */}
        {/* ================================================= */}
        <View style={{ height: 340 }} className="relative w-full bg-[#2A201B]">
          <FlatList
            data={galleryImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScrollGallery}
            scrollEventThrottle={16}
            keyExtractor={(_, index) => `gallery-${index}`}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{ width: SCREEN_WIDTH, height: 340 }}
                resizeMode="cover"
              />
            )}
          />

          {/* Gradient Overlay */}
          <View className="absolute inset-x-0 top-0 h-28 bg-black/40" />
          <View className="absolute inset-x-0 bottom-0 h-20 bg-black/30" />

          {/* Top Bar Floating Buttons */}
          <View
            style={{ paddingTop: Math.max(insets.top, 16) }}
            className="absolute inset-x-0 flex-row items-center justify-between px-5"
          >
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </Pressable>

            <View className="flex-row items-center gap-2.5">
              <Pressable
                onPress={handleShare}
                className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
              >
                <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              </Pressable>

              <Pressable
                onPress={handleToggleSave}
                className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
              >
                <Ionicons
                  name={isSaved ? "heart" : "heart-outline"}
                  size={21}
                  color={isSaved ? "#E0524D" : "#FFFFFF"}
                />
              </Pressable>
            </View>
          </View>

          {/* Carousel Dots */}
          {galleryImages.length > 1 && (
            <View className="absolute bottom-4 inset-x-0 flex-row justify-center gap-1.5">
              {galleryImages.map((_, i) => (
                <View
                  key={`dot-${i}`}
                  className={`h-2 rounded-full ${
                    activeImageIndex === i
                      ? "w-6 bg-[#B95E2E]"
                      : "w-2 bg-white/60"
                  }`}
                />
              ))}
            </View>
          )}
        </View>

        {/* ================================================= */}
        {/* CAFE MAIN INFO */}
        {/* ================================================= */}
        <View className="px-5 pt-5">
          <View className="flex-row items-center justify-between">
            <View className="rounded-lg bg-[#F8E9E0] px-3 py-1">
              <Text className="text-[11px] font-extrabold uppercase tracking-wide text-[#B95E2E]">
                {cafe.category}
              </Text>
            </View>

            <View className="flex-row items-center rounded-lg bg-[#FFF5E4] px-2.5 py-1">
              <Ionicons name="star" size={14} color="#F6B94A" />
              <Text className="ml-1 text-xs font-extrabold text-[#77532D]">
                {cafe.rating.toFixed(1)}
              </Text>
              <Text className="ml-1 text-[11px] text-[#9A8D85]">
                ({cafe.reviewCount})
              </Text>
            </View>
          </View>

          <Text className="mt-2.5 text-2xl font-black text-[#241C18]">
            {cafe.name}
          </Text>

          <View className="mt-2 flex-row items-center">
            <Ionicons name="location-outline" size={16} color="#8A7D75" />
            <Text className="ml-1.5 flex-1 text-sm font-medium text-[#81746C]">
              {cafe.location}, {cafe.city}
            </Text>
            <Text className="ml-2 text-sm font-bold text-[#B95E2E]">
              {cafe.priceRange}
            </Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* ACTION SHORTCUTS (Call, Directions, WhatsApp, Menu) */}
        {/* ================================================= */}
        <View className="mt-5 flex-row justify-around border-y border-[#EEE5DE] bg-white py-3.5 px-3">
          <Pressable
            onPress={() => makePhoneCall(cafe.phone)}
            className="items-center px-3"
          >
            <View className="h-11 w-11 items-center justify-center rounded-full bg-[#FAF3EE]">
              <Ionicons name="call-outline" size={20} color="#B95E2E" />
            </View>
            <Text className="mt-1.5 text-xs font-bold text-[#302720]">
              Call
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              openDirections(cafe.latitude, cafe.longitude, cafe.name)
            }
            className="items-center px-3"
          >
            <View className="h-11 w-11 items-center justify-center rounded-full bg-[#FAF3EE]">
              <Ionicons name="navigate-outline" size={20} color="#B95E2E" />
            </View>
            <Text className="mt-1.5 text-xs font-bold text-[#302720]">
              Directions
            </Text>
          </Pressable>

          <Pressable
            onPress={() => openWhatsApp(cafe.phone)}
            className="items-center px-3"
          >
            <View className="h-11 w-11 items-center justify-center rounded-full bg-[#FAF3EE]">
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            </View>
            <Text className="mt-1.5 text-xs font-bold text-[#302720]">
              Chat
            </Text>
          </Pressable>

          {cafeWebsite ? (
            <Pressable
              onPress={() => openWebsite(cafeWebsite)}
              className="items-center px-3"
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-[#FAF3EE]">
                <Ionicons name="globe-outline" size={20} color="#B95E2E" />
              </View>
              <Text className="mt-1.5 text-xs font-bold text-[#302720]">
                Website
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/modal/write-review",
                  params: { cafeId: cafe.id, cafeName: cafe.name },
                })
              }
              className="items-center px-3"
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-[#FAF3EE]">
                <Ionicons name="create-outline" size={20} color="#B95E2E" />
              </View>
              <Text className="mt-1.5 text-xs font-bold text-[#302720]">
                Review
              </Text>
            </Pressable>
          )}
        </View>

        {/* ================================================= */}
        {/* ABOUT & DESCRIPTION */}
        {/* ================================================= */}
        <View className="mx-5 mt-5 rounded-2xl border border-[#EEE5DE] bg-white p-4">
          <Text className="text-base font-extrabold text-[#241C18]">About</Text>
          <Text className="mt-2 text-sm leading-relaxed text-[#786B63]">
            {cafe.description}
          </Text>

          {cafe.address ? (
            <View className="mt-3 flex-row items-start border-t border-[#F2ECE7] pt-3">
              <Ionicons
                name="map-outline"
                size={16}
                color="#8A7D75"
                style={{ marginTop: 2 }}
              />
              <Text className="ml-2 flex-1 text-xs text-[#8A7D75]">
                {cafe.address}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ================================================= */}
        {/* AMENITIES */}
        {/* ================================================= */}
        {cafe.amenities && cafe.amenities.length > 0 && (
          <View className="mx-5 mt-4 rounded-2xl border border-[#EEE5DE] bg-white p-4">
            <Text className="text-base font-extrabold text-[#241C18]">
              Amenities & Features
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {cafe.amenities.map((amenity, idx) => (
                <View
                  key={`amenity-${idx}`}
                  className="flex-row items-center rounded-xl bg-[#F8F4F0] px-3 py-2"
                >
                  <Ionicons name="checkmark-circle" size={14} color="#B95E2E" />
                  <Text className="ml-1.5 text-xs font-bold text-[#4B3E36]">
                    {amenity}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ================================================= */}
        {/* OPENING HOURS */}
        {/* ================================================= */}
        {cafe.openingHours && Object.keys(cafe.openingHours).length > 0 && (
          <View className="mx-5 mt-4 rounded-2xl border border-[#EEE5DE] bg-white p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-extrabold text-[#241C18]">
                Opening Hours
              </Text>
              <View className="flex-row items-center rounded-full bg-[#EBF7EE] px-2.5 py-1">
                <View className="h-2 w-2 rounded-full bg-[#3FB950]" />
                <Text className="ml-1.5 text-[11px] font-bold text-[#2E7A3A]">
                  Open
                </Text>
              </View>
            </View>

            <View className="mt-3 gap-2">
              {DAYS.map((day) => {
                const hours = (cafe.openingHours as any)[day];
                const isToday = day === currentDayKey;
                const formattedDay = day.charAt(0).toUpperCase() + day.slice(1);

                return (
                  <View
                    key={day}
                    className={`flex-row items-center justify-between rounded-lg py-1.5 px-2 ${
                      isToday ? "bg-[#FAF1EC]" : ""
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        isToday
                          ? "font-extrabold text-[#B95E2E]"
                          : "font-medium text-[#786B63]"
                      }`}
                    >
                      {formattedDay} {isToday && " (Today)"}
                    </Text>
                    <Text
                      className={`text-xs ${
                        isToday
                          ? "font-extrabold text-[#B95E2E]"
                          : "font-semibold text-[#302720]"
                      }`}
                    >
                      {hours || "Closed"}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ================================================= */}
        {/* REVIEWS PREVIEW */}
        {/* ================================================= */}
        <View className="mx-5 mt-4 rounded-2xl border border-[#EEE5DE] bg-white p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-base font-extrabold text-[#241C18]">
                Reviews & Ratings
              </Text>
              <Text className="mt-0.5 text-xs text-[#8A7D75]">
                {cafe.reviewCount} customer reviews
              </Text>
            </View>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/reviews/[cafeId]",
                  params: { cafeId: cafe.id },
                })
              }
            >
              <Text className="text-xs font-extrabold text-[#B95E2E]">
                See All →
              </Text>
            </Pressable>
          </View>

          {/* Rating Summary Snippet */}
          <View className="mt-3.5 flex-row items-center rounded-xl bg-[#FAF5F0] p-3">
            <View className="items-center pr-3 border-r border-[#E8DFD8]">
              <Text className="text-2xl font-black text-[#241C18]">
                {cafe.rating.toFixed(1)}
              </Text>
              <View className="flex-row mt-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons
                    key={s}
                    name={
                      s <= Math.round(cafe.rating) ? "star" : "star-outline"
                    }
                    size={11}
                    color="#F6B94A"
                  />
                ))}
              </View>
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs font-bold text-[#302720]">
                Loved by coffee lovers
              </Text>
              <Text className="mt-0.5 text-[11px] text-[#8A7D75]">
                Atmosphere, coffee quality & service
              </Text>
            </View>
          </View>

          {/* Reviews List preview */}
          {reviews.length > 0 ? (
            <View className="mt-3 divide-y divide-[#F2ECE7]">
              {reviews.slice(0, 2).map((rev) => (
                <View key={rev.id} className="py-2.5">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-bold text-[#302720]">
                      {rev.userName}
                    </Text>
                    <View className="flex-row">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name={s <= rev.rating ? "star" : "star-outline"}
                          size={10}
                          color="#F6B94A"
                        />
                      ))}
                    </View>
                  </View>
                  <Text
                    className="mt-1 text-xs text-[#786B63]"
                    numberOfLines={2}
                  >
                    {rev.comment}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="mt-3 py-2 items-center">
              <Text className="text-xs text-[#9B8F87]">
                No reviews yet. Be the first to share your experience!
              </Text>
            </View>
          )}

          {/* Write a review button */}
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/modal/write-review",
                params: { cafeId: cafe.id, cafeName: cafe.name },
              })
            }
            className="mt-3 rounded-xl border border-[#B95E2E] py-2.5 items-center"
          >
            <Text className="text-xs font-extrabold text-[#B95E2E]">
              ✍️ Write a Review
            </Text>
          </Pressable>
        </View>

        <View className="h-6" />
      </ScrollView>

      {/* ================================================= */}
      {/* STICKY BOTTOM BAR — BOOK NOW */}
      {/* ================================================= */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        className="absolute inset-x-0 bottom-0 flex-row items-center justify-between border-t border-[#EEE5DE] bg-white px-5 pt-3.5 shadow-lg"
      >
        <View>
          <Text className="text-[11px] font-bold uppercase tracking-wider text-[#93867E]">
            Table Booking
          </Text>
          <Text className="text-base font-extrabold text-[#241C18]">
            Instant Confirmation
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/booking/[cafeId]",
              params: { cafeId: cafe.id },
            })
          }
          className="rounded-2xl bg-[#B95E2E] px-7 py-3.5"
        >
          <Text className="text-sm font-extrabold text-white">Book Table</Text>
        </Pressable>
      </View>
    </View>
  );
}
