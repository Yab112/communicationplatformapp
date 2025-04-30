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
  { name: "Feed", href: "/feeds", icon: Home },
  { name: "Resources", href: "/resources", icon: BookOpen },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ isMobile }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => setIsOpen(!isOpen)

  const renderNavItem = (item: typeof navigationItems[0]) => {
    const isActive = pathname === item.href

    return (
      <li key={item.name}>
        <Link
          href={item.href}
          className={cn(
            "group flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-200",
            isActive
              ? "bg-[var(--color-sidebar-active)] text-[var(--color-primary)]"
              : "text-[var(--color-fg)] hover:bg-[var(--color-sidebar-active)]",
          )}
        >
          <item.icon
            className={cn(
              "h-7 w-7 transition-colors duration-200",
              isActive
                ? "fill-[var(--color-primary)] stroke-[var(--color-primary)]"
                : "group-hover:fill-[var(--color-primary)] group-hover:stroke-[var(--color-primary)]"
            )}
          />
          <span className="text-lg font-semibold">{item.name}</span>
        </Link>
      </li>
    )
  }

  // Mobile Sidebar
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-3 z-50 md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {isOpen && (
          <div className="fixed inset-0 z-40 bg-black/50" onClick={toggleSidebar} />
        )}

        <motion.div
          className="fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-sidebar)] shadow-lg md:hidden"
          initial={{ x: "-100%" }}
          animate={{ x: isOpen ? 0 : "-100%" }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between px-6 h-[var(--spacing-header)]">
            <h1 className="text-2xl font-bold text-[var(--color-primary)]">UniConnect</h1>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="mt-4 px-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <div key={item.name} onClick={toggleSidebar}>{renderNavItem(item)}</div>
              ))}
            </ul>
          </nav>
        </motion.div>
      </>
    )
  }

  // Desktop Sidebar
  return (
    <div className="hidden md:block w-[260px] shrink-0 border-r border-[var(--color-border)] bg-[var(--color-sidebar)]">
      <div className="flex items-center px-6 h-[var(--spacing-header)]">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">UniConnect</h1>
      </div>

      <nav className="mt-6 px-4">
        <ul className="space-y-2">{navigationItems.map(renderNavItem)}</ul>
      </nav>
    </div>
  )
}
