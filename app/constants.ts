import { BookOpen, Home, MessageSquare, Settings, User } from "lucide-react"
export const navigationItems = [
    {
      name: "Feed",
      href: "/feeds",
      icon: Home,
    },
    {
      name: "Resources",
      href: "/resources",
      icon: BookOpen,
    },
    {
      name: "Chat",
      href: "/chat",
      icon: MessageSquare,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]