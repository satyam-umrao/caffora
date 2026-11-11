import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "../../src/context/ThemeContext";

export default function RegisterSelectScreen() {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Navigation */}
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>

        {/* Brand & Title */}
        <View style={styles.header}>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.chip, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              Join Caffora
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            How will you use Caffora?
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose your account type to personalize your experience.
          </Text>
        </View>

        {/* Account Type Options */}
        <View style={styles.cardsContainer}>
          {/* Option 1: Customer */}
          <Pressable
            onPress={() => router.push("/(auth)/signup")}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: pressed ? colors.primary : colors.border,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: isDark ? "#2A1E14" : "#FDF2EC" },
                ]}
              >
                <Ionicons name="cafe" size={26} color={colors.primary} />
              </View>

              <View
                style={[
                  styles.tag,
                  { backgroundColor: isDark ? "#17341E" : "#EBF7EE" },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: isDark ? "#4ADE80" : "#2E7A3A" },
                  ]}
                >
                  Coffee Lover
                </Text>
              </View>
            </View>

            <Text style={[styles.cardTitle, { color: colors.text }]}>
              I am a Customer
            </Text>

            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Discover curated specialty cafés, explore menus, reserve tables in seconds, and share your café reviews.
            </Text>

            <View style={styles.cardActionRow}>
              <Text style={[styles.cardActionText, { color: colors.primary }]}>
                Continue as Customer
              </Text>
              <Ionicons
                name="arrow-forward-circle"
                size={22}
                color={colors.primary}
              />
            </View>
          </Pressable>

          {/* Option 2: Cafe Owner */}
          <Pressable
            onPress={() => router.push("/(auth)/owner-signup")}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: pressed ? colors.primary : colors.border,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: isDark ? "#281E38" : "#F4EEFD" },
                ]}
              >
                <Ionicons name="business" size={26} color={isDark ? "#C084FC" : "#7C3AED"} />
              </View>

              <View
                style={[
                  styles.tag,
                  { backgroundColor: isDark ? "#2A1B3D" : "#F3EEFA" },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: isDark ? "#C084FC" : "#654388" },
                  ]}
                >
                  Business Portal
                </Text>
              </View>
            </View>

            <Text style={[styles.cardTitle, { color: colors.text }]}>
              I am a Cafe Owner
            </Text>

            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              List your café, manage reservations, accept or hold guest bookings, update operating hours, and grow your café business.
            </Text>

            <View style={styles.cardActionRow}>
              <Text style={[styles.cardActionText, { color: colors.primary }]}>
                Register as Cafe Owner
              </Text>
              <Ionicons
                name="arrow-forward-circle"
                size={22}
                color={colors.primary}
              />
            </View>
          </Pressable>
        </View>

        {/* Bottom Login Link */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Already have an account?
          </Text>
          <Pressable onPress={() => router.replace("/(auth)/login")}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>
              {" "}Log In
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  header: {
    marginBottom: 28,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 33,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  cardsContainer: {
    gap: 18,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 18,
  },
  cardActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.15)",
    paddingTop: 14,
  },
  cardActionText: {
    fontSize: 14,
    fontWeight: "800",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 36,
  },
  footerText: {
    fontSize: 13,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: "800",
  },
});
