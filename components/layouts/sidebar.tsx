"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { navigationItems } from "@/app/constants"

interface SidebarProps {
  isMobile: boolean
}

export function Sidebar({ isMobile }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => setIsOpen(!isOpen)

  const renderNavItem = (item: { name: string; href: string; icon: any; badge?: string }) => {
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
          <div className={cn(
            "flex items-center justify-center rounded-md transition-colors",
            isActive
              ? "text-[var(--color-primary)]"
              : "text-[var(--color-fg)] group-hover:text-[var(--color-primary)]"
          )}>
            <item.icon className="h-6 w-6" />
          </div>
          <span className="text-base font-medium">{item.name}</span>
          {item.badge && (
            <span className={cn(
              "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
              isActive
                ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)]"
            )}>
              {item.badge}
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
            {navigationItems.map((section, index) => (
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
    <div className="hidden md:block w-[260px] shrink-0 border-r border-[var(--color-border)] bg-[var(--color-sidebar)]">
      <div className="flex items-center px-6 h-[var(--spacing-header)]">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">UniConnect</h1>
      </div>

      <nav className="mt-6 px-2">
        {navigationItems.map((section, index) => (
          <div key={section.name} className="mb-6">
            <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]/70">
              {section.name}
            </h2>
            <ul className="space-y-1">
              {section.items.map(renderNavItem)}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  )
}
