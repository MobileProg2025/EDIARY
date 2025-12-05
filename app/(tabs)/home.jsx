import { useMemo, useState } from "react";
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
import { useRouter } from "expo-router";
import { useDiary } from "../../context/diary-context";
import { useAuth } from "../../context/auth-context";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_SIZE = 32;
const SELECTED_COLOR = "#C99977";
const DOT_COLOR = "#161616";

const today = new Date();
const normalisedToday = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate(),
);

const formatMonthYear = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);

const formatLongDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const dateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

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

const formatEntryTimestamp = (value) => {
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

export default function HomeScreen() {
  const router = useRouter();
  const { entries } = useDiary();
  const { user } = useAuth();
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(normalisedToday.getFullYear(), normalisedToday.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(normalisedToday);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [showAllOnThisDay, setShowAllOnThisDay] = useState(false);

  const entriesByDate = useMemo(() => {
    return entries.reduce((acc, entry) => {
      const created = new Date(entry.createdAt);
      const key = dateKey(created);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(entry);
      return acc;
    }, {});
  }, [entries]);

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [entries],
  );

  const recentEntriesLimited = useMemo(
    () => sortedEntries.slice(0, 1),
    [sortedEntries],
  );

  const selectedEntries = useMemo(() => {
    const key = dateKey(selectedDate);
    return entriesByDate[key] ?? [];
  }, [entriesByDate, selectedDate]);

  const selectedEntriesLimited = useMemo(
    () => selectedEntries.slice(0, 1),
    [selectedEntries],
  );

  const greetingName = useMemo(() => {
    if (!user) {
      return "there";
    }

    if (user.username?.trim()) {
      return user.username.trim();
    }

    const first = user.firstName?.trim();
    const last = user.lastName?.trim();
    if (first || last) {
      return [first, last].filter(Boolean).join(" ");
    }

    if (user.email) {
      const [localPart] = user.email.split("@");
      return localPart || "there";
    }

    return "there";
  }, [user]);

  const recentEntriesExpanded = useMemo(
    () => sortedEntries.slice(0, 3),
    [sortedEntries],
  );

  const recentEntriesDisplay = showAllRecent
    ? recentEntriesExpanded
    : recentEntriesLimited;

  const onThisDayEntriesDisplay = showAllOnThisDay
    ? selectedEntries
    : selectedEntriesLimited;

  const monthLabel = useMemo(
    () => formatMonthYear(visibleMonth),
    [visibleMonth],
  );

  const calendarDays = useMemo(() => {
    const startOfMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      1,
    );
    const firstDayIndex = startOfMonth.getDay();
    const gridStart = new Date(startOfMonth);
    gridStart.setDate(startOfMonth.getDate() - firstDayIndex);

    return Array.from({ length: 42 }, (_, index) => {
      const cellDate = new Date(gridStart);
      cellDate.setDate(gridStart.getDate() + index);

      const normalisedCell = new Date(
        cellDate.getFullYear(),
        cellDate.getMonth(),
        cellDate.getDate(),
      );

      const key = dateKey(normalisedCell);
      return {
        date: normalisedCell,
        isCurrentMonth: cellDate.getMonth() === visibleMonth.getMonth(),
        isToday: isSameDay(normalisedCell, normalisedToday),
        isSelected: !!selectedDate && isSameDay(normalisedCell, selectedDate),
        hasEntries: (entriesByDate[key] ?? []).length > 0,
      };
    });
  }, [entriesByDate, selectedDate, visibleMonth]);

  const calendarWeeks = useMemo(() => {
    return Array.from({ length: 6 }, (_, weekIndex) =>
      calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7),
    );
  }, [calendarDays]);

  const handleChangeMonth = (direction) => {
    setVisibleMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1),
    );
  };

  const handleSelectDate = (date, isCurrentMonth) => {
    setSelectedDate(date);

  if (!isCurrentMonth) {
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }
};

  const renderEntrySnippet = (entry) => {
    const meta = MOOD_META[entry.mood] ?? FALLBACK_META;
    return (
      <TouchableOpacity
        key={entry.id}
        style={styles.entrySnippet}
        onPress={() => router.push({ pathname: "/diary-view", params: { entryId: entry.id } })}
        activeOpacity={0.7}
      >
        <View style={styles.snippetHeader}>
          <MaterialCommunityIcons
            name={meta.icon}
            size={20}
            color="#3C3148"
            style={styles.snippetIcon}
          />
          <View style={[styles.snippetTag, { backgroundColor: meta.color }]}>
            <Ionicons name="calendar-outline" size={12} color="#FFFFFF" />
            <Text style={styles.snippetTagText}>
              {formatEntryTimestamp(entry.createdAt)}
            </Text>
          </View>
        </View>
        <Text style={styles.snippetTitle}>{entry.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Image
              source={require("../../assets/images/e-diarylogo2.png")}
              style={styles.brandMark}
              resizeMode="contain"
            />
            <Text style={styles.brandText}>eDiary</Text>
          </View>
          <Text style={styles.greeting}>Hello, {greetingName}</Text>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={styles.monthNav}
              onPress={() => handleChangeMonth(-1)}
              accessibilityLabel="Previous month"
            >
              <Ionicons name="chevron-back" size={18} color="#3C3148" />
            </TouchableOpacity>
            <View style={styles.calendarTitleRow}>
              <Ionicons name="calendar" size={18} color="#3C3148" />
              <Text style={styles.monthLabel}>{monthLabel}</Text>
            </View>
            <TouchableOpacity
              style={styles.monthNav}
              onPress={() => handleChangeMonth(1)}
              accessibilityLabel="Next month"
            >
              <Ionicons name="chevron-forward" size={18} color="#3C3148" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayRow}>
            {DAYS_SHORT.map((day) => (
              <Text key={day} style={styles.weekdayLabel}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.datesGrid}>
            {calendarWeeks.map((week, rowIndex) => (
              <View key={`week-${rowIndex}`} style={styles.weekRow}>
                {week.map((day, colIndex) => {
                  const key = `${day.date.getTime()}-${rowIndex}-${colIndex}`;
                  const textStyles = [
                    styles.dateLabel,
                    !day.isCurrentMonth && styles.dateLabelMuted,
                    day.isSelected && styles.dateLabelSelected,
                  ];

                  const dayWrapperStyles = [
                    styles.dateCell,
                    day.isSelected && styles.dateCellSelected,
                    day.isToday && !day.isSelected && styles.dateCellToday,
                    !day.isCurrentMonth && styles.dateCellMuted,
                  ];

                  return (
                    <TouchableOpacity
                      key={key}
                      style={dayWrapperStyles}
                      onPress={() =>
                        handleSelectDate(day.date, day.isCurrentMonth)
                      }
                      accessibilityLabel={formatLongDate(day.date)}
                    >
                      <Text style={textStyles}>{day.date.getDate()}</Text>
                      {day.hasEntries ? <View style={styles.dateDot} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently added</Text>
            {sortedEntries.length > recentEntriesLimited.length ? (
              <TouchableOpacity
                onPress={() => setShowAllRecent((prev) => !prev)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.sectionAction}>
                  {showAllRecent ? "View less" : "View all"}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.card}>
            {recentEntriesDisplay.length ? (
              recentEntriesDisplay.map((entry) => renderEntrySnippet(entry))
            ) : (
              <Text style={styles.cardPlaceholder}>No recent yet</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>On this day</Text>
            {selectedEntries.length > selectedEntriesLimited.length ? (
              <TouchableOpacity
                onPress={() => setShowAllOnThisDay((prev) => !prev)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.sectionAction}>
                  {showAllOnThisDay ? "View less" : "View all"}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.card}>
            {onThisDayEntriesDisplay.length ? (
              onThisDayEntriesDisplay.map((entry) => renderEntrySnippet(entry))
            ) : (
              <Text style={styles.cardPlaceholder}>
                {selectedDate ? formatLongDate(selectedDate) : "No selected date"}
              </Text>
            )}
          </View>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 15,
    paddingBottom: 80,
    gap: 20,
  },
  header: {
    gap: 12,
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
  greeting: {
    fontSize: 24,
    color: "#3C3148",
    textAlign: "center",
    fontWeight: "700",
  },
  calendarCard: {
    backgroundColor: "#FEFEFC",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E3C5B3",
    gap: 10,
    elevation: 2
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarTitleRow: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  monthLabel: {
    textAlign: "center",
    fontSize: 16,
    color: "#3C3148",
    fontWeight: "600",
  },
  monthNav: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 13,
    color: "#7E7874",
    fontWeight: "500",
  },
  datesGrid: {
    gap: 2,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: DAY_SIZE / 2,
    gap: 4,
  },
  dateCellSelected: {
    backgroundColor: SELECTED_COLOR,
  },
  dateCellToday: {
    borderWidth: 1,
    borderColor: SELECTED_COLOR,
  },
  dateCellMuted: {
    opacity: 0.35,
  },
  dateLabel: {
    fontSize: 14,
    color: "#3C3148",
    fontWeight: "500",
  },
  dateLabelMuted: {
    color: "#C0B7AF",
  },
  dateLabelSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  dateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DOT_COLOR,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 19,
    color: "#3C3148",
    fontWeight: "600",
  },
  sectionAction: {
    fontSize: 13,
    color: "#161616",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FEFEFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E3C5B3",
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 18,
  },
  cardPlaceholder: {
    fontSize: 14,
    color: "#C0B7AF",
    textAlign: "center",
    fontWeight: "500",
  },
  entrySnippet: {
    gap: 8,
  },
  snippetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  snippetIcon: {
    marginRight: 2,
  },
  snippetTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  snippetTagText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  snippetTitle: {
    fontSize: 15,
    color: "#3C3148",
    fontWeight: "600",
  },
});
