// context/user-context.tsx (The Final, Corrected Version)
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { updateUserStatus } from "@/lib/actions/users";
import { User } from "@/types/user";

type UserContextType = {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

export const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // This function is now wrapped in useCallback to be stable
  const fetchUserData = useCallback(async () => {
    if (!session?.user?.id) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${session.user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]); // It only gets a new identity if the user ID changes

  // Effect for fetching data. Runs only when the session status changes.
  useEffect(() => {
    if (status === "authenticated") {
      fetchUserData();
    } else if (status === "unauthenticated") {
      setUser(null);
      setLoading(false);
    }
  }, [status, fetchUserData]);

  // Effect for managing online/offline status. Runs only when the user logs in or out.
  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    const updateStatusSafe = (newStatus: "online" | "offline") => {
      updateUserStatus(newStatus).catch((err) =>
        console.error("Failed to update status:", err)
      );
    };

    const handleVisibilityChange = () => {
      updateStatusSafe(document.visibilityState === "visible" ? "online" : "offline");
    };
    
    // Set initial status and add listeners
    updateStatusSafe("online");
    window.addEventListener("visibilitychange", handleVisibilityChange);

    // This function will run when the component unmounts or the user logs out