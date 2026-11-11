import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../src/context/ThemeContext";
import {
  acceptBooking,
  getEffectiveBookingStatus,
  getOwnerBookings,
  holdBooking,
  rejectBooking,
  subscribeToOwnerBookings,
} from "../../src/services/firebase/bookings";
import { auth } from "../../src/services/firebase/config";
import { makePhoneCall } from "../../src/services/deepLinks/phone";
import type { Booking, BookingStatus } from "../../src/types/booking";

type FilterTab =
  | "all"
  | "pending"
  | "confirmed"
  | "on_hold"
  | "rejected"
  | "cancelled";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "on_hold", label: "On Hold" },
  { key: "rejected", label: "Rejected" },
  { key: "cancelled", label: "Cancelled" },
];

export default function OwnerBookingsScreen() {
  const { colors, isDark } = useTheme();
  const searchParams = useLocalSearchParams<{ initialTab?: string }>();

  const [activeTab, setActiveTab] = useState<FilterTab>(
    (searchParams.initialTab as FilterTab) || "pending",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal State for Note/Reason Input
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<"hold" | "reject" | null>(
    null,
  );
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const currentUser = auth.currentUser;

  useFocusEffect(
    useCallback(() => {
      if (!currentUser) {
        router.replace("/(auth)/login");
        return;
      }

      const unsubscribe = subscribeToOwnerBookings(
        currentUser.uid,
        (list) => {
          setBookings(list);
          setLoading(false);
          setRefreshing(false);
        },
        (err) => {
          console.error("subscribeToOwnerBookings error:", err);
          setLoading(false);
          setRefreshing(false);
        },
      );

      return () => {
        unsubscribe();
      };
    }, [currentUser]),
  );

  const onRefresh = async () => {
    if (!currentUser) return;
    setRefreshing(true);
    try {
      const data = await getOwnerBookings(currentUser.uid);
      setBookings(data);
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Filtered & Searched Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const status = getEffectiveBookingStatus(b);

      // Tab Filter
      if (activeTab === "pending" && status !== "pending") return false;
      if (activeTab === "confirmed" && status !== "confirmed") return false;
      if (activeTab === "on_hold" && status !== "on_hold") return false;
      if (activeTab === "rejected" && status !== "rejected") return false;
      if (activeTab === "cancelled" && status !== "cancelled") return false;

      // Text Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = b.userName.toLowerCase().includes(query);
        const matchesCode = b.bookingCode.toLowerCase().includes(query);
        const matchesCafe = b.cafeName.toLowerCase().includes(query);
        return matchesName || matchesCode || matchesCafe;
      }

      return true;
    });
  }, [bookings, activeTab, searchQuery]);

  // Tab count badges
  const counts = useMemo(() => {
    const res: Record<FilterTab, number> = {
      all: bookings.length,
      pending: 0,
      confirmed: 0,
      on_hold: 0,
      rejected: 0,
      cancelled: 0,
    };

    bookings.forEach((b) => {
      const s = getEffectiveBookingStatus(b);
      if (s === "pending") res.pending++;
      else if (s === "confirmed") res.confirmed++;
      else if (s === "on_hold") res.on_hold++;
      else if (s === "rejected") res.rejected++;
      else if (s === "cancelled") res.cancelled++;
    });

    return res;
  }, [bookings]);

  // Actions
  const handleAccept = (item: Booking) => {
    if (!currentUser) return;

    Alert.alert(
      "Confirm Reservation",
      `Accept reservation for ${item.userName} (${item.guests} guests) on ${item.date} at ${item.time}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept Table",
          onPress: async () => {
            setProcessingId(item.id);
            try {
              await acceptBooking(item.id, currentUser.uid);
              Alert.alert(
                "Booking Confirmed! 🎉",
                `Reservation ${item.bookingCode} confirmed. The customer has been notified.`,
              );
            } catch (err: any) {
              const msg =
                err?.message?.replace(/^[A-Z_]+:\s*/, "") ||
                "Failed to accept booking. Please check capacity.";
              Alert.alert("Unable to Accept", msg);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ],
    );
  };

  const openHoldModal = (item: Booking) => {
    setSelectedBooking(item);
    setModalAction("hold");
    setNoteInput("");
    setModalVisible(true);
  };

  const openRejectModal = (item: Booking) => {
    setSelectedBooking(item);
    setModalAction("reject");
    setNoteInput("");
    setModalVisible(true);
  };

  const submitModalAction = async () => {
    if (!currentUser || !selectedBooking || !modalAction) return;

    const bId = selectedBooking.id;
    const action = modalAction;
    const note = noteInput.trim();

    setModalVisible(false);
    setProcessingId(bId);

    try {
      if (action === "hold") {
        await holdBooking(bId, currentUser.uid, note);
        Alert.alert(
          "Placed On Hold ⏳",
          `Reservation ${selectedBooking.bookingCode} is now on hold. The customer has been notified.`,
        );
      } else if (action === "reject") {
        await rejectBooking(bId, currentUser.uid, note);
        Alert.alert(
          "Request Declined",
          `Reservation ${selectedBooking.bookingCode} declined. The customer has been informed.`,
        );
      }
    } catch (err: any) {
      const msg =
        err?.message?.replace(/^[A-Z_]+:\s*/, "") ||
        "Could not update reservation. Please try again.";
      Alert.alert("Action Failed", msg);
    } finally {
      setProcessingId(null);
      setSelectedBooking(null);
      setModalAction(null);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending Review",
          bgColor: isDark ? "#382C18" : "#FEF3D6",
          textColor: isDark ? "#F8C162" : "#B45309",
          dotColor: "#D97706",
        };
      case "on_hold":
        return {
          label: "On Hold",
          bgColor: isDark ? "#281E38" : "#F4EEFD",
          textColor: isDark ? "#C084FC" : "#7C3AED",
          dotColor: "#A855F7",
        };
      case "confirmed":
        return {
          label: "Confirmed",
          bgColor: isDark ? "#17341E" : "#EBF7EE",
          textColor: isDark ? "#4ADE80" : "#2E7A3A",
          dotColor: "#3FB950",
        };
      case "rejected":
        return {
          label: "Rejected",
          bgColor: isDark ? "#381816" : "#FDEAE8",
          textColor: isDark ? "#F87171" : "#D95445",
          dotColor: "#E0524D",
        };
      case "completed":
        return {
          label: "Completed",
          bgColor: isDark ? "#2A1B3D" : "#F3EEFA",
          textColor: isDark ? "#C084FC" : "#654388",
          dotColor: "#8E5EC2",
        };
      case "cancelled":
      default:
        return {
          label: "Cancelled by Guest",
          bgColor: isDark ? "#381816" : "#FDEAE8",
          textColor: isDark ? "#F87171" : "#D95445",
          dotColor: "#E0524D",
        };
    }
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const effectiveStatus = getEffectiveBookingStatus(item);
    const badge = getStatusBadge(effectiveStatus);
    const isActionable =
      effectiveStatus === "pending" || effectiveStatus === "on_hold";
    const isWorking = processingId === item.id;

    return (
      <View
        style={[
          styles.bookingCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Card Header Row */}
        <View style={styles.cardHeaderRow}>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: badge.bgColor },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: badge.dotColor }]}
            />
            <Text
              style={[styles.statusPillText, { color: badge.textColor }]}
            >
              {badge.label}
            </Text>
          </View>

          <View
            style={[styles.refBadge, { backgroundColor: colors.chip }]}
          >
            <Text
              style={[styles.refBadgeText, { color: colors.primary }]}
            >
              {item.bookingCode}
            </Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.customerRow}>
          <View style={styles.customerInfo}>
            <Text
              style={[styles.customerName, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.userName}
            </Text>
            <Text
              style={[styles.cafeNameText, { color: colors.primary }]}
              numberOfLines={1}
            >
              {item.cafeName}
            </Text>
          </View>

          {item.userPhone ? (
            <Pressable
              onPress={() => makePhoneCall(item.userPhone || "")}
              style={[
                styles.callButton,
                { backgroundColor: colors.chip, borderColor: colors.border },
              ]}
              hitSlop={6}
            >
              <Ionicons name="call" size={15} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>

        {/* Reservation Details Grid */}
        <View
          style={[
            styles.detailsGrid,
            { backgroundColor: colors.cardAlt, borderColor: colors.border },
          ]}
        >
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.muted} />
            <Text
              style={[styles.detailText, { color: colors.text }]}
            >
              {item.date}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={colors.muted} />
            <Text
              style={[styles.detailText, { color: colors.text }]}
            >
              {item.time}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={14} color={colors.muted} />
            <Text
              style={[styles.detailText, { color: colors.text }]}
            >
              {item.guests} Guests
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="cube-outline" size={14} color={colors.muted} />
            <Text
              style={[styles.detailText, { color: colors.text }]}
            >
              {item.seatingPreference || "Standard"}
            </Text>
          </View>
        </View>

        {/* Special Requests */}
        {item.specialRequests ? (
          <View style={styles.specialRequestsRow}>
            <Ionicons
              name="reader-outline"
              size={13}
              color={colors.muted}
            />
            <Text
              style={[styles.specialRequestsText, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              <Text style={{ fontWeight: "700" }}>Note: </Text>
              {item.specialRequests}
            </Text>
          </View>
        ) : null}

        {/* Owner Note / Reason Banner */}
        {item.ownerNote ? (
          <View
            style={[
              styles.ownerNoteBanner,
              {
                backgroundColor: isDark ? "#281E38" : "#F4EEFD",
                borderColor: isDark ? "#4A3568" : "#E2D3FD",
              },
            ]}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={13}
              color={isDark ? "#C084FC" : "#7C3AED"}
            />
            <Text
              style={[
                styles.ownerNoteText,
                { color: isDark ? "#E9D5FF" : "#581C87" },
              ]}
            >
              <Text style={{ fontWeight: "700" }}>Your Note: </Text>
              {item.ownerNote}
            </Text>
          </View>
        ) : null}

        {/* Cancellation Reason if cancelled */}
        {item.cancellationReason && effectiveStatus === "cancelled" ? (
          <View
            style={[
              styles.ownerNoteBanner,
              {
                backgroundColor: isDark ? "#381816" : "#FFF5F5",
                borderColor: isDark ? "#5C2622" : "#F6D7D5",
              },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={13} color="#D95445" />
            <Text style={[styles.ownerNoteText, { color: "#D95445" }]}>
              <Text style={{ fontWeight: "700" }}>Cancellation: </Text>
              {item.cancellationReason}
            </Text>
          </View>
        ) : null}

        {/* ACTION BUTTONS (For Pending or On Hold) */}
        {isActionable && (
          <View
            style={[
              styles.actionsRow,
              { borderTopColor: colors.border },
            ]}
          >
            {/* Reject Action */}
            <Pressable
              onPress={() => openRejectModal(item)}
              disabled={isWorking}
              style={[
                styles.actionBtn,
                styles.rejectBtn,
                {
                  backgroundColor: isDark ? "#381816" : "#FFF5F5",
                  borderColor: isDark ? "#5C2622" : "#F6D7D5",
                  opacity: isWorking ? 0.5 : 1,
                },
              ]}
            >
              <Ionicons name="close" size={15} color="#D95445" />
              <Text style={styles.rejectBtnText}>Reject</Text>
            </Pressable>

            {/* Hold Action */}
            <Pressable
              onPress={() => openHoldModal(item)}
              disabled={isWorking}
              style={[
                styles.actionBtn,
                styles.holdBtn,
                {
                  backgroundColor: isDark ? "#281E38" : "#F4EEFD",
                  borderColor: isDark ? "#4A3568" : "#E2D3FD",
                  opacity: isWorking ? 0.5 : 1,
                },
              ]}
            >
              <Ionicons
                name="hourglass-outline"
                size={14}
                color={isDark ? "#C084FC" : "#7C3AED"}
              />
              <Text
                style={[
                  styles.holdBtnText,
                  { color: isDark ? "#C084FC" : "#7C3AED" },
                ]}
              >
                {effectiveStatus === "on_hold" ? "Update Note" : "Hold"}
              </Text>
            </Pressable>

            {/* Accept Action */}
            <Pressable
              onPress={() => handleAccept(item)}
              disabled={isWorking}
              style={[
                styles.actionBtn,
                styles.acceptBtn,
                { opacity: isWorking ? 0.5 : 1 },
              ]}
            >
              {isWorking ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </View>
    );
  };

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
            Reservation Requests
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
            Manage incoming table bookings
          </Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View
        style={[
          styles.searchBarContainer,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.searchInputWrapper,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
            },
          ]}
        >
          <Ionicons name="search" size={17} color={colors.muted} />
          <TextInput
            placeholder="Search by customer name, ref code, or café..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={6}>
              <Ionicons name="close-circle" size={16} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Tabs Scroll */}
      <View
        style={[
          styles.tabsRowWrapper,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_TABS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.tabsContainer}
          renderItem={({ item }) => {
            const isSelected = activeTab === item.key;
            const count = counts[item.key];

            return (
              <Pressable
                onPress={() => setActiveTab(item.key)}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.chip,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabChipLabel,
                    { color: isSelected ? "#FFFFFF" : colors.text },
                  ]}
                >
                  {item.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.tabCountBadge,
                      {
                        backgroundColor: isSelected
                          ? "rgba(255,255,255,0.25)"
                          : colors.cardAlt,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabCountText,
                        { color: isSelected ? "#FFFFFF" : colors.primary },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      </View>

      {/* Bookings List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Syncing reservation requests...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconCircle,
                  { backgroundColor: colors.chip },
                ]}
              >
                <Ionicons
                  name={
                    activeTab === "pending"
                      ? "time-outline"
                      : activeTab === "confirmed"
                      ? "checkmark-circle-outline"
                      : activeTab === "on_hold"
                      ? "hourglass-outline"
                      : "calendar-outline"
                  }
                  size={42}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {activeTab === "pending"
                  ? "No Pending Requests"
                  : activeTab === "confirmed"
                  ? "No Confirmed Reservations"
                  : activeTab === "on_hold"
                  ? "No On-Hold Reservations"
                  : activeTab === "rejected"
                  ? "No Rejected Reservations"
                  : activeTab === "cancelled"
                  ? "No Cancelled Reservations"
                  : "No Reservations Found"}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                {activeTab === "pending"
                  ? "All customer booking requests have been answered. New requests will appear here in real time."
                  : activeTab === "confirmed"
                  ? "Accepted customer reservations will appear here."
                  : "Reservations matching this filter will appear here."}
              </Text>
            </View>
          }
        />
      )}

      {/* Modal for Inputting Hold or Rejection Note */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Ionicons
                name={
                  modalAction === "hold"
                    ? "hourglass-outline"
                    : "close-circle-outline"
                }
                size={24}
                color={modalAction === "hold" ? "#A855F7" : "#D95445"}
              />
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {modalAction === "hold"
                  ? "Place Request On Hold"
                  : "Decline Reservation"}
              </Text>
            </View>

            <Text style={[styles.modalHelper, { color: colors.muted }]}>
              {modalAction === "hold"
                ? "Provide an explanation for the guest (e.g. reviewing capacity or expected table turnover). You can accept or decline this later."
                : "Please provide a reason so the guest understands why their request could not be fulfilled."}
            </Text>

            <TextInput
              style={[
                styles.modalTextInput,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              placeholder={
                modalAction === "hold"
                  ? "e.g. Verifying 5:30 PM table turnover, please hold on..."
                  : "e.g. Fully booked for private gathering, apologies..."
              }
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              value={noteInput}
              onChangeText={setNoteInput}
            />

            <View style={styles.modalButtonsRow}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={[
                  styles.modalCancelBtn,
                  {
                    backgroundColor: colors.chip,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modalCancelBtnText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={submitModalAction}
                style={[
                  styles.modalConfirmBtn,
                  {
                    backgroundColor:
                      modalAction === "hold" ? "#8B5CF6" : "#D95445",
                  },
                ]}
              >
                <Text style={styles.modalConfirmBtnText}>
                  {modalAction === "hold"
                    ? "Confirm On Hold"
                    : "Decline Request"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
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
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  tabsRowWrapper: {
    borderBottomWidth: 1,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tabChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabChipLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  tabCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: "800",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  bookingCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 15,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  refBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  refBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  customerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
    marginRight: 10,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "700",
  },
  cafeNameText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    width: "46%",
  },
  detailText: {
    fontSize: 12,
    fontWeight: "600",
  },
  specialRequestsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  specialRequestsText: {
    fontSize: 12,
    fontStyle: "italic",
    flex: 1,
  },
  ownerNoteBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 9,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  ownerNoteText: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 38,
    borderRadius: 10,
    gap: 4,
  },
  rejectBtn: {
    borderWidth: 1,
  },
  rejectBtnText: {
    color: "#D95445",
    fontSize: 12,
    fontWeight: "700",
  },
  holdBtn: {
    borderWidth: 1,
  },
  holdBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  acceptBtn: {
    backgroundColor: "#16A34A",
  },
  acceptBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  modalHelper: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  modalTextInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    height: 80,
    textAlignVertical: "top",
    marginBottom: 18,
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  modalConfirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  modalConfirmBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
