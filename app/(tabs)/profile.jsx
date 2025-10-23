import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.description}>
          Manage your account details and preferences. Profile editing tools are
          coming soon.
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
