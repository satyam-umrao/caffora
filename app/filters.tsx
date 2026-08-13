import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  background: "#F8F5F1",
  surface: "#FFFFFF",
  text: "#211A16",
  muted: "#81766E",
  border: "#E8E0D9",
  primary: "#B96F3C",
  primaryDark: "#8F4F26",
  chip: "#F1E7DE",
};

const FOOD_TYPES = [
  "Coffee",
  "Bakery",
  "Breakfast",
  "Desserts",
  "Pizza",
  "Italian",
  "Asian",
  "Indian",
  "Vegan",
];

const THEMES = [
  "Cozy",
  "Modern",
  "Luxury",
  "Minimal",
  "Outdoor",
  "Work Friendly",
  "Romantic",
  "Family Friendly",
];

const AMENITIES = [
  "Wi-Fi",
  "Parking",
  "Outdoor Seating",
  "Pet Friendly",
  "Air Conditioning",
  "Charging Ports",
];

export default function FiltersScreen() {
  const params = useLocalSearchParams<{
    minPrice?: string;
    maxPrice?: string;
    distance?: string;
    rating?: string;
    foodTypes?: string;
    themes?: string;
    amenities?: string;
    openNow?: string;
  }>();

  const [minPrice, setMinPrice] = useState(Number(params.minPrice ?? 1));

  const [maxPrice, setMaxPrice] = useState(Number(params.maxPrice ?? 4));

  const [distance, setDistance] = useState(Number(params.distance ?? 10));

  const [rating, setRating] = useState(Number(params.rating ?? 0));

  const [openNow, setOpenNow] = useState(params.openNow === "true");

  const [foodTypes, setFoodTypes] = useState<string[]>(
    params.foodTypes ? params.foodTypes.split(",") : [],
  );

  const [themes, setThemes] = useState<string[]>(
    params.themes ? params.themes.split(",") : [],
  );

  const [amenities, setAmenities] = useState<string[]>(
    params.amenities ? params.amenities.split(",") : [],
  );

  const toggleItem = (
    value: string,
    selected: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const selectedCount = useMemo(() => {
    let count = 0;

    if (minPrice !== 1 || maxPrice !== 4) count++;
    if (distance !== 10) count++;
    if (rating > 0) count++;
    if (openNow) count++;

    count += foodTypes.length;
    count += themes.length;
    count += amenities.length;

    return count;
  }, [
    minPrice,
    maxPrice,
    distance,
    rating,
    openNow,
    foodTypes,
    themes,
    amenities,
  ]);

  const resetFilters = () => {
    setMinPrice(1);
    setMaxPrice(4);
    setDistance(10);
    setRating(0);
    setOpenNow(false);
    setFoodTypes([]);
    setThemes([]);
    setAmenities([]);
  };

  const applyFilters = () => {
    router.replace({
      pathname: "/(tabs)/search",
      params: {
        minPrice: String(minPrice),
        maxPrice: String(maxPrice),
        distance: String(distance),
        rating: String(rating),
        openNow: String(openNow),
        foodTypes: foodTypes.join(","),
        themes: themes.join(","),
        amenities: amenities.join(","),
      },
    });
  };

  const renderChip = (
    label: string,
    selected: boolean,
    onPress: () => void,
  ) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {selected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}

      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
    {/* <View style={styles.container}> */}
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="close" size={25} color={COLORS.text} />
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Filters</Text>

          {selectedCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{selectedCount}</Text>
            </View>
          )}
        </View>

        <Pressable onPress={resetFilters}>
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Price */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Price Range</Text>

            <Text style={styles.valueText}>
              {"$".repeat(minPrice)} - {"$".repeat(maxPrice)}
            </Text>
          </View>

          <Slider
            minimumValue={1}
            maximumValue={4}
            step={1}
            value={minPrice}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.border}
            thumbTintColor={COLORS.primary}
            onValueChange={(value) => {
              const next = Math.round(value);

              if (next <= maxPrice) {
                setMinPrice(next);
              }
            }}
          />

          <Slider
            minimumValue={1}
            maximumValue={4}
            step={1}
            value={maxPrice}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.border}
            thumbTintColor={COLORS.primary}
            onValueChange={(value) => {
              const next = Math.round(value);

              if (next >= minPrice) {
                setMaxPrice(next);
              }
            }}
          />

          <View style={styles.rangeLabels}>
            <Text style={styles.rangeLabel}>Budget</Text>
            <Text style={styles.rangeLabel}>Premium</Text>
          </View>
        </View>

        {/* Distance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Distance</Text>

            <Text style={styles.valueText}>Within {distance} km</Text>
          </View>

          <Slider
            minimumValue={1}
            maximumValue={50}
            step={1}
            value={distance}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.border}
            thumbTintColor={COLORS.primary}
            onValueChange={(value) => setDistance(Math.round(value))}
          />

          <View style={styles.rangeLabels}>
            <Text style={styles.rangeLabel}>1 km</Text>
            <Text style={styles.rangeLabel}>50 km</Text>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minimum Rating</Text>

          <View style={styles.ratingContainer}>
            {[0, 3, 3.5, 4, 4.5].map((value) => {
              const selected = rating === value;

              return (
                <Pressable
                  key={value}
                  onPress={() => setRating(value)}
                  style={[
                    styles.ratingButton,
                    selected && styles.ratingButtonSelected,
                  ]}
                >
                  {value === 0 ? (
                    <Text
                      style={[
                        styles.ratingText,
                        selected && styles.ratingTextSelected,
                      ]}
                    >
                      Any
                    </Text>
                  ) : (
                    <>
                      <Ionicons
                        name="star"
                        size={15}
                        color={selected ? "#FFFFFF" : "#D58A3E"}
                      />

                      <Text
                        style={[
                          styles.ratingText,
                          selected && styles.ratingTextSelected,
                        ]}
                      >
                        {value}+
                      </Text>
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Open now */}
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchTitle}>Open Now</Text>

            <Text style={styles.switchSubtitle}>Show cafes currently open</Text>
          </View>

          <Switch
            value={openNow}
            onValueChange={setOpenNow}
            trackColor={{
              false: "#D8D0C9",
              true: COLORS.primary,
            }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Food Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food & Drinks</Text>

          <View style={styles.chipContainer}>
            {FOOD_TYPES.map((item) =>
              renderChip(item, foodTypes.includes(item), () =>
                toggleItem(item, foodTypes, setFoodTypes),
              ),
            )}
          </View>
        </View>

        {/* Themes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cafe Theme</Text>

          <View style={styles.chipContainer}>
            {THEMES.map((item) =>
              renderChip(item, themes.includes(item), () =>
                toggleItem(item, themes, setThemes),
              ),
            )}
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>

          <View style={styles.chipContainer}>
            {AMENITIES.map((item) =>
              renderChip(item, amenities.includes(item), () =>
                toggleItem(item, amenities, setAmenities),
              ),
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <Pressable onPress={applyFilters} style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Show Cafes</Text>

          {selectedCount > 0 && (
            <View style={styles.applyBadge}>
              <Text style={styles.applyBadgeText}>{selectedCount}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    margin:5,
    height: 70,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: COLORS.text,
  },

  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  countText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  resetText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: "700",
  },

  content: {
    padding: 20,
    paddingBottom: 130,
  },

  section: {
    marginBottom: 30,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 14,
  },

  valueText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: "600",
  },

  rangeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -5,
  },

  rangeLabel: {
    color: COLORS.muted,
    fontSize: 12,
  },

  ratingContainer: {
    flexDirection: "row",
    gap: 8,
  },

  ratingButton: {
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  ratingButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  ratingText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },

  ratingTextSelected: {
    color: "#FFFFFF",
  },

  switchRow: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  switchTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },

  switchSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  chip: {
    minHeight: 40,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  chipText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "500",
  },

  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  applyButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },

  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  applyBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  applyBadgeText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "800",
  },
});
