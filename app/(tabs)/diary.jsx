import { useMemo, useState, useCallback } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

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
  const [isGridMode, setGridMode] = useState(false);
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const handleSelectYear = useCallback((year) => {
    setSelectedYear((prev) => (prev === year ? null : year));
  }, []);

  const handleSelectMonth = useCallback((month) => {
    setSelectedMonth((prev) => (prev === month ? null : month));
  }, []);

  const handleCloseFilter = useCallback(() => {
    setFilterVisible(false);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedYear(null);
    setSelectedMonth(null);
  }, []);

  const availableYears = useMemo(() => {
    const years = new Set(
      entries.map((e) => new Date(e.createdAt).getFullYear())
    );
    return [...years].sort((a, b) => b - a);
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    
    return entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      const matchesQuery =
        !normalizedQuery ||
        `${entry.title} ${entry.content}`
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesYear = !selectedYear || entryDate.getFullYear() === selectedYear;
      const matchesMonth =
        selectedMonth === null || entryDate.getMonth() === selectedMonth;

      return matchesQuery && matchesYear && matchesMonth;
    });
  }, [entries, query, selectedYear, selectedMonth]);

  const handleEdit = (entry) => {
    router.push({ pathname: "/post", params: { entryId: entry.id } });
  };

  const handleDelete = async (entry) => {
    try {
      await deleteEntry(entry.id);
    } catch (error) {
      const errorMessage = error.message || "Something went wrong";
      let userMessage = errorMessage;
      
      if (errorMessage.includes("logged in")) {
        userMessage = "Please log in to delete entries";
      } else if (errorMessage.includes("Failed")) {
        userMessage = "Could not delete. Check your internet connection.";
      }
      
      alert(userMessage);
    }
  };

  const renderEntry = ({ item }) => {
    const meta = MOOD_META[item.mood] ?? FALLBACK_META;

    if (isGridMode) {
      return (
        <TouchableOpacity
          style={styles.gridEntryCard}
          onPress={() => router.push({ pathname: "/diary-view", params: { entryId: item.id } })}
          activeOpacity={0.9}
        >
          <View style={styles.gridHeader}>
            <MaterialCommunityIcons
              name={meta.icon}
              size={24}
              color="#353535ff"
            />
             <View style={[styles.entryTag, { backgroundColor: meta.color, paddingHorizontal: 8, paddingVertical: 2 }]}>
              <Text style={[styles.entryTagText, { fontSize: 10 }]}>{formatTimestamp(item.createdAt).split(',')[0]}</Text>
            </View>
          </View>
          <Text style={styles.gridEntryTitle} numberOfLines={2}>{item.title}</Text>
           {item.content ? (
            <Text style={styles.gridEntryExcerpt} numberOfLines={3}>
              {item.content}
            </Text>
          ) : null}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.entryCard}
        onPress={() => router.push({ pathname: "/diary-view", params: { entryId: item.id } })}
        activeOpacity={0.9}
      >
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
            onPress={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}
          >
            <Ionicons name="create-outline" size={18} color="#137bfaff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.entryActionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}
          >
            <Ionicons name="trash-outline" size={18} color="#F37A74" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
      <View style={styles.searchRow}>
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
        <TouchableOpacity
          style={[styles.filterButton, isGridMode && styles.filterActive]}
          onPress={() => setGridMode(!isGridMode)}
        >
          <Ionicons
            name={isGridMode ? "list-outline" : "grid-outline"}
            size={20}
            color={isGridMode ? "#FFFFFF" : "#3C3148"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            (selectedYear || selectedMonth !== null) && styles.filterActive,
          ]}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={selectedYear || selectedMonth !== null ? "#FFFFFF" : "#3C3148"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );



const FilterModal = ({
  visible,
  onClose,
  selectedYear,
  onSelectYear,
  selectedMonth,
  onSelectMonth,
  availableYears,
  onReset,
}) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <TouchableOpacity
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filter Memories</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#3C3148" />
          </TouchableOpacity>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Year</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearScroll}
          >
            <TouchableOpacity
              style={[
                styles.yearChip,
                selectedYear === null && styles.yearChipActive,
              ]}
              onPress={() => onSelectYear(null)}
            >
              <Text
                style={[
                  styles.yearChipText,
                  selectedYear === null && styles.yearChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {availableYears.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearChip,
                  selectedYear === year && styles.yearChipActive,
                ]}
                onPress={() => onSelectYear(year)}
              >
                <Text
                  style={[
                    styles.yearChipText,
                    selectedYear === year && styles.yearChipTextActive,
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Month</Text>
          <View style={styles.monthGrid}>
            {MONTHS.map((month, index) => (
              <TouchableOpacity
                key={month}
                style={[
                  styles.monthChip,
                  selectedMonth === index && styles.monthChipActive,
                ]}
                onPress={() => onSelectMonth(index)}
              >
                <Text
                  style={[
                    styles.monthChipText,
                    selectedMonth === index && styles.monthChipTextActive,
                  ]}
                >
                  {month.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.resetButton} onPress={onReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={onClose}>
            <Text style={styles.applyButtonText}>Apply Filter</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          key={isGridMode ? "grid" : "list"}
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={listHeader}
          renderItem={renderEntry}
          contentContainerStyle={styles.listContent}
          numColumns={isGridMode ? 2 : 1}
          columnWrapperStyle={isGridMode ? styles.gridColumnWrapper : null}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No diaries found</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
        <FilterModal
          visible={isFilterVisible}
          onClose={handleCloseFilter}
          selectedYear={selectedYear}
          onSelectYear={handleSelectYear}
          selectedMonth={selectedMonth}
          onSelectMonth={handleSelectMonth}
          availableYears={availableYears}
          onReset={handleResetFilters}
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
  searchRow: {
    flexDirection: "row",
    gap: 6,
  },
  searchField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: LIST_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 3,
  },
  filterButton: {
    width: 44,
    height: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: LIST_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  filterActive: {
    backgroundColor: "#3C3148",
    borderColor: "#3C3148",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#3C3148",
  },
  emptyCard: {
    height: 96,
    borderRadius: 12,
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
    borderRadius: 12,
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
    borderRadius: 12,
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
  gridColumnWrapper: {
    gap: 12,
  },
  gridEntryCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: LIST_BG,
    padding: 12,
    gap: 8,
    maxWidth: "49%",
  },
  gridHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gridEntryTitle: {
    fontSize: 14,
    color: "#3C3148",
    fontWeight: "600",
  },
  gridEntryExcerpt: {
    fontSize: 12,
    color: "#7E7874",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    gap: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3C3148",
  },
  filterSection: {
    gap: 12,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3C3148",
  },
  yearScroll: {
    gap: 10,
  },
  yearChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F8F4F1",
    borderWidth: 1,
    borderColor: "#E6DAD1",
  },
  yearChipActive: {
    backgroundColor: "#3C3148",
    borderColor: "#3C3148",
  },
  yearChipText: {
    fontSize: 14,
    color: "#7E7874",
    fontWeight: "500",
  },
  yearChipTextActive: {
    color: "#FFFFFF",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  monthChip: {
    width: "30%",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#F8F4F1",
    borderWidth: 1,
    borderColor: "#E6DAD1",
  },
  monthChipActive: {
    backgroundColor: "#3C3148",
    borderColor: "#3C3148",
  },
  monthChipText: {
    fontSize: 13,
    color: "#7E7874",
    fontWeight: "500",
  },
  monthChipTextActive: {
    color: "#FFFFFF",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6DAD1",
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7E7874",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#3C3148",
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
