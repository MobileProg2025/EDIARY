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
import { Ionicons } from "@expo/vector-icons";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_SIZE = 40;

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
};

const today = new Date();
const normalisedToday = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate(),
);

const formatMonthYear = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);

const formatLongDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export default function HomeScreen() {
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(normalisedToday.getFullYear(), normalisedToday.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    normalisedToday,
  );

  const monthLabel = useMemo(
    () => formatMonthYear(visibleMonth),
    [visibleMonth],
  );

  const calendarDays = useMemo<CalendarDay[]>(() => {
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

      return {
        date: normalisedCell,
        isCurrentMonth: cellDate.getMonth() === visibleMonth.getMonth(),
        isToday: isSameDay(normalisedCell, normalisedToday),
        isSelected: !!selectedDate && isSameDay(normalisedCell, selectedDate),
      };
    });
  }, [selectedDate, visibleMonth]);

  const calendarWeeks = useMemo(() => {
    return Array.from({ length: 6 }, (_, weekIndex) =>
      calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7),
    );
  }, [calendarDays]);

  const handleChangeMonth = (direction: 1 | -1) => {
    setVisibleMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1),
    );
  };

  const handleSelectDate = (date: Date, isCurrentMonth: boolean) => {
    setSelectedDate(date);

    if (!isCurrentMonth) {
      setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
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
          <Text style={styles.greeting}>Hello, Ken Louie</Text>
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
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently added</Text>
          <View style={styles.card}>
            <Text style={styles.cardPlaceholder}>No recent yet</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>On this day</Text>
          <View style={styles.card}>
            <Text style={styles.cardPlaceholder}>
              {selectedDate ? formatLongDate(selectedDate) : "No selected date"}
            </Text>
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
    paddingTop: 32,
    paddingBottom: 80,
    gap: 32,
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
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3C3148",
    textAlign: "center",
  },
  calendarCard: {
    backgroundColor: "#FEFEFC",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#E6DAD1",
    gap: 20,
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
    fontWeight: "600",
    color: "#3C3148",
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
    fontWeight: "600",
    color: "#7E7874",
  },
  datesGrid: {
    gap: 8,
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
  },
  dateCellSelected: {
    backgroundColor: "#FFA36C",
  },
  dateCellToday: {
    borderWidth: 1,
    borderColor: "#FFA36C",
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
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3C3148",
  },
  card: {
    backgroundColor: "#FEFEFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6DAD1",
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  cardPlaceholder: {
    fontSize: 14,
    color: "#C0B7AF",
    textAlign: "center",
  },
  icon: {
    marginTop: 6,
  },
});
