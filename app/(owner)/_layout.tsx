import { Stack } from "expo-router";
import React from "react";

import { useTheme } from "../../src/context/ThemeContext";

export default function OwnerLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="my-cafes" />
      <Stack.Screen name="add-cafe" />
      <Stack.Screen name="edit-cafe" />
      <Stack.Screen name="bookings" />
    </Stack>
  );
}
