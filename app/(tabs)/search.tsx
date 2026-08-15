import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

const CATEGORIES = ["All", "Coffee", "Bakery", "Breakfast", "Desserts", "Tea"];

/* =========================================================
   MAIN SEARCH SCREEN
========================================================= */

export default function SearchScreen() {
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
     SEARCH + CATEGORY FILTER
  ======================================================= */

  const filteredCafes = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return cafes.filter((cafe) => {
      /* ---------------------------------------------------
         SEARCH MATCH
      --------------------------------------------------- */

      const matchesSearch =
        !query ||
        cafe.name.toLowerCase().includes(query) ||
        cafe.location.toLowerCase().includes(query) ||
        cafe.city.toLowerCase().includes(query) ||
        cafe.category.toLowerCase().includes(query) ||
        cafe.description.toLowerCase().includes(query);

      /* ---------------------------------------------------
         CATEGORY MATCH
      --------------------------------------------------- */

      const matchesCategory =
        selectedCategory === "All" ||
        cafe.category.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [cafes, searchText, selectedCategory]);

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

            <View className="px-5 pb-5 pt-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-[30px] font-black tracking-[-0.6px] text-[#241C18]">
                    Search
                  </Text>

                  <Text className="mt-1 text-sm font-medium text-[#8A7D75]">
                    Find your perfect cafe
                  </Text>
                </View>

                {/* FILTER BUTTON */}

                <Pressable
                  onPress={() => router.push("/filters")}
                  className="h-[45px] w-[45px] items-center justify-center rounded-[15px] border border-[#EEE5DE] bg-white"
                >
                  <Ionicons name="options-outline" size={22} color="#B95E2E" />
                </Pressable>
              </View>
            </View>

            {/* =================================================
                SEARCH BOX
            ================================================= */}

            <View className="mx-5 h-[62px] flex-row items-center rounded-[20px] border border-[#EDE3DC] bg-white px-3 shadow-sm">
              {/* SEARCH ICON */}

              <View className="h-10 w-10 items-center justify-center">
                <Ionicons name="search-outline" size={23} color="#8A7D75" />
              </View>

              {/* INPUT */}

              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search cafes, food, location..."
                placeholderTextColor="#9B9089"
                className="h-full flex-1 px-2 text-[15px] font-semibold text-[#302720]"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />

              {/* CLEAR */}

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
                CATEGORIES TITLE
            ================================================= */}

            <View className="mt-7">
              <Text className="mb-3 px-5 text-[17px] font-extrabold text-[#302720]">
                Categories
              </Text>

              {/* CATEGORY CHIPS */}

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
                      className={`rounded-full px-5 py-2 ${
                        active
                          ? "bg-[#B95E2E]"
                          : "border border-[#E9DED7] bg-white"
                      }`}
                    >
                      <Text
                        className={`text-[13px] font-bold {
                          active
                            ? "text-white" : "text-[#6F625A]"
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

            <View className="mt-8 flex-row items-end justify-between px-5">
              <View>
                <Text className="text-[21px] font-extrabold tracking-[-0.3px] text-[#29201B]">
                  Explore cafes
                </Text>

                <Text className="mt-1 text-xs font-medium text-[#968980]">
                  {filteredCafes.length}{" "}
                  {filteredCafes.length === 1 ? "cafe" : "cafes"} found
                </Text>
              </View>

              {/* RESET */}

              {(searchText.length > 0 || selectedCategory !== "All") && (
                <Pressable
                  onPress={() => {
                    setSearchText("");
                    setSelectedCategory("All");
                  }}
                >
                  <Text className="text-[13px] font-extrabold text-[#B95E2E]">
                    Clear all
                  </Text>
                </Pressable>
              )}
            </View>

            {/* =================================================
                ERROR
            ================================================= */}

            {error.length > 0 && (
              <View className="mx-5 mt-5 rounded-[18px] border border-[#F2D7CA] bg-[#FFF5F1] p-4">
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
            hasSearch={searchText.trim().length > 0}
            hasCategory={selectedCategory !== "All"}
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
      {/* =================================================
          IMAGE
      ================================================= */}

      <Image
        source={{
          uri:
            cafe.image ||
            "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
        }}
        className="h-[100px] w-[100px] rounded-[16px] bg-[#E9DED7]"
        resizeMode="cover"
      />

      {/* =================================================
          CONTENT
      ================================================= */}

      <View className="ml-3 flex-1">
        {/* NAME + SAVE */}

        <View className="flex-row items-start">
          <Text
            numberOfLines={1}
            className="flex-1 pr-2 text-[16px] font-extrabold text-[#2B211C]"
          >
            {cafe.name}
          </Text>

          {/* SAVE BUTTON */}

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

        {/* =================================================
            LOCATION
        ================================================= */}

        <View className="mt-2 flex-row items-center">
          <Ionicons name="location-outline" size={13} color="#8D8179" />

          <Text
            numberOfLines={1}
            className="ml-1 flex-1 text-[12px] text-[#8B7E76]"
          >
            {cafe.location}, {cafe.city}
          </Text>
        </View>

        {/* =================================================
            RATING
        ================================================= */}

        <View className="mt-2 flex-row items-center">
          <View className="flex-row items-center rounded-lg bg-[#FFF5E4] px-2 py-1">
            <Ionicons name="star" size={11} color="#F6B94A" />

            <Text className="ml-1 text-[10px] font-extrabold text-[#77532D]">
              {cafe.rating.toFixed(1)}
            </Text>
          </View>

          <Text className="ml-2 text-[11px] text-[#958880]">
            {cafe.reviewCount} reviews
          </Text>
        </View>

        {/* =================================================
            CATEGORY + PRICE + ARROW
        ================================================= */}

        <View className="mt-2.5 flex-row items-center">
          <View className="rounded-lg bg-[#F7F1ED] px-2 py-1">
            <Text className="text-[10px] font-bold text-[#725D50]">
              {cafe.category}
            </Text>
          </View>

          <Text className="ml-2 text-[11px] font-bold text-[#75675F]">
            {cafe.priceRange}
          </Text>

          <View className="flex-1" />

          <Ionicons name="chevron-forward" size={17} color="#B7ABA3" />
        </View>
      </View>
    </Pressable>
  );
}

/* =========================================================
   EMPTY SEARCH
========================================================= */

type EmptySearchProps = {
  hasSearch: boolean;
  hasCategory: boolean;
};

function EmptySearch({ hasSearch, hasCategory }: EmptySearchProps) {
  const hasFilters = hasSearch || hasCategory;

  return (
    <View className="mx-5 mt-5 items-center rounded-[22px] border border-[#EEE5DE] bg-white px-6 py-10">
      {/* ICON */}

      <View className="h-[62px] w-[62px] items-center justify-center rounded-[20px] bg-[#F8E8DE]">
        <Ionicons
          name={hasFilters ? "search-outline" : "cafe-outline"}
          size={29}
          color="#B95E2E"
        />
      </View>

      {/* TITLE */}

      <Text className="mt-4 text-[17px] font-extrabold text-[#302720]">
        {hasFilters ? "No cafes found" : "No cafes available"}
      </Text>

      {/* DESCRIPTION */}

      <Text className="mt-2 max-w-[290px] text-center text-[13px] leading-5 text-[#8C7E75]">
        {hasFilters
          ? "Try another search or choose a different category."
          : "There are no cafes available right now. Pull down to refresh."}
      </Text>

      {/* CLEAR FILTERS */}

      {hasFilters && (
        <Pressable
          onPress={() => {
            // This component doesn't own
            // the state, so the parent
            // handles clearing.
          }}
          className="mt-4 rounded-full bg-[#B95E2E] px-5 py-2.5"
        >
          <Text className="text-[12px] font-extrabold text-white">
            Try another search
          </Text>
        </Pressable>
      )}
    </View>
  );
}
