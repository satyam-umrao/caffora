import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Cafe,
  searchCafes,
} from "../src/services/firebase/cafes";

export default function SearchResultsScreen() {
  const { query } = useLocalSearchParams<{ query?: string }>();

  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const searchQuery =
    typeof query === "string" ? query.trim() : "";

  useEffect(() => {
    runSearch();
  }, [searchQuery]);

  const runSearch = async () => {
    try {
      setLoading(true);
      setError("");

      const results = await searchCafes(searchQuery);

      setCafes(results);
    } catch (error) {
      console.error("Search error:", error);
      setError("We couldn't load search results.");
    } finally {
      setLoading(false);
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
    return (
      <Pressable
        onPress={() => openCafe(item.id)}
        className="mb-4 overflow-hidden rounded-2xl border border-[#E8E1DB] bg-white"
      >
        {/* Cafe Image */}
        <View className="relative h-[190px] w-full">
          <Image
            source={{ uri: item.image }}
            className="h-full w-full"
            resizeMode="cover"
          />

          {/* Featured */}
          {item.featured && (
            <View className="absolute left-3 top-3 rounded-full bg-[#B95E2E] px-3 py-1">
              <Text className="text-[11px] font-bold text-white">
                Featured
              </Text>
            </View>
          )}

          {/* Rating */}
          <View className="absolute right-3 top-3 flex-row items-center rounded-full bg-white/95 px-2.5 py-1.5">
            <Ionicons
              name="star"
              size={14}
              color="#B95E2E"
            />

            <Text className="ml-1 text-[12px] font-bold text-[#302720]">
              {item.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Cafe Information */}
        <View className="p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text
                className="text-[18px] font-bold text-[#241C18]"
                numberOfLines={1}
              >
                {item.name}
              </Text>

              <Text
                className="mt-1 text-[13px] text-[#81746C]"
                numberOfLines={1}
              >
                {item.category} • {item.priceRange}
              </Text>
            </View>

            <Pressable
              onPress={() => console.log("Save cafe:", item.id)}
              className="h-9 w-9 items-center justify-center rounded-full bg-[#FEF1EC]"
            >
              <Ionicons
                name="bookmark-outline"
                size={19}
                color="#B95E2E"
              />
            </Pressable>
          </View>

          {/* Location */}
          <View className="mt-3 flex-row items-center">
            <Ionicons
              name="location-outline"
              size={16}
              color="#8A7D75"
            />

            <Text
              className="ml-1.5 flex-1 text-[13px] text-[#81746C]"
              numberOfLines={1}
            >
              {item.location}, {item.city}
            </Text>
          </View>

          {/* Reviews */}
          <View className="mt-2 flex-row items-center">
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={15}
              color="#8A7D75"
            />

            <Text className="ml-1.5 text-[12px] text-[#93867E]">
              {item.reviewCount} reviews
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#FAF7F3]"
      edges={["top"]}
    >
      {/* Header */}
      <View className="flex-row items-center px-5 pb-4 pt-3">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#302720"
          />
        </Pressable>

        <View className="ml-3 flex-1">
          <Text className="text-[12px] font-medium text-[#93867E]">
            Search results
          </Text>

          <Text
            className="mt-0.5 text-[19px] font-bold text-[#241C18]"
            numberOfLines={1}
          >
            {searchQuery || "All cafés"}
          </Text>
        </View>
      </View>

      {/* Loading */}
      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#B95E2E"
          />

          <Text className="mt-3 text-sm text-[#81746C]">
            Finding cafés...
          </Text>
        </View>
      )}

      {/* Error */}
      {!loading && error !== "" && (
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-[#F9E8DE]">
            <Ionicons
              name="cloud-offline-outline"
              size={28}
              color="#B95E2E"
            />
          </View>

          <Text className="mt-4 text-center text-[17px] font-bold text-[#302720]">
            Something went wrong
          </Text>

          <Text className="mt-2 text-center text-sm text-[#81746C]">
            {error}
          </Text>

          <Pressable
            onPress={runSearch}
            className="mt-5 rounded-xl bg-[#B95E2E] px-6 py-3"
          >
            <Text className="font-bold text-white">
              Try again
            </Text>
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
            paddingBottom: 30,
          }}
          ListHeaderComponent={
            cafes.length > 0 ? (
              <View className="mb-4">
                <Text className="text-[13px] text-[#93867E]">
                  {cafes.length}{" "}
                  {cafes.length === 1 ? "café" : "cafés"} found
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-5 pt-24">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-[#F9E8DE]">
                <Ionicons
                  name="search-outline"
                  size={34}
                  color="#B95E2E"
                />
              </View>

              <Text className="mt-5 text-center text-[20px] font-bold text-[#302720]">
                No cafés found
              </Text>

              <Text className="mt-2 text-center text-sm leading-5 text-[#81746C]">
                We couldn't find any cafés matching{" "}
                <Text className="font-semibold">
                  "{searchQuery}"
                </Text>
                .
              </Text>

              <Pressable
                onPress={() => router.back()}
                className="mt-6 rounded-xl bg-[#B95E2E] px-6 py-3"
              >
                <Text className="font-bold text-white">
                  Try another search
                </Text>
              </Pressable>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}