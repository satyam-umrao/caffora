import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { Heart, Home, Search, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../src/context/ThemeContext";
import { auth } from "../../src/services/firebase/config";
import { subscribeToUnreadNotificationCount } from "../../src/services/firebase/notifications";

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
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const unsub = subscribeToUnreadNotificationCount(user.uid, (cnt) => {
      setUnreadCount(cnt);
    });
    return () => unsub();
  }, []);

  const activeRouteName = state.routes[state.index]?.name;
  const foundIndex = VISIBLE_TAB_KEYS.indexOf(activeRouteName);
  const targetIndex = foundIndex !== -1 ? foundIndex : 0;

  const [gliderAnim] = useState(() => new Animated.Value(targetIndex));

  useEffect(() => {
    if (foundIndex !== -1) {
      Animated.spring(gliderAnim, {
        toValue: foundIndex,
        damping: 18,
        stiffness: 190,
        mass: 0.7,
        useNativeDriver: true,
      }).start();
    }
  }, [foundIndex, gliderAnim]);

  const numTabs = 4;
  const tabWidth = barWidth > 0 ? barWidth / numTabs : 0;

  // FIX: Clean intervals for perfect alignment
  const gliderTranslateX = gliderAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [3, tabWidth + 2, tabWidth * 2 + 1, tabWidth * 3],
  });

  // Dynamic safe margin based on device safe area (handles Android gesture navigation bar)
  const bottomMargin =
    Platform.OS === "android"
      ? Math.max(insets.bottom, 12)
      : Math.max(insets.bottom, 16);

  const handleLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  const handleTabPress = (routeName: string, isFocused: boolean) => {
    if (!isFocused) {
      navigation.navigate(routeName);
    }
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      {/* Background scrim matching app background so scrolled white cards never bleed through below the bar */}
      <LinearGradient
        colors={[
          isDark ? "rgba(18, 14, 12, 0)" : "rgba(250, 247, 243, 0)",
          colors.background,
          colors.background,
        ]}
        locations={[0, 0.45, 1]}
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
        }}
      />

      <LinearGradient
        colors={[colors.tabBarBackground, colors.tabBarBackground]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        onLayout={handleLayout}
        style={{
          flexDirection: "row",
          paddingBottom: 15,
          paddingTop: 15,
          marginHorizontal: 15,
          marginBottom: bottomMargin,
          borderRadius: 50,
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.45 : 0.15,
          shadowRadius: 12,
          elevation: 12,
          borderWidth: isDark ? 1 : 0,
          borderColor: colors.border,
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
                  color={isFocused ? "#FFFFFF" : isDark ? "#8C7F78" : "#8F827B"}
                  strokeWidth={isFocused ? 2.6 : 1.8}
                  fill={
                    route.name === "saved" && isFocused
                      ? "#FFFFFF"
                      : "transparent"
                  }
                />
                {route.name === "profile" && unreadCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -5,
                      height: 7,
                      width: 7,
                      borderRadius: 4,
                      backgroundColor: isFocused ? "#FFFFFF" : "#B95E2E",
                      borderWidth: 1,
                      borderColor: colors.tabBarBackground,
                    }}
                  />
                )}
              </View>

              {/* LABEL */}
              <Text
                style={{
                  marginTop: 3,
                  fontSize: 10,
                  fontWeight: isFocused ? "900" : "700",
                  letterSpacing: isFocused ? 0.5 : 0.25,
                  textTransform: "uppercase",
                  color: isFocused ? "#FFFFFF" : isDark ? "#8C7F78" : "#8F827B",
                }}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: "fade",
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: "transparent",
          borderTopWidth: 0,
        },
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
