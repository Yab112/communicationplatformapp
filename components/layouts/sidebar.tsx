"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, BookOpen, MessageSquare, Settings, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isMobile: boolean
}

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

export function Sidebar({ isMobile }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        <Button variant="ghost" size="icon" className="fixed left-4 top-3 z-50 md:hidden" onClick={toggleSidebar}>
          <Menu className="h-6 w-6" />
        </Button>

        {isOpen && <div className="fixed inset-0 z-40 bg-black/50" onClick={toggleSidebar} />}

        <motion.div
          className="fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-sidebar)] shadow-lg md:hidden"
          initial={{ x: "-100%" }}
          animate={{ x: isOpen ? 0 : "-100%" }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex h-[var(--spacing-header)] items-center justify-between px-4">
            <h1 className="text-xl font-bold text-[var(--color-primary)]">UniConnect</h1>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="mt-4 px-2">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-[var(--color-sidebar-active)] text-[var(--color-primary)]"
                        : "hover:bg-[var(--color-sidebar-active)] text-[var(--color-fg)]",
                    )}
                    onClick={toggleSidebar}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>
      </>
    )
  }

  // Desktop sidebar
  return (
    <div className="hidden md:block sidebar-width shrink-0 border-r border-[var(--color-border)] bg-[var(--color-sidebar)]">
      <div className="flex h-[var(--spacing-header)] items-center px-6">
        <h1 className="text-xl font-bold text-[var(--color-primary)]">UniConnect</h1>
      </div>

      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-[var(--color-sidebar-active)] text-[var(--color-primary)]"
                    : "hover:bg-[var(--color-sidebar-active)] text-[var(--color-fg)]",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
