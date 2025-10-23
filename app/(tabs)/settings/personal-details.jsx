import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

export default function PersonalDetailsScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("Ken Louie");
  const [lastName, setLastName] = useState("Neri");
  const [email, setEmail] = useState("nerikenlouie@gmail.com");
  const [phoneNumber, setPhoneNumber] = useState("09057361308");

  const handleUpdate = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenLabel}>Settings</Text>
        <Text style={styles.title}>Personal Details</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#C0B7AF"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#C0B7AF"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#C0B7AF"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={styles.input}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            placeholderTextColor="#C0B7AF"
          />
        </View>

        <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F4F1",
  },
  content: {
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 28,
    gap: 20,
  },
  screenLabel: {
    fontSize: 14,
    letterSpacing: 1.2,
    color: "#7E7874",
    textTransform: "uppercase",
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    color: "#3C3148",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: "#3C3148",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E6DAD1",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#3C3148",
    backgroundColor: "#FEFEFC",
  },
  button: {
    marginTop: 16,
    backgroundColor: "#FFA36C",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFA36C",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
