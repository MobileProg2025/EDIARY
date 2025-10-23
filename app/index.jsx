import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 1200);

    return () => clearTimeout(timer);
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require("../assets/images/e-diarylogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        {showContent && (
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <Text style={styles.tagline}>Your story starts here</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.loginButton]}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.signupButton]}
                onPress={() => router.push("/signup")}
              >
                <Text style={styles.buttonText}>SignUp</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: "#F8F4F1",
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: 160,
    height: 160,
  },
  tagline: {
    marginTop: 16,
    fontSize: 16,
    color: "#161616",
  },
  actions: {
    width: "100%",
    marginTop: 48,
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "#000000",
  },
  signupButton: {
    backgroundColor: "#3C3148",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
