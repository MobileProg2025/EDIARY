import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";

const TOKEN_KEY = "@ediary/token";
const USER_KEY = "@ediary/user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);

        if (isMounted && storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
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
    try {
      console.log("Attempting signup...");
      console.log("API URL:", `${API_BASE_URL}/auth/register`);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          username: username.trim(),
        }),
      });

      console.log("Response status:", response.status);
      
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to create account.");
      }

      // Store token and user data
      await AsyncStorage.multiSet([
        [TOKEN_KEY, data.token],
        [USER_KEY, JSON.stringify(data.user)],
      ]);

      console.log("Signup successful!");
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error("Signup error:", error);
      console.error("Error details:", error.message);
      throw error;
    }
  }, []);

  const login = useCallback(async ({ username, email, password }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username?.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to log in.");
      }

      // Store token and user data
      await AsyncStorage.multiSet([
        [TOKEN_KEY, data.token],
        [USER_KEY, JSON.stringify(data.user)],
      ]);

      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      if (!user) {
        throw new Error("No active user to update.");
      }

      const activeToken = token || (await AsyncStorage.getItem(TOKEN_KEY));

      const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);

      return data.user;
    },
    [user, token]
  );

  const getAuthToken = useCallback(async () => {
    // Token in state is the source of truth after hydration
    // Check AsyncStorage as fallback without modifying state (no side effects)
    return token || await AsyncStorage.getItem(TOKEN_KEY);
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: user != null,
      initializing: !hydrated,
      signup,
      login,
      logout,
      updateProfile,
      getAuthToken,
    }),
    [user, token, hydrated, signup, login, logout, updateProfile, getAuthToken]
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
