import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./auth-context";

const DiaryContext = createContext(null);

const ADMIN_CANONICAL_EMAIL = "admin";

const INITIAL_ENTRIES = [
  {
    id: "entry-1",
    mood: "sad",
    title: "Lost my precious item",
    content: "I misplaced something important today. Hoping it turns up soon.",
    createdAt: "2025-10-09T23:00:00.000Z",
    imageUri: null,
  },
  {
    id: "entry-2",
    mood: "angry",
    title: "Travel",
    content: "Even with the delays, the trip was worth it in the end.",
    createdAt: "2025-10-08T08:00:00.000Z",
    imageUri: null,
  },
  {
    id: "entry-3",
    mood: "calm",
    title: "Bad day",
    content: "Trying to unwind after everything that happened.",
    createdAt: "2025-10-07T22:00:00.000Z",
    imageUri: null,
  },
  {
    id: "entry-4",
    mood: "love",
    title: "She's pretty",
    content: "I finally told her how I felt today.",
    createdAt: "2025-10-07T19:00:00.000Z",
    imageUri: null,
  },
  {
    id: "entry-5",
    mood: "happy",
    title: "First day in work",
    content: "Excited to start this new chapter!",
    createdAt: "2025-10-01T15:00:00.000Z",
    imageUri: null,
  },
];

const normalizeEmail = (value) => value?.trim().toLowerCase() ?? "";
const canonicalEmail = (value) => {
  const normalized = normalizeEmail(value);
  if (normalized === "admin@admin.com") {
    return ADMIN_CANONICAL_EMAIL;
  }
  return normalized;
};

const entriesKeyFor = (email) => `@ediary/entries/${email}`;
const trashKeyFor = (email) => `@ediary/trash/${email}`;

const parseStoredList = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn("Failed to parse stored diary list", error);
  }

  return fallback;
};

const buildEntry = (partial) => {
  const now = new Date();
  return {
    id: partial.id ?? `entry-${now.getTime()}`,
    createdAt: partial.createdAt ?? now.toISOString(),
    title: partial.title?.trim() ?? "",
    content: partial.content?.trim() ?? "",
    mood: partial.mood ?? "calm",
    imageUri: partial.imageUri ?? null,
  };
};

const normalizeUpdates = (updates) => {
  const normalized = { ...updates };
  if (normalized.title != null) {
    normalized.title = normalized.title.trim();
  }
  if (normalized.content != null) {
    normalized.content = normalized.content.trim();
  }
  return normalized;
};

