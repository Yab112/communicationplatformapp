import { 
  BookOpen, 
  Home, 
  MessageSquare, 
  Settings,
  Calendar,
  GraduationCap,
  Library,
  Users,
  Building2,
  Award,
  FileText,
  Bell
} from "lucide-react"

export const navigationItems = [
  {
    name: "Main",
    items: [
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
    ]
  },
  {
    name: "Campus",
    items: [
      {
        name: "Events",
        href: "/events",
        icon: Calendar,
        badge: "3"
      },
      {
        name: "Courses",
        href: "/courses",
        icon: GraduationCap,
      },
      {
        name: "Library",
        href: "/library",
        icon: Library,
      },
      {
        name: "Clubs",
        href: "/clubs",
        icon: Users,
      },
    ]
  },
  {
    name: "Academic",
    items: [
      {
        name: "Departments",
        href: "/departments",
        icon: Building2,
      },
      {
        name: "Achievements",
        href: "/achievements",
        icon: Award,
      },
      {
        name: "Documents",
        href: "/documents",
        icon: FileText,
      },
    ]
  },
  {
    name: "Personal",
    items: [
      {
        name: "Notifications",
        href: "/notifications",
        icon: Bell,
        badge: "5"
      },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ]
  }
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

export { departments, years, statuses, roles, avatars }