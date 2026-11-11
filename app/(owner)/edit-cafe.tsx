import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../src/context/ThemeContext";
import {
  deleteCafe,
  getCafeById,
  updateCafe,
} from "../../src/services/firebase/cafes";
import { auth } from "../../src/services/firebase/config";
import { uploadCafeImage } from "../../src/services/firebase/storage";
import type { OpeningHours } from "../../src/types/cafe";

const CATEGORIES = [
  "Specialty Coffee",
  "Artisan Bakery",
  "Workspace / Study",
  "Cozy Roastery",
  "Bistro & Brunch",
  "Dessert Parlour",
  "Casual Dining",
];

const PRICE_RANGES = ["₹", "₹₹", "₹₹₹", "₹₹₹₹"];

const SEATING_OPTIONS = [
  "Indoor",
  "Outdoor / Patio",
  "Window View",
  "Quiet Corner",
  "Balcony",
  "Bar Counter",
];

const AMENITIES = [
  "Free WiFi",
  "Power Outlets",
  "Outdoor Seating",
  "Pet Friendly",
  "Air Conditioning",
  "Quiet Zone",
  "Valet Parking",
  "Vegan Options",
  "Restroom",
  "Wheelchair Accessible",
];

const ATMOSPHERES = [
  "Cozy",
  "Modern",
  "Rustic",
  "Minimalist",
  "Romantic",
  "Lively",
  "Vibrant",
  "Quiet",
  "Vintage",
];

