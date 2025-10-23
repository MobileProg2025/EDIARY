import { SafeAreaView } from "react-native-safe-area-context";
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const stats = [
    { label: "Total Entries", color: "#E9E2D7" },
    { label: "Current Streak", color: "#E6D4BD" },
    { label: "Longest Streak", color: "#DCCFC4" },
    { label: "Total Words", color: "#E8CFC5" },
  ];
  const HORIZONTAL_PADDING = 32;
  const CARD_GAP = 18;
  const CARDS_PER_ROW = 2;
  const effectiveWidth = Math.max(width, 320);
  const cardSize =
    (effectiveWidth - HORIZONTAL_PADDING * 2 - CARD_GAP * (CARDS_PER_ROW - 1)) /
    CARDS_PER_ROW;
  const statRows = [
    stats.slice(0, 2),
    stats.slice(2, 4),
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profile</Text>

        <Image
          source={{
            uri: "https://i.imgur.com/wkMsdGc.jpg",
          }}
          style={styles.avatar}
        />

        <Text style={styles.name}>Ken Louie Neri</Text>
        <Text style={styles.email}>nerikenlouie@gmail.com</Text>

        <View style={styles.statsGrid}>
          {statRows.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={[
                styles.statsRow,
                rowIndex < statRows.length - 1 ? { marginBottom: CARD_GAP } : null,
              ]}
            >
              {row.map((item) => (
                <View
                  key={item.label}
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: item.color,
                      width: cardSize,
                      height: cardSize,
                    },
                  ]}
                >
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          ))}
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
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 32,
    alignItems: "center",
    gap: 24,
  },
  title: {
    fontSize: 26,
    color: "#3C3148",
    fontWeight: "700",
  },
  avatar: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 6,
    borderColor: "#F0E8E0",
    marginTop: 8,
  },
  name: {
    fontSize: 20,
    color: "#3C3148",
    fontWeight: "700",
  },
  email: {
    fontSize: 14,
    color: "#7E7874",
    letterSpacing: 0.2,
  },
  statsGrid: {
    width: "100%",
    marginTop: 6,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#000000",
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 10,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    color: "#3C3148",
    fontWeight: "600",
  },
});
