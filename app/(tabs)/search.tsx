import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../src/context/ThemeContext";
import { Cafe, getCafes } from "../../src/services/firebase/cafes";
import {
  getSavedCafeIds,
  toggleCafeSaved,
} from "../../src/services/firebase/favorites";

/* =========================================================
   CATEGORIES
========================================================= */

const CATEGORIES = [
  "All",
  "Specialty Coffee",
  "Artisan Bakery",
  "Desserts",
  "Italian & Bakery",
  "Gourmet Brunch",
  "Healthy & Organic",
  "Outdoor Garden",
];

function parseCafeCost(priceStr?: string): number {
  if (!priceStr) return 800;
  const match = priceStr.replace(/,/g, "").match(/\d+/);
  return match ? parseInt(match[0], 10) : 800;
}

/* =========================================================
   MAIN SEARCH SCREEN
========================================================= */

export default function SearchScreen() {
  const { colors, isDark } = useTheme();

  const filterParams = useLocalSearchParams<{
    minPrice?: string;
    maxPrice?: string;
    distance?: string;
    rating?: string;
    foodTypes?: string;
    themes?: string;
    amenities?: string;
    openNow?: string;
  }>();

  /* -------------------------------------------------------
     CAFES
  ------------------------------------------------------- */

  const [cafes, setCafes] = useState<Cafe[]>([]);

  /* -------------------------------------------------------
     SEARCH
  ------------------------------------------------------- */

  const [searchText, setSearchText] = useState("");

  /* -------------------------------------------------------
     CATEGORY
  ------------------------------------------------------- */

  const [selectedCategory, setSelectedCategory] = useState("All");

  /* -------------------------------------------------------
     LOADING / ERROR
  ------------------------------------------------------- */

  const [, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* -------------------------------------------------------
     SAVED CAFES
  ------------------------------------------------------- */

  const [savedIds, setSavedIds] = useState<string[]>([]);

  /* =======================================================
     LOAD CAFES
  ======================================================= */

  const loadCafes = async () => {
    try {
      setError("");
      const data = await getCafes();
      setCafes(data);
    } catch (err) {
      console.error("Failed to load cafes:", err);
      setError("We couldn't load cafes right now. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =======================================================
     LOAD SAVED CAFES
  ======================================================= */

  const loadSavedCafes = async () => {
    try {
      const ids = await getSavedCafeIds();
      setSavedIds(ids);
    } catch (err) {
      console.error("Failed to load saved cafes:", err);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadCafes();
    loadSavedCafes();
  }, []);

  /* =======================================================
     REFRESH
  ======================================================= */

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCafes();
    loadSavedCafes();
  }, []);

  /* =======================================================
     TOGGLE SAVE
  ======================================================= */

  const handleToggleSave = async (cafeId: string) => {
    try {
      const saved = await toggleCafeSaved(cafeId);

      setSavedIds((current) => {
        if (saved) {
          if (current.includes(cafeId)) return current;
          return [...current, cafeId];
        }
        return current.filter((id) => id !== cafeId);
      });
    } catch (err) {
      console.error("Save cafe error:", err);
    }
  };

  /* =======================================================
     PARSE ACTIVE FILTER PARAMS
  ======================================================= */

  const activeMinPrice = filterParams.minPrice
    ? parseInt(filterParams.minPrice, 10)
    : 0;
  const activeMaxPrice = filterParams.maxPrice
    ? parseInt(filterParams.maxPrice, 10)
    : 3000;
  const activeMinRating = filterParams.rating
    ? parseFloat(filterParams.rating)
    : 0;

  const activeFoodTypes = useMemo(() => {
    return filterParams.foodTypes
      ? filterParams.foodTypes.split(",").filter(Boolean)
      : [];
  }, [filterParams.foodTypes]);

  const activeThemes = useMemo(() => {
    return filterParams.themes
      ? filterParams.themes.split(",").filter(Boolean)
      : [];
  }, [filterParams.themes]);

  const activeAmenities = useMemo(() => {
    return filterParams.amenities
      ? filterParams.amenities.split(",").filter(Boolean)
      : [];
  }, [filterParams.amenities]);

  const activeOpenNow = filterParams.openNow === "true";

  const advancedFiltersCount = useMemo(() => {
    let count = 0;
    if (activeMinPrice > 0 || activeMaxPrice < 3000) count += 1;
    if (activeMinRating > 0) count += 1;
    if (activeFoodTypes.length > 0) count += activeFoodTypes.length;
    if (activeThemes.length > 0) count += activeThemes.length;
    if (activeAmenities.length > 0) count += activeAmenities.length;
    if (activeOpenNow) count += 1;
    return count;
  }, [
    activeMinPrice,
    activeMaxPrice,
    activeMinRating,
    activeFoodTypes,
    activeThemes,
    activeAmenities,
    activeOpenNow,
  ]);

  const clearAdvancedFilters = () => {
    router.setParams({
      minPrice: undefined,
      maxPrice: undefined,
      rating: undefined,
      foodTypes: undefined,
      themes: undefined,
      amenities: undefined,
      openNow: undefined,
    });
  };

  /* =======================================================
     FILTER ENGINE
  ======================================================= */

  const filteredCafes = useMemo(() => {
    return cafes.filter((cafe) => {
      if (searchText.trim().length > 0) {
        const query = searchText.trim().toLowerCase();

        const matchesName = cafe.name.toLowerCase().includes(query);
        const matchesLocation = cafe.location.toLowerCase().includes(query);
        const matchesCity = (cafe.city || "").toLowerCase().includes(query);
        const matchesCategory = (cafe.category || "").toLowerCase().includes(query);
        const matchesDesc = (cafe.description || "").toLowerCase().includes(query);
        const matchesAmenity = (cafe.amenities || []).some((a) =>
          a.toLowerCase().includes(query),
        );
        const matchesTheme = (cafe.atmosphere || []).some((t) =>
          t.toLowerCase().includes(query),
        );

        if (
          !matchesName &&
          !matchesLocation &&
          !matchesCity &&
          !matchesCategory &&
          !matchesDesc &&
          !matchesAmenity &&
          !matchesTheme
        ) {
          return false;
        }
      }

      if (selectedCategory !== "All") {
        if (!cafe.category?.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      const cost = parseCafeCost(cafe.priceRange);
      if (cost < activeMinPrice) return false;
      if (activeMaxPrice < 3000 && cost > activeMaxPrice) return false;

      if (activeMinRating > 0 && cafe.rating < activeMinRating) {
        return false;
      }

      if (activeFoodTypes.length > 0) {
        const matchesAnyCat = activeFoodTypes.some((ft) =>
          cafe.category?.toLowerCase().includes(ft.toLowerCase()),
        );
        if (!matchesAnyCat) return false;
      }

      if (activeThemes.length > 0) {
        const cafeAtmosphere = (cafe.atmosphere || []).map((t) => t.toLowerCase());
        const matchesAnyTheme = activeThemes.some((theme) =>
          cafeAtmosphere.some((ca) => ca.includes(theme.toLowerCase())),
        );
        if (!matchesAnyTheme) return false;
      }

      if (activeAmenities.length > 0) {
        const cafeAmenities = (cafe.amenities || []).map((a) => a.toLowerCase());
        const matchesAnyAmenity = activeAmenities.some((amenity) =>
          cafeAmenities.some((ca) => ca.includes(amenity.toLowerCase())),
        );
        if (!matchesAnyAmenity) return false;
      }

      return true;
    });
  }, [
    cafes,
    searchText,
    selectedCategory,
    activeMinPrice,
    activeMaxPrice,
    activeMinRating,
    activeFoodTypes,
    activeThemes,
    activeAmenities,
  ]);

  const openCafe = (cafeId: string) => {
    router.push({
      pathname: "/cafe/[id]",
      params: { id: cafeId },
    });
  };

  const clearSearch = () => {
    setSearchText("");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <FlatList
        data={filteredCafes}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 110,
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
            {/* =================================================
                HEADER
            ================================================= */}

            <View style={{ paddingHorizontal: 20, paddingBottom: 16, paddingTop: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 30,
                      fontWeight: "900",
                      letterSpacing: -0.6,
                      color: colors.text,
                    }}
                  >
                    Search
                  </Text>
                  <Text
                    style={{
                      marginTop: 4,
                      fontSize: 14,
                      fontWeight: "500",
                      color: colors.textSecondary,
                    }}
                  >
                    Find your perfect cafe in Delhi NCR
                  </Text>
                </View>

                {/* FILTER BUTTON WITH ACTIVE BADGE */}
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/filters",
                      params: {
                        minPrice: String(activeMinPrice),
                        maxPrice: String(activeMaxPrice),
                        rating: String(activeMinRating),
                        foodTypes: activeFoodTypes.join(","),
                        themes: activeThemes.join(","),
                        amenities: activeAmenities.join(","),
                        openNow: String(activeOpenNow),
                      },
                    })
                  }
                  style={{
                    position: "relative",
                    height: 46,
                    width: 46,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.3 : 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Ionicons name="options-outline" size={22} color={colors.primary} />
                  {advancedFiltersCount > 0 && (
                    <View
                      style={{
                        position: "absolute",
                        top: -4,
                        right: -4,
                        height: 20,
                        width: 20,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 10,
                        backgroundColor: colors.primary,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "800",
                          color: "#FFFFFF",
                        }}
                      >
                        {advancedFiltersCount}
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>

            {/* =================================================
                SEARCH BOX
            ================================================= */}

            <View
              style={{
                marginHorizontal: 20,
                height: 58,
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.inputBorder,
                backgroundColor: colors.inputBackground,
                paddingHorizontal: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View
                style={{
                  height: 40,
                  width: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="search-outline" size={22} color={colors.textMuted} />
              </View>

              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search cafes, coffee, vibe, location..."
                placeholderTextColor={colors.textMuted}
                style={{
                  height: "100%",
                  flex: 1,
                  paddingHorizontal: 8,
                  fontSize: 15,
                  fontWeight: "600",
                  color: colors.text,
                }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />

              {searchText.length > 0 && (
                <Pressable
                  onPress={clearSearch}
                  style={{
                    height: 40,
                    width: 40,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </Pressable>
              )}
            </View>

            {/* =================================================
                ACTIVE FILTERS BAR
            ================================================= */}
            {advancedFiltersCount > 0 && (
              <View
                style={{
                  marginHorizontal: 20,
                  marginTop: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 12,
                  backgroundColor: colors.primarySoft,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: isDark ? colors.border : "#F2D7CA",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                    paddingRight: 8,
                  }}
                >
                  <Ionicons name="funnel" size={14} color={colors.primary} />
                  <Text
                    style={{
                      marginLeft: 8,
                      fontSize: 12,
                      fontWeight: "700",
                      color: colors.primary,
                    }}
                  >
                    {advancedFiltersCount} active{" "}
                    {advancedFiltersCount === 1 ? "filter" : "filters"} applied
                  </Text>
                </View>

                <Pressable onPress={clearAdvancedFilters} hitSlop={6}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "900",
                      color: colors.primary,
                    }}
                  >
                    Clear Filters ✕
                  </Text>
                </Pressable>
              </View>
            )}

            {/* =================================================
                CATEGORIES TITLE & CHIPS
            ================================================= */}

            <View style={{ marginTop: 20 }}>
              <Text
                style={{
                  marginBottom: 10,
                  paddingHorizontal: 20,
                  fontSize: 16,
                  fontWeight: "800",
                  color: colors.text,
                }}
              >
                Quick Categories
              </Text>

              <FlatList
                data={CATEGORIES}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                }}
                ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                renderItem={({ item }) => {
                  const active = selectedCategory === item;

                  return (
                    <Pressable
                      onPress={() => setSelectedCategory(item)}
                      style={{
                        borderRadius: 50,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderWidth: active ? 0 : 1,
                        borderColor: colors.border,
                        backgroundColor: active
                          ? colors.primary
                          : colors.surface,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "800",
                          color: active ? "#FFFFFF" : colors.textSecondary,
                        }}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </View>

            {/* =================================================
                RESULTS HEADER
            ================================================= */}

            <View
              style={{
                marginTop: 24,
                flexDirection: "row",
                alignItems: "flex-end",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                marginBottom: 8,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    letterSpacing: -0.3,
                    color: colors.text,
                  }}
                >
                  Cafés Found
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontSize: 12,
                    fontWeight: "500",
                    color: colors.textSecondary,
                  }}
                >
                  {filteredCafes.length}{" "}
                  {filteredCafes.length === 1 ? "café" : "cafés"} available
                </Text>
              </View>

              {(searchText.length > 0 ||
                selectedCategory !== "All" ||
                advancedFiltersCount > 0) && (
                <Pressable
                  onPress={() => {
                    setSearchText("");
                    setSelectedCategory("All");
                    clearAdvancedFilters();
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "800",
                      color: colors.primary,
                    }}
                  >
                    Reset all
                  </Text>
                </Pressable>
              )}
            </View>

            {/* =================================================
                ERROR
            ================================================= */}

            {error.length > 0 && (
              <View
                style={{
                  marginHorizontal: 20,
                  marginTop: 12,
                  marginBottom: 12,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: isDark ? "#4A1D1C" : "#F2D7CA",
                  backgroundColor: colors.dangerSoft,
                  padding: 16,
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      height: 40,
                      width: 40,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 12,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <Ionicons
                      name="alert-circle-outline"
                      size={22}
                      color={colors.primary}
                    />
                  </View>

                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "800",
                        color: colors.text,
                      }}
                    >
                      Something went wrong
                    </Text>
                    <Text
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        lineHeight: 17,
                        color: colors.textSecondary,
                      }}
                    >
                      {error}
                    </Text>
                    <Pressable
                      onPress={() => {
                        setLoading(true);
                        loadCafes();
                        loadSavedCafes();
                      }}
                    >
                      <Text
                        style={{
                          marginTop: 8,
                          fontSize: 13,
                          fontWeight: "800",
                          color: colors.primary,
                        }}
                      >
                        Try again
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <CafeCard
            cafe={item}
            isSaved={savedIds.includes(item.id)}
            onToggleSave={() => handleToggleSave(item.id)}
            onPress={() => openCafe(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptySearch
            hasFilters={
              searchText.trim().length > 0 ||
              selectedCategory !== "All" ||
              advancedFiltersCount > 0
            }
            onClear={() => {
              setSearchText("");
              setSelectedCategory("All");
              clearAdvancedFilters();
            }}
          />
        }
      />
    </SafeAreaView>
  );
}

function formatPriceDisplay(priceRange?: string) {
  if (!priceRange) return "100rs~200rs";
  if (priceRange === "₹") return "100rs~200rs";
  if (priceRange === "₹₹") return "200rs~450rs";
  if (priceRange === "₹₹₹") return "450rs~800rs";
  if (priceRange === "₹₹₹₹") return "800rs~1500rs";
  if (priceRange.includes("~") || priceRange.includes("rs") || priceRange.includes("₹")) return priceRange;
  return `${priceRange}`;
}

function getCafeReviewsCount(cafe: any) {
  if (typeof cafe.reviewCount === "number" && cafe.reviewCount > 0) return cafe.reviewCount;
  if (typeof cafe.reviewsCount === "number" && cafe.reviewsCount > 0) return cafe.reviewsCount;
  const str = cafe.id || cafe.name || "cafe";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 700) + 120;
}

/* =========================================================
   CAFE CARD
========================================================= */

type CafeCardProps = {
  cafe: Cafe;
  isSaved: boolean;
  onToggleSave: () => void;
  onPress: () => void;
};

function CafeCard({ cafe, isSaved, onToggleSave, onPress }: CafeCardProps) {
  const { colors } = useTheme();
  const reviewCount = getCafeReviewsCount(cafe);
  const priceDisplay = formatPriceDisplay(cafe.priceRange);

  return (
    <Pressable
      onPress={onPress}
      style={{
        marginHorizontal: 20,
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
              cafe.image ||
              (cafe.images && cafe.images[0]) ||
              "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
          }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />

        {/* TOP-RIGHT HEART */}
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onToggleSave();
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
            {cafe.featured ? "FEATURED" : "BUY1 GET1"}
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
          {cafe.name}
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
            {cafe.rating.toFixed(1)}
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
          {cafe.category || "Café & Bakery"}
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
          {cafe.location || cafe.city || "Nearby"}
        </Text>
      </View>
    </Pressable>
  );
}

/* =========================================================
   EMPTY SEARCH
========================================================= */

type EmptySearchProps = {
  hasFilters: boolean;
  onClear: () => void;
};

function EmptySearch({ hasFilters, onClear }: EmptySearchProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        marginHorizontal: 20,
        marginTop: 20,
        alignItems: "center",
        borderRadius: 22,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        paddingHorizontal: 24,
        paddingVertical: 40,
      }}
    >
      <View
        style={{
          height: 62,
          width: 62,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 20,
          backgroundColor: colors.primarySoft,
        }}
      >
        <Ionicons
          name={hasFilters ? "funnel-outline" : "cafe-outline"}
          size={29}
          color={colors.primary}
        />
      </View>

      <Text
        style={{
          marginTop: 16,
          fontSize: 17,
          fontWeight: "800",
          color: colors.text,
        }}
      >
        {hasFilters ? "No cafés match your filters" : "No cafés available"}
      </Text>

      <Text
        style={{
          marginTop: 8,
          maxWidth: 290,
          textAlign: "center",
          fontSize: 13,
          lineHeight: 20,
          color: colors.textSecondary,
        }}
      >
        {hasFilters
          ? "Try loosening your price, rating, or amenity filters to discover more spots."
          : "There are no cafés available right now. Pull down to refresh."}
      </Text>

      {hasFilters && (
        <Pressable
          onPress={onClear}
          style={{
            marginTop: 20,
            borderRadius: 50,
            backgroundColor: colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 10,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "800", color: "#FFFFFF" }}>
            Reset Filters
          </Text>
        </Pressable>
      )}
    </View>
  );
}
