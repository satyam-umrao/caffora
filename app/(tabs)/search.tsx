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
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const [loading, setLoading] = useState(true);
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
    } catch (error) {
      console.error("Failed to load cafes:", error);
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
    } catch (error) {
      console.error("Failed to load saved cafes:", error);
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
    Promise.all([loadCafes(), loadSavedCafes()]);
  }, []);

  /* =======================================================
     TOGGLE SAVE
  ======================================================= */

  const handleToggleSave = async (cafeId: string) => {
    try {
      const saved = await toggleCafeSaved(cafeId);

      setSavedIds((current) => {
        if (saved) {
          if (current.includes(cafeId)) {
            return current;
          }
          return [...current, cafeId];
        }
        return current.filter((id) => id !== cafeId);
      });
    } catch (error: any) {
      console.error("Save cafe error:", error);
      if (error?.message === "LOGIN_REQUIRED") {
        router.push("/(auth)/login");
        return;
      }
      setError("Couldn't update saved cafe. Please try again.");
    }
  };

  /* =======================================================
     ACTIVE FILTERS STATE
  ======================================================= */

  const activeMinPrice = filterParams.minPrice ? Number(filterParams.minPrice) : 300;
  const activeMaxPrice = filterParams.maxPrice ? Number(filterParams.maxPrice) : 3000;
  const activeMinRating = filterParams.rating ? Number(filterParams.rating) : 0;
  const activeFoodTypes = filterParams.foodTypes
    ? filterParams.foodTypes.split(",").filter(Boolean)
    : [];
  const activeThemes = filterParams.themes
    ? filterParams.themes.split(",").filter(Boolean)
    : [];
  const activeAmenities = filterParams.amenities
    ? filterParams.amenities.split(",").filter(Boolean)
    : [];
  const activeOpenNow = filterParams.openNow === "true";

  const advancedFiltersCount = useMemo(() => {
    let count = 0;
    if (activeMinPrice > 300 || activeMaxPrice < 3000) count++;
    if (activeMinRating > 0) count++;
    if (activeOpenNow) count++;
    count += activeFoodTypes.length;
    count += activeThemes.length;
    count += activeAmenities.length;
    return count;
  }, [
    activeMinPrice,
    activeMaxPrice,
    activeMinRating,
    activeOpenNow,
    activeFoodTypes,
    activeThemes,
    activeAmenities,
  ]);

  const clearAdvancedFilters = () => {
    router.replace({
      pathname: "/(tabs)/search",
    });
  };

  /* =======================================================
     SEARCH + COMPREHENSIVE FILTER
  ======================================================= */

  const filteredCafes = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return cafes.filter((cafe) => {
      /* ---------------------------------------------------
         1. SEARCH MATCH
      --------------------------------------------------- */
      if (query) {
        const matchesName = cafe.name.toLowerCase().includes(query);
        const matchesLocation = (cafe.location || "").toLowerCase().includes(query);
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

      /* ---------------------------------------------------
         2. CATEGORY CHIP MATCH
      --------------------------------------------------- */
      if (selectedCategory !== "All") {
        if (!cafe.category?.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      /* ---------------------------------------------------
         3. PRICE FILTER (REAL INR COST)
      --------------------------------------------------- */
      const cost = parseCafeCost(cafe.priceRange);
      if (cost < activeMinPrice) {
        return false;
      }
      if (activeMaxPrice < 3000 && cost > activeMaxPrice) {
        return false;
      }

      /* ---------------------------------------------------
         4. RATING FILTER
      --------------------------------------------------- */
      if (activeMinRating > 0 && cafe.rating < activeMinRating) {
        return false;
      }

      /* ---------------------------------------------------
         5. MODAL CATEGORY / FOOD TYPES
      --------------------------------------------------- */
      if (activeFoodTypes.length > 0) {
        const matchesAnyCat = activeFoodTypes.some((ft) =>
          cafe.category?.toLowerCase().includes(ft.toLowerCase()),
        );
        if (!matchesAnyCat) return false;
      }

      /* ---------------------------------------------------
         6. THEMES / ATMOSPHERE
      --------------------------------------------------- */
      if (activeThemes.length > 0) {
        const cafeAtmosphere = (cafe.atmosphere || []).map((t) => t.toLowerCase());
        const matchesAnyTheme = activeThemes.some((theme) =>
          cafeAtmosphere.some((ca) => ca.includes(theme.toLowerCase())),
        );
        if (!matchesAnyTheme) return false;
      }

      /* ---------------------------------------------------
         7. AMENITIES
      --------------------------------------------------- */
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

  /* =======================================================
     OPEN CAFE
  ======================================================= */

  const openCafe = (cafeId: string) => {
    router.push({
      pathname: "/cafe/[id]",
      params: {
        id: cafeId,
      },
    });
  };

  /* =======================================================
     CLEAR SEARCH
  ======================================================= */

  const clearSearch = () => {
    setSearchText("");
  };

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-[#FAF7F3]"
        edges={["top"]}
      >
        <ActivityIndicator size="large" color="#B95E2E" />
        <Text className="mt-3 text-sm font-semibold text-[#8A7D75]">
          Finding beautiful cafes...
        </Text>
      </SafeAreaView>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F3]" edges={["top"]}>
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
            tintColor="#B95E2E"
          />
        }
        ListHeaderComponent={
          <>
            {/* =================================================
                HEADER
            ================================================= */}

            <View className="px-5 pb-4 pt-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-[30px] font-black tracking-[-0.6px] text-[#241C18]">
                    Search
                  </Text>
                  <Text className="mt-1 text-sm font-medium text-[#8A7D75]">
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
                  className="relative h-[46px] w-[46px] items-center justify-center rounded-[16px] border border-[#EEE5DE] bg-white shadow-sm"
                >
                  <Ionicons name="options-outline" size={22} color="#B95E2E" />
                  {advancedFiltersCount > 0 && (
                    <View className="absolute -top-1 -right-1 h-5 w-5 items-center justify-center rounded-full bg-[#B95E2E]">
                      <Text className="text-[10px] font-extrabold text-white">
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

            <View className="mx-5 h-[58px] flex-row items-center rounded-[18px] border border-[#EDE3DC] bg-white px-3 shadow-sm">
              <View className="h-10 w-10 items-center justify-center">
                <Ionicons name="search-outline" size={22} color="#8A7D75" />
              </View>

              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search cafes, coffee, vibe, location..."
                placeholderTextColor="#9B9089"
                className="h-full flex-1 px-2 text-[15px] font-semibold text-[#302720]"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />

              {searchText.length > 0 && (
                <Pressable
                  onPress={clearSearch}
                  className="h-10 w-10 items-center justify-center"
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={20} color="#A99B92" />
                </Pressable>
              )}
            </View>

            {/* =================================================
                ACTIVE FILTERS BAR
            ================================================= */}
            {advancedFiltersCount > 0 && (
              <View className="mx-5 mt-3.5 flex-row items-center justify-between rounded-xl bg-[#FAF3EE] px-3.5 py-2.5 border border-[#F2D7CA]">
                <View className="flex-row items-center flex-1 pr-2">
                  <Ionicons name="funnel" size={14} color="#B95E2E" />
                  <Text className="ml-2 text-xs font-bold text-[#8A4A28]">
                    {advancedFiltersCount} active {advancedFiltersCount === 1 ? "filter" : "filters"} applied
                  </Text>
                </View>

                <Pressable onPress={clearAdvancedFilters} hitSlop={6}>
                  <Text className="text-xs font-black text-[#B95E2E]">
                    Clear Filters ✕
                  </Text>
                </Pressable>
              </View>
            )}

            {/* =================================================
                CATEGORIES TITLE & CHIPS
            ================================================= */}

            <View className="mt-5">
              <Text className="mb-2.5 px-5 text-[16px] font-extrabold text-[#302720]">
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
                ItemSeparatorComponent={() => <View className="w-2.5" />}
                renderItem={({ item }) => {
                  const active = selectedCategory === item;

                  return (
                    <Pressable
                      onPress={() => setSelectedCategory(item)}
                      className={`rounded-full px-4 py-2 ${
                        active
                          ? "bg-[#B95E2E]"
                          : "border border-[#E9DED7] bg-white"
                      }`}
                    >
                      <Text
                        className={`text-[12px] font-extrabold ${
                          active ? "text-white" : "text-[#6F625A]"
                        }`}
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

            <View className="mt-6 flex-row items-end justify-between px-5 mb-2">
              <View>
                <Text className="text-[20px] font-extrabold tracking-[-0.3px] text-[#29201B]">
                  Cafés Found
                </Text>
                <Text className="mt-0.5 text-xs font-medium text-[#968980]">
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
                  <Text className="text-[13px] font-extrabold text-[#B95E2E]">
                    Reset all
                  </Text>
                </Pressable>
              )}
            </View>

            {/* =================================================
                ERROR
            ================================================= */}

            {error.length > 0 && (
              <View className="mx-5 mt-3 mb-3 rounded-[18px] border border-[#F2D7CA] bg-[#FFF5F1] p-4">
                <View className="flex-row">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-white">
                    <Ionicons
                      name="alert-circle-outline"
                      size={22}
                      color="#B95E2E"
                    />
                  </View>

                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-extrabold text-[#3A2922]">
                      Something went wrong
                    </Text>
                    <Text className="mt-1 text-xs leading-[17px] text-[#7E6D64]">
                      {error}
                    </Text>
                    <Pressable
                      onPress={() => {
                        setLoading(true);
                        loadCafes();
                        loadSavedCafes();
                      }}
                    >
                      <Text className="mt-2 text-[13px] font-extrabold text-[#B95E2E]">
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
  return (
    <Pressable
      onPress={onPress}
      className="mx-5 mb-3 flex-row rounded-[20px] border border-[#EEE5DE] bg-white p-3 shadow-sm"
    >
      <Image
        source={{
          uri:
            cafe.image ||
            "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
        }}
        className="h-[100px] w-[100px] rounded-[16px] bg-[#E9DED7]"
        resizeMode="cover"
      />

      <View className="ml-3 flex-1">
        <View className="flex-row items-start">
          <Text
            numberOfLines={1}
            className="flex-1 pr-2 text-[15px] font-extrabold text-[#2B211C]"
          >
            {cafe.name}
          </Text>

          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onToggleSave();
            }}
            hitSlop={8}
            className="h-8 w-8 items-center justify-center rounded-full bg-[#FAF4F0]"
          >
            <Ionicons
              name={isSaved ? "heart" : "heart-outline"}
              size={17}
              color={isSaved ? "#E0524D" : "#806F65"}
            />
          </Pressable>
        </View>

        <View className="mt-1.5 flex-row items-center">
          <Ionicons name="location-outline" size={13} color="#8D8179" />
          <Text
            numberOfLines={1}
            className="ml-1 flex-1 text-[11px] font-medium text-[#8B7E76]"
          >
            {cafe.location}, {cafe.city}
          </Text>
        </View>

        <View className="mt-1.5 flex-row items-center">
          <View className="flex-row items-center rounded-lg bg-[#FFF5E4] px-2 py-0.5">
            <Ionicons name="star" size={11} color="#F6B94A" />
            <Text className="ml-1 text-[10px] font-extrabold text-[#77532D]">
              {cafe.rating.toFixed(1)}
            </Text>
          </View>

          <Text className="ml-2 text-[10px] text-[#958880]">
            ({cafe.reviewCount})
          </Text>
        </View>

        <View className="mt-2 flex-row items-center justify-between">
          <View className="rounded-lg bg-[#F7F1ED] px-2 py-0.5 max-w-[130px]">
            <Text numberOfLines={1} className="text-[10px] font-bold text-[#725D50]">
              {cafe.category}
            </Text>
          </View>

          <Text className="text-[11px] font-extrabold text-[#B95E2E]">
            {cafe.priceRange}
          </Text>
        </View>
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
  return (
    <View className="mx-5 mt-5 items-center rounded-[22px] border border-[#EEE5DE] bg-white px-6 py-10">
      <View className="h-[62px] w-[62px] items-center justify-center rounded-[20px] bg-[#F8E8DE]">
        <Ionicons
          name={hasFilters ? "funnel-outline" : "cafe-outline"}
          size={29}
          color="#B95E2E"
        />
      </View>

      <Text className="mt-4 text-[17px] font-extrabold text-[#302720]">
        {hasFilters ? "No cafés match your filters" : "No cafés available"}
      </Text>

      <Text className="mt-2 max-w-[290px] text-center text-[13px] leading-5 text-[#8C7E75]">
        {hasFilters
          ? "Try loosening your price, rating, or amenity filters to discover more spots."
          : "There are no cafés available right now. Pull down to refresh."}
      </Text>

      {hasFilters && (
        <Pressable
          onPress={onClear}
          className="mt-5 rounded-full bg-[#B95E2E] px-6 py-2.5 shadow-sm"
        >
          <Text className="text-[12px] font-extrabold text-white">
            Reset Filters
          </Text>
        </Pressable>
      )}
    </View>
  );
}
