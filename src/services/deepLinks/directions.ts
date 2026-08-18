import { Alert, Linking, Platform } from "react-native";

export async function openDirections(
  latitude: number,
  longitude: number,
  label: string = "Cafe",
): Promise<void> {
  if (!latitude || !longitude) {
    Alert.alert(
      "Location Unavailable",
      "Exact coordinates are not available for this cafe.",
    );
    return;
  }

  const cleanLabel = encodeURIComponent(label);
  const scheme = Platform.select({
    ios: `maps:0,0?q=${cleanLabel}@${latitude},${longitude}`,
    android: `geo:0,0?q=${latitude},${longitude}(${cleanLabel})`,
  });

  const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  try {
    if (scheme && (await Linking.canOpenURL(scheme))) {
      await Linking.openURL(scheme);
    } else {
      await Linking.openURL(webUrl);
    }
  } catch (error) {
    console.error("Failed to open directions:", error);
    try {
      await Linking.openURL(webUrl);
    } catch {
      Alert.alert(
        "Could Not Open Maps",
        "Please check if you have a maps application installed.",
      );
    }
  }
}
