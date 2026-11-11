import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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

import { useTheme } from "../../src/context/ThemeContext";
import {
  Cafe,
  getCafes,
  getFeaturedCafes,
} from "../../src/services/firebase/cafes";
import { auth } from "../../src/services/firebase/config";
import {
  getSavedCafeIds,
  toggleCafeSaved,
} from "../../src/services/firebase/favorites";
import { subscribeToUnreadNotificationCount } from "../../src/services/firebase/notifications";

export default function HomeScreen() {
  const { colors, isDark } = useTheme();

  const [location, setLocation] = useState("Getting location...");
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [featuredCafes, setFeaturedCafes] = useState<Cafe[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  /* =====================================================
     LOCATION
  ===================================================== */

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
    } catch (err) {
      console.log("Location error:", err);
      setLocation("Location unavailable");
    }
  };

  /* =====================================================
     LOAD CAFES
  ===================================================== */

  const loadCafes = async () => {
    try {
      setError("");

      const [allCafes, featured] = await Promise.all([
        getCafes(),
        getFeaturedCafes(),
      ]);

      setCafes(allCafes);
      setFeaturedCafes(featured);
    } catch (err) {
      console.error("Failed to load cafés:", err);
      setError("We couldn't load cafés right now. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =====================================================
     LOAD SAVED CAFES
  ===================================================== */

  const loadSavedCafes = async () => {
    try {
      const ids = await getSavedCafeIds();
      setSavedIds(ids);
    } catch (err) {
      console.error("Failed to load saved cafes:", err);
    }
  };

  /* =====================================================
     INITIAL LOAD & FOCUS EFFECT
  ===================================================== */

  useEffect(() => {
    getLocation();
    loadCafes();
    loadSavedCafes();

    const user = auth.currentUser;
    if (user) {
      const unsub = subscribeToUnreadNotificationCount(user.uid, (cnt) => {
        setUnreadNotifCount(cnt);
      });
      return () => unsub();
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSavedCafes();
    }, []),
  );

  /* =====================================================
     REFRESH
  ===================================================== */

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([loadCafes(), loadSavedCafes()]);
  }, []);

  /* =====================================================
     SAVE / UNSAVE CAFE
  ===================================================== */

  const handleToggleSave = async (cafeId: string) => {
    try {
      const saved = await toggleCafeSaved(cafeId);

      setSavedIds((current) => {
        if (saved) {
          if (current.includes(cafeId)) {
            return current;
          }
          return [...current, cafeId];
        }
        return current.filter((id) => id !== cafeId);
      });
    } catch (err: any) {
      console.error("Save cafe error:", err);

      if (err?.message === "LOGIN_REQUIRED") {
        Alert.alert("Sign in required", "Please sign in to save cafes.", [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Sign In",
            onPress: () => router.push("/(auth)/login"),
          },
        ]);
        return;
      }

      Alert.alert("Couldn't save cafe", "Please try again.");
    }
  };

  /* =====================================================
     SEARCH
  ===================================================== */

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

  /* =====================================================
     NEARBY CAFES
  ===================================================== */

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
    Promise.all([loadCafes(), loadSavedCafes()]);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 130,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingBottom: 4,
            paddingTop: 12,
          }}
        >
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                height: 40,
                width: 40,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 14,
                backgroundColor: colors.primarySoft,
              }}
            >
              <Ionicons name="location" size={17} color={colors.primary} />
            </View>

            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: colors.textSecondary,
                }}
              >
                Current location
              </Text>

              <Text
                style={{
                  marginTop: 2,
                  fontSize: 14,
                  fontWeight: "700",
                  color: colors.text,
                }}
                numberOfLines={1}
              >
                {location}
              </Text>
            </View>
          </View>

          <Pressable
            style={{
              position: "relative",
              height: 42,
              width: 42,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 15,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
            onPress={() => router.push("/profile/notifications")}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.text}
            />

            {unreadNotifCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  right: 6,
                  top: 6,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  paddingHorizontal: 3,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1.5,
                  borderColor: colors.surface,
                  backgroundColor: colors.primary,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 9,
                    fontWeight: "900",
                    lineHeight: 11,
                  }}
                >
                  {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* =================================================
            HERO
        ================================================= */}

        <View
          style={{ paddingHorizontal: 20, paddingBottom: 18, paddingTop: 24 }}
        >
          <Text
            style={{
              marginBottom: 6,
              fontSize: 13,
              fontWeight: "700",
              color: colors.primary,
            }}
          >
            Find your next favorite place
          </Text>

          <Text
            style={{
              fontSize: 32,
              fontWeight: "900",
              lineHeight: 37,
              letterSpacing: -0.8,
              color: colors.text,
            }}
          >
            Good coffee.
            {"\n"}
            Great moments.
          </Text>

          <Text
            style={{
              marginTop: 8,
              fontSize: 14,
              lineHeight: 21,
              color: colors.textSecondary,
            }}
          >
            Discover beautiful cafés around you.
          </Text>
        </View>

        {/* =================================================
            SEARCH
        ================================================= */}

        <View
          style={{
            marginHorizontal: 20,
            height: 62,
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 50,
            borderWidth: 1,
            borderColor: colors.inputBorder,
            backgroundColor: colors.inputBackground,
            paddingHorizontal: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View
            style={{
              height: 44,
              width: 44,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 22,
            }}
          >
            <Ionicons
              name="search-outline"
              size={24}
              color={colors.textMuted}
            />
          </View>

          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search cafés, food, location..."
            placeholderTextColor={colors.textMuted}
            style={{
              height: "100%",
              flex: 1,
              paddingHorizontal: 10,
              fontSize: 15,
              fontWeight: "600",
              color: colors.text,
            }}
            returnKeyType="search"
          />

          {searchText.length > 0 && (
            <Pressable
              onPress={() => setSearchText("")}
              style={{ marginRight: 4, padding: 4 }}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textMuted}
              />
            </Pressable>
          )}

          <Pressable
            style={{
              height: 44,
              width: 44,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 22,
              backgroundColor: colors.primarySoft,
            }}
            onPress={() => router.push("/filters")}
          >
            <Ionicons name="options-outline" size={21} color={colors.primary} />
          </Pressable>
        </View>

        {/* =================================================
            ERROR
        ================================================= */}

        {error.length > 0 && (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 18,
              flexDirection: "row",
              borderRadius: 17,
              borderWidth: 1,
              borderColor: isDark ? "#4A1D1C" : "#F2D7CA",
              backgroundColor: colors.dangerSoft,
              padding: 15,
            }}
          >
            <View
              style={{
                height: 42,
                width: 42,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 14,
                backgroundColor: colors.surface,
              }}
            >
              <Ionicons
                name="cloud-offline-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "800",
                  color: colors.text,
                }}
              >
                Something went wrong
              </Text>

              <Text
                style={{
                  marginTop: 2,
                  fontSize: 12,
                  lineHeight: 17,
                  color: colors.textSecondary,
                }}
              >
                {error}
              </Text>

              <Pressable onPress={handleRetry}>
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    fontWeight: "800",
                    color: colors.primary,
                  }}
                >
                  Try again
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 100,
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />

            <Text
              style={{
                marginTop: 12,
                fontSize: 13,
                color: colors.textSecondary,
              }}
            >
              Finding beautiful cafés...
            </Text>
          </View>
        ) : (
          <>
            {/* =================================================
                FEATURED
            ================================================= */}

            {featuredCafes.length > 0 && (
              <View style={{ marginTop: 28 }}>
                <View
                  style={{
                    marginBottom: 16,
                    flexDirection: "row",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    paddingHorizontal: 20,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 21,
                        fontWeight: "800",
                        letterSpacing: -0.3,
                        color: colors.text,
                      }}
                    >
                      Featured cafés
                    </Text>

                    <Text
                      style={{
                        marginTop: 2,
                        fontSize: 12,
                        color: colors.textSecondary,
                      }}
                    >
                      Places worth discovering
                    </Text>
                  </View>

                  <Pressable onPress={handleSeeAll} hitSlop={10}>
                    <Text
                      style={{
                        paddingBottom: 2,
                        fontSize: 13,
                        fontWeight: "800",
                        color: colors.primary,
                      }}
                    >
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
                    marginBottom: 4,
                  }}
                  ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
                  renderItem={({ item }) => (
                    <FeaturedCafeCard
                      cafe={item}
                      onPress={() => openCafe(item.id)}
                      isSaved={savedIds.includes(item.id)}
                      onToggleSave={() => handleToggleSave(item.id)}
                    />
                  )}
                />
              </View>
            )}

            {/* =================================================
                SEARCH RESULTS OR EXPLORE
            ================================================= */}

            {searchText.trim().length > 0 ? (
              <View style={{ marginTop: 28 }}>
                <View
                  style={{
                    marginBottom: 16,
                    flexDirection: "row",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    paddingHorizontal: 20,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 21,
                        fontWeight: "800",
                        letterSpacing: -0.3,
                        color: colors.text,
                      }}
                    >
                      Search results
                    </Text>

                    <Text
                      style={{
                        marginTop: 2,
                        fontSize: 12,
                        color: colors.textSecondary,
                      }}
                    >
                      {filteredCafes.length} cafés found
                    </Text>
                  </View>
                </View>

                {filteredCafes.length === 0 ? (
                  <EmptySearch />
                ) : (
                  <View style={{ paddingHorizontal: 20 }}>
                    {filteredCafes.map((cafe) => (
                      <NearbyCafeCard
                        key={cafe.id}
                        cafe={cafe}
                        onPress={() => openCafe(cafe.id)}
                        isSaved={savedIds.includes(cafe.id)}
                        onToggleSave={() => handleToggleSave(cafe.id)}
                      />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={{ marginTop: 28 }}>
                <View
                  style={{
                    marginBottom: 16,
                    flexDirection: "row",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    paddingHorizontal: 20,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 21,
                        fontWeight: "800",
                        letterSpacing: -0.3,
                        color: colors.text,
                      }}
                    >
                      Explore cafés
                    </Text>

                    <Text
                      style={{
                        marginTop: 2,
                        fontSize: 12,
                        color: colors.textSecondary,
                      }}
                    >
                      More places for your next coffee
                    </Text>
                  </View>

                  <Pressable onPress={handleSeeAll} hitSlop={10}>
                    <Text
                      style={{
                        paddingBottom: 2,
                        fontSize: 13,
                        fontWeight: "800",
                        color: colors.primary,
                      }}
                    >
                      See all
                    </Text>
                  </Pressable>
                </View>

                {nearbyCafes.length === 0 ? (
                  <EmptyCafes />
                ) : (
                  <View style={{ paddingHorizontal: 20 }}>
                    {nearbyCafes.map((cafe) => (
                      <NearbyCafeCard
                        key={cafe.id}
                        cafe={cafe}
                        onPress={() => openCafe(cafe.id)}
                        isSaved={savedIds.includes(cafe.id)}
                        onToggleSave={() => handleToggleSave(cafe.id)}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            {cafes.length === 0 && !error && <EmptyCafes />}
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatPriceDisplay(priceRange?: string) {
  if (!priceRange) return "100rs~200rs";
  if (priceRange === "₹") return "100rs~200rs";
  if (priceRange === "₹₹") return "200rs~450rs";
  if (priceRange === "₹₹₹") return "450rs~800rs";
  if (priceRange === "₹₹₹₹") return "800rs~1500rs";
  if (
    priceRange.includes("~") ||
    priceRange.includes("rs") ||
    priceRange.includes("₹")
  )
    return priceRange;
  return `${priceRange}`;
}

function getCafeReviewsCount(cafe: any) {
  if (typeof cafe.reviewCount === "number" && cafe.reviewCount > 0)
    return cafe.reviewCount;
  if (typeof cafe.reviewsCount === "number" && cafe.reviewsCount > 0)
    return cafe.reviewsCount;
  const str = cafe.id || cafe.name || "cafe";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 700) + 120;
}

/* =========================================================
   FEATURED CARD
========================================================= */

type FeaturedCafeCardProps = {
  cafe: Cafe;
  onPress: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
};

function FeaturedCafeCard({
  cafe,
  onPress,
  isSaved,
  onToggleSave,
}: FeaturedCafeCardProps) {
  const { colors } = useTheme();
  const reviewCount = getCafeReviewsCount(cafe);
  const priceDisplay = formatPriceDisplay(cafe.priceRange);

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 300,
        overflow: "hidden",
        borderRadius: 24,
        backgroundColor: colors.surface,
      }}
    >
      <View
        style={{
          position: "relative",
          height: 190,
          backgroundColor: colors.surfaceMuted,
        }}
      >
        <Image
          source={{
            uri:
              cafe.image ||
              (cafe.images && cafe.images[0]) ||
              "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
          }}
          style={{ height: "100%", width: "100%" }}
          resizeMode="cover"
        />

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.65)"]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 60,
          }}
        />

        {/* FAVORITE */}
        <Pressable
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            height: 34,
            width: 34,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 17,
            backgroundColor: "rgba(0,0,0,0.28)",
          }}
          onPress={(event) => {
            event.stopPropagation();
            onToggleSave();
          }}
          hitSlop={8}
        >
          <Ionicons
            name={isSaved ? "heart" : "heart-outline"}
            size={18}
            color={isSaved ? "#FF3B30" : "#FFFFFF"}
          />
        </Pressable>

        {/* BOTTOM BADGE / TAG */}
        <View
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: "900",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            {cafe.featured ? "FEATURED" : "BUY1 GET1"}
          </Text>
        </View>
      </View>

      <View style={{ padding: 14 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "800",
            color: colors.text,
            letterSpacing: -0.2,
          }}
          numberOfLines={1}
        >
          {cafe.name}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 6,
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
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            {priceDisplay}
          </Text>
        </View>

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

        <Text
          numberOfLines={1}
          style={{
            marginTop: 2,
            fontSize: 13,
            fontWeight: "500",
            color: colors.textSecondary,
          }}
        >
          {cafe.location || cafe.city}
        </Text>
      </View>
    </Pressable>
  );
}

/* =========================================================
   NEARBY CARD
========================================================= */

type NearbyCafeCardProps = {
  cafe: Cafe;
  onPress: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
};

function NearbyCafeCard({
  cafe,
  onPress,
  isSaved,
  onToggleSave,
}: NearbyCafeCardProps) {
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
              (cafe.images && cafe.images[0]) ||
              "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
          }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />

        {/* TOP-RIGHT HEART */}
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onToggleSave();
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
            name={isSaved ? "heart" : "heart-outline"}
            size={17}
            color={isSaved ? "#FF3B30" : "#FFFFFF"}
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
            {cafe.featured ? "FEATURED" : "BUY1 GET1"}
          </Text>
        </LinearGradient>
      </View>

      {/* RIGHT CONTENT */}
      <View
        style={{
          marginLeft: 14,
          flex: 1,
          minWidth: 0,
          justifyContent: "center",
        }}
      >
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

/* =========================================================
   EMPTY SEARCH
========================================================= */

function EmptySearch() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        marginHorizontal: 20,
        alignItems: "center",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        paddingHorizontal: 24,
        paddingVertical: 35,
      }}
    >
      <View
        style={{
          height: 58,
          width: 58,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 20,
          backgroundColor: colors.primarySoft,
        }}
      >
        <Ionicons name="search-outline" size={28} color={colors.primary} />
      </View>

      <Text
        style={{
          marginTop: 13,
          fontSize: 16,
          fontWeight: "800",
          color: colors.text,
        }}
      >
        No cafés found
      </Text>

      <Text
        style={{
          marginTop: 6,
          maxWidth: 280,
          textAlign: "center",
          fontSize: 12,
          lineHeight: 18,
          color: colors.textSecondary,
        }}
      >
        Try searching for another café, location, or category.
      </Text>
    </View>
  );
}

/* =========================================================
   EMPTY CAFES
========================================================= */

function EmptyCafes() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        marginHorizontal: 20,
        alignItems: "center",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        paddingHorizontal: 24,
        paddingVertical: 35,
      }}
    >
      <View
        style={{
          height: 58,
          width: 58,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 20,
          backgroundColor: colors.primarySoft,
        }}
      >
        <Ionicons name="cafe-outline" size={28} color={colors.primary} />
      </View>

      <Text
        style={{
          marginTop: 13,
          fontSize: 16,
          fontWeight: "800",
          color: colors.text,
        }}
      >
        No cafés available
      </Text>

      <Text
        style={{
          marginTop: 6,
          maxWidth: 280,
          textAlign: "center",
          fontSize: 12,
          lineHeight: 18,
          color: colors.textSecondary,
        }}
      >
        We could not find any cafés right now. Pull down to refresh.
      </Text>
    </View>
  );
}
