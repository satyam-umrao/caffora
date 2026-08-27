import { router } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
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

import { auth } from "../../src/services/firebase/config";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleResetPassword = async () => {
    setError("");
    setSent(false);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(auth, cleanEmail);

      setSent(true);
    } catch (err: any) {
      console.log("Password reset error:", err);

      switch (err?.code) {
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/user-not-found":
          setError("No account was found with this email address.");
          break;

        case "auth/too-many-requests":
          setError("Too many requests. Please wait a while and try again.");
          break;

        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection.");
          break;

        default:
          setError("Unable to send the reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        {/* Icon */}
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🔐</Text>
        </View>

        {/* Header */}
        <Text style={styles.title}>Forgot password?</Text>

        <Text style={styles.description}>
          No worries. Enter the email address associated with your Caffora
          account and we'll send you a link to reset your password.
        </Text>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email address</Text>

          <TextInput
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setError("");
              setSent(false);
            }}
            placeholder="you@example.com"
            placeholderTextColor="#806F64"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            style={styles.input}
          />

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Success */}
          {sent ? (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>Reset email sent</Text>

              <Text style={styles.successText}>
                Check your inbox for a password reset link. Don't forget to
                check your spam folder.
              </Text>
            </View>
          ) : null}

          {/* Reset button */}
          <Pressable
            style={[styles.resetButton, loading && styles.disabledButton]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.resetButtonText}>Send Reset Link </Text>
            )}
          </Pressable>
        </View>

        {/* Back to login */}
        <Pressable
          style={styles.loginButton}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={styles.loginArrow}>←</Text>

          <Text style={styles.loginText}>Back to Sign In </Text>
        </Pressable>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>☕</Text>
          </View>

          <Text style={styles.logo}>Caffora</Text>

          <Text style={styles.tagline}>Discover. Book. Enjoy. </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F3",
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 35,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FAF8F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 35,
  },

  backText: {
    color: "#1D1815",
    fontSize: 32,
    lineHeight: 34,
    marginTop: -3,
  },

  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#FAF8F5",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 26,
  },

  icon: {
    fontSize: 40,
  },

  title: {
    color: "#1D1815",
    fontSize: 29,
    fontWeight: "800",
    textAlign: "center",
  },

  description: {
    color: "#776B64",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 12,
    maxWidth: 340,
    alignSelf: "center",
  },

  form: {
    marginTop: 35,
  },

  label: {
    color: "#776B64",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 9,
  },

  input: {
    height: 56,
    borderWidth: 1,
    borderColor: "#E5DFDA",
    borderRadius: 15,
    backgroundColor: "#FAF8F5",
    color: "#1D1815",
    paddingHorizontal: 16,
    fontSize: 15,
  },

  errorBox: {
    backgroundColor: "#FAF8F5",
    borderWidth: 0.5,
    borderColor: "red",
    borderRadius: 13,
    padding: 13,
    marginTop: 15,
  },

  errorText: {
    color: "red",
    fontSize: 13,
    lineHeight: 19,
  },

  successBox: {
    backgroundColor: "#FAF8F5",
    borderWidth: 1,
    borderColor: "green",
    borderRadius: 13,
    padding: 14,
    marginTop: 15,
  },

  successTitle: {
    color: "green",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 5,
  },

  successText: {
    color: "green",
    fontSize: 12,
    lineHeight: 18,
  },

  resetButton: {
    height: 58,
    borderRadius: 17,
    backgroundColor: "#B95E2E",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  disabledButton: {
    opacity: 0.65,
  },

  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
    paddingVertical: 12,
  },

  loginArrow: {
    color: "#B95E2E",
    fontSize: 18,
    marginRight: 8,
  },

  loginText: {
    color: "#B95E2E",
    fontSize: 14,
    fontWeight: "700",
  },

  footer: {
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 35,
  },

  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#B95E2E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  logoEmoji: {
    fontSize: 18,
  },

  logo: {
    color: "#C87941",
    fontSize: 15,
    fontWeight: "800",
  },

  tagline: {
    color: "#1D1815",
    fontSize: 10,
    marginTop: 3,
  },
});
