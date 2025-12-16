import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  ScrollView,
  StyleSheet,

  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../context/auth-context";
import CustomAlertModal from "../../../components/CustomAlertModal";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState("light");
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);
      await logout();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
      setLogoutModalVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Account</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/settings/personal-details")}
              style={[styles.row, styles.choiceRow]}
            >
              <Ionicons name="person" size={20} color="#FFA36C" />
              <Text style={styles.cardPrimary}>Personal Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Permission</Text>
            <View style={styles.row}>
              <Ionicons
                name="notifications"
                size={20}
                color="#FFA36C"
                style={styles.leadingIcon}
              />
              <View style={styles.textGroup}>
                <Text style={styles.cardPrimary}>Notifications</Text>
                <Text style={styles.cardSecondary}>Remind me at 9 PM</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#D7CBC2", true: "#FFE0CC" }}
                thumbColor={notificationsEnabled ? "#FFA36C" : "#F4F3F4"}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Security</Text>
            <View style={styles.row}>
              <Ionicons name="shield-checkmark" size={20} color="#FFA36C" />
              <Text style={styles.cardPrimary}>Security Pin</Text>
              <Text style={styles.statusText}>Not enrolled</Text>
            </View>
          </View>
        </View>

        {/*<View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Theme</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedTheme("light")}
              style={[styles.row, styles.choiceRow]}
            >
              <Ionicons name="sunny" size={18} color="#FFA36C" />
              <Text style={styles.cardPrimary}>Light</Text>
              <View style={styles.radioOuter}>
                {selectedTheme === "light" ? <View style={styles.radioInner} /> : null}
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedTheme("dark")}
              style={[styles.row, styles.choiceRow]}
            >
              <Ionicons name="moon" size={18} color="#FFA36C" />
              <Text style={styles.cardPrimary}>Dark</Text>
              <View style={styles.radioOuter}>
                {selectedTheme === "dark" ? <View style={styles.radioInner} /> : null}
              </View>
            </TouchableOpacity>
          </View>
        </View>*/}

        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Others</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/settings/trash")}
              style={[styles.row, styles.choiceRow]}
            >
              <Ionicons name="trash" size={18} color="#FFA36C" />
              <Text style={styles.cardPrimary}>Trash</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.row, styles.choiceRow]}
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <Ionicons name="log-out" size={18} color="#FFA36C" />
              <Text style={styles.cardPrimary}>
                {isLoggingOut ? "Logging out..." : "Log out"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomAlertModal
        visible={logoutModalVisible}
        title="Logout"
        message="Are you sure you want to log out?"
        confirmText="Logout"
        isDelete={true}
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={confirmLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F4F1",
  },
  content: {
    paddingTop: 30,
    paddingBottom: 64,
    paddingHorizontal: 28,
    gap: 18,
    alignItems: "stretch",
  },
  title: {
    fontSize: 26,
    color: "#3C3148",
    fontWeight: "700",
    textAlign: "center",
    alignSelf: "center",
    paddingBottom: 12,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    color: "#7E7874",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#FEFEFC",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#E6DAD1",
    gap: 15,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  cardPrimary: {
    fontSize: 16,
    color: "#3C3148",
    fontWeight: "600",
    flex: 1,
  },
  cardSecondary: {
    fontSize: 13,
    color: "#B6ABA2",
    marginTop: 4,
  },
  leadingIcon: {
    alignSelf: "flex-start",
    marginTop: 2,
  },
  textGroup: {
    flex: 1,
  },
  statusText: {
    fontSize: 13,
    color: "#B6ABA2",
    fontWeight: "500",
  },
  choiceRow: {
    paddingRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0E6DC",
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#3C3148",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3C3148",
  },
});
