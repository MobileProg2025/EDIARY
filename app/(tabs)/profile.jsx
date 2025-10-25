import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo } from "react";
import { useDiary } from "../../context/diary-context";
import { useAuth } from "../../context/auth-context";

const STAT_META = [
  { label: "Total Entries", color: "#E9E2D7", key: "totalEntries" },
  { label: "Current Streak", color: "#E6D4BD", key: "currentStreak" },
  { label: "Longest Streak", color: "#DCCFC4", key: "longestStreak" },
  { label: "Total Words", color: "#E8CFC5", key: "totalWords" },
];

const normalizeDate = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const countWords = (text) =>
  text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const { entries } = useDiary();
  const { user } = useAuth();

  const stats = useMemo(() => {
    if (!entries.length) {
      return {
        totalEntries: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalWords: 0,
      };
    }

    const sortedDates = [...entries]
      .map((entry) => normalizeDate(new Date(entry.createdAt)))
      .sort((a, b) => a.getTime() - b.getTime());

    const uniqueDates = sortedDates.reduce((acc, date) => {
      const key = date.getTime();
      if (!acc.length || acc[acc.length - 1].getTime() !== key) {
        acc.push(date);
      }
      return acc;
    }, []);

    let longestStreak = 1;
    let currentStreak = 1;

    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i += 1) {
      const prev = uniqueDates[i - 1];
      const current = uniqueDates[i];
      const diffInDays =
        (current.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000);

      if (diffInDays === 1) {
        streak += 1;
      } else if (diffInDays === 0) {
        continue;
      } else {
        streak = 1;
      }

      longestStreak = Math.max(longestStreak, streak);
    }

    const today = normalizeDate(new Date());
    const lastDate = uniqueDates[uniqueDates.length - 1];
    if (uniqueDates.length === 1) {
      currentStreak = 1;
    } else if (today.getTime() === lastDate.getTime()) {
      currentStreak = streak;
    } else if (
      (today.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000) === 1
    ) {
      currentStreak = streak;
    } else {
      currentStreak = 0;
    }

    const totalWords = entries.reduce(
      (sum, entry) =>
        sum + countWords(entry.title ?? "") + countWords(entry.content ?? ""),
      0,
    );

    return {
      totalEntries: entries.length,
      currentStreak,
      longestStreak,
      totalWords,
    };
  }, [entries]);

  const HORIZONTAL_PADDING = 32;
  const CARD_GAP = 18;
  const CARDS_PER_ROW = 2;
  const effectiveWidth = Math.max(width, 320);
  const cardSize =
    (effectiveWidth - HORIZONTAL_PADDING * 2 - CARD_GAP * (CARDS_PER_ROW - 1)) /
    CARDS_PER_ROW;
  const statRows = useMemo(() => {
    const values = STAT_META.map((meta) => ({
      ...meta,
      value: stats[meta.key],
    }));
    return [values.slice(0, 2), values.slice(2, 4)];
  }, [stats]);

  const displayName = useMemo(() => {
    if (!user) {
      return "Your Profile";
    }

    const first = user.firstName?.trim();
    const last = user.lastName?.trim();
    const fullName = [first, last].filter(Boolean).join(" ").trim();

    if (fullName) {
      return fullName;
    }

    if (user.email) {
      return user.email;
    }

    return "Your Profile";
  }, [user]);

  const displayEmail = user?.email ?? "Add your email";
  const displayPhone = user?.phoneNumber?.trim() ?? "";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profile</Text>

        <View style={styles.avatar}>
          <View style={styles.avatarHead} />
          <View style={styles.avatarBody} />
        </View>

        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{displayEmail}</Text>
        {/* {displayPhone ? <Text style={styles.phone}>{displayPhone}</Text> : null} */}

        <View style={styles.statsGrid}>
          {statRows.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={[
                styles.statsRow,
                rowIndex < statRows.length - 1 ? { marginBottom: CARD_GAP } : null,
              ]}
            >
              {row.map((item) => (
                <View
                  key={item.label}
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: item.color,
                      width: cardSize,
                      height: cardSize,
                    },
                  ]}
                >
                  <Text style={styles.statLabel}>{item.label}</Text>
                  <Text style={styles.statValue}>{item.value ?? 0}</Text>
                </View>
              ))}
            </View>
          ))}
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
  container: {
    paddingTop: 30,
    paddingBottom: 64,
    paddingHorizontal: 32,
    alignItems: "center",
    gap: 15,
  },
  title: {
    fontSize: 26,
    color: "#3C3148",
    fontWeight: "700",
  },
  avatar: {
    width: 132,
    height: 132,
    borderRadius: 100,
    borderWidth: 6,
    borderColor: "#F0E8E0",
    marginTop: 8,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
    paddingTop: 26,
  },
  avatarHead: {
    width: 60,
    height: 60,
    borderRadius: 100,
    backgroundColor: "#B4B4B4",
  },
  avatarBody: {
    marginTop: 14,
    width: 104,
    height: 56,
    backgroundColor: "#C2C2C2",
    borderRadius: 100,
  },
  name: {
    fontSize: 20,
    color: "#3C3148",
    fontWeight: "700",
  },
  email: {
    fontSize: 14,
    color: "#7E7874",
    letterSpacing: 0.2,
  },
  phone: {
    fontSize: 13,
    color: "#A29C97",
    letterSpacing: 0.2,
  },
  statsGrid: {
    width: "100%",
    marginTop: 6,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#000000",
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 10,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    color: "#3C3148",
    fontWeight: "600",
  },
  statValue: {
    marginTop: 6,
    fontSize: 22,
    color: "#3C3148",
    fontWeight: "700",
  },
});
