import { createContext, useCallback, useContext, useMemo, useState } from "react";

const DiaryContext = createContext(null);

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
  const [entries, setEntries] = useState(INITIAL_ENTRIES);
  const [trashEntries, setTrashEntries] = useState([]);

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
