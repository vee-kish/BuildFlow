import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { USERS } from "../data/mockData";
import { PERMISSIONS } from "../data/permissions";
import { useLocalStorage } from "../hooks/useLocalStorage";

const SESSION_KEY = "bfk.session";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession, clearSession] = useLocalStorage(SESSION_KEY, null);
  // Simulate an async session-restore check (token validation, etc.) so the
  // router can show a splash instead of flashing the login page on hard refresh.
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setInitializing(false), 250);
    return () => clearTimeout(timer);
  }, []);

  const user = useMemo(
    () => USERS.find((u) => u.id === session?.userId) ?? null,
    [session]
  );

  const login = useCallback(
    (loggedInUser, { remember = false } = {}) => {
      setSession({ userId: loggedInUser.id, remember });
    },
    [setSession]
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  // Demo helper: instantly view the app as the demo user for a role
  const switchRole = useCallback(
    (role) => {
      const nextUser = USERS.find((u) => u.role === role);
      if (nextUser) setSession((s) => ({ ...s, userId: nextUser.id }));
    },
    [setSession]
  );

  const can = useCallback(
    (permission, ...args) => {
      if (!user) return false;
      const check = PERMISSIONS[permission];
      if (typeof check !== "function") return false;
      return check(user.role, ...args);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initializing,
      login,
      logout,
      switchRole,
      can,
    }),
    [user, initializing, login, logout, switchRole, can]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
