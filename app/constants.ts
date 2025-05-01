import { BookOpen, Home, MessageSquare, Settings } from "lucide-react"
const navigationItems = [
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
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]



const departments = [
  "Computer Science",
  "Information Technology",
  "Software Engineering",
  "Business",
  "Arts",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Literature",
]

const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"]

const statuses = ["online", "offline", "busy", "away"]
const roles = ["Student", "Teacher", "Admin"]
const avatars = [
  "/placeholder.svg?height=96&width=96",
  "/placeholder.svg?height=96&width=96",
  "/placeholder.svg?height=96&width=96",
  "/placeholder.svg?height=96&width=96",
]



export { departments, years, statuses, roles, avatars ,navigationItems}