import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useDiary } from "../../context/diary-context";

const BG_COLOR = "#F8F4F1";
const CARD_COLOR = "#FEFEFC";
const BORDER_COLOR = "#E6DAD1";
const SAVE_COLOR = "#2F2621";
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

export default function PostScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const entryIdParam = params.entryId;
  const entryId = Array.isArray(entryIdParam)
    ? entryIdParam[0]
    : entryIdParam ?? undefined;
  const { entries, addEntry, updateEntry } = useDiary();
  const existingEntry = useMemo(
    () => (entryId ? entries.find((item) => item.id === entryId) ?? null : null),
    [entries, entryId],
  );

  const [selectedMood, setSelectedMood] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState(null);

  const resetForm = useCallback(() => {
    setSelectedMood("");
    setTitle("");
    setContent("");
    setImageUri(null);
  }, []);

  useEffect(() => {
    if (entryId && existingEntry) {
      setSelectedMood(existingEntry.mood ?? "");
      setTitle(existingEntry.title ?? "");
      setContent(existingEntry.content ?? "");
      setImageUri(existingEntry.imageUri ?? null);
    }
  }, [entryId, existingEntry]);

  useFocusEffect(
    useCallback(() => {
      if (!entryId) {
        resetForm();
      }
    }, [entryId, resetForm]),
  );

  const moodEntries = useMemo(() => Object.entries(MOODS), []);

  const handleToggleImage = () => {
    setImageUri((prev) => (prev ? null : null));
  };

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle && !trimmedContent) {
      return;
    }

    if (entryId && existingEntry) {
      updateEntry(entryId, {
        mood: selectedMood,
        title: trimmedTitle || "Untitled memory",
        content: trimmedContent,
        imageUri,
      });
    } else {
      addEntry({
        mood: selectedMood,
        title: trimmedTitle || "Untitled memory",
        content: trimmedContent,
        imageUri,
      });
    }

    resetForm();
    router.setParams({ entryId: undefined });
    router.replace("/diary");
  };

  const screenTitle = entryId ? "Edit memory" : "Add memories";
  const buttonLabel = entryId ? "Update" : "Save";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{screenTitle}</Text>

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
          onPress={handleToggleImage}
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

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{buttonLabel}</Text>
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
    paddingTop: 20,
    paddingBottom: 120,
    gap: 15,
  },
  title: {
    fontSize: 26,
    color: "#3C3148",
    textAlign: "center",
    fontWeight: "700",
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
    borderRadius: 12,
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
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
