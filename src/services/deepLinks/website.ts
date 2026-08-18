import { Alert, Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";

export async function openWebsite(url: string): Promise<void> {
  if (!url || !url.trim()) {
    Alert.alert("Website Unavailable", "No website link is available.");
    return;
  }

  let formattedUrl = url.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`;
  }

  try {
    await WebBrowser.openBrowserAsync(formattedUrl);
  } catch (error) {
    console.error("WebBrowser error, falling back to Linking:", error);
    try {
      await Linking.openURL(formattedUrl);
    } catch {
      Alert.alert("Link Failed", "Could not open the requested website.");
    }
  }
}
