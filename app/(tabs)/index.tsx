import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Cafe,
  getCafes,
  getFeaturedCafes,
} from "../../src/services/firebase/cafes";

export default function HomeScreen() {
  const [location, setLocation] = useState("Getting location...");
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [featuredCafes, setFeaturedCafes] = useState<Cafe[]>([]);

  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getLocation();
    loadCafes();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocation("Location unavailable");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;

      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (address.length > 0) {
        const place = address[0];

        setLocation(
          place.district || place.city || place.region || "Current Location",
        );
      } else {
        setLocation("Current Location");
      }
    } catch (error) {
      console.log("Location error:", error);
      setLocation("Location unavailable");
    }
  };

  const loadCafes = async () => {
    try {
      setError("");

      const [allCafes, featured] = await Promise.all([
        getCafes(),
        getFeaturedCafes(),
      ]);

      setCafes(allCafes);
      setFeaturedCafes(featured);
    } catch (error) {
      console.error("Failed to load cafés:", error);

      setError("We couldn't load cafés right now. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCafes();
  }, []);

  const filteredCafes = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return cafes;
    }

    return cafes.filter((cafe) => {
      return (
        cafe.name.toLowerCase().includes(query) ||
        cafe.location.toLowerCase().includes(query) ||
        cafe.city.toLowerCase().includes(query) ||
        cafe.category.toLowerCase().includes(query) ||
        cafe.description.toLowerCase().includes(query)
      );
    });
  }, [cafes, searchText]);

  const nearbyCafes = useMemo(() => {
    return filteredCafes
      .filter(
        (cafe) => !featuredCafes.some((featured) => featured.id === cafe.id),
      )
      .slice(0, 8);
  }, [filteredCafes, featuredCafes]);

  const openCafe = (cafeId: string) => {
    router.push({
      pathname: "/cafe/[id]",
      params: {
        id: cafeId,
      },
    });
  };

  const handleSeeAll = () => {
    router.push("/(tabs)/search");
  };

  const handleRetry = () => {
    setLoading(true);
    loadCafes();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F3]" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 60,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#B95E2E"
          />
        }
      >
        {/* =========================================
            HEADER
        ========================================= */}

        <View className="flex-row items-center justify-between px-5 pt-3 pb-1">
          <View className="flex-1 flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-[#F7E5DA]">
              <Ionicons name="location" size={17} color="#B95E2E" />
            </View>

            <View className="ml-2.5 flex-1">
              <Text className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#93867E]">
                Current location
              </Text>

              <Text
                className="mt-0.5 text-sm font-bold text-[#302720]"
                numberOfLines={1}
              >
                {location}
              </Text>
            </View>
          </View>

          <Pressable
            className="relative h-[42px] w-[42px] items-center justify-center rounded-[15px] border border-[#EEE5DE] bg-white"
            onPress={() => router.push("/profile/notifications")}
          >
            <Ionicons name="notifications-outline" size={22} color="#2A211D" />

            <View className="absolute right-[9px] top-[9px] h-[7px] w-[7px] rounded-full border-[1.5px] border-white bg-[#B95E2E]" />
          </Pressable>
        </View>

        {/* =========================================
            HERO
        ========================================= */}

        <View className="px-5 pb-[18px] pt-[25px]">
          <Text className="mb-1.5 text-[13px] font-bold text-[#B95E2E]">
            Find your next favorite place
          </Text>

          <Text className="text-[32px] font-black leading-[37px] tracking-[-0.8px] text-[#241C18]">
            Good coffee.
            {"\n"}
            Great moments.
          </Text>

          <Text className="mt-2 text-sm leading-[21px] text-[#81746C]">
            Discover beautiful cafés around you.
          </Text>
        </View>

        {/* =========================================
            SEARCH
        ========================================= */}

        <View className="mx-5 h-[65px] flex-row items-center rounded-[50px] border border-[#EDE3DC] bg-white px-3 shadow-sm">
          <View className="h-[45px] w-[45px] items-center justify-center rounded-[50px] ">
            <Ionicons name="search-outline" size={25} color="#8A7D75" />
          </View>

          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search cafés, food, location..."
            placeholderTextColor="#9B9089"
            className="h-full flex-1 px-2.5 text-[15px] font-semibold text-[#3027209d]"
            returnKeyType="search"
          />

          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText("")} className="mr-1 p-1 ">
              <Ionicons name="close-circle" size={20} color="#A99B92" />
            </Pressable>
          )}

          <Pressable
            className="h-[45px] w-[45px] items-center justify-center rounded-[50px] bg-[#F9E8DE]"
            onPress={() => router.push("/filters")}
          >
            <Ionicons name="options-outline" size={21} color="#B95E2E" />
          </Pressable>
        </View>

        {/* =========================================
            ERROR
        ========================================= */}

        {error.length > 0 && (
          <View className="mx-5 mt-[18px] flex-row rounded-[17px] border border-[#F2D7CA] bg-[#FFF5F1] p-[15px]">
            <View className="h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white">
              <Ionicons
                name="cloud-offline-outline"
                size={22}
                color="#B95E2E"
              />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-sm font-extrabold text-[#3A2922]">
                Something went wrong
              </Text>

              <Text className="mt-0.5 text-xs leading-[17px] text-[#7E6D64]">
                {error}
              </Text>

              <Pressable onPress={handleRetry}>
                <Text className="mt-2 text-[13px] font-extrabold text-[#B95E2E]">
                  Try again
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* =========================================
            LOADING
        ========================================= */}

        {loading ? (
          <View className="items-center justify-center py-[100px]">
            <ActivityIndicator size="large" color="#B95E2E" />

            <Text className="mt-3 text-[13px] text-[#8A7D75]">
              Finding beautiful cafés...
            </Text>
          </View>
        ) : (
          <>
            {/* =====================================
                FEATURED
            ===================================== */}

            {featuredCafes.length > 0 && (
              <View className="mt-[30px]">
                <View className="mb-4 flex-row items-end justify-between px-5">
                  <View>
                    <Text className="text-[21px] font-extrabold tracking-[-0.3px] text-[#29201B]">
                      Featured cafés
                    </Text>

                    <Text className="mt-0.5 text-xs text-[#968980]">
                      Places worth discovering
                    </Text>
                  </View>

                  <Pressable onPress={handleSeeAll} hitSlop={10}>
                    <Text className="pb-0.5 text-[13px] font-extrabold text-[#B95E2E]">
                      See all
                    </Text>
                  </Pressable>
                </View>

                <FlatList
                  data={featuredCafes}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{
                    paddingHorizontal: 20,
                  }}
                  ItemSeparatorComponent={() => <View className="w-4" />}
                  renderItem={({ item }) => (
                    <FeaturedCafeCard
                      cafe={item}
                      onPress={() => openCafe(item.id)}
                    />
                  )}
                />
              </View>
            )}

            {/* =====================================
                SEARCH RESULTS
            ===================================== */}

            {searchText.trim().length > 0 ? (
              <View className="mt-[30px]">
                <View className="mb-4 flex-row items-end justify-between px-5">
                  <View>
                    <Text className="text-[21px] font-extrabold tracking-[-0.3px] text-[#29201B]">
                      Search results
                    </Text>

                    <Text className="mt-0.5 text-xs text-[#968980]">
                      {filteredCafes.length} cafés found
                    </Text>
                  </View>
                </View>

                {filteredCafes.length === 0 ? (
                  <EmptySearch />
                ) : (
                  <View className="px-5">
                    {filteredCafes.map((cafe) => (
                      <NearbyCafeCard
                        key={cafe.id}
                        cafe={cafe}
                        onPress={() => openCafe(cafe.id)}
                      />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              /* ===================================
                 EXPLORE
              =================================== */

              <View className="mt-[30px]">
                <View className="mb-4 flex-row items-end justify-between px-5">
                  <View>
                    <Text className="text-[21px] font-extrabold tracking-[-0.3px] text-[#29201B]">
                      Explore cafés
                    </Text>

                    <Text className="mt-0.5 text-xs text-[#968980]">
                      More places for your next coffee
                    </Text>
                  </View>

                  <Pressable onPress={handleSeeAll} hitSlop={10}>
                    <Text className="pb-0.5 text-[13px] font-extrabold text-[#B95E2E]">
                      See all
                    </Text>
                  </Pressable>
                </View>

                {nearbyCafes.length === 0 ? (
                  <EmptyCafes />
                ) : (
                  <View className="px-5">
                    {nearbyCafes.map((cafe) => (
                      <NearbyCafeCard
                        key={cafe.id}
                        cafe={cafe}
                        onPress={() => openCafe(cafe.id)}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* =====================================
                EMPTY DATABASE
            ===================================== */}

            {cafes.length === 0 && !error && <EmptyCafes />}
          </>
        )}

        <View className="h-[30px]" />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ==================================================
   FEATURED CARD
================================================== */

type FeaturedCafeCardProps = {
  cafe: Cafe;
  onPress: () => void;
};

function FeaturedCafeCard({ cafe, onPress }: FeaturedCafeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="w-[300px] overflow-hidden rounded-[23px] border border-[#EEE4DD] bg-white shadow-md"
    >
      <View className="relative h-[190px] bg-[#E9DED7]">
        <Image
          source={{
            uri:
              cafe.image ||
              "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
          }}
          className="h-full w-full"
          resizeMode="cover"
        />

        <View className="absolute inset-x-0 bottom-0 h-[70px] bg-black/10" />

        {/* Favorite */}

        <Pressable
          className="absolute right-[13px] top-[13px] h-[38px] w-[38px] items-center justify-center rounded-[14px] bg-white/95"
          onPress={(event) => {
            event.stopPropagation();

            Alert.alert(
              "Saved Cafés",
              "Favorite functionality will be connected next.",
            );
          }}
        >
          <Ionicons name="heart-outline" size={19} color="#302720" />
        </Pressable>

        {/* Featured */}

        <View className="absolute left-[13px] top-[13px] flex-row items-center rounded-[10px] bg-[#412D22]/90 px-2.5 py-1.5">
          <Ionicons name="sparkles" size={12} color="#FFFFFF" />

          <Text className="ml-1 text-[10px] font-extrabold text-white">
            Featured
          </Text>
        </View>

        {/* Rating */}

        <View className="absolute bottom-[13px] left-[13px] flex-row items-center rounded-[10px] bg-white px-2.5 py-1.5">
          <Ionicons name="star" size={13} color="#F6B94A" />

          <Text className="ml-1 text-xs font-extrabold text-[#302720]">
            {cafe.rating.toFixed(1)}
          </Text>
        </View>
      </View>

      <View className="p-[15px]">
        <Text
          className="text-lg font-extrabold text-[#2B211C]"
          numberOfLines={1}
        >
          {cafe.name}
        </Text>

        <View className="mt-1.5 flex-row items-center">
          <Ionicons name="location-outline" size={14} color="#8B7E76" />

          <Text
            className="ml-1 flex-1 text-xs text-[#877970]"
            numberOfLines={1}
          >
            {cafe.location}, {cafe.city}
          </Text>
        </View>

        <View className="mt-3 flex-row items-center">
          <View className="rounded-lg bg-[#F8E9E0] px-2.5 py-1">
            <Text className="text-[10px] font-extrabold text-[#A8522B]">
              {cafe.category}
            </Text>
          </View>

          <Text className="ml-2 text-xs font-extrabold text-[#5E514A]">
            {cafe.priceRange}
          </Text>

          <Text className="ml-2 text-[11px] text-[#9A8D85]">
            {cafe.reviewCount} reviews
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/* ==================================================
   NEARBY CARD
================================================== */

type NearbyCafeCardProps = {
  cafe: Cafe;
  onPress: () => void;
};

function NearbyCafeCard({ cafe, onPress }: NearbyCafeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row items-center rounded-[19px] border border-[#EEE5DE] bg-white p-[11px] shadow-sm"
    >
      <Image
        source={{
          uri:
            cafe.image ||
            "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
        }}
        className="h-[82px] w-[82px] rounded-[14px] bg-[#E9DED7]"
        resizeMode="cover"
      />

      <View className="ml-[13px] min-w-0 flex-1">
        <View className="flex-row items-center">
          <Text
            className="flex-1 text-[15px] font-extrabold text-[#2B211C]"
            numberOfLines={1}
          >
            {cafe.name}
          </Text>

          <View className="ml-2 flex-row items-center rounded-[7px] bg-[#FFF5E4] px-1.5 py-1">
            <Ionicons name="star" size={11} color="#F6B94A" />

            <Text className="ml-0.5 text-[10px] font-extrabold text-[#77532D]">
              {cafe.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        <View className="mt-1.5 flex-row items-center">
          <Ionicons name="location-outline" size={13} color="#8D8179" />

          <Text
            className="ml-0.5 flex-1 text-[11px] text-[#8B7E76]"
            numberOfLines={1}
          >
            {cafe.location}, {cafe.city}
          </Text>
        </View>

        <View className="mt-2.5 flex-row items-center">
          <View className="rounded-[7px] bg-[#F7F1ED] px-2 py-1">
            <Text className="text-[9px] font-bold text-[#725D50]">
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

/* ==================================================
   EMPTY SEARCH
================================================== */

function EmptySearch() {
  return (
    <View className="mx-5 items-center rounded-[20px] border border-[#EEE5DE] bg-white px-6 py-[35px]">
      <View className="h-[58px] w-[58px] items-center justify-center rounded-[20px] bg-[#F8E8DE]">
        <Ionicons name="search-outline" size={28} color="#B95E2E" />
      </View>

      <Text className="mt-[13px] text-base font-extrabold text-[#302720]">
        No cafés found
      </Text>

      <Text className="mt-1.5 max-w-[280px] text-center text-xs leading-[18px] text-[#8C7E75]">
        Try searching for another café, location, or category.
      </Text>
    </View>
  );
}

/* ==================================================
   EMPTY CAFÉS
================================================== */

function EmptyCafes() {
  return (
    <View className="mx-5 items-center rounded-[20px] border border-[#EEE5DE] bg-white px-6 py-[35px]">
      <View className="h-[58px] w-[58px] items-center justify-center rounded-[20px] bg-[#F8E8DE]">
        <Ionicons name="cafe-outline" size={28} color="#B95E2E" />
      </View>

      <Text className="mt-[13px] text-base font-extrabold text-[#302720]">
        No cafés available
      </Text>

      <Text className="mt-1.5 max-w-[280px] text-center text-xs leading-[18px] text-[#8C7E75]">
        We couldn't find any cafés right now. Pull down to refresh.
      </Text>
    </View>
  );
}
