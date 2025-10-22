import { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type DiaryEntry = {
  id: string;
  moodIcon: keyof typeof MOOD_META;
  title: string;
  timestamp: string;
};

const SEARCH_PLACEHOLDER = "Search memories";
const LIST_BG = "#FEFEFC";
const BORDER_COLOR = "#E6DAD1";

const MOOD_META = {
  happy: { label: "Happy", color: "#68C290", icon: "emoticon-happy-outline" },
  sad: { label: "Sad", color: "#79A7F3", icon: "emoticon-sad-outline" },
  angry: { label: "Angry", color: "#F37A74", icon: "emoticon-angry-outline" },
  love: { label: "In Love", color: "#E39BCB", icon: "heart-outline" },
  excited: {
    label: "Excited",
    color: "#F3C95C",
    icon: "emoticon-excited-outline",
  },
} as const;

const SAMPLE_ENTRIES: DiaryEntry[] = [];

export default function DiaryScreen() {
  const [query, setQuery] = useState("");
  const filteredEntries: DiaryEntry[] = [];

  const renderEntry = ({ item }: { item: DiaryEntry }) => {
    const meta = MOOD_META[item.moodIcon];

    return (
      <View style={styles.entryCard}>
        <View style={styles.entryIconWrapper}>
          <MaterialCommunityIcons
            name={meta.icon}
            size={20}
            color={meta.color}
          />
        </View>
        <View style={styles.entryContent}>
          <View style={[styles.entryTag, { backgroundColor: meta.color }]}>
            <Text style={styles.entryTagText}>{item.timestamp}</Text>
          </View>
          <Text style={styles.entryTitle}>{item.title}</Text>
        </View>
        <View style={styles.entryActions}>
          <TouchableOpacity style={styles.entryActionButton}>
            <Ionicons name="create-outline" size={18} color="#3C3148" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.entryActionButton}>
            <Ionicons name="trash-outline" size={18} color="#F37A74" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const listHeader = (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <Image
          source={require("../../assets/images/e-diarylogo2.png")}
          style={styles.brandMark}
          resizeMode="contain"
        />
        <Text style={styles.brandText}>eDiary</Text>
      </View>
      <Text style={styles.title}>My Memories</Text>
      <View style={styles.searchField}>
        <Ionicons name="search" size={18} color="#7E7874" />
        <TextInput
          style={styles.searchInput}
          placeholder={SEARCH_PLACEHOLDER}
          placeholderTextColor="#B6ABA2"
          value={query}
          onChangeText={setQuery}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={listHeader}
          renderItem={renderEntry}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No diaries yet</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
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
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 120,
    gap: 18,
  },
  header: {
    gap: 24,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandMark: {
    width: 40,
    height: 40,
  },
  brandText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#161616",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3C3148",
  },
  searchField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: LIST_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#3C3148",
  },
  emptyCard: {
    height: 96,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: LIST_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#B6ABA2",
  },
  entryCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: LIST_BG,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  entryIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(60, 49, 72, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  entryContent: {
    flex: 1,
    gap: 8,
  },
  entryTag: {
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  entryTagText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3C3148",
  },
  entryActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  entryActionButton: {
    padding: 6,
  },
});
