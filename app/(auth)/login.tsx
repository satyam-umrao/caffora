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
  useColorScheme,
  View,
} from "react-native";

import {
  checkEmailVerification,
  signIn,
} from "../../src/services/firebase/auth";

export default function LoginScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bg = "#FAF8F5";
  const text = "#1D1815";
  const secondary = "#776B64";
  const inputBg = "#FFFFFF";
  const border = "#E5DFDA";

  const handleLogin = async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const credential = await signIn(email.trim().toLowerCase(), password);

      const verified = await checkEmailVerification();

      if (!verified) {
        router.replace({
          pathname: "/verify-email",
          params: {
            email: credential.user.email ?? email,
          },
        });

        return;
      }

      router.replace("/(tabs)");
    } catch (err: any) {
      switch (err?.code) {
        case "auth/invalid-credential":
          setError("Incorrect email or password.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email.");
          break;

        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later.");
          break;

        default:
          setError("Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => router.replace("/(auth)/onboarding")}
          style={styles.back}
        >
          <Text style={[styles.backText, { color: text }]}>‹</Text>
        </Pressable>

        <View style={styles.content}>
          <Text style={[styles.title, { color: text }]}>Welcome Back! 👋</Text>

          <Text style={[styles.subtitle, { color: secondary }]}>
            Login to continue
          </Text>

          <View style={styles.form}>
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
                placeholder="Password"
                placeholderTextColor={isDark ? "#71635B" : "#AAA19B"}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={[styles.passwordInput, { color: text }]}
              />

              <Pressable onPress={() => setShowPassword((v) => !v)}>
                <Text style={styles.show}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>

            <Pressable onPress={() => router.push("/forgot-password")}>
              <Text style={styles.forgot}>Forgot password?</Text>
            </Pressable>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Continue </Text>
              )}
            </Pressable>
          </View>

          <View style={styles.signupRow}>
            <Text style={[styles.signupLabel, { color: secondary }]}>
              Don't have an account?
            </Text>

            <Pressable onPress={() => router.replace("/signup")}>
              <Text style={styles.signup}>Sign Up </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    paddingHorizontal: 28,
    paddingTop: 145,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 14,
    marginTop: 10,
  },

  form: {
    marginTop: 42,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 9,
  },

  input: {
    height: 58,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: 20,
  },

  passwordBox: {
    height: 58,
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
    color: "#B95E2E",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 15,
  },

  forgot: {
    color: "#B95E2E",
    textAlign: "right",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 11,
  },

  error: {
    color: "#D95445",
    fontSize: 12,
    marginTop: 12,
  },

  button: {
    height: 58,
    borderRadius: 15,
    backgroundColor: "#B95E2E",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 23,
  },

  line: {
    flex: 1,
    height: 1,
  },

  or: {
    marginHorizontal: 14,
    fontSize: 12,
  },

  socialButton: {
    height: 56,
    borderWidth: 1,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  google: {
    fontSize: 20,
    fontWeight: "800",
    marginRight: 10,
  },

  socialText: {
    fontSize: 13,
    fontWeight: "700",
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 65,
  },

  signupLabel: {
    fontSize: 13,
  },

  signup: {
    color: "#B95E2E",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 5,
  },
});
