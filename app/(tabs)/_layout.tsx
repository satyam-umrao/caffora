import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { Heart, Home, Search, User } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_CONFIG = {
  index: { label: "Home", icon: Home },
  search: { label: "Search", icon: Search },
  saved: { label: "Saved", icon: Heart },
  profile: { label: "Profile", icon: User },
} as const;

const VISIBLE_TAB_KEYS = ["index", "search", "saved", "profile"];
type TabKey = keyof typeof TAB_CONFIG;

type CustomTabBarProps = {
  state: any;
  navigation: any;
};

// Fixed width for the animated background highlight

function CustomTabBar({ state, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);

  const activeRouteName = state.routes[state.index]?.name;
  const foundIndex = VISIBLE_TAB_KEYS.indexOf(activeRouteName);
  const lastValidIndex = useRef(0);

  if (foundIndex !== -1) {
    lastValidIndex.current = foundIndex;
  }

  const activeGliderIndex =
    foundIndex !== -1 ? foundIndex : lastValidIndex.current;

  const gliderAnim = useRef(new Animated.Value(activeGliderIndex)).current;

  useEffect(() => {
    Animated.spring(gliderAnim, {
      toValue: activeGliderIndex,
      damping: 18,
      stiffness: 190,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
  }, [activeGliderIndex, gliderAnim]);

  const numTabs = 4;
  const tabWidth = barWidth > 0 ? barWidth / numTabs : 0;

  // FIX: Clean intervals for perfect alignment
  const gliderTranslateX = gliderAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [3, tabWidth + 2, tabWidth * 2 + 1, tabWidth * 3],
  });

  // FIX: Apply safe area insets to prevent home indicator overlap
  const bottomMargin = 10;

  const handleLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  const handleTabPress = (routeName: string, isFocused: boolean) => {
    if (!isFocused) {
      navigation.navigate(routeName);
    }
  };

  return (
    <LinearGradient
      colors={["#ffffff", "#ffffff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      onLayout={handleLayout}
      style={{
        flexDirection: "row",
        paddingBottom: 15,
        paddingTop: 15,
        marginHorizontal: 15,
        marginBottom: bottomMargin, // Applied safe area
        borderRadius: 50,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 12,
      }}
    >
      {/* =====================================
          ANIMATED GLASS GLIDER
      ===================================== */}
      {barWidth > 0 && (
        <Animated.View
          style={{
            position: "absolute",
            top: 7,
            // FIX: Dynamically center the glider within the tab's boundaries
            left: (tabWidth - 80) / 2,
            width: 75,
            height: 65,
            borderRadius: 60,
            zIndex: 1,
            transform: [{ translateX: gliderTranslateX }],
            ...Platform.select({
              ios: {
                shadowColor: "#B95E2E",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.45,
                shadowRadius: 12,
              },
              android: {
                elevation: 7,
              },
            }),
          }}
        >
          <LinearGradient
            colors={["#D87943", "#B95E2E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flex: 1,
              borderRadius: 50,
            }}
          />
        </Animated.View>
      )}

      {/* =====================================
          TABS
      ===================================== */}
      {state.routes.map((route: any, index: number) => {
        const config = TAB_CONFIG[route.name as TabKey];

        if (!config) return null;

        const isFocused = state.index === index;
        const Icon = config.icon;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => handleTabPress(route.name, isFocused)}
            activeOpacity={0.8}
            style={{
              flex: 1, // FIX: Removed the broken 'width: 6 / tabWidth' calculation
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 50,
              paddingVertical: 6,
              zIndex: 2,
            }}
          >
            {/* ICON */}
            <View style={{ alignItems: "center", position: "relative" }}>
              <Icon
                size={isFocused ? 22 : 21}
                color={isFocused ? "#FFFFFF" : "#8F827B"}
                strokeWidth={isFocused ? 2.6 : 1.8}
                fill={
                  route.name === "saved" && isFocused
                    ? "#FFFFFF"
                    : "transparent"
                }
              />
            </View>

            {/* LABEL */}
            <Text
              style={{
                marginTop: 3,
                fontSize: 10,
                fontWeight: isFocused ? "900" : "700",
                letterSpacing: isFocused ? 0.5 : 0.25,
                textTransform: "uppercase",
                color: isFocused ? "#FFFFFF" : "#8F827B",
              }}
            >
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: "fade",
        sceneStyle: { backgroundColor: "#FAF7F3" },
        tabBarStyle: { display: "none" },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="saved" options={{ title: "Saved" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
