import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  ImageBackground,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { auth } from "../src/services/firebase/config";

const SPLASH_IMAGE =
  "https://plus.unsplash.com/premium_photo-1673545518947-ddf3240090b1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2FmZXxlbnwwfHwwfHx8MA%3D%3D";

export default function Index() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const scale = useRef(new Animated.Value(0.82)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 45,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    let timer: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      timer = setTimeout(() => {
        if (user) {
          if (user.emailVerified) {
            router.replace("/(tabs)");
          } else {
            router.replace("/(auth)/verify-email");
          }
        } else {
          router.replace("/(auth)/onboarding");
        }
      }, 1800);
    });

    return () => {
      unsubscribe();

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [opacity, scale]);

  return (
    <ImageBackground
      source={{ uri: SPLASH_IMAGE }}
      style={styles.container}
      resizeMode="cover"
    >
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: isDark
              ? "rgba(0,0,0,0.60)"
              : "rgba(20,14,10,0.45)",
          },
        ]}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <Text
          style={[
            styles.logo,
            {
              color: "#FFFFFF",
            },
          ]}
        >
          Caffora
        </Text>

        <Text style={styles.tagline}>DISCOVER. BOOK. ENJOY.</Text>
      </Animated.View>

      <View style={styles.bottom}>
        <Text style={styles.bottomText}>
          Your next favorite cafe is waiting.
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  logoIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#B95E2E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  coffeeIcon: {
    fontSize: 42,
  },

  logo: {
    fontSize: 70,
    fontWeight: "800",
    letterSpacing: -1.5,
  },

  tagline: {
    marginTop: 8,
    color: "#F2DED0",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },

  bottom: {
    position: "absolute",
    bottom: 48,
    left: 24,
    right: 24,
    alignItems: "center",
  },

  progress: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  progressActive: {
    width: 34,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#D87338",
    marginHorizontal: 4,
  },

  progressInactive: {
    width: 34,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
    marginHorizontal: 4,
  },

  bottomText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
});
