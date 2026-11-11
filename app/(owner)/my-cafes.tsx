import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../src/context/ThemeContext";
import {
  deleteCafe,
  getOwnerCafes,
  isCafeOpenNow,
  toggleCafeActiveStatus,
  toggleCafeOpenStatus,
} from "../../src/services/firebase/cafes";
import { auth } from "../../src/services/firebase/config";
import type { Cafe } from "../../src/types/cafe";

export default function MyCafesScreen() {
  const { colors, isDark } = useTheme();

  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(
    null,
  );

  const fetchCafes = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      router.replace("/(auth)/login");
      return;
    }

    try {
      const data = await getOwnerCafes(user.uid);
      setCafes(data);
    } catch (err) {
      console.error("fetchCafes error:", err);
      Alert.alert("Error", "Could not load your café listings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCafes();
    }, [fetchCafes]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCafes();
  };

  const handleToggleOpen = async (cafe: Cafe) => {
    const user = auth.currentUser;
    if (!user) return;

    const nextState = !(cafe.isOpen !== false);
    setActionInProgressId(cafe.id);

    try {
      await toggleCafeOpenStatus(cafe.id, nextState, user.uid);
      setCafes((prev) =>
        prev.map((c) => (c.id === cafe.id ? { ...c, isOpen: nextState } : c)),
      );
    } catch (err: any) {
      Alert.alert(
        "Update Failed",
        err?.message || "Could not toggle open/closed status.",
      );
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleToggleActive = async (cafe: Cafe) => {
    const user = auth.currentUser;
    if (!user) return;

    const nextState = !(cafe.isActive !== false);
    setActionInProgressId(cafe.id);

    try {
      await toggleCafeActiveStatus(cafe.id, nextState, user.uid);
      setCafes((prev) =>
        prev.map((c) => (c.id === cafe.id ? { ...c, isActive: nextState } : c)),
      );
    } catch (err: any) {
      Alert.alert(
        "Update Failed",
        err?.message || "Could not toggle listing visibility.",
      );
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleDelete = (cafe: Cafe) => {
    Alert.alert(
      "Delete Listing",
      `Are you sure you want to permanently remove "${cafe.name}"? This action cannot be reversed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const user = auth.currentUser;
            if (!user) return;

            setActionInProgressId(cafe.id);
            try {
              await deleteCafe(cafe.id, user.uid);
              setCafes((prev) => prev.filter((c) => c.id !== cafe.id));
              Alert.alert("Success", "Café listing removed successfully.");
            } catch (err: any) {
              Alert.alert(
                "Delete Failed",
                err?.message || "Could not delete café.",
              );
            } finally {
              setActionInProgressId(null);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>
          Loading your listings...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Top Header */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            My Cafés
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
            {cafes.length} {cafes.length === 1 ? "location" : "locations"} listed
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/(owner)/add-cafe")}
          style={[styles.addHeaderBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addHeaderBtnText}>Add Café</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {cafes.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: colors.chip },
              ]}
            >
              <Ionicons name="storefront-outline" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Cafés Listed Yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
              Showcase your café to thousands of local coffee lovers. Add high-resolution photos, configure seating, and start receiving table bookings.
            </Text>
            <Pressable
              onPress={() => router.push("/(owner)/add-cafe")}
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>List Your First Café</Text>
            </Pressable>
          </View>
        ) : (
          /* List of Cafes */
          cafes.map((cafe) => {
            const isManualOpen = cafe.isOpen !== false;
            const isCurrentlyOpen = isCafeOpenNow(
              cafe.openingHours,
              cafe.isOpen,
            );
            const isListingActive = cafe.isActive !== false;
            const isWorking = actionInProgressId === cafe.id;

            return (
              <View
                key={cafe.id}
                style={[
                  styles.cafeCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: isListingActive ? 1 : 0.75,
                  },
                ]}
              >
                {/* Hero Image & Top Badges */}
                <View style={styles.imageContainer}>
                  <Image
                    source={{
                      uri:
                        cafe.image ||
                        (cafe.images && cafe.images[0]) ||
                        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
                    }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />

                  {/* Badges Overlay */}
                  <View style={styles.topBadgeRow}>
                    {/* Open/Closed Badge */}
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: !isManualOpen
                            ? "rgba(220, 38, 38, 0.9)"
                            : isCurrentlyOpen
                            ? "rgba(22, 163, 74, 0.9)"
                            : "rgba(100, 116, 139, 0.9)",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.badgeDot,
                          {
                            backgroundColor: !isManualOpen
                              ? "#FCA5A5"
                              : isCurrentlyOpen
                              ? "#86EFAC"
                              : "#CBD5E1",
                          },
                        ]}
                      />
                      <Text style={styles.badgeText}>
                        {!isManualOpen
                          ? "Manual Closed"
                          : isCurrentlyOpen
                          ? "Open Now"
                          : "Scheduled Closed"}
                      </Text>
                    </View>

                    {/* Active/Inactive Status Badge */}
                    {!isListingActive && (
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: "rgba(71, 85, 105, 0.9)" },
                        ]}
                      >
                        <Ionicons name="eye-off-outline" size={12} color="#FFFFFF" />
                        <Text style={styles.badgeText}>Deactivated</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Card Body */}
                <View style={styles.cardBody}>
                  <View style={styles.cardTitleRow}>
                    <Text
                      style={[styles.cafeName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {cafe.name}
                    </Text>
                    <Text
                      style={[styles.priceTag, { color: colors.primary }]}
                    >
                      {cafe.priceRange}
                    </Text>
                  </View>

                  <Text
                    style={[styles.locationText, { color: colors.muted }]}
                    numberOfLines={1}
                  >
                    <Ionicons name="location-sharp" size={13} color={colors.primary} />{" "}
                    {cafe.location}, {cafe.city}
                  </Text>

                  {/* Highlights Row */}
                  <View style={styles.metaRow}>
                    <View
                      style={[
                        styles.metaPill,
                        { backgroundColor: colors.chip },
                      ]}
                    >
                      <Ionicons
                        name="restaurant-outline"
                        size={13}
                        color={colors.primary}
                      />
                      <Text
                        style={[styles.metaPillText, { color: colors.text }]}
                      >
                        {cafe.category}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.metaPill,
                        { backgroundColor: colors.chip },
                      ]}
                    >
                      <Ionicons
                        name="people-outline"
                        size={13}
                        color={colors.primary}
                      />
                      <Text
                        style={[styles.metaPillText, { color: colors.text }]}
                      >
                        {cafe.seatingCapacity || 40} Seats
                      </Text>
                    </View>

                    {cafe.rating > 0 ? (
                      <View
                        style={[
                          styles.metaPill,
                          { backgroundColor: colors.chip },
                        ]}
                      >
                        <Ionicons name="star" size={13} color="#EAB308" />
                        <Text
                          style={[styles.metaPillText, { color: colors.text }]}
                        >
                          {cafe.rating.toFixed(1)} ({cafe.reviewCount})
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Quick Toggles Row */}
                  <View
                    style={[
                      styles.toggleControlSection,
                      {
                        backgroundColor: colors.cardAlt,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    {/* Toggle Open */}
                    <View style={styles.singleToggle}>
                      <View>
                        <Text
                          style={[styles.toggleLabel, { color: colors.text }]}
                        >
                          Open for Orders
                        </Text>
                        <Text
                          style={[
                            styles.toggleSubtext,
                            { color: colors.muted },
                          ]}
                        >
                          {isManualOpen ? "Open" : "Temporarily Closed"}
                        </Text>
                      </View>
                      <Switch
                        value={isManualOpen}
                        onValueChange={() => handleToggleOpen(cafe)}
                        disabled={isWorking}
                        trackColor={{
                          false: isDark ? "#3A3532" : "#E2DCD5",
                          true: colors.primary,
                        }}
                        thumbColor="#FFFFFF"
                      />
                    </View>

                    <View
                      style={[
                        styles.toggleDivider,
                        { backgroundColor: colors.border },
                      ]}
                    />

                    {/* Toggle Active */}
                    <View style={styles.singleToggle}>
                      <View>
                        <Text
                          style={[styles.toggleLabel, { color: colors.text }]}
                        >
                          Listed on App
                        </Text>
                        <Text
                          style={[
                            styles.toggleSubtext,
                            { color: colors.muted },
                          ]}
                        >
                          {isListingActive ? "Visible" : "Hidden"}
                        </Text>
                      </View>
                      <Switch
                        value={isListingActive}
                        onValueChange={() => handleToggleActive(cafe)}
                        disabled={isWorking}
                        trackColor={{
                          false: isDark ? "#3A3532" : "#E2DCD5",
                          true: colors.primary,
                        }}
                        thumbColor="#FFFFFF"
                      />
                    </View>
                  </View>

                  {/* Actions Row */}
                  <View style={styles.actionButtonsRow}>
                    {/* Edit Button */}
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: "/(owner)/edit-cafe",
                          params: { cafeId: cafe.id },
                        })
                      }
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor: colors.chip,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name="create-outline"
                        size={16}
                        color={colors.primary}
                      />
                      <Text
                        style={[
                          styles.actionBtnText,
                          { color: colors.primary },
                        ]}
                      >
                        Edit Details
                      </Text>
                    </Pressable>

                    {/* Customer Preview */}
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: "/cafe/[id]",
                          params: { id: cafe.id },
                        })
                      }
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor: colors.chip,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name="eye-outline"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.actionBtnText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Preview
                      </Text>
                    </Pressable>

                    {/* Delete */}
                    <Pressable
                      onPress={() => handleDelete(cafe)}
                      style={[
                        styles.iconActionBtn,
                        {
                          backgroundColor: isDark ? "#381816" : "#FFF5F5",
                          borderColor: isDark ? "#5C2622" : "#F6D7D5",
                        },
                      ]}
                    >
                      <Ionicons name="trash-outline" size={17} color="#D95445" />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 14,
    padding: 4,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addHeaderBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  cafeCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  imageContainer: {
    height: 160,
    width: "100%",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  topBadgeRow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  cardBody: {
    padding: 14,
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cafeName: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  priceTag: {
    fontSize: 14,
    fontWeight: "700",
  },
  locationText: {
    fontSize: 13,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  toggleControlSection: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  singleToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  toggleSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  toggleDivider: {
    height: 1,
    marginVertical: 10,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  iconActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
