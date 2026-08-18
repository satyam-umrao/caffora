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
  background: "#FAF7F3",
  surface: "#FFFFFF",
  text: "#241C18",
  muted: "#8A7D75",
  border: "#EEE5DE",
  primary: "#B95E2E",
  primaryDark: "#9E4D24",
  chip: "#FAF3EE",
};

const CATEGORIES = [
  "Specialty Coffee",
  "Artisan Bakery",
  "Desserts",
  "Italian & Bakery",
  "Gourmet Brunch",
  "Healthy & Organic",
  "Healthy & Vegan",
  "Outdoor Garden",
  "European & Brunch",
  "Tea & Books",
  "Books & Café",
  "Heritage & Coffee",
];

const THEMES = [
  "Aesthetic",
  "Work Friendly",
  "Cozy & Quiet",
  "Romantic",
  "Outdoor Garden",
  "Modern Minimalist",
  "European Chic",
  "Scenic Views",
  "Book Lovers",
  "Vintage Vibe",
];

const AMENITIES = [
  "High-Speed Wi-Fi",
  "Power Outlets",
  "Outdoor Seating",
  "Pet Friendly",
  "Valet Parking",
  "Specialty Manual Brews",
  "Artisan Bakery",
  "Air Conditioning",
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

  const [minPrice, setMinPrice] = useState(
    params.minPrice ? Number(params.minPrice) : 300,
  );
  const [maxPrice, setMaxPrice] = useState(
    params.maxPrice ? Number(params.maxPrice) : 3000,
  );
  const [distance, setDistance] = useState(
    params.distance ? Number(params.distance) : 25,
  );
  const [rating, setRating] = useState(
    params.rating ? Number(params.rating) : 0,
  );
  const [openNow, setOpenNow] = useState(params.openNow === "true");

  const [foodTypes, setFoodTypes] = useState<string[]>(
    params.foodTypes ? params.foodTypes.split(",").filter(Boolean) : [],
  );
  const [themes, setThemes] = useState<string[]>(
    params.themes ? params.themes.split(",").filter(Boolean) : [],
  );
  const [amenities, setAmenities] = useState<string[]>(
    params.amenities ? params.amenities.split(",").filter(Boolean) : [],
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
    if (minPrice > 300 || maxPrice < 3000) count++;
    if (distance < 25) count++;
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
    setMinPrice(300);
    setMaxPrice(3000);
    setDistance(25);
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
      {selected && <Ionicons name="checkmark" size={15} color="#FFFFFF" />}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={COLORS.text} />
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
          <Text style={styles.resetText}>Reset All</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Real Price Range in INR */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Price for Two</Text>
            <View style={styles.priceTag}>
              <Text style={styles.valueText}>
                ₹{minPrice.toLocaleString()} - ₹{maxPrice >= 3000 ? "3,000+" : maxPrice.toLocaleString()}
              </Text>
            </View>
          </View>

          <Text style={styles.sliderSubLabel}>Min: ₹{minPrice.toLocaleString()}</Text>
          <Slider
            minimumValue={300}
            maximumValue={3000}
            step={100}
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

          <Text style={[styles.sliderSubLabel, { marginTop: 8 }]}>
            Max: ₹{maxPrice >= 3000 ? "3,000+" : maxPrice.toLocaleString()}
          </Text>
          <Slider
            minimumValue={300}
            maximumValue={3000}
            step={100}
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
            <Text style={styles.rangeLabel}>Budget (₹300)</Text>
            <Text style={styles.rangeLabel}>Luxury (₹3,000+)</Text>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minimum Rating</Text>
          <View style={styles.ratingContainer}>
            {[0, 4.0, 4.4, 4.6, 4.7].map((value) => {
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
                        size={14}
                        color={selected ? "#FFFFFF" : "#F6B94A"}
                      />
                      <Text
                        style={[
                          styles.ratingText,
                          selected && styles.ratingTextSelected,
                        ]}
                      >
                        {value}★+
                      </Text>
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Distance Slider */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Distance Radius</Text>
            <Text style={styles.valueText}>Within {distance} km</Text>
          </View>

          <Slider
            minimumValue={2}
            maximumValue={50}
            step={1}
            value={distance}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.border}
            thumbTintColor={COLORS.primary}
            onValueChange={(value) => setDistance(Math.round(value))}
          />

          <View style={styles.rangeLabels}>
            <Text style={styles.rangeLabel}>2 km (Nearby)</Text>
            <Text style={styles.rangeLabel}>50 km (All Delhi NCR)</Text>
          </View>
        </View>

        {/* Open Now Toggle */}
        <View style={styles.switchRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.switchTitle}>Open Now</Text>
            <Text style={styles.switchSubtitle}>Show cafés open right now</Text>
          </View>

          <Switch
            value={openNow}
            onValueChange={setOpenNow}
            trackColor={{
              false: "#E0D7D0",
              true: COLORS.primary,
            }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Café Category</Text>
          <View style={styles.chipContainer}>
            {CATEGORIES.map((item) =>
              renderChip(item, foodTypes.includes(item), () =>
                toggleItem(item, foodTypes, setFoodTypes),
              ),
            )}
          </View>
        </View>

        {/* Atmosphere / Theme */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atmosphere & Vibe</Text>
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
          <Text style={styles.sectionTitle}>Amenities & Features</Text>
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
          <Text style={styles.applyButtonText}>Apply Filters</Text>
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
    height: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAF7F3",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
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
    fontWeight: "800",
  },
  resetText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  content: {
    padding: 20,
    paddingBottom: 130,
  },
  section: {
    marginBottom: 26,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },
  priceTag: {
    backgroundColor: "#FAF3EE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F2D7CA",
  },
  valueText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  sliderSubLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.muted,
    marginBottom: 2,
  },
  rangeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  rangeLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ratingButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
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
    fontWeight: "700",
  },
  ratingTextSelected: {
    color: "#FFFFFF",
  },
  switchRow: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  switchTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },
  switchSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  applyButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  applyBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  applyBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
});
