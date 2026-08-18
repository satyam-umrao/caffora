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
    <SafeAreaView className="flex-1 bg-[#FAF7F3]" edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pb-3 pt-2 border-b border-[#EEE5DE] bg-white">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-[#FAF7F3]"
          >
            <Ionicons name="chevron-back" size={22} color="#241C18" />
          </Pressable>

          <Text className="text-base font-extrabold text-[#241C18]">
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
              className="flex-1 rounded-2xl border border-[#EEE5DE] bg-white p-4"
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#FAF3EE]">
                <Ionicons name="mail" size={20} color="#B95E2E" />
              </View>
              <Text className="mt-2.5 text-xs font-extrabold text-[#241C18]">
                Email Us
              </Text>
              <Text className="mt-0.5 text-[11px] text-[#8A7D75]">
                support@caffora.com
              </Text>
            </Pressable>

            <Pressable
              onPress={() => Linking.openURL("https://wa.me/919876543210")}
              className="flex-1 rounded-2xl border border-[#EEE5DE] bg-white p-4"
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#EBF7EE]">
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              </View>
              <Text className="mt-2.5 text-xs font-extrabold text-[#241C18]">
                WhatsApp
              </Text>
              <Text className="mt-0.5 text-[11px] text-[#8A7D75]">
                Instant support chat
              </Text>
            </Pressable>
          </View>

          {/* Frequently Asked Questions */}
          <View className="mt-7">
            <Text className="mb-3 ml-1 text-xs font-bold uppercase tracking-wider text-[#93867E]">
              Frequently Asked Questions
            </Text>

            <View className="rounded-2xl border border-[#EEE5DE] bg-white divide-y divide-[#F2ECE7] overflow-hidden">
              {FAQS.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                return (
                  <View key={`faq-${index}`}>
                    <Pressable
                      onPress={() => toggleFaq(index)}
                      className="flex-row items-center justify-between p-4"
                    >
                      <Text className="flex-1 pr-3 text-xs font-bold text-[#241C18]">
                        {faq.question}
                      </Text>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="#B7ABA3"
                      />
                    </Pressable>
                    {isExpanded && (
                      <View className="px-4 pb-4 pt-1">
                        <Text className="text-xs leading-relaxed text-[#786B63]">
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
          <View className="mt-8 rounded-2xl border border-[#EEE5DE] bg-white p-5">
            <Text className="text-sm font-black text-[#241C18]">
              Send Us a Message
            </Text>
            <Text className="mt-1 text-xs text-[#8A7D75]">
              Have a question or feedback? We'd love to hear from you.
            </Text>

            {/* Category selection */}
            <View className="mt-4">
              <Text className="mb-2 text-[11px] font-bold text-[#302720]">
                Category
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => setSelectedCategory(cat.id)}
                      className={`rounded-xl px-3 py-2 ${
                        active
                          ? "bg-[#B95E2E]"
                          : "border border-[#EEE5DE] bg-[#FAF7F3]"
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-bold ${
                          active ? "text-white" : "text-[#786B63]"
                        }`}
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
              <Text className="mb-1.5 text-[11px] font-bold text-[#302720]">
                Subject
              </Text>
              <View className="h-12 rounded-xl border border-[#EEE5DE] bg-[#FAF7F3] px-3.5 justify-center">
                <TextInput
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Brief summary of your inquiry..."
                  placeholderTextColor="#9E928A"
                  className="text-xs font-semibold text-[#241C18]"
                />
              </View>
            </View>

            {/* Message */}
            <View className="mt-4">
              <Text className="mb-1.5 text-[11px] font-bold text-[#302720]">
                Message Details
              </Text>
              <View className="rounded-xl border border-[#EEE5DE] bg-[#FAF7F3] p-3">
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Describe your issue or suggestions in detail..."
                  placeholderTextColor="#9E928A"
                  multiline
                  numberOfLines={4}
                  className="text-xs text-[#241C18]"
                />
              </View>
            </View>

            {/* Submit */}
            <Pressable
              onPress={handleSubmitTicket}
              disabled={submitting}
              className={`mt-5 h-12 items-center justify-center rounded-xl bg-[#B95E2E] ${
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
