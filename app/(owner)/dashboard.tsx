import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../src/context/ThemeContext";
import { logout } from "../../src/services/firebase/auth";
import {
  getEffectiveBookingStatus,
  getOwnerBookings,
  subscribeToOwnerBookings,
} from "../../src/services/firebase/bookings";
import { getOwnerCafes, isCafeOpenNow } from "../../src/services/firebase/cafes";
import { auth } from "../../src/services/firebase/config";
import { getUserProfile } from "../../src/services/firebase/users";
import type { Booking } from "../../src/types/booking";
import type { Cafe } from "../../src/types/cafe";
import type { UserProfile } from "../../src/types/profile";

export default function OwnerDashboardScreen() {
  const { colors, isDark } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentUser = auth.currentUser;

  const loadData = useCallback(async () => {
    if (!currentUser) {
      router.replace("/(auth)/login");
      return;
    }

    try {
      const [profileData, cafesData, bookingsData] = await Promise.all([
        getUserProfile(currentUser.uid),
        getOwnerCafes(currentUser.uid),
        getOwnerBookings(currentUser.uid),
      ]);
      setProfile(profileData);
      setCafes(cafesData);
      setBookings(bookingsData);
    } catch (err) {
      console.error("OwnerDashboard load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  useFocusEffect(
    useCallback(() => {
      if (!currentUser) {
        router.replace("/(auth)/login");
        return;
      }

      loadData();

      // Real-time listener for live booking metrics
      const unsubscribeBookings = subscribeToOwnerBookings(
        currentUser.uid,
        (updatedBookings) => {
          setBookings(updatedBookings);
        },
      );

      return () => {
        unsubscribeBookings();
      };
    }, [currentUser, loadData]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your Café Owner portal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/(auth)/login");
            } catch {
              Alert.alert("Error", "Could not log out. Please try again.");
            }
          },
        },
      ],
    );
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    let pendingCount = 0;
    let confirmedCount = 0;
    let onHoldCount = 0;
    let todayGuests = 0;

    bookings.forEach((b) => {
      const status = getEffectiveBookingStatus(b);
      if (status === "pending") pendingCount++;
      else if (status === "confirmed") confirmedCount++;
      else if (status === "on_hold") onHoldCount++;

      if (
        (status === "confirmed" || status === "completed") &&
        b.date.includes(today)
      ) {
        todayGuests += Number(b.guests || b.guestCount) || 0;
      }
    });

    return {
      listedCafesCount: cafes.length,
      pendingCount,
      confirmedCount,
      onHoldCount,
      todayGuests,
    };
  }, [cafes, bookings]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>
          Loading partner dashboard...
        </Text>
      </View>
    );
  }

  const ownerName =
    profile?.displayName || currentUser?.displayName || "Café Owner";
  const businessName = profile?.businessName || "Specialty Café Partner";
  const email = profile?.email || currentUser?.email || "";
  const phone = profile?.phoneNumber || "No phone added";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Top Header Bar */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.brandRow}>
          <View
            style={[
              styles.portalBadge,
              {
                backgroundColor: isDark ? "#281E38" : "#F4EEFD",
                borderColor: isDark ? "#4A3568" : "#E2D3FD",
              },
            ]}
          >
            <Ionicons
              name="business"
              size={13}
              color={isDark ? "#C084FC" : "#7C3AED"}
            />
            <Text
              style={[
                styles.portalBadgeText,
                { color: isDark ? "#C084FC" : "#7C3AED" },
              ]}
            >
              Owner Portal
            </Text>
          </View>

          <Pressable
            onPress={handleLogout}
            style={[
              styles.logoutButton,
              {
                backgroundColor: isDark ? "#381816" : "#FFF5F5",
                borderColor: isDark ? "#5C2622" : "#F6D7D5",
              },
            ]}
          >
            <Ionicons name="log-out-outline" size={16} color="#D95445" />
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </View>

        <View style={styles.ownerInfo}>
          <Text style={[styles.greeting, { color: colors.muted }]}>
            Welcome back 👋
          </Text>
          <Text
            style={[styles.ownerName, { color: colors.text }]}
            numberOfLines={1}
          >
            {ownerName}
          </Text>
          <Text style={[styles.businessName, { color: colors.primary }]}>
            {businessName}
          </Text>
        </View>
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
        {/* Quick Actions Bar (3 Action Buttons) */}
        <View style={styles.quickActionsContainer}>
          {/* Action 1: Bookings Hub */}
          <Pressable
            onPress={() => router.push("/(owner)/bookings")}
            style={[
              styles.quickActionBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.quickActionIconCircle,
                {
                  backgroundColor:
                    metrics.pendingCount > 0
                      ? (isDark ? "#382C18" : "#FEF3D6")
                      : colors.chip,
                },
              ]}
            >
              <Ionicons
                name="calendar"
                size={18}
                color={
                  metrics.pendingCount > 0
                    ? (isDark ? "#F8C162" : "#B45309")
                    : colors.primary
                }
              />
            </View>
            <View style={styles.quickActionLabelRow}>
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>
                Bookings
              </Text>
              {metrics.pendingCount > 0 && (
                <View style={styles.pendingBadgeCircle}>
                  <Text style={styles.pendingBadgeText}>
                    {metrics.pendingCount}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[styles.quickActionSub, { color: colors.textSecondary }]}
            >
              Manage & Review
            </Text>
          </Pressable>

          {/* Action 2: My Cafes */}
          <Pressable
            onPress={() => router.push("/(owner)/my-cafes")}
            style={[
              styles.quickActionBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.quickActionIconCircle,
                { backgroundColor: colors.chip },
              ]}
            >
              <Ionicons name="storefront" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.text }]}>
              My Cafés
            </Text>
            <Text
              style={[styles.quickActionSub, { color: colors.textSecondary }]}
            >
              {metrics.listedCafesCount} listed
            </Text>
          </Pressable>

          {/* Action 3: Add Cafe */}
          <Pressable
            onPress={() => router.push("/(owner)/add-cafe")}
            style={[
              styles.quickActionBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.quickActionIconCircle,
                { backgroundColor: isDark ? "#17341E" : "#EBF7EE" },
              ]}
            >
              <Ionicons
                name="add-circle"
                size={18}
                color={isDark ? "#4ADE80" : "#2E7A3A"}
              />
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.text }]}>
              Add Café
            </Text>
            <Text
              style={[styles.quickActionSub, { color: colors.textSecondary }]}
            >
              New Listing
            </Text>
          </Pressable>
        </View>

        {/* Live Overview Stats */}
        <Text style={[styles.sectionHeading, { color: colors.text }]}>
          Live Overview
        </Text>

        <View style={styles.statsGrid}>
          {/* Card 1: My Cafes */}
          <Pressable
            onPress={() => router.push("/(owner)/my-cafes")}
            style={[
              styles.statCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.statIconCircle,
                { backgroundColor: colors.chip },
              ]}
            >
              <Ionicons name="storefront" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {metrics.listedCafesCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Listed Cafés
            </Text>
          </Pressable>

          {/* Card 2: Pending Bookings */}
          <Pressable
            onPress={() => router.push("/(owner)/bookings")}
            style={[
              styles.statCard,
              {
                backgroundColor: colors.surface,
                borderColor:
                  metrics.pendingCount > 0
                    ? (isDark ? "#B45309" : "#F59E0B")
                    : colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.statIconCircle,
                { backgroundColor: isDark ? "#382C18" : "#FEF3D6" },
              ]}
            >
              <Ionicons
                name="time"
                size={20}
                color={isDark ? "#F8C162" : "#B45309"}
              />
            </View>
            <Text
              style={[
                styles.statValue,
                {
                  color:
                    metrics.pendingCount > 0
                      ? (isDark ? "#F8C162" : "#B45309")
                      : colors.text,
                },
              ]}
            >
              {metrics.pendingCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Pending Requests
            </Text>
          </Pressable>

          {/* Card 3: Confirmed */}
          <Pressable
            onPress={() => router.push("/(owner)/bookings")}
            style={[
              styles.statCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.statIconCircle,
                { backgroundColor: isDark ? "#17341E" : "#EBF7EE" },
              ]}
            >
              <Ionicons
                name="checkmark-done-circle"
                size={20}
                color={isDark ? "#4ADE80" : "#2E7A3A"}
              />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {metrics.confirmedCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Confirmed Tables
            </Text>
          </Pressable>

          {/* Card 4: Today's Guests */}
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.statIconCircle,
                { backgroundColor: isDark ? "#281E38" : "#F4EEFD" },
              ]}
            >
              <Ionicons
                name="people"
                size={20}
                color={isDark ? "#C084FC" : "#7C3AED"}
              />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {metrics.todayGuests}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {"Today's Guests"}
            </Text>
          </View>
        </View>

        {/* Recent Booking Requests Section */}
        <View style={styles.sectionHeaderBetween}>
          <Text style={[styles.sectionHeading, { color: colors.text, marginBottom: 0 }]}>
            Recent Booking Requests
          </Text>
          {bookings.length > 0 && (
            <Pressable
              onPress={() => router.push("/(owner)/bookings")}
              hitSlop={8}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                View All ({bookings.length})
              </Text>
            </Pressable>
          )}
        </View>

        {bookings.length === 0 ? (
          <View
            style={[
              styles.emptySectionCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="calendar-outline" size={32} color={colors.primary} />
            <Text style={[styles.emptySectionTitle, { color: colors.text }]}>
              No Bookings Received Yet
            </Text>
            <Text style={[styles.emptySectionSubtitle, { color: colors.muted }]}>
              When customers book tables at your cafés, incoming reservation requests will appear here in real time.
            </Text>
          </View>
        ) : (
          <View style={styles.recentBookingsList}>
            {bookings.slice(0, 3).map((item) => {
              const status = getEffectiveBookingStatus(item);
              const isPending = status === "pending";

              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push("/(owner)/bookings")}
                  style={[
                    styles.bookingMiniCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isPending
                        ? (isDark ? "#B45309" : "#F59E0B")
                        : colors.border,
                    },
                  ]}
                >
                  <View style={styles.bookingMiniLeft}>
                    <Text
                      style={[styles.bookingMiniName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {item.userName}
                    </Text>
                    <Text
                      style={[styles.bookingMiniSub, { color: colors.textSecondary }]}
                    >
                      {item.date} • {item.time} ({item.guests} guests)
                    </Text>
                    <Text
                      style={[styles.bookingMiniCafe, { color: colors.primary }]}
                      numberOfLines={1}
                    >
                      {item.cafeName}
                    </Text>
                  </View>

                  <View style={styles.bookingMiniRight}>
                    <View
                      style={[
                        styles.statusMiniBadge,
                        {
                          backgroundColor:
                            status === "pending"
                              ? (isDark ? "#382C18" : "#FEF3D6")
                              : status === "confirmed"
                              ? (isDark ? "#17341E" : "#EBF7EE")
                              : status === "on_hold"
                              ? (isDark ? "#281E38" : "#F4EEFD")
                              : (isDark ? "#381816" : "#FFF5F5"),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusMiniBadgeText,
                          {
                            color:
                              status === "pending"
                                ? (isDark ? "#F8C162" : "#B45309")
                                : status === "confirmed"
                                ? (isDark ? "#4ADE80" : "#2E7A3A")
                                : status === "on_hold"
                                ? (isDark ? "#C084FC" : "#7C3AED")
                                : "#D95445",
                          },
                        ]}
                      >
                        {status}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.muted}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* My Cafés Showcase Section */}
        <View style={styles.sectionHeaderBetween}>
          <Text style={[styles.sectionHeading, { color: colors.text, marginBottom: 0 }]}>
            My Café Listings
          </Text>
          {cafes.length > 0 && (
            <Pressable
              onPress={() => router.push("/(owner)/my-cafes")}
              hitSlop={8}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                View All ({cafes.length})
              </Text>
            </Pressable>
          )}
        </View>

        {cafes.length === 0 ? (
          <View
            style={[
              styles.emptySectionCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="storefront-outline" size={32} color={colors.primary} />
            <Text style={[styles.emptySectionTitle, { color: colors.text }]}>
              No Cafés Added Yet
            </Text>
            <Text style={[styles.emptySectionSubtitle, { color: colors.muted }]}>
              Ready to attract customers? Add your first venue with photos, menus, seating capacity, and weekly hours.
            </Text>
            <Pressable
              onPress={() => router.push("/(owner)/add-cafe")}
              style={[styles.addCafeCta, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="add-circle" size={18} color="#FFFFFF" />
              <Text style={styles.addCafeCtaText}>Add Your First Café</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.cafesList}>
            {cafes.slice(0, 3).map((cafe) => {
              const isOpenNow = isCafeOpenNow(cafe.openingHours, cafe.isOpen);
              const isManualOpen = cafe.isOpen !== false;

              return (
                <Pressable
                  key={cafe.id}
                  onPress={() =>
                    router.push({
                      pathname: "/(owner)/edit-cafe",
                      params: { cafeId: cafe.id },
                    })
                  }
                  style={[
                    styles.cafePreviewCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Image
                    source={{
                      uri:
                        cafe.image ||
                        (cafe.images && cafe.images[0]) ||
                        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
                    }}
                    style={styles.cafeThumb}
                  />

                  <View style={styles.cafePreviewInfo}>
                    <Text
                      style={[styles.cafePreviewName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {cafe.name}
                    </Text>
                    <Text
                      style={[
                        styles.cafePreviewLoc,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {cafe.location}, {cafe.city}
                    </Text>

                    <View style={styles.cafePreviewBadgeRow}>
                      <View
                        style={[
                          styles.statusDotBadge,
                          {
                            backgroundColor: !isManualOpen
                              ? (isDark ? "#381816" : "#FFF5F5")
                              : isOpenNow
                              ? (isDark ? "#17341E" : "#EBF7EE")
                              : (isDark ? "#2A2522" : "#F4EFEA"),
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusDotText,
                            {
                              color: !isManualOpen
                                ? "#D95445"
                                : isOpenNow
                                ? (isDark ? "#4ADE80" : "#2E7A3A")
                                : colors.muted,
                            },
                          ]}
                        >
                          {!isManualOpen ? "Closed" : isOpenNow ? "Open" : "Closed"}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.capacityText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {cafe.seatingCapacity || 40} seats
                      </Text>
                    </View>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.muted}
                  />
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Business Profile Details */}
        <Text style={[styles.sectionHeading, { color: colors.text }]}>
          Partner Account Details
        </Text>

        <View
          style={[
            styles.detailsCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Ionicons name="person-outline" size={16} color={colors.muted} />
              <Text style={[styles.detailLabel, { color: colors.muted }]}>
                Owner Name
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {ownerName}
            </Text>
          </View>

          <View
            style={[styles.detailDivider, { backgroundColor: colors.border }]}
          />

          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Ionicons name="business-outline" size={16} color={colors.muted} />
              <Text style={[styles.detailLabel, { color: colors.muted }]}>
                Café / Business
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {businessName}
            </Text>
          </View>

          <View
            style={[styles.detailDivider, { backgroundColor: colors.border }]}
          />

          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Ionicons name="mail-outline" size={16} color={colors.muted} />
              <Text style={[styles.detailLabel, { color: colors.muted }]}>
                Business Email
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {email}
            </Text>
          </View>

          <View
            style={[styles.detailDivider, { backgroundColor: colors.border }]}
          />

          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Ionicons name="call-outline" size={16} color={colors.muted} />
              <Text style={[styles.detailLabel, { color: colors.muted }]}>
                Contact Phone
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {phone}
            </Text>
          </View>

          <View
            style={[styles.detailDivider, { backgroundColor: colors.border }]}
          />

          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Ionicons name="key-outline" size={16} color={colors.muted} />
              <Text style={[styles.detailLabel, { color: colors.muted }]}>
                Account Role
              </Text>
            </View>
            <View
              style={[
                styles.rolePill,
                { backgroundColor: isDark ? "#281E38" : "#F4EEFD" },
              ]}
            >
              <Text
                style={[
                  styles.rolePillText,
                  { color: isDark ? "#C084FC" : "#7C3AED" },
                ]}
              >
                cafe_owner (Protected)
              </Text>
            </View>
          </View>
        </View>

        {/* Customer View Switcher */}
        <Pressable
          onPress={() => router.push("/(tabs)")}
          style={[
            styles.customerAppRow,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.customerAppLeft}>
            <View
              style={[
                styles.customerAppIcon,
                { backgroundColor: colors.chip },
              ]}
            >
              <Ionicons
                name="compass-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.customerAppTitle, { color: colors.text }]}>
                Switch to Customer View
              </Text>
              <Text
                style={[
                  styles.customerAppSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Browse customer discovery, explore cafes & preview listings
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
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
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
  },
  headerBar: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  portalBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
  },
  portalBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  logoutText: {
    color: "#D95445",
    fontSize: 12,
    fontWeight: "700",
  },
  ownerInfo: {
    marginTop: 4,
  },
  greeting: {
    fontSize: 13,
    fontWeight: "500",
  },
  ownerName: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginTop: 2,
  },
  businessName: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  quickActionsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  quickActionBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  quickActionIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  pendingBadgeCircle: {
    backgroundColor: "#D97706",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  pendingBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  quickActionSub: {
    fontSize: 11,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  sectionHeaderBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: "48.5%",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  statIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  emptySectionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 20,
  },
  emptySectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 4,
  },
  emptySectionSubtitle: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 17,
    marginBottom: 12,
  },
  recentBookingsList: {
    gap: 10,
    marginBottom: 20,
  },
  bookingMiniCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  bookingMiniLeft: {
    flex: 1,
    marginRight: 8,
  },
  bookingMiniName: {
    fontSize: 14,
    fontWeight: "700",
  },
  bookingMiniSub: {
    fontSize: 12,
    marginTop: 2,
  },
  bookingMiniCafe: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  bookingMiniRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusMiniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusMiniBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  addCafeCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addCafeCtaText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  cafesList: {
    gap: 10,
    marginBottom: 20,
  },
  cafePreviewCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  cafeThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  cafePreviewInfo: {
    flex: 1,
  },
  cafePreviewName: {
    fontSize: 15,
    fontWeight: "700",
  },
  cafePreviewLoc: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 4,
  },
  cafePreviewBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDotBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusDotText: {
    fontSize: 10,
    fontWeight: "700",
  },
  capacityText: {
    fontSize: 11,
  },
  detailsCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    maxWidth: "55%",
    textAlign: "right",
  },
  detailDivider: {
    height: 1,
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: "800",
  },
  customerAppRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  customerAppLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  customerAppIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  customerAppTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  customerAppSubtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
});
