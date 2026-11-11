import { Ionicons } from "@expo/vector-icons";
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
  const { colors, isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        marginBottom: 12,
        flexDirection: "row",
        overflow: "hidden",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        padding: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <Image
        source={{
          uri:
            cafe.image ||
            "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
        }}
        style={{
          height: 92,
          width: 92,
          borderRadius: 15,
          backgroundColor: colors.surfaceMuted,
        }}
        resizeMode="cover"
      />

      <View style={{ marginLeft: 12, flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "800",
            color: colors.text,
          }}
          numberOfLines={1}
        >
          {cafe.name}
        </Text>

        <View
          style={{
            marginTop: 4,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons
            name="location-outline"
            size={13}
            color={colors.textSecondary}
          />

          <Text
            style={{
              marginLeft: 4,
              flex: 1,
              fontSize: 11,
              color: colors.textSecondary,
            }}
            numberOfLines={1}
          >
            {cafe.location}, {cafe.city}
          </Text>
        </View>

        <View
          style={{
            marginTop: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 8,
              backgroundColor: isDark ? "#2F2312" : "#FFF5E4",
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Ionicons name="star" size={11} color={colors.star} />

            <Text
              style={{
                marginLeft: 4,
                fontSize: 10,
                fontWeight: "800",
                color: isDark ? "#F8C162" : "#77532D",
              }}
            >
              {cafe.rating.toFixed(1)}
            </Text>
          </View>

          <Text
            style={{
              marginLeft: 8,
              fontSize: 10,
              fontWeight: "700",
              color: colors.textSecondary,
            }}
          >
            {cafe.category}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        hitSlop={10}
        style={{
          height: 40,
          width: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="heart" size={21} color={colors.danger} />
      </Pressable>
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
