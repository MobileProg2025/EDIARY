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
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/auth-context";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, initializing } = useAuth();

  useEffect(() => {
    if (!initializing && isAuthenticated) {
      router.replace("/home");
    }
  }, [initializing, isAuthenticated, router]);

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

  const handleLogin = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email, password });
      setError("");
      router.replace("/home");
    } catch (loginError) {
      const message =
        loginError instanceof Error ? loginError.message : "Failed to log in.";
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
          <Text style={styles.label}>Enter email address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person" size={20} color="#161616" />
            <TextInput
              style={styles.input}
              placeholder="abc12@gmail.com"
              placeholderTextColor="#9B9B9B"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={[styles.label, styles.labelSpacing]}>Enter password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed" size={20} color="#161616" />
            <TextInput
              style={styles.input}
              placeholder="************"
              placeholderTextColor="#9B9B9B"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
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

          <TouchableOpacity style={styles.forgotLink}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, styles.loginButton]}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "Logging in..." : "Log in"}
            </Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.bottomPrompt}>
            <Text style={styles.promptText}>Don&apos;t have an account? </Text>
            <Link href="/signup" style={styles.promptLink}>
              Sign Up
            </Link>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.socialButton}>
            <Image
            source = {require("../assets/images/google.png")}
            style={styles.socialLogo}
            />
            <Text style={styles.socialText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Image
            source = {require("../assets/images/facebook.png")}
            style={styles.socialLogo}
            />
            <Text style={styles.socialText}>Continue with Facebook</Text>
          </TouchableOpacity>
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
    paddingVertical: 45,
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
  labelSpacing: {
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
    paddingVertical: 6,
    elevation: 1,
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
  forgotLink: {
    alignSelf: "flex-end",
    marginTop: 12,
  },
  forgotText: {
    marginTop: 10,
    fontSize: 13,
    color: "#161616",
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: "#000000",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  loginButton: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
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
    marginTop: 16,
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
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D9D9D9",
  },
  dividerText: {
    fontSize: 12,
    color: "#6F6F6F",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingVertical: 15,
    marginBottom: 12,
    gap: 10,
    elevation: 1,
  },
  socialLogo: {
    width: 20,  
    height: 20,
    marginRight: 10, 
    resizeMode: "contain",
  },
  socialText: {
    fontSize: 15,
    color: "#161616",
    fontWeight: "500",
  },
});
