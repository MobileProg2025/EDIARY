import { useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useDiary } from "../context/diary-context";

const BG_COLOR = "#F8F4F1";
const CARD_COLOR = "#FEFEFC";
const BORDER_COLOR = "#E6DAD1";
const BORDER_BLACK = "#161616";

const MOOD_ICONS = {
  sad: "emoticon-sad-outline",
  angry: "emoticon-angry-outline",
  calm: "emoticon-neutral-outline",
  happy: "emoticon-happy-outline",
  love: "heart-outline",
};

const MOODS = {
  sad: { label: "Sad", background: "#79A7F3", icon: "sad" },
  angry: { label: "Angry", background: "#F37A74", icon: "angry" },
  calm: { label: "Calm", background: "#68C290", icon: "calm" },
  happy: { label: "Happy", background: "#F3C95C", icon: "happy" },
  love: { label: "In love", background: "#E39BCB", icon: "love" },
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

export default function DiaryViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const entryIdParam = params.entryId;
  const entryId = Array.isArray(entryIdParam)
    ? entryIdParam[0]
    : entryIdParam ?? undefined;
  const { entries } = useDiary();
  
  const entry = useMemo(
    () => (entryId ? entries.find((item) => item.id === entryId) ?? null : null),
    [entries, entryId],
  );

  const moodEntries = useMemo(() => Object.entries(MOODS), []);

  if (!entry) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Diary entry not found</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.dateLabel}>{formatDate(entry.createdAt)}</Text>
        </View>

        <View style={styles.moodCard}>
          <Text style={styles.moodLabel}>Mood</Text>
          <View style={styles.moodRow}>
            {moodEntries.map(([key, mood]) => {
              const isSelected = entry.mood === key;
              // If selected, show full color. If not, show muted/disabled look.
              const opacity = isSelected ? 1 : 0.3;

              return (
                <View
                  key={key}
                  style={[
                    styles.moodOption,
                    {
                      backgroundColor: mood.background,
                      borderColor: BORDER_BLACK,
                      opacity,
                    },
                    isSelected && styles.moodOptionSelected,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={MOOD_ICONS[mood.icon]}
                    size={26}
                    color={BORDER_BLACK}
                  />
                  <Text style={styles.moodOptionLabel}>{mood.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.titleText}>{entry.title}</Text>
          <View style={styles.divider} />
          <Text style={styles.bodyText}>{entry.content}</Text>
        </View>

        {entry.imageUri ? (
          <View style={styles.imageCard}>
            <Image source={{ uri: entry.imageUri }} style={styles.previewImage} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 120,
    gap: 15,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  dateLabel: {
    fontSize: 16,
    color: "#7E7874",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#7E7874",
  },
  moodCard: {
    backgroundColor: CARD_COLOR,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 18,
    gap: 10,
    alignItems: "center",
  },
  moodLabel: {
    fontSize: 20,
    color: "#3C3148",
    textAlign: "center",
    fontWeight: "600",
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: 10,
  },
  moodOption: {
    width: 50,
    height: 60,
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  moodOptionSelected: {
    transform: [{ translateY: -7 }],
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  moodOptionLabel: {
    fontSize: 12,
    color: BORDER_BLACK,
    fontWeight: "600",
  },
  inputCard: {
    backgroundColor: CARD_COLOR,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    minHeight: 200,
  },
  titleText: {
    fontSize: 18,
    color: "#3C3148",
    fontWeight: "700",
    paddingBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER_COLOR,
    width: "100%",
  },
  bodyText: {
    fontSize: 16,
    color: "#3C3148",
    lineHeight: 24,
  },
  imageCard: {
    height: 240,
    borderRadius: 12,
    backgroundColor: "#E9D8C7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
