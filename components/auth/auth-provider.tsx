"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

// 1. DEFINE THE SHAPE OF OUR AUTH DATA
type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
};

// 2. SET THE DEFAULT STATE (Before we know if someone is logged in)
const fallbackAuthContext: AuthContextValue = {
  user: null,
  isLoading: false,
  isSignedIn: false,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// 3. THE MAIN PROVIDER COMPONENT
// This wraps around our app and constantly listens to Firebase to see if the user logs in or out.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Firebase's built-in listener. It fires automatically whenever auth state changes.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  // Package up the current data so other components can use it
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isSignedIn: Boolean(user),
    }),
    [isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 4. A CUSTOM HOOK FOR EASY ACCESS
// Now, any file can just call useAuth() to instantly get the current user!
export function useAuth() {
  return useContext(AuthContext) ?? fallbackAuthContext;
}
