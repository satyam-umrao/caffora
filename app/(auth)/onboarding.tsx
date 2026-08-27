import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const ONBOARDING_KEY = "@caffora_onboarding_completed";

const slides = [
  {
    id: "1",
    title: "Discover\nAmazing Cafes",
    description: "Find the best cafes near you and book your table with ease.",
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=85&w=1000&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "Find Your\nPerfect Spot",
    description:
      "Explore cafes by location, price, rating, food type and atmosphere.",
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=85&w=1000&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "Book &\nEnjoy",
    description:
      "Choose your date, time and guests. Your perfect table is just a few taps away.",
    image:
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=85&w=1000&auto=format&fit=crop",
  },
];

export default function OnboardingScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [index, setIndex] = useState(0);

  const listRef = useRef<FlatList>(null);

  const background = "#FAF8F5";
  const text = "#1E1916";
  const secondary = "#756960";

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/login");
  };

  const next = () => {
    if (index === slides.length - 1) {
      finish();
      return;
    }

    listRef.current?.scrollToIndex({
      index: index + 1,
      animated: true,
    });
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);

    if (newIndex !== index) {
      setIndex(newIndex);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Pressable style={styles.skip} onPress={finish}>
        <Text style={[styles.skipText, { color: secondary }]}>Skip</Text>
      </Pressable>

      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.heading}>
              <Text style={[styles.title, { color: text }]}>{item.title}</Text>

              <Text style={[styles.description, { color: secondary }]}>
                {item.description}
              </Text>
            </View>

            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}
      />

      <View style={styles.bottom}>
        <View style={styles.pagination}>
          {slides.map((slide, i) => (
            <View
              key={slide.id}
              style={[
                styles.dot,
                i === index
                  ? styles.activeDot
                  : {
                      backgroundColor: "#DDD7D1",
                    },
              ]}
            />
          ))}
        </View>

        <Pressable style={styles.nextButton} onPress={next}>
          <Text style={styles.nextText}>
            {index === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  skip: {
    position: "absolute",
    top: 58,
    right: 24,
    zIndex: 10,
  },

  skipText: {
    fontSize: 14,
    fontWeight: "600",
  },

  slide: {
    width,
    paddingHorizontal: 28,
    paddingTop: 95,
  },

  heading: {
    marginBottom: 26,
  },

  title: {
    fontSize: 29,
    lineHeight: 34,
    fontWeight: "800",
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 310,
  },

  image: {
    width: "100%",
    height: 380,
    borderRadius: 28,
  },

  bottom: {
    position: "absolute",
    left: 28,
    right: 28,
    bottom: 38,
    alignItems: "flex-end",
  },

  pagination: {
    position: "absolute",
    left: 0,
    bottom: 18,
    flexDirection: "row",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },

  activeDot: {
    width: 24,
    backgroundColor: "#B95E2E",
  },

  nextButton: {
    minWidth: 135,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#B95E2E",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },

  nextText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
