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
import { API_BASE_URL } from "../config";

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

// Helper to convert MongoDB diary to local diary format
const convertApiDiary = (apiDiary) => ({
  id: apiDiary._id,
  mood: apiDiary.mood,
  title: apiDiary.title,
  content: apiDiary.content,
  imageUri: apiDiary.imageUri,
  createdAt: apiDiary.createdAt || apiDiary.updatedAt,
});

export function DiaryProvider({ children }) {
  const { user, getAuthToken } = useAuth();
  const [entries, setEntries] = useState([]);
  const [trashEntries, setTrashEntries] = useState([]);
  const [dataEmail, setDataEmail] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const previousEmailRef = useRef(null);

  // Load entries from API
  const loadEntriesFromAPI = useCallback(async () => {
    const token = await getAuthToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/diaries`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch entries");
      }

      const data = await response.json();
      return data.map(convertApiDiary);
    } catch (error) {
      console.warn("Failed to load entries from API", error);
      return null;
    }
  }, [getAuthToken]);

  // Load trash entries from API
  const loadTrashFromAPI = useCallback(async () => {
    const token = await getAuthToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/diaries/trash`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch trash");
      }

      const data = await response.json();
      return data.map(apiDiary => ({
        ...convertApiDiary(apiDiary),
        trashedAt: apiDiary.deletedAt,
      }));
    } catch (error) {
      console.warn("Failed to load trash from API", error);
      return null;
    }
  }, [getAuthToken]);

  useEffect(() => {
    let isMounted = true;

    const loadForEmail = async (email) => {
      setIsReady(false);
      setIsLoading(true);
      setDataEmail(null);

      try {
        // Try to load from API first
        const apiEntries = await loadEntriesFromAPI();
        const apiTrash = await loadTrashFromAPI();
        
        if (apiEntries && isMounted) {
          setEntries(apiEntries);
          setTrashEntries(apiTrash || []);
          setDataEmail(email);
          setIsReady(true);
          setIsLoading(false);
          return;
        }

        // Fallback to AsyncStorage
        const entriesKey = entriesKeyFor(email);
        const trashKey = trashKeyFor(email);

        const result = await AsyncStorage.multiGet([entriesKey, trashKey]);
        const storedEntries = result[0]?.[1] ?? null;
        const storedTrash = result[1]?.[1] ?? null;

        const fallbackEntries =
          email === ADMIN_CANONICAL_EMAIL ? INITIAL_ENTRIES : [];

        const nextEntries = storedEntries
          ? JSON.parse(storedEntries)
          : fallbackEntries;
        const nextTrash = storedTrash ? JSON.parse(storedTrash) : [];

        if (isMounted) {
          setEntries(nextEntries);
          setTrashEntries(nextTrash);
          setDataEmail(email);
          setIsReady(true);
        }
      } catch (error) {
        console.warn("Failed to load diary data", error);
        const fallbackEntries =
          email === ADMIN_CANONICAL_EMAIL ? INITIAL_ENTRIES : [];
        
        if (isMounted) {
          setEntries(fallbackEntries);
          setTrashEntries([]);
          setDataEmail(email);
          setIsReady(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const handleSignedOut = () => {
      previousEmailRef.current = null;
      setEntries([]);
      setTrashEntries([]);
      setDataEmail(null);
      setIsReady(true);
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

      await loadForEmail(currentEmail);
      previousEmailRef.current = currentEmail;
    };

    hydrate();

    return () => {
      isMounted = false;
    };
  }, [user, loadEntriesFromAPI, loadTrashFromAPI]);

  // Add entry to API
  const addEntry = useCallback(
    async (partialEntry) => {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error("You must be logged in to create diary entries");
      }

      const entryData = {
        mood: partialEntry.mood || "calm",
        title: partialEntry.title?.trim() || "Untitled memory",
        content: partialEntry.content?.trim() || "",
        imageUri: partialEntry.imageUri || null,
      };

      const response = await fetch(`${API_BASE_URL}/diaries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(entryData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
       throw new Error(errorData.message || "Failed to save diary entry");
      }

      const apiDiary = await response.json();
      const newEntry = convertApiDiary(apiDiary);
      setEntries((prev) => [newEntry, ...prev]);
    },
    [getAuthToken]
  );

  // Update entry in API
  const updateEntry = useCallback(
    async (id, updates) => {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("You must be logged in to update diary entries");
      }

      const response = await fetch(`${API_BASE_URL}/diaries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update diary entry");
      }

      const apiDiary = await response.json();
      const updatedEntry = convertApiDiary(apiDiary);
      setEntries((prev) =>
        prev.map((entry) => (entry.id === id ? updatedEntry : entry))
      );
    },
    [getAuthToken]
  );

  // Delete entry (soft delete - move to trash)
  const deleteEntry = useCallback(
    async (id) => {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("You must be logged in to delete diary entries");
      }

      const response = await fetch(`${API_BASE_URL}/diaries/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete diary entry");
      }

      const data = await response.json();
      const trashedEntry = {
        ...convertApiDiary(data.diary),
        trashedAt: data.diary.deletedAt,
      };
      
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
      setTrashEntries((prev) => [trashedEntry, ...prev]);
    },
    [getAuthToken]
  );

  // Restore entry from trash
  const recoverEntry = useCallback(
    async (id) => {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("You must be logged in to restore diary entries");
      }

      const response = await fetch(`${API_BASE_URL}/diaries/${id}/restore`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to restore diary entry");
      }

      const data = await response.json();
      const restoredEntry = convertApiDiary(data.diary);
      
      setTrashEntries((prev) => prev.filter((entry) => entry.id !== id));
      
      // Insert in correct chronological position based on createdAt
      setEntries((prev) => {
        const newEntries = [...prev, restoredEntry];
        return newEntries.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
      });
    },
    [getAuthToken]
  );

  // Permanently delete entry from trash
  const deleteFromTrash = useCallback(
    async (id) => {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("You must be logged in to permanently delete diary entries");
      }

      const response = await fetch(`${API_BASE_URL}/diaries/${id}/permanent`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to permanently delete diary entry");
      }

      setTrashEntries((prev) => prev.filter((entry) => entry.id !== id));
    },
    [getAuthToken]
  );

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
      isLoading,
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
      isLoading,
    ]
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
