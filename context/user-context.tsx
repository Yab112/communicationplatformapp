// providers/user-provider.tsx (Corrected Version)
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

  const fetchUserData = useCallback(async () => {
    if (!session?.user?.id) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${session.user.id}`);
      if (!response.ok) throw new Error("Failed to fetch user data");
      
      const userData = await response.json();
      setUser(userData as User); // Assuming the API returns the correct User type
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Effect for fetching user data when session changes
  useEffect(() => {
    if (status === "authenticated") {
      fetchUserData();
    } else if (status === "unauthenticated") {
      setUser(null);
      setLoading(false);
    }
  }, [status, fetchUserData]);

  // Effect for handling online/offline status listeners. Runs only ONCE.
  useEffect(() => {
    if (!session?.user?.id) return;

    const handleStatusUpdate = (newStatus: "online" | "offline") => {
      updateUserStatus(newStatus).catch(err => console.error("Failed to update status:", err));
    };

    const handleVisibilityChange = () => {
      handleStatusUpdate(document.visibilityState === "visible" ? "online" : "offline");
    };

    // Set initial status and add listeners
    handleStatusUpdate("online");
    window.addEventListener("online", () => handleStatusUpdate("online"));
    window.addEventListener("offline", () => handleStatusUpdate("offline"));
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Set status to offline on cleanup (e.g., closing the tab)
    return () => {
      handleStatusUpdate("offline");
      window.removeEventListener("online", () => handleStatusUpdate("online"));
      window.removeEventListener("offline", () => handleStatusUpdate("offline"));
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session?.user?.id]); // Only re-runs if the user logs in/out

  return (
    <UserContext.Provider value={{ user, loading, refreshUser: fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
}