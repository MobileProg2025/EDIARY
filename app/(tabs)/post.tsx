import { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type MoodKey = "sad" | "angry" | "calm" | "happy" | "love";

const BG_COLOR = "#F8F4F1";
const CARD_COLOR = "#FEFEFC";
const BORDER_COLOR = "#E6DAD1";
const SAVE_COLOR = "#2F2621";
const BORDER_BLACK = "#161616";

type MoodOption = {
  label: string;
  background: string;
  icon: keyof typeof MOOD_ICONS;
};

const MOOD_ICONS = {
  sad: "emoticon-sad-outline",
  angry: "emoticon-angry-outline",
  calm: "emoticon-neutral-outline",
  happy: "emoticon-happy-outline",
  love: "heart-outline",
} as const;

const MOODS: Record<MoodKey, MoodOption> = {
  sad: { label: "Sad", background: "#79A7F3", icon: "sad" },
  angry: { label: "Angry", background: "#F37A74", icon: "angry" },
  calm: { label: "Calm", background: "#68C290", icon: "calm" },
  happy: { label: "Happy", background: "#F3C95C", icon: "happy" },
  love: { label: "In love", background: "#E39BCB", icon: "love" },
};

export default function PostScreen() {
  const [selectedMood, setSelectedMood] = useState<MoodKey>("sad");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const moodEntries = useMemo(
    () => Object.entries(MOODS) as Array<[MoodKey, MoodOption]>,
    [],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Add memories</Text>

        <View style={styles.moodCard}>
          <Text style={styles.moodLabel}>Mood</Text>
          <View style={styles.moodRow}>
            {moodEntries.map(([key, mood]) => {
              const isSelected = selectedMood === key;

              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.moodOption,
                    {
                      backgroundColor: mood.background,
                      borderColor: BORDER_BLACK,
                    },
                    isSelected && styles.moodOptionSelected,
                  ]}
                  onPress={() => setSelectedMood(key)}
                  accessibilityLabel={`Mood ${mood.label}`}
                >
                  <MaterialCommunityIcons
                    name={MOOD_ICONS[mood.icon]}
                    size={26}
                    color={BORDER_BLACK}
                  />
                  <Text style={styles.moodOptionLabel}>{mood.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.inputCard}>
          <TextInput
            style={styles.titleInput}
            placeholder="Title"
            placeholderTextColor="#B6ABA2"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.bodyInput}
            placeholder="Start typing"
            placeholderTextColor="#B6ABA2"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={styles.imageCard}
          onPress={() => setImageUri(imageUri ? null : null)}
          activeOpacity={0.85}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={20} color="#3C3148" />
              <Text style={styles.imagePlaceholderText}>Add image</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 24,
  },
  title: {
    fontSize: 26,
    color: "#3C3148",
    textAlign: "center",
    fontWeight: "700",
  },
  moodCard: {
    backgroundColor: CARD_COLOR,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 16,
    alignItems: "center",
  },
  moodLabel: {
    fontSize: 16,
    color: "#3C3148",
    textAlign: "center",
    fontWeight: "600",
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  moodOption: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  moodOptionSelected: {
    transform: [{ translateY: -2 }],
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  titleInput: {
    fontSize: 16,
    color: "#3C3148",
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    paddingBottom: 8,
    fontWeight: "600",
  },
  bodyInput: {
    fontSize: 16,
    color: "#3C3148",
    minHeight: 180,
  },
  imageCard: {
    height: 120,
    borderRadius: 18,
    backgroundColor: "#E9D8C7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  imagePlaceholder: {
    alignItems: "center",
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: "#3C3148",
    fontWeight: "600",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  saveButton: {
    backgroundColor: SAVE_COLOR,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
