import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PostScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Create a new entry</Text>
        <Text style={styles.description}>
          Capture today&apos;s thoughts, feelings, or highlights. We&apos;ll help
          you keep everything organised.
        </Text>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Start writing</Text>
        </TouchableOpacity>
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
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#161616",
  },
  description: {
    fontSize: 16,
    color: "#514C48",
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: "#FFA36C",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
