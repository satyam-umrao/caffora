import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth } from "../../src/services/firebase/config";
import { createSupportTicket } from "../../src/services/firebase/notifications";
import { useTheme } from "../../src/context/ThemeContext";

const FAQS = [
  {
    question: "How do I book a table at a café?",
    answer:
      "Find any café in the Home or Search tabs, tap 'Book Table', choose your preferred date, time slot, and party size, and confirm your reservation. It takes less than 30 seconds!",
  },
  {
    question: "Is there any reservation fee?",
    answer:
      "No! Table reservations on Caffora are 100% free of charge. You only pay for what you order at the café.",
  },
  {
    question: "How do I modify or cancel a booking?",
    answer:
      "Go to your Profile tab -> Booking History. Tap on your upcoming booking and press 'Cancel Booking'. You can then make a new reservation for your preferred time.",
  },
  {
    question: "How are café ratings calculated?",
    answer:
      "All ratings come from verified Caffora community members. Every review includes honest feedback on coffee taste, ambiance, seating, and service.",
  },
  {
    question: "Can I save my favorite cafés for later?",
    answer:
      "Yes! Tap the heart icon on any café card or café detail page. Your saved spots will sync across all your devices in the 'Saved' tab.",
  },
];

const CATEGORIES = [
  { id: "booking", label: "Booking Issue" },
  { id: "account", label: "Account & Login" },
  { id: "cafe", label: "Café Information" },
  { id: "technical", label: "App Bug / Other" },
] as const;

