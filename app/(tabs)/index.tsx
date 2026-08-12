import { StyleSheet, Text, View, TextInput, FlatList, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// npx expo install @expo/vector-icons
import { Ionicons } from "@expo/vector-icons";
// npx expo install expo-location
import * as Location from "expo-location";
import { useState, useEffect } from "react";

//========= featured cafe data======= 
const featuredCafes = [
  {
    id: "1",
    name: "The No1 Cafe ",
    location: "Barra",
    distance: "0.2 km",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
    tags: ["Coffee", "Tea", "Samosa"],
  },
  {
    id: "2",
    name: "O-2 Cafe",
    location: "Saket Nagar",
    distance: "0.8 km",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    tags: ["Bakery", "Chole Bhature", "Pasta"],
  },
  {
    id: "3",
    name: "Cachoriwala",
    location: "Naubasta",
    distance: "0.8 km",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    tags: ["Cachori", "Bakery", "Chole Bhature"],
  },
];

// =========NearbyCafeData==========
const nearbyCafes = [
  {
    id: "1",
    name: "Third Wave Coffee",
    distance: "0.5 km",
    rating: "4.7",
    status: "Open",
    closingTime: "Closes 11 PM",
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
    features: ["Free WiFi", "Brews"],
  },
  {
    id: "2",
    name: "Fig & Maple",
    distance: "1.2 km",
    rating: "4.5",
    status: "Open",
    closingTime: "Closes 10 PM",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    features: ["Brunch", "Vegan Options"],
  },
];



export default function HomeScreen() {

  const [location, setLocation] = useState("Getting location data ...");
  // const [searchText, setSearchText] = useState("");
  // const [filterVisible, setFilterVisible] = useState(false);
  // const [selectedRating, setSelectedRating] = useState<number | null>(null);
  // const [selectedDistance, setSelectedDistance] = useState<number | null>(null);

  useEffect(() => {
    getLocation();
  }, []);

  // ========= location fetch=======
  const getLocation = async () => {
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setLocation("Location unavailable");
      return;
    }

    const currentLocation =
      await Location.getCurrentPositionAsync({});

    const { latitude, longitude } =
      currentLocation.coords;

    const address =
      await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

    if (address.length > 0) {
      const place = address[0];

      setLocation(
        place.district ||
        place.city ||
        place.region ||
        "Current Location"
      );
    }
  };

  //============ filter cafe==========
  
// home 


  return (
    <View style={styles.container}>
      <Text style={styles.text}>Caffora Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({

  scrollContent: {
    paddingBottom: 20,
  },

  container: {
    flex: 1,
    backgroundColor: "#F5F1EB",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },

  locationIcon: {
    marginLeft: 8,

  },

  locationLabel: {
    fontSize: 14,
    color: "#7c726B",
    marginBottom: 3,
  },

  location: {
    fontSize: 14,
    fontWeight: "600",
    color: "#201A17",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#994418",
    marginHorizontal: 16,
    marginTop: 18,
  },

  //========== Search==============

  searchContainer: {
    height: 48,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E1DB",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 8,
  },

  searchIcon: {
    fontSize: 25,
    color: "#7C726B",
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#201A17",
  },

  filterButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFDBCC",
    justifyContent: "center",
    alignItems: "center",
  },

  filterIcon: {
    fontSize: 20,
    color: "#994418",
  },
  // ===================Featured Section==============

  featuredSection: {
    marginTop: 35,
  },

  featuredHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 18,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#201A17",
  },

  seeAll: {
    fontSize: 14,
    fontWeight: "600",
    color: "#994418",
  },

  featuredList: {
    paddingHorizontal: 16,
  },

  cafeCard: {
    width: 300,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8E1DB",
  },

  imageContainer: {
    height: 180,
    width: "100%",
    position: "relative",
  },

  cafeImage: {
    width: "100%",
    height: "100%",
  },

  bookmarkButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },

  ratingBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#201A17",
  },

  cardContent: {
    padding: 16,
  },

  cafeName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#201A17",
    marginBottom: 6,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },

  cafeLocation: {
    flex: 1,
    fontSize: 16,
    color: "#7C726B",
  },

  tagsRow: {
    flexDirection: "row",
    gap: 8,
  },

  tag: {
    borderWidth: 1,
    borderColor: "#E8E1DB",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  tagText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#55433B",
  },
  // ==================Nearby Section==============
  nearbySection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },

  nearbyList: {
    gap: 16,
    marginTop: 16,
  },

  nearbyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E1DB",
    borderRadius: 12,
    padding: 12,
  },

  nearbyImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },

  nearbyContent: {
    flex: 1,
    marginLeft: 16,
    minWidth: 0,
  },

  nameRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  nearbyName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#201A17",
    marginRight: 8,
  },

  ratingSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F8EBE6",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },

  ratingSmallText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#994418",
  },

  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  distance: {
    fontSize: 14,
    color: "#7C726B",
  },

  dot: {
    fontSize: 10,
    color: "#7C726B",
    marginHorizontal: 6,
  },

  openStatus: {
    fontSize: 14,
    color: "#5C9A6D",
    fontWeight: "500",
  },

  closingTime: {
    flex: 1,
    fontSize: 14,
    color: "#7C726B",
  },

  featuresRow: {
    flexDirection: "row",
    gap: 14,
  },

  featureText: {
    fontSize: 11,
    color: "#55433B",
  },
});

