import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDiary } from "../../../context/diary-context";
import CustomAlertModal from "../../../components/CustomAlertModal";

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

const formatEntryTimestamp = (value) =>
  new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(value ? new Date(value) : new Date());

export default function TrashScreen() {
  const { trashEntries, recoverEntry, deleteFromTrash, emptyTrash } = useDiary();

  const [emptyModalVisible, setEmptyModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState(null);

  const confirmEmptyTrash = () => {
    emptyTrash();
    setEmptyModalVisible(false);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalVisible(false);
    setSelectedEntryId(null);
  };

  const handleDeletePress = (id) => {
    setSelectedEntryId(id);
    setDeleteModalVisible(true);
  };

  const confirmDeleteEntry = async () => {
    if (selectedEntryId) {
      try {
        await deleteFromTrash(selectedEntryId);
      } catch (error) {
        alert(
          error.message ||
            "Could not delete entry. Check your internet connection."
        );
      } finally {
        handleCloseDeleteModal();
      }
    }
  };

  const items = useMemo(
    () =>
      [...trashEntries].sort(
        (a, b) =>
          new Date(b.trashedAt ?? b.createdAt).getTime() -
          new Date(a.trashedAt ?? a.createdAt).getTime(),
      ),
    [trashEntries],
  );

  const hasEntries = items.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Trash</Text>

        {hasEntries ? (
          <>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setEmptyModalVisible(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyButtonText}>Empty Trash</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.list}>
              {items.map((entry) => {
                const meta = MOOD_META[entry.mood] ?? FALLBACK_META;
                return (
                  <View key={entry.id} style={styles.entryCard}>
                    <View style={styles.entryHeader}>
                      <MaterialCommunityIcons
                        name={meta.icon}
                        size={22}
                        color="#3C3148"
                      />
                      <View style={[styles.entryTag, { backgroundColor: meta.color }]}>
                        <Ionicons name="calendar-outline" size={12} color="#FFFFFF" />
                        <Text style={styles.entryTagText}>
                          {formatEntryTimestamp(entry.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                    <View style={styles.entryActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={async () => {
                          try {
                            await recoverEntry(entry.id);
                          } catch (error) {
                            alert(error.message || "Could not recover entry. Check your internet connection.");
                          }
                        }}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="arrow-undo" size={16} color="#3C3148" />
                        <Text style={styles.actionText}>Recover</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.actionButtonDanger]}
                        onPress={() => handleDeletePress(entry.id)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="trash" size={16} color="#FFFFFF" />
                        <Text style={[styles.actionText, styles.actionTextInverse]}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="trash-bin" size={80} color="#3C3148" />
            <Text style={styles.emptyText}>No diaries in trash</Text>
          </View>
        )}
      </ScrollView>

      <CustomAlertModal
        visible={emptyModalVisible}
        title="Empty Trash"
        message="Are you sure you want to permanently delete all items in the trash? This action cannot be undone."
        confirmText="Empty Trash"
        isDelete={true}
        onCancel={() => setEmptyModalVisible(false)}
        onConfirm={confirmEmptyTrash}
      />

      <CustomAlertModal
        visible={deleteModalVisible}
        title="Permanent Delete"
        message="Are you sure you want to permanently delete this entry? This action cannot be undone."
        confirmText="Delete"
        isDelete={true}
        onCancel={handleCloseDeleteModal}
        onConfirm={confirmDeleteEntry}
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
    paddingHorizontal: 28,
    paddingVertical: 48,
    gap: 24,
  },
  title: {
    fontSize: 24,
    color: "#3C3148",
    fontWeight: "700",
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  emptyButton: {
    backgroundColor: "#2F2621",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  list: {
    gap: 18,
  },
  entryCard: {
    backgroundColor: "#FEFEFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6DAD1",
    padding: 18,
    gap: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  entryTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  entryTagText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  entryTitle: {
    fontSize: 16,
    color: "#3C3148",
    fontWeight: "600",
  },
  entryActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3C3148",
  },
  actionButtonDanger: {
    backgroundColor: "#3C3148",
    borderColor: "#3C3148",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3C3148",
  },
  actionTextInverse: {
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    gap: 18,
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 15,
    color: "#7E7874",
    fontWeight: "500",
  },
});
