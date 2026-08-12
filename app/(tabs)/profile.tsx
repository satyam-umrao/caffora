import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { logout } from "../../src/services/firebase/auth";
import { auth } from "../../src/services/firebase/config";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;

  const name = user?.displayName || "Caffora User";
  const email = user?.email || "No email available";
  const avatar = user?.photoURL || "https://i.pravatar.cc/300?img=12";

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/(auth)/login");
          } catch (error) {
            console.error(error);
            Alert.alert("Logout failed", "Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* ================= HEADER ================= */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: avatar }} style={styles.avatar} />

          <View style={styles.userDetails}>
            <Text style={styles.userName} numberOfLines={1}>
              {name}
            </Text>

            <Text style={styles.userEmail} numberOfLines={1}>
              {email}
            </Text>

            {user?.phoneNumber && (
              <Text style={styles.userPhone}>{user.phoneNumber}</Text>
            )}
          </View>
        </View>

        {/* ================= MENU ================= */}
        <View style={styles.menuCard}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <ProfileItem
              icon="create-outline"
              title="Edit Profile"
              onPress={() => router.push("/profile/edit")}
            />
            <ProfileItem
              icon="calendar-outline"
              title="Booking History"
              onPress={() => router.push("/booking/history")}
            />
            <ProfileItem
              icon="heart-outline"
              title="Saved Cafes"
              onPress={() => router.push("/saved")}
            />
            <ProfileItem
              icon="settings-outline"
              title="Settings"
              onPress={() => router.push("/profile/settings")}
            />
            <ProfileItem
              icon="help-circle-outline"
              title="Help & Support"
              onPress={() => router.push("/profile/help")}
            />
            <ProfileItem
              icon="document-text-outline"
              title="Terms & Conditions"
              onPress={() =>
                Alert.alert(
                  "Terms & Conditions",
                  "Terms & Conditions will be available soon.",
                )
              }
              isLast
            />
          </ScrollView>

          {/* ================= LOGOUT ================= */}
          <View
            style={[
              styles.logoutArea,
              { paddingBottom: Math.max(insets.bottom + 16, 24) },
            ]}
          >
            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutPressed,
              ]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#E0524D" />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* =====================================================
   MENU ITEM COMPONENT
===================================================== */

type ProfileItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  isLast?: boolean;
};

function ProfileItem({
  icon,
  title,
  onPress,
  isLast = false,
}: ProfileItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.profileItem,
        !isLast && styles.profileItemBorder,
        pressed && styles.itemPressed,
      ]}
    >
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color="#68635F" />
        </View>
        <Text style={styles.itemTitle}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#C4C0BD" />
    </Pressable>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#BB5729", // Caffora brand orange
  },
  container: {
    flex: 1,
    backgroundColor: "#BB5729",
  },

  /* ---------- HEADER ---------- */
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 54, // Extra bottom padding for the overlapping card
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "#E8DED7",
  },
  userDetails: {
    flex: 1,
    marginLeft: 18,
    justifyContent: "center",
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  userEmail: {
    color: "#FBE7DA",
    fontSize: 14,
    marginTop: 6,
    fontWeight: "500",
  },
  userPhone: {
    color: "#FBE7DA",
    fontSize: 13,
    marginTop: 4,
    opacity: 0.9,
  },

  /* ---------- WHITE CONTENT CARD ---------- */
  menuCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24, // Pulls the card up over the orange background
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },

  /* ---------- MENU ROW ---------- */
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  profileItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F2EFEA",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F9F8F6",
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: {
    color: "#363331",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 16,
  },
  itemPressed: {
    opacity: 0.6,
  },

  /* ---------- LOGOUT ---------- */
  logoutArea: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F2EFEA",
  },
  logoutButton: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#FFF0F0",
    backgroundColor: "#FFFAFA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutPressed: {
    backgroundColor: "#FFF0F0",
    borderColor: "#FFE0E0",
  },
  logoutText: {
    color: "#E0524D",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
});
