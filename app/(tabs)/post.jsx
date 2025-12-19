import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const [imageAspectRatio, setImageAspectRatio] = useState(1);

  const [permissionStatus, requestPermission] = ImagePicker.useMediaLibraryPermissions();

  const resetForm = useCallback(() => {
    setSelectedMood("");
    setTitle("");
    setContent("");
    setImageUri(null);
    setImageAspectRatio(1);
  }, []);

  useEffect(() => {
    if (entryId && existingEntry) {
      setSelectedMood(existingEntry.mood ?? "");
      setTitle(existingEntry.title ?? "");
      setContent(existingEntry.content ?? "");
      
      const uri = existingEntry.imageUri ?? null;
      setImageUri(uri);
      
      if (uri) {
        Image.getSize(uri, (width, height) => {
          if (width && height) {
            setImageAspectRatio(width / height);
          }
        }, (error) => {
            console.log("Failed to get image size", error);
        });
      }
    }
  }, [entryId, existingEntry]);

  useFocusEffect(
    useCallback(() => {
      if (!entryId) {
        resetForm();
      }
    }, [entryId, resetForm])
  );

  const moodEntries = useMemo(() => Object.entries(MOODS), []);

  const pickImage = async () => {
    try {
      if (permissionStatus?.status !== ImagePicker.PermissionStatus.GRANTED) {
        const { status } = await requestPermission();
        if (status !== ImagePicker.PermissionStatus.GRANTED) {
          Alert.alert("Permission needed", "Please grant camera roll permissions to upload images.");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, 
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        if (asset.width && asset.height) {
            setImageAspectRatio(asset.width / asset.height);
        }

        if (asset.base64) {
          const prefix = "data:image/jpeg;base64,";
          const newUri = asset.base64.startsWith("data:image") 
            ? asset.base64 
            : `${prefix}${asset.base64}`;
          setImageUri(newUri);
        } else {
          setImageUri(asset.uri);
          if (!asset.width || !asset.height) {
             Image.getSize(
                asset.uri,
                (w, h) => {
                  if (h > 0) setImageAspectRatio(w / h);
                },
                (err) => console.warn("Failed to get image size", err)
              );
          }
        }
      }
    } catch (error) {
      console.warn("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleToggleImage = async () => {
     await pickImage();
  };

  const handleSave = async () => {
    if (!selectedMood) {
      Alert.alert("Mood required", "Please select a mood for your diary entry.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter a title.");
      return;
    }
    if (!content.trim()) {
      Alert.alert("Content required", "Please enter some content.");
      return;
    }

    const entryData = {
      mood: selectedMood,
      title,
      content,
      imageUri,
      // Use existing date if updating, else new date
      date: existingEntry?.date ?? new Date().toISOString(),
    };

    try {
        if (existingEntry) {
        await updateEntry(existingEntry.id, entryData);
        } else {
        await addEntry(entryData);
        }
        router.back();
    } catch (e) {
        console.error("Failed to save entry", e);
        Alert.alert("Error", "Failed to save entry");
    }
  };

  const buttonLabel = existingEntry ? "Update" : "Save";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
            <Text style={styles.headerText}>How are you?</Text>
        </View>

        <View style={styles.moodCard}>
          <View style={styles.moodRow}>
            {moodEntries.map(([key, mood]) => {
              const isSelected = selectedMood === key;
              const opacity = isSelected ? 1 : 0.3;

              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSelectedMood(key)}
                  activeOpacity={0.7}
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
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.inputCard}>
          <TextInput
            style={styles.titleInput}
            placeholder="Title"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
          <View style={styles.divider} />
          <TextInput
            style={styles.bodyInput}
            placeholder="Write your thoughts..."
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
          />
        </View>

        <TouchableOpacity
          style={[styles.imageCard, imageUri && { height: undefined, aspectRatio: imageAspectRatio, backgroundColor: 'transparent' }]}
          onPress={handleToggleImage}
          activeOpacity={0.85}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={[styles.previewImage, { aspectRatio: imageAspectRatio }]} />
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
  header: {
    alignItems: "center",
    marginBottom: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#3C3148",
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
  titleInput: {
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
  bodyInput: {
    fontSize: 16,
    color: "#3C3148",
    lineHeight: 24,
    minHeight: 150,
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
    width: "100%", 
    height: "100%",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: "#3C3148",
    fontWeight: "600",
  },
  previewImage: {
    width: "100%",
    height: undefined, 
    resizeMode: "contain",
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
