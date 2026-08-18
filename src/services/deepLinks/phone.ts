import { Alert, Linking } from "react-native";

export async function makePhoneCall(phone: string): Promise<void> {
  if (!phone || !phone.trim()) {
    Alert.alert("Phone Number Unavailable", "This cafe has not provided a contact number.");
    return;
  }

  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  const url = `tel:${cleanPhone}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Unable to Call", "Calling is not supported on this device.");
    }
  } catch (error) {
    console.error("Phone call error:", error);
    Alert.alert("Call Failed", "Could not initiate the phone call.");
  }
}
