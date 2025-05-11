"use client"

import { useState, useMemo, useEffect } from "react"
import { Bell, User, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { mockChatRooms } from "@/data/mock/chat-rooms"
import { useRouter } from "next/navigation"
import { ProfileModal, type ProfileType } from "@/components/profile/profile-modal"
import { useToast } from "@/hooks/use-toast"
import { signOut } from "next-auth/react"
import ThemeToggle from "../theme-toggle"
import { useUser } from "@/context/user-context"

export function Header() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading } = useUser()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Current user profile data
  const currentUserProfile: ProfileType = useMemo(() => ({
    id: user?.id || "current-user",
    name: user?.name || "Anonymous User",
    avatar: user?.image || "/placeholder.svg?height=96&width=96",
    role: user?.role || "Student",
    department: user?.department || "Unspecified",
    year: user?.year || undefined,
    status: user?.status || "offline",
    bio: user?.bio || "No bio available",
    email: user?.email || undefined,
  }), [user])

  const handleNavigateToSettings = () => {
    router.push("/settings")
  }

  const handleLogout = async () => {
    try {
      await signOut()
      // The logout function will redirect to the home page
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Prevent hydration mismatch by not rendering user-specific content until mounted
  const renderAvatar = () => {
    if (!mounted || loading) {
      return (
        <Avatar className="h-8 w-8">
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
      )
    }

    return (
      <Avatar className="h-8 w-8">
        <AvatarImage src={currentUserProfile.avatar} alt={currentUserProfile.name} />
        <AvatarFallback>{currentUserProfile.name.charAt(0)}</AvatarFallback>
      </Avatar>
    )
  }

  return (
    <header className="header-height shrink-0 border-b border-[var(--color-border)] bg-[var(--color-header)]">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        <div className="md:hidden" />

        <div className="hidden md:block">
          <h2 className="text-lg font-semibold">University of Technology</h2>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs text-white">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
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
              <DropdownMenuItem onClick={handleNavigateToSettings}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
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
  )
}
