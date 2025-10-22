import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.description}>
          Configure notifications, privacy, and other preferences here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F4F1",
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 12,
  },
  title: {
    fontSize: 28,
    color: "#161616",
    fontWeight: "700",
  },
  description: {
    fontSize: 16,
    color: "#514C48",
    lineHeight: 22,
  },
});
