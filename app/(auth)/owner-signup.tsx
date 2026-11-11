import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useTheme } from "../../src/context/ThemeContext";
import { signUpOwner } from "../../src/services/firebase/auth";

export default function OwnerSignupScreen() {
  const { colors, isDark } = useTheme();

  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bg = colors.background;
  const text = colors.text;
  const secondary = colors.textSecondary;
  const primary = colors.primary;
  const inputBg = colors.inputBackground;
  const border = colors.border;

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleOwnerSignup = async () => {
    setError("");

    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!businessName.trim() || businessName.trim().length < 2) {
      setError("Please enter your café or business name.");
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      setError("Please enter a valid business email address.");
      return;
    }

    const cleanPhone = phone.trim().replace(/[^0-9+]/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setError("Please enter a valid phone number (min 10 digits).");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the Terms of Service & Partner Agreement to continue.");
      return;
    }

    try {
      setLoading(true);

      const credential = await signUpOwner(
        name.trim(),
        businessName.trim(),
        email.trim(),
        phone.trim(),
        password,
      );

      router.replace({
        pathname: "/verify-email",
        params: {
          email: credential.user.email ?? email,
        },
      });
    } catch (err: any) {
      switch (err?.code) {
        case "auth/email-already-in-use":
          setError("An account already exists with this email address. Please sign in or use another email.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          setError("Password is too weak. Please use letters, numbers, and symbols.");
          break;

        case "auth/network-request-failed":
          setError("Network connection error. Please check your internet connection.");
          break;

        default:
          setError(err?.message || "Unable to register your café owner account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bg }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          style={[styles.back, { backgroundColor: colors.surface, borderColor: border }]}
        >
          <Ionicons name="arrow-back" size={20} color={text} />
        </Pressable>

        {/* Header */}
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: isDark ? "#281E38" : "#F4EEFD", borderColor: isDark ? "#4A3568" : "#E2D3FD" },
            ]}
          >
            <Ionicons name="business" size={13} color={isDark ? "#C084FC" : "#7C3AED"} />
            <Text
              style={[
                styles.badgeText,
                { color: isDark ? "#C084FC" : "#7C3AED" },
              ]}
            >
              Café Partner Portal
            </Text>
          </View>
        </View>

        <Text style={[styles.title, { color: text }]}>Partner Registration</Text>

        <Text style={[styles.subtitle, { color: secondary }]}>
          List your café, manage live reservations, and connect with thousands of coffee lovers.
        </Text>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Owner Full Name */}
          <Text style={[styles.label, { color: text }]}>Your Full Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Satyam Sharma"
            placeholderTextColor={isDark ? "#71635B" : "#AAA19B"}
            style={[
              styles.input,
              {
                backgroundColor: inputBg,
                borderColor: border,
                color: text,
              },
            ]}
          />

          {/* Business / Cafe Name */}
          <Text style={[styles.label, { color: text }]}>Café / Business Name *</Text>
          <TextInput
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="e.g. Roastery Coffee House"
            placeholderTextColor={isDark ? "#71635B" : "#AAA19B"}
            style={[
              styles.input,
              {
                backgroundColor: inputBg,
                borderColor: border,
                color: text,
              },
            ]}
          />

          {/* Email Address */}
          <Text style={[styles.label, { color: text }]}>Business Email Address *</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="owner@cafe.com"
            placeholderTextColor={isDark ? "#71635B" : "#AAA19B"}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={[
              styles.input,
              {
                backgroundColor: inputBg,
                borderColor: border,
                color: text,
              },
            ]}
          />

          {/* Phone Number */}
          <Text style={[styles.label, { color: text }]}>Contact Phone Number *</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 98765 43210"
            placeholderTextColor={isDark ? "#71635B" : "#AAA19B"}
            keyboardType="phone-pad"
            style={[
              styles.input,
              {
                backgroundColor: inputBg,
                borderColor: border,
                color: text,
              },
            ]}
          />

          {/* Password */}
          <Text style={[styles.label, { color: text }]}>Password *</Text>
          <View
            style={[
              styles.passwordBox,
              {
                backgroundColor: inputBg,
                borderColor: border,
              },
            ]}
          >
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Minimum 6 characters"
              placeholderTextColor={isDark ? "#71635B" : "#AAA19B"}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              style={[styles.passwordInput, { color: text }]}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)}>
              <Text style={[styles.show, { color: primary }]}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </Pressable>
          </View>

          {/* Confirm Password */}
          <Text style={[styles.label, { color: text }]}>Confirm Password *</Text>
          <View
            style={[
              styles.passwordBox,
              {
                backgroundColor: inputBg,
                borderColor: border,
              },
            ]}
          >
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              placeholderTextColor={isDark ? "#71635B" : "#AAA19B"}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              style={[styles.passwordInput, { color: text }]}
            />
            <Pressable onPress={() => setShowConfirmPassword((v) => !v)}>
              <Text style={[styles.show, { color: primary }]}>
                {showConfirmPassword ? "Hide" : "Show"}
              </Text>
            </Pressable>
          </View>

          {/* Terms Checkbox */}
          <Pressable
            onPress={() => setAcceptTerms((v) => !v)}
            style={styles.termsRow}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: acceptTerms ? primary : border,
                  backgroundColor: acceptTerms ? primary : "transparent",
                },
              ]}
            >
              {acceptTerms ? (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              ) : null}
            </View>

            <Text style={[styles.termsText, { color: secondary }]}>
              I agree to the{" "}
              <Text style={{ color: text, fontWeight: "700" }}>
                Partner Terms of Service
              </Text>{" "}
              and{" "}
              <Text style={{ color: text, fontWeight: "700" }}>
                Privacy Policy
              </Text>
              .
            </Text>
          </Pressable>

          {/* Error Banner */}
          {error ? (
            <View
              style={[
                styles.errorContainer,
                {
                  backgroundColor: isDark ? "#381816" : "#FFF5F5",
                  borderColor: isDark ? "#5C2622" : "#F6D7D5",
                },
              ]}
            >
              <Ionicons name="alert-circle" size={18} color="#D95445" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <Pressable
            style={[
              styles.button,
              { backgroundColor: primary, opacity: loading ? 0.7 : 1 },
            ]}
            onPress={handleOwnerSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Register Café Business ✨</Text>
            )}
          </Pressable>
        </View>

        {/* Switch to Customer Signup */}
        <Pressable
          onPress={() => router.replace("/(auth)/signup")}
          style={[
            styles.customerSwitch,
            { backgroundColor: colors.chip, borderColor: border },
          ]}
        >
          <Text style={[styles.customerSwitchText, { color: primary }]}>
            Looking to book cafés as a guest? Sign up as Customer →
          </Text>
        </Pressable>

        {/* Login Row */}
        <View style={styles.loginRow}>
          <Text style={[styles.loginLabel, { color: secondary }]}>
            Already have an account?{" "}
          </Text>
          <Pressable onPress={() => router.replace("/(auth)/login")}>
            <Text style={[styles.login, { color: primary }]}>Log In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingTop: 45,
    paddingBottom: 40,
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 33,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 22,
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
    marginTop: 14,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  passwordBox: {
    height: 52,
    borderWidth: 1,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    fontSize: 14,
  },
  show: {
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 15,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 18,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: "#D95445",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
  button: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  customerSwitch: {
    marginTop: 24,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  customerSwitchText: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 26,
  },
  loginLabel: {
    fontSize: 13,
  },
  login: {
    fontSize: 13,
    fontWeight: "800",
  },
});
