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
import { useTheme } from "../../src/context/ThemeContext";
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
  const { colors, isDark } = useTheme();
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
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={{
            marginTop: 12,
            fontSize: 14,
            fontWeight: "600",
            color: colors.textSecondary,
          }}
        >
          Loading café details...
        </Text>
      </View>
    );
  }

  if (error || !cafe) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            height: 64,
            width: 64,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            backgroundColor: colors.primarySoft,
          }}
        >
          <Ionicons name="cafe-outline" size={32} color={colors.primary} />
        </View>
        <Text
          style={{
            marginTop: 16,
            textAlign: "center",
            fontSize: 18,
            fontWeight: "700",
            color: colors.text,
          }}
        >
          {error || "Café Not Found"}
        </Text>
        <Text
          style={{
            marginTop: 8,
            textAlign: "center",
            fontSize: 14,
            color: colors.textSecondary,
          }}
        >
          {"We couldn't load this café. It may have been moved or removed."}
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{
            marginTop: 24,
            borderRadius: 12,
            backgroundColor: colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
          }}
        >
          <Text style={{ fontWeight: "700", color: "#FFFFFF" }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const cafeWebsite = (cafe as any).website;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
            <View
              style={{ backgroundColor: colors.chip }}
              className="rounded-lg px-3 py-1"
            >
              <Text
                style={{ color: colors.primary }}
                className="text-[11px] font-extrabold uppercase tracking-wide"
              >
                {cafe.category}
              </Text>
            </View>

            <View
              style={{ backgroundColor: isDark ? "#2A1E14" : "#FFF5E4" }}
              className="flex-row items-center rounded-lg px-2.5 py-1"
            >
              <Ionicons name="star" size={14} color="#F6B94A" />
              <Text
                style={{ color: isDark ? "#F8C162" : "#77532D" }}
                className="ml-1 text-xs font-extrabold"
              >
                {cafe.rating.toFixed(1)}
              </Text>
              <Text
                style={{ color: colors.muted }}
                className="ml-1 text-[11px]"
              >
                ({cafe.reviewCount})
              </Text>
            </View>
          </View>

          <Text
            style={{
              marginTop: 10,
              fontSize: 24,
              fontWeight: "900",
              color: colors.text,
            }}
          >
            {cafe.name}
          </Text>

          <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text
              style={{
                marginLeft: 6,
                flex: 1,
                fontSize: 14,
                fontWeight: "500",
                color: colors.textSecondary,
              }}
            >
              {cafe.location}, {cafe.city}
            </Text>
            <Text
              style={{
                marginLeft: 8,
                fontSize: 14,
                fontWeight: "700",
                color: colors.primary,
              }}
            >
              {cafe.priceRange}
            </Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* ACTION SHORTCUTS (Call, Directions, WhatsApp, Menu) */}
        {/* ================================================= */}
        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            justifyContent: "space-around",
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            paddingVertical: 14,
            paddingHorizontal: 12,
          }}
        >
          <Pressable
            onPress={() => makePhoneCall(cafe.phone)}
            style={{ alignItems: "center", paddingHorizontal: 12 }}
          >
            <View
              style={{
                height: 44,
                width: 44,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 22,
                backgroundColor: colors.primarySoft,
              }}
            >
              <Ionicons name="call-outline" size={20} color={colors.primary} />
            </View>
            <Text
              style={{
                marginTop: 6,
                fontSize: 12,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              Call
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              openDirections(cafe.latitude, cafe.longitude, cafe.name)
            }
            style={{ alignItems: "center", paddingHorizontal: 12 }}
          >
            <View
              style={{
                height: 44,
                width: 44,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 22,
                backgroundColor: colors.primarySoft,
              }}
            >
              <Ionicons name="navigate-outline" size={20} color={colors.primary} />
            </View>
            <Text
              style={{
                marginTop: 6,
                fontSize: 12,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              Directions
            </Text>
          </Pressable>

          <Pressable
            onPress={() => openWhatsApp(cafe.phone)}
            style={{ alignItems: "center", paddingHorizontal: 12 }}
          >
            <View
              style={{
                height: 44,
                width: 44,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 22,
                backgroundColor: colors.primarySoft,
              }}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            </View>
            <Text
              style={{
                marginTop: 6,
                fontSize: 12,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              Chat
            </Text>
          </Pressable>

          {cafeWebsite ? (
            <Pressable
              onPress={() => openWebsite(cafeWebsite)}
              style={{ alignItems: "center", paddingHorizontal: 12 }}
            >
              <View
                style={{
                  height: 44,
                  width: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 22,
                  backgroundColor: colors.primarySoft,
                }}
              >
                <Ionicons name="globe-outline" size={20} color={colors.primary} />
              </View>
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  fontWeight: "700",
                  color: colors.text,
                }}
              >
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
              style={{ alignItems: "center", paddingHorizontal: 12 }}
            >
              <View
                style={{
                  height: 44,
                  width: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 22,
                  backgroundColor: colors.primarySoft,
                }}
              >
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </View>
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  fontWeight: "700",
                  color: colors.text,
                }}
              >
                Review
              </Text>
            </Pressable>
          )}
        </View>

        {/* ================================================= */}
        {/* ABOUT & DESCRIPTION */}
        {/* ================================================= */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 20,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            padding: 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: colors.text,
            }}
          >
            About
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontSize: 14,
              lineHeight: 22,
              color: colors.textSecondary,
            }}
          >
            {cafe.description}
          </Text>

          {cafe.address ? (
            <View
              style={{
                marginTop: 12,
                flexDirection: "row",
                alignItems: "flex-start",
                borderTopWidth: 1,
                borderTopColor: colors.borderMuted,
                paddingTop: 12,
              }}
            >
              <Ionicons
                name="map-outline"
                size={16}
                color={colors.textSecondary}
                style={{ marginTop: 2 }}
              />
              <Text
                style={{
                  marginLeft: 8,
                  flex: 1,
                  fontSize: 12,
                  color: colors.textSecondary,
                }}
              >
                {cafe.address}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ================================================= */}
        {/* AMENITIES */}
        {/* ================================================= */}
        {cafe.amenities && cafe.amenities.length > 0 && (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 16,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: colors.text,
              }}
            >
              Amenities & Features
            </Text>
            <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {cafe.amenities.map((amenity, idx) => (
                <View
                  key={`amenity-${idx}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 12,
                    backgroundColor: colors.surfaceMuted,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                  <Text
                    style={{
                      marginLeft: 6,
                      fontSize: 12,
                      fontWeight: "700",
                      color: colors.text,
                    }}
                  >
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
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 16,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              padding: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: colors.text,
                }}
              >
                Opening Hours
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 50,
                  backgroundColor: colors.successSoft,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <View
                  style={{
                    height: 8,
                    width: 8,
                    borderRadius: 4,
                    backgroundColor: colors.success,
                  }}
                />
                <Text
                  style={{
                    marginLeft: 6,
                    fontSize: 11,
                    fontWeight: "700",
                    color: colors.success,
                  }}
                >
                  Open
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 12, gap: 8 }}>
              {DAYS.map((day) => {
                const hours = (cafe.openingHours as any)[day];
                const isToday = day === currentDayKey;
                const formattedDay = day.charAt(0).toUpperCase() + day.slice(1);

                return (
                  <View
                    key={day}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderRadius: 8,
                      paddingVertical: 6,
                      paddingHorizontal: 8,
                      backgroundColor: isToday ? colors.primarySoft : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: isToday ? "800" : "500",
                        color: isToday ? colors.primary : colors.textSecondary,
                      }}
                    >
                      {formattedDay} {isToday && " (Today)"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: isToday ? "800" : "600",
                        color: isToday ? colors.primary : colors.text,
                      }}
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
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 16,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            padding: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: colors.text,
                }}
              >
                Reviews & Ratings
              </Text>
              <Text
                style={{
                  marginTop: 2,
                  fontSize: 12,
                  color: colors.textSecondary,
                }}
              >
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
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "800",
                  color: colors.primary,
                }}
              >
                See All →
              </Text>
            </Pressable>
          </View>

          {/* Rating Summary Snippet */}
          <View
            style={{
              marginTop: 14,
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 12,
              backgroundColor: colors.surfaceMuted,
              padding: 12,
            }}
          >
            <View
              style={{
                alignItems: "center",
                paddingRight: 12,
                borderRightWidth: 1,
                borderRightColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "900",
                  color: colors.text,
                }}
              >
                {cafe.rating.toFixed(1)}
              </Text>
              <View style={{ flexDirection: "row", marginTop: 2 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons
                    key={s}
                    name={
                      s <= Math.round(cafe.rating) ? "star" : "star-outline"
                    }
                    size={11}
                    color={colors.star}
                  />
                ))}
              </View>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: colors.text,
                }}
              >
                Loved by coffee lovers
              </Text>
              <Text
                style={{
                  marginTop: 2,
                  fontSize: 11,
                  color: colors.textSecondary,
                }}
              >
                Atmosphere, coffee quality & service
              </Text>
            </View>
          </View>

          {/* Reviews List preview */}
          {reviews.length > 0 ? (
            <View style={{ marginTop: 12 }}>
              {reviews.slice(0, 2).map((rev) => (
                <View
                  key={rev.id}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderMuted,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: colors.text,
                      }}
                    >
                      {rev.userName || "Guest"}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="star" size={10} color={colors.star} />
                      <Text
                        style={{
                          marginLeft: 2,
                          fontSize: 10,
                          fontWeight: "800",
                          color: colors.text,
                        }}
                      >
                        {rev.rating}
                      </Text>
                    </View>
                  </View>
                  <Text
                    numberOfLines={2}
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      lineHeight: 17,
                      color: colors.textSecondary,
                    }}
                  >
                    {rev.comment}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ marginTop: 12, paddingVertical: 8, alignItems: "center" }}>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
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
            style={{
              marginTop: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.primary,
              paddingVertical: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "800",
                color: colors.primary,
              }}
            >
              ✍️ Write a Review
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ================================================= */}
      {/* STICKY BOTTOM BAR — BOOK NOW */}
      {/* ================================================= */}
      <View
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 14,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.35 : 0.08,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              color: colors.textSecondary,
            }}
          >
            Table Booking
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: colors.text,
            }}
          >
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
          style={{
            borderRadius: 16,
            backgroundColor: colors.primary,
            paddingHorizontal: 28,
            paddingVertical: 14,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>
            Book Table
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
