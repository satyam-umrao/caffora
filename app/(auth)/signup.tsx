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
import { signUp } from "../../src/services/firebase/auth";

export default function SignupScreen() {
  const { colors, isDark } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bg = colors.background;
  const text = colors.text;
  const secondary = colors.textSecondary;
  const primary = colors.primary;
  const inputBg = colors.inputBackground;
  const border = colors.border;

  const handleSignup = async () => {
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const credential = await signUp(name, email, password);

      router.replace({
        pathname: "/verify-email",
        params: {
          email: credential.user.email ?? email,
        },
      });
    } catch (err: any) {
      switch (err?.code) {
        case "auth/email-already-in-use":
          setError("An account already exists with this email.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email.");
          break;

        case "auth/weak-password":
          setError("Please choose a stronger password.");
          break;

        default:
          setError("Unable to create your account.");
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
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
        >
          <Text style={[styles.backText, { color: text }]}>‹</Text>
        </Pressable>

        <Text style={[styles.title, { color: text }]}>Customer Sign Up ☕</Text>

        <Text style={[styles.subtitle, { color: secondary }]}>
          Join Caffora and discover your next favorite cafe.
        </Text>

        <View style={styles.form}>
          <Text style={[styles.label, { color: text }]}>Full name</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
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

          <Text style={[styles.label, { color: text }]}>Email address</Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
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

          <Text style={[styles.label, { color: text }]}>Password</Text>

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
              placeholder="Create a password"
              placeholderTextColor={isDark ? "#71635B" : "#AAA19B"}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              style={[styles.passwordInput, { color: text }]}
            />

            <Pressable onPress={() => setShowPassword((v) => !v)}>
              <Text style={[styles.show, { color: primary }]}>{showPassword ? "Hide" : "Show"}</Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.button, { backgroundColor: primary }]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Create Account </Text>
            )}
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push("/(auth)/owner-signup")}
          style={{
            marginTop: 22,
            paddingVertical: 13,
            paddingHorizontal: 16,
            borderRadius: 16,
            backgroundColor: colors.chip,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "700" }}>
            Are you a café owner? Register your café here →
          </Text>
        </Pressable>

        <View style={styles.loginRow}>
          <Text style={[styles.loginLabel, { color: secondary }]}>
            Already have an account?{" "}
          </Text>

          <Pressable onPress={() => router.replace("/login")}>
            <Text style={[styles.login, { color: primary }]}>Login </Text>
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
    paddingHorizontal: 28,
    paddingTop: 110,
    paddingBottom: 40,
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

  title: {
    fontSize: 29,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 330,
  },

  form: {
    marginTop: 38,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 9,
  },

  input: {
    height: 57,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: 18,
  },

  passwordBox: {
    height: 57,
    borderWidth: 1,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
  },

  show: {
    color: "#B95E2E",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 15,
  },

  error: {
    color: "#D95445",
    fontSize: 12,
    marginTop: 12,
  },

  button: {
    height: 57,
    borderRadius: 15,
    backgroundColor: "#B95E2E",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 23,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 45,
  },

  loginLabel: {
    fontSize: 13,
  },

  login: {
    color: "#B95E2E",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 5,
  },
});
