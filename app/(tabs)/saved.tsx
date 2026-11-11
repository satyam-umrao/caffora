import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../src/context/ThemeContext";
import { auth, db } from "../../src/services/firebase/config";

type Cafe = {
  id: string;
  name: string;
  location: string;
  city: string;
  category: string;
  description: string;
  image?: string;
  rating: number;
  priceRange: string;
  reviewCount: number;
};

type SavedCafe = Cafe & {
  favoriteId: string;
};

export default function SavedScreen() {
  const { colors } = useTheme();
  const [cafes, setCafes] = useState<SavedCafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSavedCafes = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setCafes([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const favoritesRef = collection(db, "users", currentUser.uid, "favorites");
      const favoriteSnapshot = await getDocs(favoritesRef);

      const cafePromises = favoriteSnapshot.docs.map(async (favoriteDoc) => {
        const favoriteData = favoriteDoc.data();
        const cafeId = favoriteData.cafeId || favoriteDoc.id;

        const cafeRef = doc(db, "cafes", cafeId);
        const cafeSnapshot = await getDoc(cafeRef);

        if (cafeSnapshot.exists()) {
          const cafeData = cafeSnapshot.data() as Omit<Cafe, "id">;
          return {
            id: cafeSnapshot.id,
            favoriteId: favoriteDoc.id,
            ...cafeData,
          } as SavedCafe;
        }

        return null;
      });

      const loadedCafes = await Promise.all(cafePromises);
      const validCafes = loadedCafes.filter(
        (cafe): cafe is SavedCafe => cafe !== null,
      );

      setCafes(validCafes);
    } catch (error) {
      console.error("Error loading saved cafes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSavedCafes();
    }, [loadSavedCafes]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadSavedCafes();
  };

  const removeCafe = async (cafe: SavedCafe) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      setCafes((currentCafes) =>
        currentCafes.filter((item) => item.favoriteId !== cafe.favoriteId),
      );

      await deleteDoc(
        doc(db, "users", currentUser.uid, "favorites", cafe.favoriteId),
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Couldn't remove cafe", "Please try again.");
    }
  };

  const confirmRemove = (cafe: SavedCafe) => {
    Alert.alert(
      "Remove saved cafe?",
      `Remove ${cafe.name} from your saved cafes?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeCafe(cafe),
        },
      ],
    );
  };

  const currentUser = auth.currentUser;

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      {/* HEADER */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 0.7,
                color: colors.textSecondary,
              }}
            >
              Your collection
            </Text>

            <Text
              style={{
                marginTop: 4,
                fontSize: 29,
                fontWeight: "900",
                letterSpacing: -0.7,
                color: colors.text,
              }}
            >
              Saved Cafes
            </Text>
          </View>

          <View
            style={{
              height: 44,
              width: 44,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 15,
              backgroundColor: colors.primarySoft,
            }}
          >
            <Ionicons name="heart" size={22} color={colors.primary} />
          </View>
        </View>

        <Text
          style={{
            marginTop: 8,
            fontSize: 14,
            color: colors.textSecondary,
          }}
        >
          Your favorite coffee spots in one place.
        </Text>
      </View>

      <View style={{ height: 1, backgroundColor: colors.border }} />

      {/* CONTENT */}
      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />

          <Text
            style={{
              marginTop: 12,
              fontSize: 14,
              color: colors.textSecondary,
            }}
          >
            Loading saved cafes...
          </Text>
        </View>
      ) : !currentUser ? (
        <LoginRequired />
      ) : cafes.length === 0 ? (
        <EmptySaved />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 120,
            paddingTop: 20,
          }}
        >
          <View
            style={{
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: colors.text,
              }}
            >
              {cafes.length} {cafes.length === 1 ? "cafe" : "cafes"} saved
            </Text>

            <Ionicons name="heart" size={17} color={colors.danger} />
          </View>

          {cafes.map((cafe) => (
            <SavedCafeCard
              key={cafe.favoriteId}
              cafe={cafe}
              onPress={() =>
                router.push({
                  pathname: "/cafe/[id]",
                  params: {
                    id: cafe.id,
                  },
                })
              }
              onRemove={() => confirmRemove(cafe)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function formatPriceDisplay(priceRange?: string) {
  if (!priceRange) return "100rs~200rs";
  if (priceRange === "₹") return "100rs~200rs";
  if (priceRange === "₹₹") return "200rs~450rs";
  if (priceRange === "₹₹₹") return "450rs~800rs";
  if (priceRange === "₹₹₹₹") return "800rs~1500rs";
  if (priceRange.includes("~") || priceRange.includes("rs") || priceRange.includes("₹")) return priceRange;
  return `${priceRange}`;
}

function getCafeReviewsCount(cafe: any) {
  if (typeof cafe.reviewCount === "number" && cafe.reviewCount > 0) return cafe.reviewCount;
  if (typeof cafe.reviewsCount === "number" && cafe.reviewsCount > 0) return cafe.reviewsCount;
  const str = cafe.id || cafe.name || "cafe";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 700) + 120;
}

/* ========================================================= */
/* SAVED CAFE CARD */
/* ========================================================= */

function SavedCafeCard({
  cafe,
  onPress,
  onRemove,
}: {
  cafe: SavedCafe;
  onPress: () => void;
  onRemove: () => void;
}) {
  const { colors } = useTheme();
  const reviewCount = getCafeReviewsCount(cafe);
  const priceDisplay = formatPriceDisplay(cafe.priceRange);

  return (
    <Pressable
      onPress={onPress}
      style={{
        marginBottom: 14,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 22,
        backgroundColor: colors.surface,
        padding: 12,
      }}
    >
      {/* LEFT IMAGE WITH HEART & TAG */}
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 18,
          overflow: "hidden",
          backgroundColor: colors.surfaceMuted,
          position: "relative",
        }}
      >
        <Image
          source={{
            uri:
              cafe.image ||
              "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
          }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />

        {/* TOP-RIGHT HEART */}
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          hitSlop={8}
          style={{
            position: "absolute",
            top: 7,
            right: 7,
            height: 28,
            width: 28,
            borderRadius: 14,
            backgroundColor: "rgba(0,0,0,0.28)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="heart"
            size={17}
            color="#FF3B30"
          />
        </Pressable>

        {/* BOTTOM TAG SCRIM */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 44,
            justifyContent: "flex-end",
            paddingHorizontal: 8,
            paddingBottom: 6,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: "#FFFFFF",
              fontSize: 11,
              fontWeight: "900",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            SAVED
          </Text>
        </LinearGradient>
      </View>

      {/* RIGHT CONTENT */}
      <View style={{ marginLeft: 14, flex: 1, minWidth: 0, justifyContent: "center" }}>
        {/* CAFE NAME */}
        <Text
          numberOfLines={1}
          style={{
            fontSize: 18,
            fontWeight: "800",
            color: colors.text,
            letterSpacing: -0.2,
          }}
        >
          {cafe.name}
        </Text>

        {/* RATING, REVIEWS & PRICE */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 5,
            flexWrap: "nowrap",
          }}
        >
          <View
            style={{
              width: 17,
              height: 17,
              borderRadius: 8.5,
              backgroundColor: "#0F8A5F",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="star" size={9} color="#FFFFFF" />
          </View>

          <Text
            style={{
              marginLeft: 5,
              fontSize: 14,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            {cafe.rating.toFixed(1)}
          </Text>

          <Text
            style={{
              marginLeft: 3,
              fontSize: 13,
              fontWeight: "500",
              color: colors.textSecondary,
            }}
          >
            ({reviewCount})
          </Text>

          <Text
            style={{
              marginHorizontal: 5,
              fontSize: 13,
              color: colors.textSecondary,
            }}
          >
            •
          </Text>

          <Text
            numberOfLines={1}
            style={{
              flexShrink: 1,
              fontSize: 13,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            {priceDisplay}
          </Text>
        </View>

        {/* CATEGORY */}
        <Text
          numberOfLines={1}
          style={{
            marginTop: 4,
            fontSize: 14,
            fontWeight: "500",
            color: colors.textSecondary,
          }}
        >
          {cafe.category || "Café & Bakery"}
        </Text>

        {/* LOCATION */}
        <Text
          numberOfLines={1}
          style={{
            marginTop: 2,
            fontSize: 13,
            fontWeight: "500",
            color: colors.textSecondary,
          }}
        >
          {cafe.location || cafe.city || "Nearby"}
        </Text>
      </View>
    </Pressable>
  );
}

/* ========================================================= */
/* EMPTY */
/* ========================================================= */

function EmptySaved() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
      }}
    >
      <View
        style={{
          height: 92,
          width: 92,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 30,
          backgroundColor: colors.primarySoft,
        }}
      >
        <Ionicons name="heart-outline" size={43} color={colors.primary} />
      </View>

      <Text
        style={{
          marginTop: 24,
          textAlign: "center",
          fontSize: 21,
          fontWeight: "900",
          color: colors.text,
        }}
      >
        No saved cafes yet
      </Text>

      <Text
        style={{
          marginTop: 8,
          textAlign: "center",
          fontSize: 14,
          lineHeight: 20,
          color: colors.textSecondary,
        }}
      >
        Find a cafe you love and tap the heart to save it here.
      </Text>

      <Pressable
        onPress={() => router.push("/(tabs)/search")}
        style={{
          marginTop: 24,
          borderRadius: 16,
          backgroundColor: colors.primary,
          paddingHorizontal: 28,
          paddingVertical: 14,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>
          Explore Cafes
        </Text>
      </Pressable>
    </View>
  );
}

/* ========================================================= */
/* LOGIN */
/* ========================================================= */

function LoginRequired() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
      }}
    >
      <View
        style={{
          height: 92,
          width: 92,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 30,
          backgroundColor: colors.primarySoft,
        }}
      >
        <Ionicons name="person-outline" size={42} color={colors.primary} />
      </View>

      <Text
        style={{
          marginTop: 24,
          textAlign: "center",
          fontSize: 21,
          fontWeight: "900",
          color: colors.text,
        }}
      >
        Sign in to save cafes
      </Text>

      <Text
        style={{
          marginTop: 8,
          textAlign: "center",
          fontSize: 14,
          lineHeight: 20,
          color: colors.textSecondary,
        }}
      >
        Sign in to keep your favorite cafes synced with your account.
      </Text>

      <Pressable
        onPress={() => router.push("/(auth)/login")}
        style={{
          marginTop: 24,
          borderRadius: 16,
          backgroundColor: colors.primary,
          paddingHorizontal: 28,
          paddingVertical: 14,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>
          Sign In
        </Text>
      </Pressable>
    </View>
  );
}
