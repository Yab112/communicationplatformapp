"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { navigationItems } from "@/app/constants"
import { useNotifications } from "@/hooks/use-notifications"

interface SidebarProps {
  isMobile: boolean
}

export function Sidebar({ isMobile }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { unreadCount } = useNotifications()

  const toggleSidebar = () => setIsOpen(!isOpen)

  const renderNavItem = (item: { name: string; href: string; icon: React.ComponentType<{ className?: string }>; badge?: boolean }) => {
    const isActive = pathname === item.href

    return (
      <li key={item.name}>
        <Link
          href={item.href}
          className={cn(
            "group flex items-center gap-4 px-4 py-2 rounded-md transition-all duration-200",
            isActive
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <div className={cn(
            "flex items-center justify-center rounded-md transition-colors",
            isActive
              ? "text-primary"
              : "text-muted-foreground group-hover:text-foreground"
          )}>
            <item.icon className="h-5 w-5" />
          </div>
          <span className="text-sm">{item.name}</span>
          { item.badge && item.name === 'Notifications' && (
            <span className={cn(
              "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
            )}>
              {unreadCount}
            </span>
          )}
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
          <nav className="mt-4 px-2">
            {navigationItems.map((section) => (
              <div key={section.name} className="mb-6">
                <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]/70">
                  {section.name}
                </h2>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <div key={item.name} onClick={toggleSidebar}>
                      {renderNavItem(item)}
                    </div>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </motion.div>
      </>
    )
  }

  // Desktop Sidebar
  return (
    <div className="hidden md:block w-[260px] shrink-0  bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="sticky top-0 flex flex-col h-screen">
        <div className="flex items-center px-6 h-14">
          <h1 className="text-2xl font-bold text-primary">UniConnect</h1>
        </div>

        <nav className="flex-1 mt-6 px-2 overflow-y-auto feeds-scroll-hidden">
          {navigationItems.map((section) => (
            <div key={section.name} className="mb-6">
              <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                {section.name}
              </h2>
              <ul className="space-y-1">
                {section.items.map(renderNavItem)}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
