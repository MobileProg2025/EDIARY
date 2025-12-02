import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const USERS_KEY = "@ediary/users";
const ACTIVE_USER_KEY = "@ediary/activeUser";
const ADMIN_CANONICAL_EMAIL = "admin";
const ADMIN_ALIASES = new Set([ADMIN_CANONICAL_EMAIL, "admin@admin.com"]);

const AuthContext = createContext(null);

const normalizeEmail = (value) => value?.trim().toLowerCase() ?? "";
const canonicalEmail = (value) => {
  const normalized = normalizeEmail(value);
  if (ADMIN_ALIASES.has(normalized)) {
    return ADMIN_CANONICAL_EMAIL;
  }
  return normalized;
};

const sanitizeText = (value) => value?.trim() ?? "";

const readUsers = async () => {
  const stored = await AsyncStorage.getItem(USERS_KEY);
  if (!stored) {
    return {};
  }

  try {
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn("Failed to parse stored users", error);
  }

  return {};
};

const ensureAdminAccount = async (users) => {
  const next = { ...users };
  let mutated = false;

  if (!next[ADMIN_CANONICAL_EMAIL]) {
    next[ADMIN_CANONICAL_EMAIL] = {
      id: "user-admin",
      email: ADMIN_CANONICAL_EMAIL,
      password: "admin",
      firstName: "Admin",
      lastName: "",
      username: "01234567890",
      createdAt: new Date().toISOString(),
    };
    mutated = true;
  }

  if (mutated) {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(next));
  }

  return next;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      try {
        const rawUsers = await readUsers();
        const users = await ensureAdminAccount(rawUsers);
        const storedEmail = await AsyncStorage.getItem(ACTIVE_USER_KEY);
        const activeEmail = canonicalEmail(storedEmail);
        const activeUser = activeEmail ? users[activeEmail] ?? null : null;

        if (isMounted) {
          setUser(activeUser);
        }
      } catch (error) {
        console.warn("Failed to hydrate auth context", error);
      } finally {
        if (isMounted) {
          setHydrated(true);
        }
      }
    };

    hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  const signup = useCallback(async ({ email, password, username }) => {
    const emailCanonical = canonicalEmail(email);
    const passwordTrimmed = sanitizeText(password);
    const usernameTrimmed = sanitizeText(username);

    if (!emailCanonical) {
      throw new Error("Email is required.");
    }

    if (ADMIN_ALIASES.has(emailCanonical)) {
      throw new Error("That email is reserved.");
    }

    if (!passwordTrimmed) {
      throw new Error("Password is required.");
    }

    const usersWithAdmin = await ensureAdminAccount(await readUsers());

    if (usersWithAdmin[emailCanonical]) {
      throw new Error("An account with this email already exists.");
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email: emailCanonical,
      password: passwordTrimmed,
      username: usernameTrimmed,
      firstName: "",
      lastName: "",
      createdAt: new Date().toISOString(),
    };

    const nextUsers = { ...usersWithAdmin, [emailCanonical]: newUser };

    await AsyncStorage.multiSet([
      [USERS_KEY, JSON.stringify(nextUsers)],
      [ACTIVE_USER_KEY, emailCanonical],
    ]);

    setUser(newUser);

    return newUser;
  }, []);

  const login = useCallback(async ({ username, email, password }) => {
    const passwordTrimmed = sanitizeText(password);
    const usernameTrimmed = sanitizeText(username || "");
    const emailTrimmed = sanitizeText(email || "");

    if (!passwordTrimmed) {
      throw new Error("Password is required.");
    }

    if (!usernameTrimmed && !emailTrimmed) {
      throw new Error("Username or email is required.");
    }

    const users = await ensureAdminAccount(await readUsers());
    
    // Find user by username or email
    let account = null;
    let accountEmail = null;

    if (usernameTrimmed) {
      // Search for user by username
      for (const [email, user] of Object.entries(users)) {
        if (user.username?.toLowerCase() === usernameTrimmed.toLowerCase()) {
          account = user;
          accountEmail = email;
          break;
        }
      }
    } else if (emailTrimmed) {
      // Search by email
      const emailCanonical = canonicalEmail(emailTrimmed);
      account = users[emailCanonical];
      accountEmail = emailCanonical;
    }

    if (!account || account.password !== passwordTrimmed) {
      throw new Error("Invalid username or password.");
    }

    await AsyncStorage.setItem(ACTIVE_USER_KEY, accountEmail);
    setUser(account);

    return account;
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(ACTIVE_USER_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      if (!user) {
        throw new Error("No active user to update.");
      }

      const users = await ensureAdminAccount(await readUsers());
      const currentCanonical = canonicalEmail(user.email);
      const nextCanonical =
        updates.email != null
          ? canonicalEmail(updates.email)
          : currentCanonical;

      if (!nextCanonical) {
        throw new Error("Email cannot be empty.");
      }

      if (
        nextCanonical !== currentCanonical &&
        (users[nextCanonical] || ADMIN_ALIASES.has(nextCanonical))
      ) {
        throw new Error("Another account already uses this email.");
      }

      const nextUser = {
        ...user,
        email: nextCanonical,
        firstName:
          updates.firstName != null
            ? sanitizeText(updates.firstName)
            : user.firstName,
        lastName:
          updates.lastName != null
            ? sanitizeText(updates.lastName)
            : user.lastName,
        username:
          updates.username != null
            ? sanitizeText(updates.username)
            : user.username,
        updatedAt: new Date().toISOString(),
      };

      if (updates.password != null) {
        const passwordTrimmed = sanitizeText(updates.password);
        if (!passwordTrimmed) {
          throw new Error("Password cannot be empty.");
        }
        nextUser.password = passwordTrimmed;
      }

      const nextUsers = { ...users };
      delete nextUsers[currentCanonical];
      nextUsers[nextCanonical] = nextUser;

      await AsyncStorage.multiSet([
        [USERS_KEY, JSON.stringify(nextUsers)],
        [ACTIVE_USER_KEY, nextCanonical],
      ]);

      setUser(nextUser);

      return nextUser;
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user != null,
      initializing: !hydrated,
      signup,
      login,
      logout,
      updateProfile,
    }),
    [user, hydrated, signup, login, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context == null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
