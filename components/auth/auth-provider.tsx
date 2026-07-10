"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import type { StudentProfile } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  profile: StudentProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const defaultAuthContext: AuthContextValue = {
  user: null,
  profile: null,
  loading: false,
  refreshProfile: async () => {},
};

const AuthContext = createContext<AuthContextValue>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Keep the Firebase Auth session and the matching Firestore user profile together.
  const loadProfile = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setProfile(null);
      return;
    }
    try {
      const { getStudentProfile } = await import("@/lib/firebase/user-profile");
      const nextProfile = await getStudentProfile(nextUser.uid);
      setProfile(nextProfile);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};

    async function subscribeToFirebaseAuth() {
      const [{ auth }, { onAuthStateChanged }] = await Promise.all([
        import("@/lib/firebase/client"),
        import("firebase/auth"),
      ]);

      unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
        setUser(nextUser);
        await loadProfile(nextUser);
        setLoading(false);
      });
    }

    subscribeToFirebaseAuth().catch(() => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    const { auth } = await import("@/lib/firebase/client");
    await loadProfile(auth.currentUser);
  }, [loadProfile]);

  const value = useMemo(
    () => ({ user, profile, loading, refreshProfile }),
    [loading, profile, refreshProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}