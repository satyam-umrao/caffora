import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import {
  checkEmailVerification,
  resendVerificationEmail,
} from "../../src/services/firebase/auth";

export default function VerifyEmailScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const params = useLocalSearchParams<{
    email?: string;
  }>();

  const email = params.email ?? "";

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const bg = "#FAF8F5";
  const text = "#1D1815";
  const secondary = "#776B64";
  const card = "#FFFFFF";
  const border = "#E5DFDA";

  useEffect(() => {
    setMessage("A verification link has been sent to your email.");
  }, []);

  const resend = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      await resendVerificationEmail();

      setMessage("A new verification email has been sent.");
    } catch {
      setError("Unable to send the email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkVerification = async () => {
    try {
      setChecking(true);
      setError("");

      const verified = await checkEmailVerification();

      if (verified) {
        router.replace("/(tabs)");
      } else {
        setError(
          "Your email is not verified yet. Please open the verification link in your email.",
        );
      }
    } catch {
      setError("Unable to check verification status.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Pressable style={styles.back} onPress={() => router.replace("/login")}>
        <Text style={[styles.backText, { color: text }]}>‹</Text>
      </Pressable>

      <View style={styles.content}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: "#F2E5DC",
            },
          ]}
        >
          <Text style={styles.icon}>✉️</Text>
        </View>

        <Text style={[styles.title, { color: text }]}>Verify Your Email</Text>

        <Text style={[styles.description, { color: secondary }]}>
          We've sent a verification link to
        </Text>

        <Text style={[styles.email, { color: text }]}>
          {email || "your email address"}
        </Text>

        <Text
          style={[
            styles.description,
            {
              color: secondary,
              marginTop: 8,
            },
          ]}
        >
          Open the email and tap the verification link to activate your Caffora
          account.
        </Text>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: card,
              borderColor: border,
            },
          ]}
        >
          <Text style={styles.infoIcon}>💡</Text>

          <Text style={[styles.infoText, { color: secondary }]}>
            Don't see the email? Check your spam or promotions folder.
          </Text>
        </View>

        {message ? <Text style={styles.success}>{message}</Text> : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={styles.primaryButton}
          onPress={checkVerification}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryText}>I've Verified My Email</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={resend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#B95E2E" />
          ) : (
            <Text style={styles.secondaryText}>Resend Verification Email</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  back: {
    position: "absolute",
    top: 52,
    left: 24,
    zIndex: 10,
  },

  backText: {
    fontSize: 38,
    fontWeight: "300",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  iconCircle: {
    width: 94,
    height: 94,
    borderRadius: 47,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },

  icon: {
    fontSize: 42,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 12,
    maxWidth: 330,
  },

  email: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 8,
    textAlign: "center",
  },

  infoCard: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
  },

  infoIcon: {
    fontSize: 21,
    marginRight: 11,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },

  success: {
    color: "#4E9364",
    textAlign: "center",
    fontSize: 12,
    marginTop: 18,
  },

  error: {
    color: "#D95445",
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 16,
  },

  primaryButton: {
    width: "100%",
    height: 57,
    borderRadius: 15,
    backgroundColor: "#B95E2E",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  secondaryButton: {
    width: "100%",
    height: 55,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#B95E2E",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  secondaryText: {
    color: "#B95E2E",
    fontSize: 13,
    fontWeight: "800",
  },
});
