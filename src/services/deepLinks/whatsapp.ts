import { Alert, Linking } from "react-native";

export async function openWhatsApp(
  phone: string,
  message: string = "Hi! I found your café on Caffora and would like to inquire.",
): Promise<void> {
  if (!phone || !phone.trim()) {
    Alert.alert("Contact Unavailable", "This cafe has not provided a WhatsApp contact number.");
    return;
  }

  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const encodedMessage = encodeURIComponent(message);
  const appUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodedMessage}`;
  const webUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  try {
    const canOpen = await Linking.canOpenURL(appUrl);
    if (canOpen) {
      await Linking.openURL(appUrl);
    } else {
      await Linking.openURL(webUrl);
    }
  } catch (error) {
    console.error("WhatsApp error:", error);
    try {
      await Linking.openURL(webUrl);
    } catch {
      Alert.alert("WhatsApp Unavailable", "Could not open WhatsApp.");
    }
  }
}
