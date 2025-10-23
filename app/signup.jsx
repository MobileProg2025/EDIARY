import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/auth-context";

export default function Signup() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup, isAuthenticated, initializing } = useAuth();

  useEffect(() => {
    if (!initializing && isAuthenticated) {
      router.replace("/home");
    }
  }, [initializing, isAuthenticated, router]);

  const handlePhoneChange = (value) => {
    setPhoneNumber(value);
    if (error) {
      setError("");
    }
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (error) {
      setError("");
    }
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (error) {
      setError("");
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    if (error) {
      setError("");
    }
  };

  const handleSignup = async () => {
    if (isSubmitting) {
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }

    if (!trimmedPassword) {
      setError("Password is required.");
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await signup({
        email: trimmedEmail,
        password: trimmedPassword,
        phoneNumber,
      });
      router.replace("/home");
    } catch (signupError) {
      const message =
        signupError instanceof Error
          ? signupError.message
          : "Failed to create account.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/e-diarylogo2.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Enter your mobile number</Text>
          <View style={styles.phoneInputWrapper}>
            <TouchableOpacity style={styles.countryPicker}>
              <Text style={styles.countryCode}>+91</Text>
              <Ionicons name="chevron-down" size={16} color="#161616" />
            </TouchableOpacity>
            <TextInput
              style={styles.phoneInput}
              placeholder="1712345678"
              placeholderTextColor="#9B9B9B"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
            />
          </View>

          <Text style={[styles.label, styles.sectionSpacing]}>
            Enter email address
          </Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-circle" size={20} color="#161616" />
            <TextInput
              style={styles.input}
              placeholder="abc12@gmail.com"
              placeholderTextColor="#9B9B9B"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={handleEmailChange}
            />
          </View>

          <Text style={[styles.label, styles.sectionSpacing]}>
            Enter password
          </Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed" size={20} color="#161616" />
            <TextInput
              style={styles.input}
              placeholder="************"
              placeholderTextColor="#9B9B9B"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={handlePasswordChange}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.trailingIcon}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#161616"
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, styles.sectionSpacing]}>
            Re - enter password
          </Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed" size={20} color="#161616" />
            <TextInput
              style={styles.input}
              placeholder="************"
              placeholderTextColor="#9B9B9B"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword((prev) => !prev)}
              style={styles.trailingIcon}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color="#161616"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, styles.signupButton]}
            onPress={handleSignup}
            activeOpacity={0.85}
            disabled={isSubmitting}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.bottomPrompt}>
            <Text style={styles.promptText}>Already have an account? </Text>
            <Link href="/login" style={styles.promptLink}>
              Log In
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F4F1",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 92,
    height: 92,
  },
  form: {
    backgroundColor: "#F8F4F1",
  },
  label: {
    fontSize: 14,
    color: "#161616",
    marginBottom: 8,
  },
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden",
  },
  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 6,
    height: "100%",
  },
  countryCode: {
    fontSize: 14,
    color: "#161616",
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#161616",
  },
  sectionSpacing: {
    marginTop: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#161616",
    marginLeft: 8,
  },
  trailingIcon: {
    paddingLeft: 8,
  },
  primaryButton: {
    marginTop: 32,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  signupButton: {
    backgroundColor: "#3C3148",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 12,
    textAlign: "center",
    color: "#C03221",
    fontSize: 13,
    fontWeight: "500",
  },
  bottomPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  promptText: {
    fontSize: 14,
    color: "#161616",
  },
  promptLink: {
    fontSize: 14,
    color: "#3C4BF2",
    fontWeight: "600",
  },
});
