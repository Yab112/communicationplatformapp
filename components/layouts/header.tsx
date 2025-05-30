"use client";

import { useState, useMemo, useEffect } from "react";
import { Bell, User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import {
  ProfileModal,
  type ProfileType,
} from "@/components/profile/profile-modal";
import { useToast } from "@/hooks/use-toast";
import { signOut } from "next-auth/react";
import ThemeToggle from "../theme-toggle";
import { useUser } from "@/context/user-context";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationList } from "@/components/notification-list";

export function Header() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useUser();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Current user profile data
  const currentUserProfile: ProfileType = useMemo(
    () => ({
      id: user?.id || "current-user",
      name: user?.name || "Anonymous User",
      email: user?.email || "",
      emailVerified: null,
      image: user?.image || null,
      role: user?.role || "Student",
      department: user?.department || null,
      status: user?.status || "offline",
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    [user]
  );

  const handleNavigateToSettings = () => {
    router.push("/settings");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // The logout function will redirect to the home page
    } catch {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Prevent hydration mismatch by not rendering user-specific content until mounted
  const renderAvatar = () => {
    if (!mounted || loading) {
      return (
        <Avatar className="h-8 w-8">
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
      );
    }

    return (
      <Avatar className="h-8 w-8">
        <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
        <AvatarFallback>
          {user?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("") || "U"}
        </AvatarFallback>
      </Avatar>
    );
  };

  return (
    <header className=" bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="md:hidden" />

        <div className="hidden md:block">
          <h2 className="text-lg font-semibold">University of Technology</h2>
        </div>

        <div className="flex items-center ">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <NotificationList
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                showMarkAll={true}
                emptyText="No notifications"
              />
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                {renderAvatar()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
                <User className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleNavigateToSettings}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {mounted && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profile={currentUserProfile}
        />
      )}
    </header>
  );
}