export default function HelpSupportScreen() {
  const { colors, isDark } = useTheme();
  const currentUser = auth.currentUser;

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<
    "booking" | "account" | "cafe" | "technical" | "other"
  >("booking");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleFaq = (index: number) => {
    setExpandedFaq((prev) => (prev === index ? null : index));
  };

  const handleEmailSupport = () => {
    Linking.openURL("mailto:support@caffora.com?subject=Caffora Support Inquiry");
  };

  const handleSubmitTicket = async () => {
    if (!currentUser) {
      Alert.alert("Sign In Required", "Please sign in to submit a support request.");
      return;
    }

    if (!subject.trim()) {
      Alert.alert("Missing Subject", "Please provide a subject for your request.");
      return;
    }

    if (!message.trim() || message.trim().length < 10) {
      Alert.alert("Message Too Short", "Please write at least a sentence explaining your inquiry.");
      return;
    }

    try {
      setSubmitting(true);

      await createSupportTicket({
        userId: currentUser.uid,
        userName: currentUser.displayName || "Caffora Member",
        userEmail: currentUser.email || "",
        category: selectedCategory,
        subject: subject.trim(),
        message: message.trim(),
      });

      Alert.alert(
        "Message Sent! 📩",
        "Thank you for contacting us. Our support team will get back to your email within 24 hours.",
        [
          {
            text: "Done",
            onPress: () => {
              setSubject("");
              setMessage("");
            },
          },
        ],
      );
    } catch (err) {
      console.error("Submit ticket error:", err);
      Alert.alert("Error", "Could not send your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.background }}
      className="flex-1"
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          }}
          className="flex-row items-center justify-between px-5 pb-3 pt-2 border-b"
        >
          <Pressable
            onPress={() => router.back()}
            style={{ backgroundColor: colors.cardAlt }}
            className="h-10 w-10 items-center justify-center rounded-full"
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>

          <Text
            style={{ color: colors.text }}
            className="text-base font-extrabold"
          >
            Help & Support
          </Text>

          <View className="w-10" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Quick Contact Cards */}
          <View className="mt-5 flex-row gap-3">
            <Pressable
              onPress={handleEmailSupport}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="flex-1 rounded-2xl border p-4"
            >
              <View
                style={{ backgroundColor: colors.chip }}
                className="h-10 w-10 items-center justify-center rounded-xl"
              >
                <Ionicons name="mail" size={20} color={colors.primary} />
              </View>
              <Text
                style={{ color: colors.text }}
                className="mt-2.5 text-xs font-extrabold"
              >
                Email Us
              </Text>
              <Text style={{ color: colors.muted }} className="mt-0.5 text-[11px]">
                support@caffora.com
              </Text>
            </Pressable>

            <Pressable
              onPress={() => Linking.openURL("https://wa.me/919876543210")}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="flex-1 rounded-2xl border p-4"
            >
              <View
                style={{ backgroundColor: isDark ? "#17341E" : "#EBF7EE" }}
                className="h-10 w-10 items-center justify-center rounded-xl"
              >
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              </View>
              <Text
                style={{ color: colors.text }}
                className="mt-2.5 text-xs font-extrabold"
              >
                WhatsApp
              </Text>
              <Text style={{ color: colors.muted }} className="mt-0.5 text-[11px]">
                Instant support chat
              </Text>
            </Pressable>
          </View>

          {/* Frequently Asked Questions */}
          <View className="mt-7">
            <Text
              style={{ color: colors.muted }}
              className="mb-3 ml-1 text-xs font-bold uppercase tracking-wider"
            >
              Frequently Asked Questions
            </Text>

            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="rounded-2xl border overflow-hidden"
            >
              {FAQS.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                return (
                  <View
                    key={`faq-${index}`}
                    style={
                      index > 0
                        ? { borderTopWidth: 1, borderTopColor: colors.border }
                        : undefined
                    }
                  >
                    <Pressable
                      onPress={() => toggleFaq(index)}
                      className="flex-row items-center justify-between p-4"
                    >
                      <Text
                        style={{ color: colors.text }}
                        className="flex-1 pr-3 text-xs font-bold"
                      >
                        {faq.question}
                      </Text>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={colors.muted}
                      />
                    </Pressable>
                    {isExpanded && (
                      <View className="px-4 pb-4 pt-1">
                        <Text
                          style={{ color: colors.textSecondary }}
                          className="text-xs leading-relaxed"
                        >
                          {faq.answer}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Submit Support Message Form */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="mt-8 rounded-2xl border p-5"
          >
            <Text
              style={{ color: colors.text }}
              className="text-sm font-black"
            >
              Send Us a Message
            </Text>
            <Text style={{ color: colors.muted }} className="mt-1 text-xs">
              {"Have a question or feedback? We'd love to hear from you."}
            </Text>

            {/* Category selection */}
            <View className="mt-4">
              <Text
                style={{ color: colors.text }}
                className="mb-2 text-[11px] font-bold"
              >
                Category
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => setSelectedCategory(cat.id)}
                      style={{
                        backgroundColor: active
                          ? colors.primary
                          : colors.cardAlt,
                        borderColor: active
                          ? colors.primary
                          : colors.border,
                      }}
                      className="rounded-xl border px-3 py-2"
                    >
                      <Text
                        style={{
                          color: active ? "#FFFFFF" : colors.muted,
                        }}
                        className="text-[11px] font-bold"
                      >
                        {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Subject */}
            <View className="mt-4">
              <Text
                style={{ color: colors.text }}
                className="mb-1.5 text-[11px] font-bold"
              >
                Subject
              </Text>
              <View
                style={{
                  backgroundColor: colors.cardAlt,
                  borderColor: colors.border,
                }}
                className="h-12 rounded-xl border px-3.5 justify-center"
              >
                <TextInput
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Brief summary of your inquiry..."
                  placeholderTextColor={colors.muted}
                  style={{ color: colors.text }}
                  className="text-xs font-semibold"
                />
              </View>
            </View>

            {/* Message */}
            <View className="mt-4">
              <Text
                style={{ color: colors.text }}
                className="mb-1.5 text-[11px] font-bold"
              >
                Message Details
              </Text>
              <View
                style={{
                  backgroundColor: colors.cardAlt,
                  borderColor: colors.border,
                }}
                className="rounded-xl border p-3"
              >
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Describe your issue or suggestions in detail..."
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={4}
                  style={{ color: colors.text }}
                  className="text-xs"
                />
              </View>
            </View>

            {/* Submit */}
            <Pressable
              onPress={handleSubmitTicket}
              disabled={submitting}
              style={{ backgroundColor: colors.primary }}
              className={`mt-5 h-12 items-center justify-center rounded-xl ${
                submitting ? "opacity-70" : ""
              }`}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-xs font-extrabold text-white">
                  Send Message
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
