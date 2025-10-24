import { useMemo, useState } from "react";
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
import { useRouter } from "expo-router";
import { useDiary } from "../../context/diary-context";

const SEARCH_PLACEHOLDER = "Search memories";
const LIST_BG = "#FEFEFC";
const BORDER_COLOR = "#E6DAD1";

const MOOD_META = {
  happy: { label: "Happy", color: "#F3C95C", icon: "emoticon-happy-outline" },
  sad: { label: "Sad", color: "#79A7F3", icon: "emoticon-sad-outline" },
  angry: { label: "Angry", color: "#F37A74", icon: "emoticon-angry-outline" },
  calm: { label: "Calm", color: "#68C290", icon: "emoticon-neutral-outline" },
  love: { label: "In Love", color: "#E39BCB", icon: "heart-outline" },
};

const FALLBACK_META = {
  label: "Memory",
  color: "#FFA36C",
  icon: "emoticon-outline",
};

const formatTimestamp = (value) => {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

export default function DiaryScreen() {
  const router = useRouter();
  const { entries, deleteEntry } = useDiary();
  const [query, setQuery] = useState("");

  const filteredEntries = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return entries;
    }

    return entries.filter((entry) => {
      const haystack = `${entry.title} ${entry.content}`.toLowerCase();
      return haystack.includes(trimmed);
    });
  }, [entries, query]);

  const handleEdit = (entry) => {
    router.push({ pathname: "/post", params: { entryId: entry.id } });
  };

  const handleDelete = (entry) => {
    deleteEntry(entry.id);
  };

  const renderEntry = ({ item }) => {
    const meta = MOOD_META[item.mood] ?? FALLBACK_META;

    return (
      <View style={styles.entryCard}>
        <MaterialCommunityIcons
          name={meta.icon}
          size={28}
          color="#161616"
          style={styles.entryMoodIcon}
        />
        <View style={styles.entryContent}>
          <View style={[styles.entryTag, { backgroundColor: meta.color }]}>
            <Text style={styles.entryTagText}>{formatTimestamp(item.createdAt)}</Text>
          </View>
          <Text style={styles.entryTitle}>{item.title}</Text>
          {item.content ? (
            <Text style={styles.entryExcerpt} numberOfLines={1}>
              {item.content}
            </Text>
          ) : null}
        </View>
        <View style={styles.entryActions}>
          <TouchableOpacity
            style={styles.entryActionButton}
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="create-outline" size={18} color="#3C3148" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.entryActionButton}
            onPress={() => handleDelete(item)}
          >
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
    paddingTop: 15,
    paddingBottom: 120,
    gap: 10,
  },
  header: {
    gap: 20,
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
    fontSize: 20,
    color: "#161616",
    fontWeight: "700",
  },
  title: {
    fontSize: 24,
    color: "#3C3148",
    fontWeight: "700",
  },
  searchField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: LIST_BG,
    borderRadius: 10,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: LIST_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#B6ABA2",
    fontWeight: "500",
  },
  entryCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: LIST_BG,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  entryMoodIcon: {
    marginRight: 8,
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
    color: "#3C3148",
    fontWeight: "600",
  },
  entryExcerpt: {
    fontSize: 13,
    color: "#7E7874",
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
