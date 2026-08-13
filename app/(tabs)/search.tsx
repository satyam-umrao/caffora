// Search Screen
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";


const popularSearches = [
  { title: "Coffee", icon: "local-cafe" as const },
  { title: "Pizza", icon: "local-pizza" as const },
  { title: "Desserts", icon: "cake" as const },
  { title: "Healthy", icon: "spa" as const },
  { title: "WiFi", icon: "wifi" as const },
  { title: "Work Friendly", icon: "laptop-mac" as const },
];

const vibes = [
  {
    title: "Cozy Mornings",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
  },
  {
    title: "Modern Minimal",
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
  },
  {
    title: "Star",
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
  },
  {
    title: "Best",
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
  },
];

export default function SearchScreen() {
  const [searchText, setSearchText] = useState("");

  const [recentSearches, setRecentSearches] = useState([
    "Blue Tokai Coffee",
    "The Brew Room",
    "Starbucks",
  ]);

  const removeRecent = (item: string) => {
    setRecentSearches((prev) =>
      prev.filter((search) => search !== item)
    );
  };

  const clearAll = () => {
    setRecentSearches([]);
  };
  const handleSearch = () => {
    const query = searchText.trim();

    if (!query) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== query.toLowerCase()
      );

      return [query, ...filtered].slice(0, 5);
    });

    router.push({
      pathname: "/search-results",
      params: {
        query,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F3]">

      {/* =========Search Header================== */}

      <View className="px-5 pt-12 pb-5">
        {/* ======================== SEARCH BAR===== */}
        <View className="mx-5 h-14 flex-row items-center rounded-[18px] border border-[#EDE3DC] bg-white px-2 shadow-sm">
          <Ionicons name="search-outline" size={21} color="#8A7D75" />

          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search cafés, food, location..."
            placeholderTextColor="#9B9089"
            className="h-full flex-1 px-2.5 text-sm text-[#302720]"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />

          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText("")} className="mr-1 p-1">
              <Ionicons name="close-circle" size={20} color="#A99B92" />
            </Pressable>
          )}

          <Pressable
            className="h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-[#F9E8DE]"
            onPress={() => router.push("/filters")}
          >
            <Ionicons name="options-outline" size={21} color="#B95E2E" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 110,
        }}
      >

        {/* ================Recent Searches================== */}
        {recentSearches.length > 0 && (
          <View className="mt-3">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[18px] font-semibold text-[#201A17]">
                Recent Searches
              </Text>

              <Pressable onPress={clearAll}>
                <Text className="text-[14px] font-semibold text-[#994418]">
                  Clear all
                </Text>
              </Pressable>
            </View>

            <View className="gap-2">
              {recentSearches.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => {
                    setSearchText(item);

                    router.push({
                      pathname: "/search-results",
                      params: { query: item },
                    });
                  }}
                  className="h-[64px] flex-row items-center justify-between rounded-xl border border-[#E8E1DB] bg-white px-3"
                >
                  <View className="flex-row items-center">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FEF1EC]">
                      <Ionicons
                        name="time-outline"
                        size={18}
                        color="#7C726B"
                      />
                    </View>

                    <Text className="ml-3 text-[15px] text-[#201A17]">
                      {item}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => removeRecent(item)}
                    className="h-9 w-9 items-center justify-center rounded-full"
                  >
                    <Ionicons name="close" size={18} color="#7C726B" />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ===================Popular Searches =================*/}
        <View className="mt-8">
          <Text className="mb-4 text-[18px] font-semibold text-[#201A17]">
            Popular Searches
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {popularSearches.map((item) => (
              <Pressable
                key={item.title}
                onPress={() => {
                  setSearchText(item.title);
                  router.push({
                    pathname: "/search-results",
                    params: { query: item.title},
                  });

                  setRecentSearches((prev) => {
                    const filtered = prev.filter(
                      (search) =>
                        search.toLowerCase() !== item.title.toLowerCase()
                    );

                    return [item.title, ...filtered].slice(0, 5);
                  });
                }}
                className="h-12 flex-row items-center rounded-full border border-[#E8E1DB] bg-white px-3"
              >
                <MaterialIcons
                  name={item.icon}
                  size={16}
                  color="#994418"
                />

                <Text className="ml-1.5 text-[13px] font-semibold text-[#55433B]">
                  {item.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ==================Discover Vibes========== */}
        <View className="mt-8">
          <Text className="mb-3 text-[18px] font-semibold text-[#201A17]">
            Discover Vibes
          </Text>
          <View className="-mx-2">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                gap: 14,
              }}
            >
              {vibes.map((vibe) => (
                <Pressable
                  key={vibe.title}
                  className="relative h-[140px] w-[220px] overflow-hidden rounded-xl"
                >
                  <Image
                    source={{ uri: vibe.image }}
                    className="absolute h-full w-full"
                    resizeMode="cover"
                  />

                  <View className="absolute inset-0 bg-black/35" />

                  <Text className="absolute bottom-3 left-3 text-[14px] font-bold text-white">
                    {vibe.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView >
  );
}