const DAYS_OF_WEEK: (keyof OpeningHours)[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function EditCafeScreen() {
  const { colors, isDark } = useTheme();
  const { cafeId } = useLocalSearchParams<{ cafeId: string }>();

  const [loadingInitial, setLoadingInitial] = useState(true);

  // Basic Details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priceRange, setPriceRange] = useState("₹₹");

  // Location & Contact
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  // Capacity & Seating
  const [seatingCapacity, setSeatingCapacity] = useState("40");
  const [selectedSeating, setSelectedSeating] = useState<string[]>([]);

  // Amenities & Atmosphere
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedAtmosphere, setSelectedAtmosphere] = useState<string[]>([]);

  // Schedule
  const [schedule, setSchedule] = useState<
    Record<
      keyof OpeningHours,
      { enabled: boolean; openTime: string; closeTime: string }
    >
  >({
    monday: { enabled: true, openTime: "08:00 AM", closeTime: "10:00 PM" },
    tuesday: { enabled: true, openTime: "08:00 AM", closeTime: "10:00 PM" },
    wednesday: { enabled: true, openTime: "08:00 AM", closeTime: "10:00 PM" },
    thursday: { enabled: true, openTime: "08:00 AM", closeTime: "10:00 PM" },
    friday: { enabled: true, openTime: "08:00 AM", closeTime: "11:00 PM" },
    saturday: { enabled: true, openTime: "09:00 AM", closeTime: "11:00 PM" },
    sunday: { enabled: true, openTime: "09:00 AM", closeTime: "10:00 PM" },
  });

  // Photos (existing remote URLs and new local URIs)
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newImageUris, setNewImageUris] = useState<string[]>([]);

  // Status
  const [isOpen, setIsOpen] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Loading & Progress
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadCafe() {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Authentication Required", "Please log in.");
        router.replace("/(auth)/login");
        return;
      }

      if (!cafeId) {
        Alert.alert("Error", "Missing Café ID");
        router.back();
        return;
      }

      try {
        const cafe = await getCafeById(cafeId);
        if (!cafe) {
          Alert.alert("Not Found", "This café could not be found.");
          router.back();
          return;
        }

        if (cafe.ownerId !== user.uid) {
          Alert.alert(
            "Access Denied",
            "You do not have permission to manage this café.",
          );
          router.back();
          return;
        }

        // Prepopulate
        setName(cafe.name || "");
        setDescription(cafe.description || "");
        setCategory(cafe.category || CATEGORIES[0]);
        setPriceRange(cafe.priceRange || "₹₹");
        setLocation(cafe.location || "");
        setAddress(cafe.address || "");
        setCity(cafe.city || "Bengaluru");
        setPhone(cafe.phone || "");
        setWebsite(cafe.website || "");
        setSeatingCapacity(String(cafe.seatingCapacity || 40));
        setSelectedSeating(cafe.availableSeating || ["Indoor"]);
        setSelectedAmenities(cafe.amenities || []);
        setSelectedAtmosphere(cafe.atmosphere || []);
        setIsOpen(cafe.isOpen !== false);
        setIsActive(cafe.isActive !== false);

        // Prepopulate photos
        const photos = cafe.images && cafe.images.length > 0 ? cafe.images : cafe.image ? [cafe.image] : [];
        setExistingPhotos(photos);

        // Parse Opening Hours
        if (cafe.openingHours) {
          setSchedule((prevSchedule) => {
            const parsedSchedule = { ...prevSchedule };
            DAYS_OF_WEEK.forEach((d) => {
              const val = cafe.openingHours[d];
              if (val && val !== "Closed" && val.includes("-")) {
                const [o, c] = val.split("-").map((s) => s.trim());
                parsedSchedule[d] = {
                  enabled: true,
                  openTime: o || "08:00 AM",
                  closeTime: c || "10:00 PM",
                };
              } else if (val === "Closed") {
                parsedSchedule[d] = {
                  enabled: false,
                  openTime: "08:00 AM",
                  closeTime: "10:00 PM",
                };
              }
            });
            return parsedSchedule;
          });
        }
      } catch (err) {
        console.error("Load cafe error:", err);
        Alert.alert("Error", "Could not load café details.");
        router.back();
      } finally {
        setLoadingInitial(false);
      }
    }

    loadCafe();
  }, [cafeId]);

  const handlePickImages = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to upload café photos.",
        );
        return;
      }

      const totalExisting = existingPhotos.length + newImageUris.length;
      if (totalExisting >= 8) {
        Alert.alert("Maximum Limit", "You can upload at most 8 photos per café.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: 8 - totalExisting,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uris = result.assets.map((asset) => asset.uri);
        setNewImageUris((prev) => [...prev, ...uris]);
      }
    } catch (err) {
      console.error("Image pick error:", err);
      Alert.alert("Error", "Could not access photos library.");
    }
  };

  const handleRemoveExistingPhoto = (indexToRemove: number) => {
    setExistingPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveNewPhoto = (indexToRemove: number) => {
    setNewImageUris((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const toggleItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  const copyWeekdayHours = () => {
    const mondayVal = schedule.monday;
    setSchedule((prev) => ({
      ...prev,
      tuesday: { ...mondayVal },
      wednesday: { ...mondayVal },
      thursday: { ...mondayVal },
      friday: { ...mondayVal },
    }));
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Café Listing",
      `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Listing",
          style: "destructive",
          onPress: async () => {
            const user = auth.currentUser;
            if (!user || !cafeId) return;
            try {
              setSubmitting(true);
              await deleteCafe(cafeId, user.uid);
              Alert.alert("Deleted", "Your café listing has been deleted.");
              router.replace("/(owner)/my-cafes");
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Failed to delete café.");
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user || !cafeId) {
      Alert.alert("Authentication Error", "You must be logged in as a café owner.");
      return;
    }

    // Validation
    if (!name.trim()) {
      setErrorMsg("Please enter the café name.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Please enter a description for your café.");
      return;
    }
    if (!location.trim()) {
      setErrorMsg("Please enter the area/neighborhood.");
      return;
    }
    if (!address.trim()) {
      setErrorMsg("Please enter the complete street address.");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("Please enter a contact phone number.");
      return;
    }
    if (!seatingCapacity || isNaN(Number(seatingCapacity)) || Number(seatingCapacity) <= 0) {
      setErrorMsg("Please enter a valid seating capacity.");
      return;
    }
    if (existingPhotos.length === 0 && newImageUris.length === 0) {
      setErrorMsg("Please provide at least one photo for your café.");
      return;
    }

    setErrorMsg("");
    setSubmitting(true);

    try {
      // 1. Upload new photos
      const uploadedUrls: string[] = [];
      for (let i = 0; i < newImageUris.length; i++) {
        setUploadProgress(`Uploading photo ${i + 1} of ${newImageUris.length}...`);
        const url = await uploadCafeImage(user.uid, newImageUris[i], i);
        uploadedUrls.push(url);
      }

      const allPhotos = [...existingPhotos, ...uploadedUrls];

      setUploadProgress("Updating café in Firestore...");

      // 2. Build opening hours
      const openingHoursFormatted: OpeningHours = {};
      DAYS_OF_WEEK.forEach((day) => {
        const d = schedule[day];
        if (d.enabled) {
          openingHoursFormatted[day] = `${d.openTime} - ${d.closeTime}`;
        } else {
          openingHoursFormatted[day] = "Closed";
        }
      });

      // 3. Update café document
      await updateCafe(
        cafeId,
        {
          name: name.trim(),
          description: description.trim(),
          location: location.trim(),
          address: address.trim(),
          city: city.trim(),
          priceRange,
          category,
          image: allPhotos[0] || "",
          images: allPhotos,
          phone: phone.trim(),
          website: website.trim(),
          openingHours: openingHoursFormatted,
          amenities: selectedAmenities,
          atmosphere: selectedAtmosphere,
          seatingCapacity: Number(seatingCapacity),
          availableSeating: selectedSeating,
          isOpen,
          isActive,
        },
        user.uid,
      );

      Alert.alert(
        "Café Updated! 🎉",
        `Changes to "${name.trim()}" have been saved.`,
        [
          {
            text: "View My Cafés",
            onPress: () => router.replace("/(owner)/my-cafes"),
          },
        ],
      );
    } catch (err: any) {
      console.error("EditCafe error:", err);
      setErrorMsg(err?.message || "Failed to update café. Please try again.");
    } finally {
      setSubmitting(false);
      setUploadProgress("");
    }
  };

  if (loadingInitial) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>
          Loading café details...
        </Text>
      </View>
    );
  }

  const allPhotosCount = existingPhotos.length + newImageUris.length;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header Bar */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Edit Café Listing
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
            Update pricing, seating & hours
          </Text>
        </View>
        <Pressable onPress={handleDelete} style={styles.deleteHeaderBtn} hitSlop={6}>
          <Ionicons name="trash-outline" size={20} color="#D95445" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Error Banner */}
          {!!errorMsg && (
            <View
              style={[
                styles.errorCard,
                {
                  backgroundColor: isDark ? "#381816" : "#FFF5F5",
                  borderColor: isDark ? "#5C2622" : "#F6D7D5",
                },
              ]}
            >
              <Ionicons name="alert-circle" size={18} color="#D95445" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* SECTION 1: PHOTOS */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="images-outline" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Café Photos ({allPhotosCount}/8)
              </Text>
            </View>

            {/* Photos Scroll */}
            {allPhotosCount > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.photosScroll}
              >
                {/* Existing Remote Photos */}
                {existingPhotos.map((url, idx) => (
                  <View key={`remote-${idx}`} style={styles.thumbnailWrapper}>
                    <Image source={{ uri: url }} style={styles.thumbnailImage} />
                    {idx === 0 && (
                      <View style={styles.coverBadge}>
                        <Text style={styles.coverBadgeText}>Cover</Text>
                      </View>
                    )}
                    <Pressable
                      onPress={() => handleRemoveExistingPhoto(idx)}
                      style={styles.removeImageBtn}
                    >
                      <Ionicons name="close" size={14} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}

                {/* Newly Picked Local Photos */}
                {newImageUris.map((uri, idx) => (
                  <View key={`local-${idx}`} style={styles.thumbnailWrapper}>
                    <Image source={{ uri }} style={styles.thumbnailImage} />
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>New</Text>
                    </View>
                    <Pressable
                      onPress={() => handleRemoveNewPhoto(idx)}
                      style={styles.removeImageBtn}
                    >
                      <Ionicons name="close" size={14} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}

            <Pressable
              onPress={handlePickImages}
              disabled={submitting}
              style={[
                styles.pickButton,
                {
                  backgroundColor: colors.chip,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="camera-outline" size={20} color={colors.primary} />
              <Text style={[styles.pickButtonText, { color: colors.primary }]}>
                {allPhotosCount > 0 ? "Add More Photos" : "Select Photos"}
              </Text>
            </Pressable>
          </View>

          {/* SECTION 2: BASIC DETAILS */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="storefront-outline" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Basic Information
              </Text>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Café Name *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Description *</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.chip,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? "#FFFFFF" : colors.text },
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Price Range</Text>
            <View style={styles.priceRow}>
              {PRICE_RANGES.map((pr) => {
                const isSelected = priceRange === pr;
                return (
                  <Pressable
                    key={pr}
                    onPress={() => setPriceRange(pr)}
                    style={[
                      styles.priceButton,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.chip,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priceText,
                        { color: isSelected ? "#FFFFFF" : colors.text },
                      ]}
                    >
                      {pr}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* SECTION 3: LOCATION & CONTACT */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Location & Contact
              </Text>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Area / Neighborhood *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              value={location}
              onChangeText={setLocation}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Complete Street Address *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              value={address}
              onChangeText={setAddress}
            />

            <View style={styles.formRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>City *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    },
                  ]}
                  value={city}
                  onChangeText={setCity}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Contact Phone *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    },
                  ]}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Website / Social</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              value={website}
              onChangeText={setWebsite}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          {/* SECTION 4: CAPACITY & SEATING */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="people-outline" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Seating & Capacity
              </Text>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Total Seating Capacity (Seats) *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              value={seatingCapacity}
              onChangeText={setSeatingCapacity}
              keyboardType="number-pad"
            />

            <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>
              Available Seating Areas
            </Text>
            <View style={styles.wrapContainer}>
              {SEATING_OPTIONS.map((opt) => {
                const selected = selectedSeating.includes(opt);
                return (
                  <Pressable
                    key={opt}
                    onPress={() => toggleItem(selectedSeating, opt, setSelectedSeating)}
                    style={[
                      styles.toggleBadge,
                      {
                        backgroundColor: selected ? colors.primary : colors.chip,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={selected ? "checkmark-circle" : "add-circle-outline"}
                      size={15}
                      color={selected ? "#FFFFFF" : colors.muted}
                    />
                    <Text
                      style={[
                        styles.toggleBadgeText,
                        { color: selected ? "#FFFFFF" : colors.text },
                      ]}
                    >
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* SECTION 5: WEEKLY SCHEDULE */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.sectionHeaderBetween}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Weekly Opening Hours
                </Text>
              </View>
              <Pressable onPress={copyWeekdayHours} hitSlop={6}>
                <Text style={[styles.quickActionText, { color: colors.primary }]}>
                  Copy Mon to Weekdays
                </Text>
              </Pressable>
            </View>

            {DAYS_OF_WEEK.map((day) => {
              const current = schedule[day];
              const capDay = day.charAt(0).toUpperCase() + day.slice(1);
              return (
                <View
                  key={day}
                  style={[
                    styles.dayRow,
                    { borderBottomColor: colors.border },
                  ]}
                >
                  <View style={styles.dayNameCol}>
                    <Text style={[styles.dayLabel, { color: colors.text }]}>
                      {capDay}
                    </Text>
                    <View style={styles.switchWrapper}>
                      <Switch
                        value={current.enabled}
                        onValueChange={(val) =>
                          setSchedule((prev) => ({
                            ...prev,
                            [day]: { ...prev[day], enabled: val },
                          }))
                        }
                        trackColor={{
                          false: isDark ? "#3A3532" : "#E2DCD5",
                          true: colors.primary,
                        }}
                        thumbColor="#FFFFFF"
                      />
                      <Text
                        style={[
                          styles.openStatusText,
                          { color: current.enabled ? colors.primary : colors.muted },
                        ]}
                      >
                        {current.enabled ? "Open" : "Closed"}
                      </Text>
                    </View>
                  </View>

                  {current.enabled ? (
                    <View style={styles.hoursInputs}>
                      <TextInput
                        style={[
                          styles.timeInput,
                          {
                            backgroundColor: colors.inputBackground,
                            borderColor: colors.inputBorder,
                            color: colors.text,
                          },
                        ]}
                        value={current.openTime}
                        onChangeText={(txt) =>
                          setSchedule((prev) => ({
                            ...prev,
                            [day]: { ...prev[day], openTime: txt },
                          }))
                        }
                        placeholder="08:00 AM"
                        placeholderTextColor={colors.textMuted}
                      />
                      <Text style={[styles.hyphen, { color: colors.muted }]}>-</Text>
                      <TextInput
                        style={[
                          styles.timeInput,
                          {
                            backgroundColor: colors.inputBackground,
                            borderColor: colors.inputBorder,
                            color: colors.text,
                          },
                        ]}
                        value={current.closeTime}
                        onChangeText={(txt) =>
                          setSchedule((prev) => ({
                            ...prev,
                            [day]: { ...prev[day], closeTime: txt },
                          }))
                        }
                        placeholder="10:00 PM"
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>
                  ) : (
                    <Text style={[styles.closedText, { color: colors.muted }]}>
                      Closed for the day
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* SECTION 6: AMENITIES & ATMOSPHERE */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Amenities & Atmosphere
              </Text>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Amenities</Text>
            <View style={styles.wrapContainer}>
              {AMENITIES.map((item) => {
                const selected = selectedAmenities.includes(item);
                return (
                  <Pressable
                    key={item}
                    onPress={() => toggleItem(selectedAmenities, item, setSelectedAmenities)}
                    style={[
                      styles.toggleBadge,
                      {
                        backgroundColor: selected ? colors.primary : colors.chip,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={selected ? "checkmark-circle" : "add-circle-outline"}
                      size={14}
                      color={selected ? "#FFFFFF" : colors.muted}
                    />
                    <Text
                      style={[
                        styles.toggleBadgeText,
                        { color: selected ? "#FFFFFF" : colors.text },
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.inputLabel, { color: colors.text, marginTop: 14 }]}>
              Atmosphere & Vibe
            </Text>
            <View style={styles.wrapContainer}>
              {ATMOSPHERES.map((item) => {
                const selected = selectedAtmosphere.includes(item);
                return (
                  <Pressable
                    key={item}
                    onPress={() => toggleItem(selectedAtmosphere, item, setSelectedAtmosphere)}
                    style={[
                      styles.toggleBadge,
                      {
                        backgroundColor: selected ? colors.primary : colors.chip,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={selected ? "checkmark-circle" : "add-circle-outline"}
                      size={14}
                      color={selected ? "#FFFFFF" : colors.muted}
                    />
                    <Text
                      style={[
                        styles.toggleBadgeText,
                        { color: selected ? "#FFFFFF" : colors.text },
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* SECTION 7: STATUS & VISIBILITY */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="radio-button-on-outline" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Live Status & Visibility
              </Text>
            </View>

            <View style={styles.statusToggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleTitle, { color: colors.text }]}>
                  Open Right Now
                </Text>
                <Text style={[styles.helperText, { color: colors.muted }]}>
                  Manual toggle to mark open or closed in real time.
                </Text>
              </View>
              <Switch
                value={isOpen}
                onValueChange={setIsOpen}
                trackColor={{
                  false: isDark ? "#3A3532" : "#E2DCD5",
                  true: colors.primary,
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.statusToggleRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 12, paddingTop: 12 }]}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleTitle, { color: colors.text }]}>
                  Listing Active
                </Text>
                <Text style={[styles.helperText, { color: colors.muted }]}>
                  Deactivating conceals your café from discovery while preserving all data.
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{
                  false: isDark ? "#3A3532" : "#E2DCD5",
                  true: colors.primary,
                }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Upload Progress Bar if submitting */}
          {submitting && (
            <View
              style={[
                styles.progressCard,
                {
                  backgroundColor: isDark ? "#2A2018" : "#FFF7ED",
                  borderColor: colors.primary,
                },
              ]}
            >
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.progressText, { color: colors.primary }]}>
                {uploadProgress}
              </Text>
            </View>
          )}

          {/* SUBMIT BUTTON */}
          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={({ pressed }) => [
              styles.submitButton,
              {
                backgroundColor: colors.primary,
                opacity: submitting ? 0.6 : pressed ? 0.9 : 1,
              },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Save Changes</Text>
              </>
            )}
          </Pressable>

          {/* DELETE BUTTON */}
          <Pressable
            onPress={handleDelete}
            disabled={submitting}
            style={({ pressed }) => [
              styles.deleteButton,
              {
                borderColor: colors.border,
                opacity: submitting ? 0.6 : pressed ? 0.8 : 1,
              },
            ]}
          >
            <Ionicons name="trash-outline" size={18} color="#D95445" />
            <Text style={styles.deleteButtonText}>Delete Listing</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 14,
    padding: 4,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteHeaderBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: "#D95445",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionHeaderBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  helperText: {
    fontSize: 12,
    lineHeight: 17,
  },
  photosScroll: {
    marginTop: 12,
    marginBottom: 12,
  },
  thumbnailWrapper: {
    position: "relative",
    marginRight: 12,
  },
  thumbnailImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  coverBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coverBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  newBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "#16A34A",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  removeImageBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.65)",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  pickButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    marginTop: 10,
    gap: 8,
  },
  pickButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  textArea: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  chipRow: {
    flexDirection: "row",
    marginVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  priceButton: {
    flex: 1,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
  },
  priceText: {
    fontSize: 15,
    fontWeight: "700",
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  wrapContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  toggleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  toggleBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dayNameCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: 140,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: "600",
    width: 50,
  },
  switchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  openStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  hoursInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeInput: {
    width: 82,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  hyphen: {
    fontSize: 14,
    fontWeight: "600",
  },
  closedText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  statusToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleInfo: {
    flex: 1,
    paddingRight: 16,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  progressCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "600",
  },
  submitButton: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  deleteButton: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  deleteButtonText: {
    color: "#D95445",
    fontSize: 14,
    fontWeight: "600",
  },
});
