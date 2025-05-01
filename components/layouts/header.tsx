"use client"

import { useState, useMemo } from "react"
import { Bell, User } from "lucide-react"
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
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { mockChatRooms } from "@/data/mock/chat-rooms"
import { ProfileModal, ProfileType } from "../profile/profile-modal"
import ThemeToggle from "../theme-toggle"

export function Header() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Calculate total unread messages
  const totalUnreadCount = useMemo(() => {
    return mockChatRooms.reduce((total, room) => total + room.unreadCount, 0)
  }, []) // Empty dependency array means this only calculates once

  // Current user profile data
  const currentUserProfile: ProfileType = {
    id: "current-user",
    name: "Yabibal Yabib",
    avatar: "/placeholder.svg?height=96&width=96",
    role: "Student",
    department: "Computer Science",
    year: "2nd Year",
    status: "online",
    bio: "Computer Science student interested in AI and machine learning.",
    email: "john.doe@university.edu",
  }

  const handleNavigateToSettings = () => {
    router.push("/settings")
    setIsAccountModalOpen(false)
  }

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    setIsAccountModalOpen(false)
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
              <DropdownMenuItem>New comment on your post</DropdownMenuItem>
              <DropdownMenuItem>Your post was featured</DropdownMenuItem>
              <DropdownMenuItem>New course materials available</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@user" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                {totalUnreadCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {totalUnreadCount}
                  </Badge>
                )}
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
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={currentUserProfile}
      />
    </header>
  )
}
