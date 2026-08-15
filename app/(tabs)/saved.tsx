import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
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
  const [cafes, setCafes] = useState<SavedCafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const user = auth.currentUser;

  const loadSavedCafes = useCallback(async () => {
    if (!user) {
      setCafes([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoading(true);

      const favoritesRef = collection(db, "users", user.uid, "favorites");

      const favoriteSnapshot = await getDocs(favoritesRef);

      const saved: SavedCafe[] = [];

      for (const favoriteDoc of favoriteSnapshot.docs) {
        const favoriteData = favoriteDoc.data();

        const cafeId = favoriteData.cafeId;

        if (!cafeId) {
          continue;
        }

        const cafeRef = doc(db, "cafes", cafeId);

        const cafeSnapshot = await getDoc(cafeRef);

        if (!cafeSnapshot.exists()) {
          continue;
        }

        const cafeData = cafeSnapshot.data() as Cafe;

        saved.push({
          ...cafeData,
          id: cafeSnapshot.id,
          favoriteId: favoriteDoc.id,
        });
      }

      setCafes(saved);
    } catch (error) {
      console.error("Failed to load saved cafes:", error);

      Alert.alert("Something went wrong", "We couldn't load your saved cafes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadSavedCafes();
  }, [loadSavedCafes]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadSavedCafes();
  };

  const removeCafe = async (cafe: SavedCafe) => {
    try {
      await deleteDoc(doc(db, "favorites", cafe.favoriteId));

      setCafes((current) =>
        current.filter((item) => item.favoriteId !== cafe.favoriteId),
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

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#FAF7F3]">
      {/* HEADER */}

      <View className="px-5 pb-5 pt-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[12px] font-bold uppercase tracking-[0.7px] text-[#A09289]">
              Your collection
            </Text>

            <Text className="mt-1 text-[29px] font-black tracking-[-0.7px] text-[#281F1A]">
              Saved Cafes
            </Text>
          </View>

          <View className="h-11 w-11 items-center justify-center rounded-[15px] bg-[#F7E4D9]">
            <Ionicons name="heart" size={22} color="#B95E2E" />
          </View>
        </View>

        <Text className="mt-2 text-sm text-[#897C73]">
          Your favorite coffee spots in one place.
        </Text>
      </View>

      <View className="h-px bg-[#EAE2DC]" />

      {/*CONTENT*/}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#B95E2E" />

          <Text className="mt-3 text-sm text-[#8D8078]">
            Loading saved cafes...
          </Text>
        </View>
      ) : !user ? (
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
              tintColor="#B95E2E"
            />
          }
          contentContainerClassName="px-5 pb-[120px] pt-5"
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-base font-extrabold text-[#302720]">
              {cafes.length} {cafes.length === 1 ? "cafe" : "cafes"} saved
            </Text>

            <Ionicons name="heart" size={17} color="#E0524D" />
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
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row overflow-hidden rounded-[20px] border border-[#EEE4DD] bg-white p-2.5 shadow-sm active:opacity-70"
    >
      <Image
        source={{
          uri:
            cafe.image ||
            "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
        }}
        className="h-[92px] w-[92px] rounded-[15px] bg-[#E9DED7]"
        resizeMode="cover"
      />

      <View className="ml-3 flex-1 justify-center">
        <Text
          className="text-[16px] font-extrabold text-[#2B211C]"
          numberOfLines={1}
        >
          {cafe.name}
        </Text>

        <View className="mt-1 flex-row items-center">
          <Ionicons name="location-outline" size={13} color="#8D8179" />

          <Text
            className="ml-1 flex-1 text-[11px] text-[#8B7E76]"
            numberOfLines={1}
          >
            {cafe.location}, {cafe.city}
          </Text>
        </View>

        <View className="mt-2 flex-row items-center">
          <View className="flex-row items-center rounded-[8px] bg-[#FFF5E4] px-2 py-1">
            <Ionicons name="star" size={11} color="#F6B94A" />

            <Text className="ml-1 text-[10px] font-extrabold text-[#77532D]">
              {cafe.rating.toFixed(1)}
            </Text>
          </View>

          <Text className="ml-2 text-[10px] font-bold text-[#75675F]">
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
        className="h-10 w-10 items-center justify-center"
      >
        <Ionicons name="heart" size={21} color="#E0524D" />
      </Pressable>
    </Pressable>
  );
}

/* ========================================================= */
/* EMPTY */
/* ========================================================= */

function EmptySaved() {
  return (
    <View className="flex-1 items-center justify-center px-10">
      <View className="h-[92px] w-[92px] items-center justify-center rounded-[30px] bg-[#F7E4D9]">
        <Ionicons name="heart-outline" size={43} color="#B95E2E" />
      </View>

      <Text className="mt-6 text-center text-[21px] font-black text-[#302720]">
        No saved cafes yet
      </Text>

      <Text className="mt-2 text-center text-sm leading-5 text-[#8C7E75]">
        Find a cafe you love and tap the heart to save it here.
      </Text>

      <Pressable
        onPress={() => router.push("/(tabs)/search")}
        className="mt-6 rounded-[16px] bg-[#B95E2E] px-7 py-3.5 active:bg-[#9E4D25]"
      >
        <Text className="text-sm font-extrabold text-white">Explore Cafes</Text>
      </Pressable>
    </View>
  );
}

/* ========================================================= */
/* LOGIN */
/* ========================================================= */

function LoginRequired() {
  return (
    <View className="flex-1 items-center justify-center px-10">
      <View className="h-[92px] w-[92px] items-center justify-center rounded-[30px] bg-[#F7E4D9]">
        <Ionicons name="person-outline" size={42} color="#B95E2E" />
      </View>

      <Text className="mt-6 text-center text-[21px] font-black text-[#302720]">
        Sign in to save cafes
      </Text>

      <Text className="mt-2 text-center text-sm leading-5 text-[#8C7E75]">
        Sign in to keep your favorite cafes synced with your account.
      </Text>

      <Pressable
        onPress={() => router.push("/(auth)/login")}
        className="mt-6 rounded-[16px] bg-[#B95E2E] px-7 py-3.5 active:bg-[#9E4D25]"
      >
        <Text className="text-sm font-extrabold text-white">Sign In</Text>
      </Pressable>
    </View>
  );
}
