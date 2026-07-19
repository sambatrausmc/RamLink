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

export type ProfileStatus = "loading" | "ready" | "missing" | "error";
export type SessionState =
  | "loading"
  | "verificationRequired"
  | "ready"
  | "error";

type AuthContextValue = {
  user: User | null;
  profile: StudentProfile | null;
  profileStatus: ProfileStatus;
  sessionState: SessionState;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
};

const defaultAuthContext: AuthContextValue = {
  user: null,
  profile: null,
  profileStatus: "missing",
  sessionState: "loading",
  loading: false,
  refreshProfile: async () => {},
  refreshSession: async () => false,
};

const AuthContext = createContext<AuthContextValue>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileStatus, setProfileStatus] =
    useState<ProfileStatus>("loading");
  const [sessionState, setSessionState] = useState<SessionState>("loading");
  const [loading, setLoading] = useState(true);

  // Keep the Firebase Auth session and the matching Firestore user profile together.
  const loadProfile = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setProfile(null);
      setProfileStatus("missing");
      return;
    }
    if (!nextUser.emailVerified) {
      setProfile(null);
      setProfileStatus("missing");
      return;
    }
    setProfileStatus("loading");
    try {
      const { ensureStudentProfile, getStudentProfile } = await import(
        "@/lib/firebase/user-profile"
      );
      const nextProfile = await getStudentProfile(nextUser.uid);
      if (nextProfile) {
        setProfile(nextProfile);
        setProfileStatus("ready");
        return;
      }

      setProfile(null);
      setProfileStatus("missing");
      const recoveredProfile = await ensureStudentProfile(nextUser);
      setProfile(recoveredProfile);
      setProfileStatus("ready");
    } catch {
      setProfile(null);
      setProfileStatus("error");
    }
  }, []);

  const synchronizeSession = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setSessionState("ready");
      return true;
    }
    if (!nextUser.emailVerified) {
      setSessionState("verificationRequired");
      return false;
    }

    setSessionState("loading");
    try {
      const { createServerSession, readServerSession } = await import(
        "@/lib/firebase/server-session"
      );
      const currentSession = await readServerSession();
      if (!currentSession || currentSession.uid !== nextUser.uid) {
        await createServerSession(nextUser);
      }
      setSessionState("ready");
      return true;
    } catch {
      setSessionState("error");
      return false;
    }
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};

    async function subscribeToFirebaseAuth() {
      const [{ auth, ensureAuthPersistence }, { onAuthStateChanged }] =
        await Promise.all([
          import("@/lib/firebase/client"),
          import("firebase/auth"),
        ]);

      await ensureAuthPersistence();

      unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
        setUser(nextUser);
        const sessionReady = await synchronizeSession(nextUser);
        if (!nextUser || !nextUser.emailVerified || sessionReady) {
          await loadProfile(nextUser);
        } else {
          setProfile(null);
          setProfileStatus("missing");
        }
        setLoading(false);
      });
    }

    subscribeToFirebaseAuth().catch(() => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadProfile, synchronizeSession]);

  const refreshProfile = useCallback(async () => {
    const { auth } = await import("@/lib/firebase/client");
    await loadProfile(auth.currentUser);
  }, [loadProfile]);

  const refreshSession = useCallback(async () => {
    const { auth } = await import("@/lib/firebase/client");
    return synchronizeSession(auth.currentUser);
  }, [synchronizeSession]);

  const value = useMemo(
    () => ({
      user,
      profile,
      profileStatus,
      sessionState,
      loading,
      refreshProfile,
      refreshSession,
    }),
    [
      loading,
      profile,
      profileStatus,
      refreshProfile,
      refreshSession,
      sessionState,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
