import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import React from "react";

import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import "../global.css";

function RootStack() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {/* Startup / Splash */}
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />

        {/* Authentication */}
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />

        {/* Main application */}
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        {/* Cafe Owner Portal */}
        <Stack.Screen
          name="(owner)"
          options={{
            headerShown: false,
          }}
        />

        {/* Cafe details */}
        <Stack.Screen
          name="cafe/[id]"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />

        {/* Filters */}
        <Stack.Screen
          name="filters"
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />

        {/* Search Results Screen */}
        <Stack.Screen
          name="search/search-results"
          options={{
            headerShown: false,
          }}
        />

        {/* Booking */}
        <Stack.Screen
          name="booking/[cafeId]"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />

        <Stack.Screen
          name="booking/confirmation"
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />

        <Stack.Screen
          name="booking/history"
          options={{
            headerShown: false,
          }}
        />

        {/* Reviews */}
        <Stack.Screen
          name="reviews/[cafeId]"
          options={{
            headerShown: false,
          }}
        />

        {/* Profile */}
        <Stack.Screen
          name="profile/edit"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="profile/settings"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="profile/notifications"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="profile/help"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="profile/privacy"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="profile/about"
          options={{
            headerShown: false,
          }}
        />

        {/* Modals */}
        <Stack.Screen
          name="modal/write-review"
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />

        <Stack.Screen
          name="modal/booking-details"
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}
