import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/auth-context";

export default function PersonalDetailsScreen() {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setEmail(user.email ?? "");
    setPhoneNumber(user.phoneNumber ?? "");
  }, [user]);

  const handleFirstNameChange = (value) => {
    setFirstName(value);
    if (error) {
      setError("");
    }
    if (message) {
      setMessage("");
    }
  };

  const handleLastNameChange = (value) => {
    setLastName(value);
    if (error) {
      setError("");
    }
    if (message) {
      setMessage("");
    }
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (error) {
      setError("");
    }
    if (message) {
      setMessage("");
    }
  };

  const handlePhoneChange = (value) => {
    setPhoneNumber(value);
    if (error) {
      setError("");
    }
    if (message) {
      setMessage("");
    }
  };

  const handleUpdate = async () => {
    if (isSaving) {
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setMessage("");

      await updateProfile({
        firstName,
        lastName,
        email,
        phoneNumber,
      });

      setMessage("Details updated successfully.");
    } catch (updateError) {
      const info =
        updateError instanceof Error
          ? updateError.message
          : "Failed to update details.";
      setError(info);
    } finally {
      setIsSaving(false);
    }
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
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#C0B7AF"
            value={firstName}
            onChangeText={handleFirstNameChange}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#C0B7AF"
            value={lastName}
            onChangeText={handleLastNameChange}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#C0B7AF"
            value={email}
            onChangeText={handleEmailChange}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            placeholderTextColor="#C0B7AF"
            value={phoneNumber}
            onChangeText={handlePhoneChange}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {message ? <Text style={styles.messageText}>{message}</Text> : null}

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={handleUpdate}
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>
            {isSaving ? "Saving..." : "Update"}
          </Text>
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
  errorText: {
    fontSize: 13,
    color: "#C03221",
    fontWeight: "500",
    textAlign: "center",
  },
  messageText: {
    fontSize: 13,
    color: "#2E7D32",
    fontWeight: "500",
    textAlign: "center",
  },
});