export function DiaryProvider({ children }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [trashEntries, setTrashEntries] = useState([]);
  const [dataEmail, setDataEmail] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const previousEmailRef = useRef(null);

  const migrateDiaryData = useCallback(async (fromEmail, toEmail) => {
    if (!fromEmail || !toEmail || fromEmail === toEmail) {
      return;
    }

    const fromEntriesKey = entriesKeyFor(fromEmail);
    const fromTrashKey = trashKeyFor(fromEmail);
    const toEntriesKey = entriesKeyFor(toEmail);
    const toTrashKey = trashKeyFor(toEmail);

    try {
      const results = await AsyncStorage.multiGet([
        fromEntriesKey,
        fromTrashKey,
        toEntriesKey,
        toTrashKey,
      ]);

      const fromEntriesRaw = results[0]?.[1] ?? null;
      const fromTrashRaw = results[1]?.[1] ?? null;
      const toEntriesRaw = results[2]?.[1] ?? null;
      const toTrashRaw = results[3]?.[1] ?? null;

      const updates = [];
      const keysToRemove = [];

      if (fromEntriesRaw && !toEntriesRaw) {
        updates.push([toEntriesKey, fromEntriesRaw]);
        keysToRemove.push(fromEntriesKey);
      }

      if (fromTrashRaw && !toTrashRaw) {
        updates.push([toTrashKey, fromTrashRaw]);
        keysToRemove.push(fromTrashKey);
      }

      if (updates.length) {
        await AsyncStorage.multiSet(updates);
      }

      if (keysToRemove.length) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
    } catch (error) {
      console.warn("Failed to migrate diary data", error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const resetState = (nextEntries, nextTrash, email) => {
      if (!isMounted) {
        return;
      }

      setEntries(nextEntries);
      setTrashEntries(nextTrash);
      setDataEmail(email);
      setIsReady(true);
    };

    const loadForEmail = async (email) => {
      setIsReady(false);
      setDataEmail(null);

      const entriesKey = entriesKeyFor(email);
      const trashKey = trashKeyFor(email);

      try {
        const result = await AsyncStorage.multiGet([entriesKey, trashKey]);
        const storedEntries = result[0]?.[1] ?? null;
        const storedTrash = result[1]?.[1] ?? null;

        const fallbackEntries =
          email === ADMIN_CANONICAL_EMAIL ? INITIAL_ENTRIES : [];

        const nextEntries = parseStoredList(storedEntries, fallbackEntries);
        const nextTrash = parseStoredList(storedTrash, []);

        resetState(nextEntries, nextTrash, email);
      } catch (error) {
        console.warn("Failed to load diary data", error);
        resetState(
          email === ADMIN_CANONICAL_EMAIL ? INITIAL_ENTRIES : [],
          [],
          email,
        );
      }
    };

    const handleSignedOut = () => {
      previousEmailRef.current = null;
      resetState([], [], null);
    };

    const hydrate = async () => {
      if (!user) {
        handleSignedOut();
        return;
      }

      const currentEmail = canonicalEmail(user.email);
      if (!currentEmail) {
        handleSignedOut();
        return;
      }

      const previousEmail = previousEmailRef.current;
      if (previousEmail && previousEmail !== currentEmail) {
        await migrateDiaryData(previousEmail, currentEmail);
      }

      await loadForEmail(currentEmail);
      previousEmailRef.current = currentEmail;
    };

    hydrate();

    return () => {
      isMounted = false;
    };
  }, [user, migrateDiaryData]);

  useEffect(() => {
    if (!user || !isReady) {
      return;
    }

    const email = canonicalEmail(user.email);
    if (!email || dataEmail !== email) {
      return;
    }

    const persist = async () => {
      try {
        const key = entriesKeyFor(email);
        await AsyncStorage.setItem(key, JSON.stringify(entries));
      } catch (error) {
        console.warn("Failed to persist diary entries", error);
      }
    };

    persist();
  }, [entries, user, dataEmail, isReady]);

  useEffect(() => {
    if (!user || !isReady) {
      return;
    }

    const email = canonicalEmail(user.email);
    if (!email || dataEmail !== email) {
      return;
    }

    const persist = async () => {
      try {
        const key = trashKeyFor(email);
        await AsyncStorage.setItem(key, JSON.stringify(trashEntries));
      } catch (error) {
        console.warn("Failed to persist trash entries", error);
      }
    };

    persist();
  }, [trashEntries, user, dataEmail, isReady]);

  const addEntry = useCallback((partialEntry) => {
    setEntries((prev) => {
      const entry = buildEntry(partialEntry);
      return [entry, ...prev];
    });
  }, []);

  const updateEntry = useCallback((id, updates) => {
    const next = normalizeUpdates(updates);
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...next } : entry)),
    );
  }, []);

  const deleteEntry = useCallback((id) => {
    setEntries((prev) => {
      const target = prev.find((entry) => entry.id === id);
      if (!target) {
        return prev;
      }

      setTrashEntries((trashPrev) => [
        { ...target, trashedAt: new Date().toISOString() },
        ...trashPrev,
      ]);

      return prev.filter((entry) => entry.id !== id);
    });
  }, []);

  const recoverEntry = useCallback((id) => {
    setTrashEntries((prev) => {
      const target = prev.find((entry) => entry.id === id);
      if (!target) {
        return prev;
      }

      const { trashedAt, ...rest } = target;

      setEntries((entriesPrev) => [rest, ...entriesPrev]);

      return prev.filter((entry) => entry.id !== id);
    });
  }, []);

  const deleteFromTrash = useCallback((id) => {
    setTrashEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const emptyTrash = useCallback(() => {
    setTrashEntries([]);
  }, []);

  const value = useMemo(
    () => ({
      entries,
      addEntry,
      updateEntry,
      deleteEntry,
      recoverEntry,
      deleteFromTrash,
      emptyTrash,
      trashEntries,
      getEntry: (id) => entries.find((entry) => entry.id === id) ?? null,
      isReady,
    }),
    [
      entries,
      addEntry,
      updateEntry,
      deleteEntry,
      recoverEntry,
      deleteFromTrash,
      emptyTrash,
      trashEntries,
      isReady,
    ],
  );

  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
}

export function useDiary() {
  const context = useContext(DiaryContext);

  if (context == null) {
    throw new Error("useDiary must be used within a DiaryProvider");
  }

  return context;
}
