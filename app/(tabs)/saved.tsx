import { StyleSheet, Text, View } from "react-native";

export default function SavedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Saved Cafes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#17120F",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#FFF8F2",
    fontSize: 24,
    fontWeight: "800",
  },
});
